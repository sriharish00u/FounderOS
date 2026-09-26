import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { 
  CompanyDetails, 
  HumanEmployee, 
  AIEmployee, 
  Role, 
  Department, 
  Task, 
  Goal, 
  ActivityItem, 
  NotificationItem,
  TaskStatus,
  AuthUser,
  OnboardingPayload
} from '../types';
import { api } from '../services/api';
import { AppContext } from './AppContextInstance';
import type { ActiveView, AuthStatus } from './AppContextInstance';

const AUTH_STORAGE_KEY = 'founder_os_auth';

interface StoredAuth {
  token: string;
  user: AuthUser;
  company: CompanyDetails;
}

const readStoredAuth = (): StoredAuth | null => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAuth;
    if (!parsed.token || !parsed.user) return null;
    return parsed;
  } catch {
    return null;
  }
};

const writeStoredAuth = (auth: StoredAuth | null) => {
  try {
    if (auth) localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
    else localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // Intentionally silent
  }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthStatus>({ phase: 'loading' });
  const [company, setCompany] = useState<CompanyDetails>({
    name: 'Founder OS',
    code: 'FO-2026-0000',
    type: '',
    address: '',
    isOnline: true,
    owner: {
      name: '',
      phone: '',
      email: '',
      address: ''
    },
    coFounders: []
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [humanEmployees, setHumanEmployees] = useState<HumanEmployee[]>([]);
  const [aiEmployees, setAIEmployees] = useState<AIEmployee[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedAIEmployee, setSelectedAIEmployee] = useState<AIEmployee | null>(null);
  
  const [isHireModalOpen, setIsHireModalOpen] = useState<boolean>(false);
  const [hireModalTab, setHireModalTab] = useState<'human' | 'ai'>('human');
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState<boolean>(false);
  const [isCreateGoalModalOpen, setIsCreateGoalModalOpen] = useState<boolean>(false);
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState<boolean>(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState<boolean>(false);

  const fetchRemoteData = async () => {
    try {
      const [comp, depts, rls, emps, ais, tsks, gls, acts, notifs] = await Promise.allSettled([
        api.getCompany(),
        api.getDepartments(),
        api.getRoles(),
        api.getEmployees(),
        api.getAIEmployees(),
        api.getTasks(),
        api.getGoals(),
        api.getActivities(),
        api.getNotifications()
      ]);

      if (comp.status === 'fulfilled') setCompany(comp.value);
      if (depts.status === 'fulfilled') setDepartments(depts.value);
      if (rls.status === 'fulfilled') setRoles(rls.value);
      if (emps.status === 'fulfilled') setHumanEmployees(emps.value);
      if (ais.status === 'fulfilled') setAIEmployees(ais.value);
      if (tsks.status === 'fulfilled') setTasks(tsks.value);
      if (gls.status === 'fulfilled') setGoals(gls.value);
      if (acts.status === 'fulfilled') setActivities(acts.value);
      if (notifs.status === 'fulfilled') setNotifications(notifs.value);
    } catch {
      // Intentionally silent
    }
  };

  const login = async (email: string, password: string) => {
    const session = await api.login({ email, password });
    applySession(session.token, session.user, session.company);
  };

  const register = async (data: {
    company: { name: string; type?: string; address?: string };
    founder: { name: string; email: string; phone?: string; password: string };
  }) => {
    const session = await api.register(data);
    applySession(session.token, session.user, session.company);
  };

  const logout = () => {
    writeStoredAuth(null);
    setAuth({ phase: 'unauthenticated' });
  };

  const completeOnboarding = async (data: OnboardingPayload) => {
    const res = await api.completeOnboarding(data);
    const updated = res.user;
    const stored = readStoredAuth();
    setAuth(prev => prev.phase === 'authenticated'
      ? { phase: 'authenticated', token: prev.token, user: updated }
      : prev);
    if (stored) writeStoredAuth({ token: stored.token, user: updated, company: stored.company });
    void fetchRemoteData();
  };

  const applySession = (token: string, user: AuthUser, companyData: CompanyDetails | null) => {
    setAuth({ phase: 'authenticated', token, user });
    setCompany(companyData ?? {
      name: `${user.name}'s Company`,
      code: user.companyCode,
      type: '',
      address: '',
      isOnline: true,
      owner: { name: user.name, phone: user.phone ?? '', email: user.email, address: '' },
      coFounders: []
    });
    writeStoredAuth({ token, user, company: companyData ?? {
      name: `${user.name}'s Company`,
      code: user.companyCode,
      type: '',
      address: '',
      isOnline: true,
      owner: { name: user.name, phone: user.phone ?? '', email: user.email, address: '' },
      coFounders: []
    } });
  };

  useEffect(() => {
    const stored = readStoredAuth();
    if (!stored) {
      setAuth({ phase: 'unauthenticated' });
      return;
    }
    const token = stored.token;
    api.getMe(token)
      .then(({ user, company: meCompany }) => {
        setAuth({ phase: 'authenticated', token, user });
        if (meCompany) setCompany(meCompany);
        writeStoredAuth({ token, user, company: meCompany ?? stored.company });
      })
      .catch(() => {
        writeStoredAuth(null);
        setAuth({ phase: 'unauthenticated' });
      });
  }, []);

  useEffect(() => {
    if (auth.phase !== 'authenticated') return;
    const timer = setTimeout(() => {
      void fetchRemoteData();
    }, 0);
    return () => clearTimeout(timer);
  }, [auth.phase]);

  const updateCompany = async (details: Partial<CompanyDetails>) => {
    try {
      const updated = await api.updateCompany(details);
      setCompany(updated);
    } catch {
      setCompany(prev => ({ ...prev, ...details }));
    }
  };

  const createTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'submissions' | 'activityLogs'>) => {
    try {
      const created = await api.createTask(taskData);
      setTasks(prev => [created, ...prev]);
      void fetchRemoteData();
    } catch {
      const fallback: Task = {
        ...taskData,
        id: `task-${Date.now()}`,
        createdAt: new Date().toISOString(),
        submissions: [],
        activityLogs: []
      };
      setTasks(prev => [fallback, ...prev]);
    }
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    const performer = auth.phase === 'authenticated' ? auth.user.name : 'Team Member';
    try {
      const updated = await api.updateTaskStatus(taskId, status, performer);
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
      if (selectedTask?.id === taskId) setSelectedTask(updated);
    } catch {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
    }
  };

  const submitTaskDeliverable = async (taskId: string, summary: string, notes?: string) => {
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) return;

    try {
      const updated = await api.submitDeliverable(taskId, {
        deliverableSummary: summary,
        notes,
        submittedBy: targetTask.assigneeName,
        submitterType: targetTask.assigneeType
      });
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
      if (selectedTask?.id === taskId) setSelectedTask(updated);
      void fetchRemoteData();
    } catch {
      // Intentionally silent
    }
  };

  const reviewTaskSubmission = async (
    taskId: string, 
    submissionId: string, 
    decision: 'approved' | 'changes_requested', 
    notes: string
  ) => {
    const reviewerName = auth.phase === 'authenticated' ? auth.user.name : 'Manager';
    try {
      const updated = await api.reviewSubmission(taskId, submissionId, {
        decision,
        notes,
        reviewedBy: reviewerName
      });
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
      if (selectedTask?.id === taskId) setSelectedTask(updated);
      void fetchRemoteData();
    } catch {
      // Intentionally silent
    }
  };

  const hireHumanEmployee = async (data: { name: string; email: string; phone: string; role: string; department: string }) => {
    try {
      const created = await api.hireEmployee(data);
      setHumanEmployees(prev => [created, ...prev]);
      void fetchRemoteData();
    } catch {
      // Intentionally silent
    }
  };

  const updateEmployee = async (id: string, data: { name?: string; email?: string; phone?: string; role?: string; department?: string }) => {
    try {
      const updated = await api.updateEmployee(id, data);
      setHumanEmployees(prev => prev.map(e => e.id === id ? updated : e));
    } catch {
      // Intentionally silent
    }
  };

  const hireAIEmployee = async (data: {
    name: string;
    role: string;
    department: string;
    managerName: string;
    provider: string;
    model: string;
    apiEndpoint?: string;
    apiKey?: string;
    fallbackModel?: string;
    fallbackModels?: string[];
    instructions: string;
    priority: string;
  }) => {
    try {
      const created = await api.hireAIEmployee(data);
      setAIEmployees(prev => [created, ...prev]);
      void fetchRemoteData();
    } catch {
      // Intentionally silent
    }
  };

  const createDepartment = async (data: { name: string; lead?: string }) => {
    try {
      await api.createDepartment(data);
    } catch {
      // Intentionally silent
    }
    await fetchRemoteData();
  };

  const createRole = async (data: {
    name: string;
    description?: string;
    department?: string;
    priority?: string;
    responsibilities?: string[];
    permissions?: string[];
  }) => {
    try {
      await api.createRole(data);
    } catch {
      // Intentionally silent
    }
    await fetchRemoteData();
  };

  const updateAIMemory = async (aiId: string, memoryUpdates: Partial<AIEmployee['memory']>) => {
    try {
      const updated = await api.updateAIMemory(aiId, memoryUpdates);
      setAIEmployees(prev => prev.map(a => a.id === aiId ? updated : a));
      if (selectedAIEmployee?.id === aiId) setSelectedAIEmployee(updated);
    } catch {
      // Intentionally silent
    }
  };

  const createGoal = async (goalData: Omit<Goal, 'id' | 'linkedTaskIds'>) => {
    try {
      const created = await api.createGoal(goalData);
      setGoals(prev => [created, ...prev]);
      void fetchRemoteData();
    } catch {
      // Intentionally silent
    }
  };

  const markNotificationAsRead = async (notifId: string) => {
    try {
      await api.markNotificationAsRead(notifId);
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
    } catch {
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
    }
  };

  return (
    <AppContext.Provider
      value={{
        auth,
        login,
        register,
        logout,
        completeOnboarding,
        company,
        updateCompany,
        departments,
        roles,
        humanEmployees,
        aiEmployees,
        tasks,
        goals,
        activities,
        notifications,
        activeView,
        setActiveView,
        selectedTask,
        setSelectedTask,
        selectedAIEmployee,
        setSelectedAIEmployee,
        isHireModalOpen,
        setIsHireModalOpen,
        hireModalTab,
        setHireModalTab,
        isCreateTaskModalOpen,
        setIsCreateTaskModalOpen,
        isCreateGoalModalOpen,
        setIsCreateGoalModalOpen,
        isTaskDetailModalOpen,
        setIsTaskDetailModalOpen,
        selectedTaskId,
        setSelectedTaskId,
        isMemoryModalOpen,
        setIsMemoryModalOpen,
        createTask,
        updateTaskStatus,
        submitTaskDeliverable,
        reviewTaskSubmission,
        hireHumanEmployee,
        updateEmployee,
        hireAIEmployee,
        createDepartment,
        createRole,
        updateAIMemory,
        createGoal,
        markNotificationAsRead
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

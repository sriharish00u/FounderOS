import { createContext } from 'react';
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

export type ActiveView = 
  | 'dashboard'
  | 'tasks'
  | 'todos'
  | 'goals'
  | 'people'
  | 'reports'
  | 'settings';

export type AuthStatus =
  | { phase: 'loading' }
  | { phase: 'unauthenticated' }
  | { phase: 'authenticated'; token: string; user: AuthUser };

export interface AppContextType {
  auth: AuthStatus;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    company: { name: string; type?: string; address?: string };
    founder: { name: string; email: string; phone?: string; password: string };
  }) => Promise<void>;
  logout: () => void;
  completeOnboarding: (data: OnboardingPayload) => Promise<void>;

  company: CompanyDetails;
  updateCompany: (details: Partial<CompanyDetails>) => void;
  departments: Department[];
  roles: Role[];
  humanEmployees: HumanEmployee[];
  aiEmployees: AIEmployee[];
  tasks: Task[];
  goals: Goal[];
  activities: ActivityItem[];
  notifications: NotificationItem[];
  
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  
  selectedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;
  selectedAIEmployee: AIEmployee | null;
  setSelectedAIEmployee: (ai: AIEmployee | null) => void;
  
  isHireModalOpen: boolean;
  setIsHireModalOpen: (open: boolean) => void;
  hireModalTab: 'human' | 'ai';
  setHireModalTab: (tab: 'human' | 'ai') => void;
  
  isCreateTaskModalOpen: boolean;
  setIsCreateTaskModalOpen: (open: boolean) => void;
  isMemoryModalOpen: boolean;
  setIsMemoryModalOpen: (open: boolean) => void;
  
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'submissions' | 'activityLogs'>) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  submitTaskDeliverable: (taskId: string, summary: string, notes?: string) => void;
  reviewTaskSubmission: (taskId: string, submissionId: string, decision: 'approved' | 'changes_requested', notes: string) => void;
  
  hireHumanEmployee: (data: { name: string; email: string; phone: string; role: string; department: string }) => void;
  updateEmployee: (id: string, data: { name?: string; email?: string; phone?: string; role?: string; department?: string }) => void;
  hireAIEmployee: (data: {
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
  }) => void;
  createDepartment: (data: { name: string; lead?: string }) => Promise<void>;
  createRole: (data: {
    name: string;
    description?: string;
    department?: string;
    priority?: string;
    responsibilities?: string[];
    permissions?: string[];
  }) => Promise<void>;
  
  updateAIMemory: (aiId: string, memoryUpdates: Partial<AIEmployee['memory']>) => void;
  createGoal: (goal: Omit<Goal, 'id' | 'linkedTaskIds'>) => void;
  markNotificationAsRead: (notifId: string) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

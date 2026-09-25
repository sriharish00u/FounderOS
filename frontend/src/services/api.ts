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
  AuthSession,
  OnboardingPayload
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AUTH_STORAGE_KEY = 'founder_os_auth';

const getStoredToken = (): string | null => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { token?: string };
    return parsed.token ?? null;
  } catch {
    return null;
  }
};

const normalizeIds = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(normalizeIds);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k === '_id' ? 'id' : k] = normalizeIds(v);
    }
    return out;
  }
  return value;
};

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      if (err?.error) message = err.error;
    } catch {
      // Ignore parse failures
    }
    throw new Error(message);
  }

  return normalizeIds(await res.json()) as T;
}

export const api = {
  register: (data: {
    company: { name: string; type?: string; address?: string };
    founder: { name: string; email: string; phone?: string; password: string };
  }) => request<AuthSession>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  login: (data: { email: string; password: string }) => request<AuthSession>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getMe: (token: string) => request<{ user: AuthSession['user']; company: CompanyDetails | null }>('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  }),
  completeOnboarding: (data: OnboardingPayload) => request<{ user: AuthSession['user'] }>('/auth/onboarding', {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),

  getCompany: () => request<CompanyDetails>('/company'),
  updateCompany: (data: Partial<CompanyDetails>) => request<CompanyDetails>('/company', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  getEmployees: () => request<HumanEmployee[]>('/employees'),
  hireEmployee: (data: { name: string; email: string; phone: string; role: string; department: string }) => 
    request<HumanEmployee>('/employees/hire', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateEmployee: (id: string, data: { name?: string; email?: string; phone?: string; role?: string; department?: string }) =>
    request<HumanEmployee>(`/employees/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  getAIEmployees: () => request<AIEmployee[]>('/ai-employees'),
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
  }) => request<AIEmployee>('/ai-employees', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateAIMemory: (aiId: string, memoryUpdates: Partial<AIEmployee['memory']>) =>
    request<AIEmployee>(`/ai-employees/${aiId}/memory`, {
      method: 'PUT',
      body: JSON.stringify(memoryUpdates),
    }),
  loadAIModels: (url: string, apiKey: string) =>
    request<{ provider: string; models: string[] }>('/ai/models', {
      method: 'POST',
      body: JSON.stringify({ url, apiKey }),
    }),

  getTasks: () => request<Task[]>('/tasks'),
  createTask: (data: Omit<Task, 'id' | 'createdAt' | 'submissions' | 'activityLogs'>) => 
    request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateTaskStatus: (taskId: string, status: TaskStatus, performedBy?: string) => 
    request<Task>(`/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, performedBy }),
    }),
  submitDeliverable: (taskId: string, data: { deliverableSummary: string; notes?: string; submittedBy: string; submitterType: 'human' | 'ai' }) =>
    request<Task>(`/tasks/${taskId}/submissions`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  reviewSubmission: (taskId: string, submissionId: string, data: { decision: 'approved' | 'changes_requested'; notes: string; reviewedBy: string }) =>
    request<Task>(`/tasks/${taskId}/submissions/${submissionId}/review`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getGoals: () => request<Goal[]>('/goals'),
  createGoal: (data: Omit<Goal, 'id' | 'linkedTaskIds'>) => 
    request<Goal>('/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getDepartments: () => request<Department[]>('/departments'),
  getRoles: () => request<Role[]>('/roles'),
  createDepartment: (data: { name: string; lead?: string }) =>
    request<Department>('/departments', {
      method: 'POST',
      body: JSON.stringify({ name: data.name, lead: data.lead }),
    }),
  createRole: (data: {
    name: string;
    description?: string;
    department?: string;
    priority?: string;
    responsibilities?: string[];
    permissions?: string[];
  }) => request<Role>('/roles', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  getActivities: () => request<ActivityItem[]>('/activities'),
  getNotifications: () => request<NotificationItem[]>('/notifications'),
  markNotificationAsRead: (notifId: string) => 
    request<NotificationItem>(`/notifications/${notifId}/read`, {
      method: 'PATCH',
    }),
};

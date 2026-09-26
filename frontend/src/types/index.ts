export type UserRole = 'founder' | 'co_founder' | 'manager' | 'employee' | 'ai';

export interface UserProfile {
  dob?: string;
  gender?: string;
  city?: string;
  altPhone?: string;
  personalEmail?: string;
  address?: string;
}

export interface UserPreferences {
  avatar?: string;
  notifications?: string;
  workMode?: string;
}

export interface OnboardingPayload {
  name?: string;
  phone?: string;
  department?: string;
  role?: string;
  level?: string;
  managerId?: string;
  managerName?: string;
  password?: string;
  bio?: string;
  skills?: string[];
  profile?: Partial<UserProfile>;
  preferences?: Partial<UserPreferences>;
}

export interface AuthUser {
  id: string;
  email: string;
  phone?: string;
  name: string;
  role: UserRole;
  companyCode: string;
  department?: string;
  departmentId?: string;
  status: 'active' | 'invited' | 'onboarding';
  mustChangePassword?: boolean;
  level?: string;
  bio?: string;
  skills?: string[];
  profile?: UserProfile;
  preferences?: UserPreferences;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
  company: CompanyDetails | null;
}

export type TaskStatus = 
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'REVIEW'
  | 'COMPLETED'
  | 'BLOCKED'
  | 'CANCELLED';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface HumanEmployee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  roleId: string;
  department: string;
  departmentId: string;
  managerId?: string;
  managerName?: string;
  employeeCode: string;
  avatar: string;
  status: 'active' | 'invited' | 'onboarding';
  joinedDate: string;
  address?: string;
  tasksCompleted: number;
  tasksInProgress: number;
  level?: string;
  bio?: string;
  skills?: string[];
  profile?: UserProfile;
  preferences?: UserPreferences;
}

export interface AIMemory {
  id: string;
  identitySummary: string;
  responsibilities: string[];
  companyContext: string;
  instructions: string;
  preferences: string[];
  keyLearnings: string[];
  previousOutputsSummary: string;
  tokenCount: number;
  lastUpdated: string;
}

export interface AIEmployee {
  id: string;
  name: string;
  role: string;
  department: string;
  departmentId: string;
  managerId: string;
  managerName: string;
  provider: 'OpenAI' | 'Anthropic' | 'Google' | 'Groq' | 'Ollama' | 'Custom';
  model: string;
  fallbackModel?: string;
  fallbackModels?: string[];
  apiEndpoint?: string;
  apiKey?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'idle' | 'running' | 'completed_recent' | 'error';
  avatar: string;
  permissions: string[];
  memory: AIMemory;
  tasksCompleted: number;
  tasksRunning: number;
  successRate: number;
  lastActive: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  department: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  responsibilities: string[];
  permissions: string[];
  memberCount: number;
}

export interface Department {
  id: string;
  name: string;
  lead: string;
  memberCount: number;
  aiCount: number;
  progress: number;
  color: string;
}

export interface TaskSubmission {
  id: string;
  submittedAt: string;
  submittedBy: string;
  submitterType: 'human' | 'ai';
  deliverableSummary: string;
  attachments?: string[];
  notes?: string;
  reviewStatus?: 'pending' | 'approved' | 'changes_requested';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  creatorName: string;
  assigneeId: string;
  assigneeName: string;
  assigneeType: 'human' | 'ai';
  assigneeAvatar?: string;
  assigneeRole: string;
  department: string;
  priority: TaskPriority;
  status: TaskStatus;
  deadline: string;
  createdAt: string;
  goalId?: string;
  goalTitle?: string;
  targetId?: string;
  targetTitle?: string;
  submissions: TaskSubmission[];
  activityLogs: {
    id: string;
    timestamp: string;
    action: string;
    performedBy: string;
  }[];
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetMetric: string;
  currentValue: string;
  targetValue: string;
  progressPercent: number;
  deadline: string;
  ownerName: string;
  ownerRole: string;
  department: string;
  status: 'on_track' | 'at_risk' | 'completed' | 'behind';
  linkedTaskIds: string[];
}

export interface ActivityItem {
  id: string;
  timestamp: string;
  actorName: string;
  actorType: 'human' | 'ai' | 'founder';
  actorAvatar?: string;
  action: string;
  target: string;
  category: 'task' | 'goal' | 'hire' | 'review' | 'system';
}

export interface NotificationItem {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: 'urgent' | 'milestone' | 'review' | 'info';
  read: boolean;
  linkAction?: string;
}

export interface CompanyDetails {
  name: string;
  code: string;
  type: string;
  address: string;
  isOnline: boolean;
  owner: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };
  coFounders: {
    id: string;
    name: string;
    email: string;
    phone: string;
  }[];
}

export type DealStage = 'LEAD' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';

export interface Deal {
  id: string;
  title: string;
  clientName: string;
  contactEmail: string;
  value: number;
  stage: DealStage;
  probability: number;
  ownerName: string;
  notes?: string;
  lastContactDate: string;
  followUpRequired: boolean;
  aiRecommendation?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CRMResponse {
  deals: Deal[];
  metrics: {
    totalDeals: number;
    openDealsCount: number;
    pipelineValue: number;
    wonValue: number;
  };
}

export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
  | 'Subscription / MRR'
  | 'Services / Deals'
  | 'Payroll'
  | 'Cloud & Compute'
  | 'AI APIs'
  | 'Marketing'
  | 'Operations'
  | 'Other';

export interface FinanceTransaction {
  id: string;
  title: string;
  type: TransactionType;
  amount: number;
  category: TransactionCategory;
  date: string;
  status: 'cleared' | 'pending';
  account?: string;
  notes?: string;
}

export interface FinancialSummary {
  cashBalance: number;
  monthlyBurn: number;
  monthlyMRR: number;
  netMonthlyBurn: number;
  runwayMonths: number;
  totalIncome: number;
  totalExpense: number;
  categoryBreakdown: Record<string, number>;
  transactionCount: number;
}

export type DecisionCategory = 'Strategy' | 'Product' | 'Hiring' | 'Finance' | 'Architecture';

export interface Decision {
  id: string;
  title: string;
  category: DecisionCategory;
  context: string;
  decision: string;
  rationale: string;
  impact?: string;
  stakeholders: string[];
  date: string;
  status: 'active' | 'superseded' | 'under_review';
  ownerName: string;
}

export interface ExecutiveBriefing {
  date: string;
  criticalAttentions: {
    id: string;
    level: 'critical' | 'warning' | 'info';
    title: string;
    message: string;
    actionLabel?: string;
    actionType?: string;
    targetId?: string;
  }[];
  topPriorities: {
    id: string;
    rank: number;
    title: string;
    context: string;
    category: 'CRM' | 'Finance' | 'Project' | 'Team' | 'Strategy';
    actionLabel: string;
    targetView: string;
  }[];
  pillarHealth: {
    crm: { pipelineValue: number; openDeals: number; stalledDeals: number };
    finance: { cashBalance: number; monthlyBurn: number; runwayMonths: number };
    projects: { totalTasks: number; inReview: number; urgentCount: number };
    team: { humans: number; aiAgents: number; runningNow: number };
    strategy: { avgGoalProgress: number; totalGoals: number };
  };
}

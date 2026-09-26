import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import type {
  Task,
  Goal,
  TaskStatus,
  Deal,
  DealStage,
  FinanceTransaction,
  Decision,
} from '../types';

export const queryKeys = {
  company: ['company'] as const,
  employees: ['employees'] as const,
  aiEmployees: ['aiEmployees'] as const,
  tasks: ['tasks'] as const,
  goals: ['goals'] as const,
  activities: ['activities'] as const,
  notifications: ['notifications'] as const,
  departments: ['departments'] as const,
  roles: ['roles'] as const,
  crm: ['crm'] as const,
  financeSummary: ['financeSummary'] as const,
  financeTransactions: ['financeTransactions'] as const,
  decisions: ['decisions'] as const,
  executiveBriefing: ['executiveBriefing'] as const,
};

export function useCompanyQuery() {
  return useQuery({
    queryKey: queryKeys.company,
    queryFn: () => api.getCompany(),
    staleTime: 1000 * 30,
  });
}

export function useEmployeesQuery() {
  return useQuery({
    queryKey: queryKeys.employees,
    queryFn: () => api.getEmployees(),
    staleTime: 1000 * 15,
  });
}

export function useAIEmployeesQuery() {
  return useQuery({
    queryKey: queryKeys.aiEmployees,
    queryFn: () => api.getAIEmployees(),
    staleTime: 1000 * 15,
  });
}

export function useTasksQuery() {
  return useQuery({
    queryKey: queryKeys.tasks,
    queryFn: () => api.getTasks(),
    staleTime: 1000 * 10,
    refetchInterval: 10000,
  });
}

export function useGoalsQuery() {
  return useQuery({
    queryKey: queryKeys.goals,
    queryFn: () => api.getGoals(),
    staleTime: 1000 * 30,
  });
}

export function useActivitiesQuery() {
  return useQuery({
    queryKey: queryKeys.activities,
    queryFn: () => api.getActivities(),
    staleTime: 1000 * 10,
    refetchInterval: 10000,
  });
}

export function useNotificationsQuery() {
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: () => api.getNotifications(),
    staleTime: 1000 * 10,
    refetchInterval: 15000,
  });
}

export function useDepartmentsQuery() {
  return useQuery({
    queryKey: queryKeys.departments,
    queryFn: () => api.getDepartments(),
    staleTime: 1000 * 60,
  });
}

export function useRolesQuery() {
  return useQuery({
    queryKey: queryKeys.roles,
    queryFn: () => api.getRoles(),
    staleTime: 1000 * 60,
  });
}

export function useUpdateTaskStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, status, performedBy }: { taskId: string; status: TaskStatus; performedBy?: string }) =>
      api.updateTaskStatus(taskId, status, performedBy),
    onMutate: async ({ taskId, status }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks });
      const previousTasks = queryClient.getQueryData<Task[]>(queryKeys.tasks);

      if (previousTasks) {
        queryClient.setQueryData<Task[]>(
          queryKeys.tasks,
          previousTasks.map((t) => (t.id === taskId ? { ...t, status } : t))
        );
      }
      return { previousTasks };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKeys.tasks, context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      queryClient.invalidateQueries({ queryKey: queryKeys.activities });
      queryClient.invalidateQueries({ queryKey: queryKeys.employees });
      queryClient.invalidateQueries({ queryKey: queryKeys.aiEmployees });
    },
  });
}

export function useReviewSubmissionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      submissionId,
      decision,
      notes,
      reviewedBy,
    }: {
      taskId: string;
      submissionId: string;
      decision: 'approved' | 'changes_requested';
      notes: string;
      reviewedBy: string;
    }) => api.reviewSubmission(taskId, submissionId, { decision, notes, reviewedBy }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      queryClient.invalidateQueries({ queryKey: queryKeys.activities });
      queryClient.invalidateQueries({ queryKey: queryKeys.employees });
      queryClient.invalidateQueries({ queryKey: queryKeys.aiEmployees });
    },
  });
}

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Task, 'id' | 'createdAt' | 'submissions' | 'activityLogs'>) =>
      api.createTask(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      queryClient.invalidateQueries({ queryKey: queryKeys.activities });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
      queryClient.invalidateQueries({ queryKey: queryKeys.goals });
    },
  });
}

export function useSubmitDeliverableMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      data,
    }: {
      taskId: string;
      data: { deliverableSummary: string; notes?: string; submittedBy: string; submitterType: 'human' | 'ai' };
    }) => api.submitDeliverable(taskId, data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      queryClient.invalidateQueries({ queryKey: queryKeys.activities });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
}

export function useCreateGoalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Goal, 'id' | 'linkedTaskIds'>) => api.createGoal(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals });
      queryClient.invalidateQueries({ queryKey: queryKeys.activities });
      queryClient.invalidateQueries({ queryKey: queryKeys.executiveBriefing });
    },
  });
}

// Pillar 1: CRM Hooks
export function useCRMQuery() {
  return useQuery({
    queryKey: queryKeys.crm,
    queryFn: () => api.getCRM(),
    staleTime: 1000 * 20,
  });
}

export function useCreateDealMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => api.createDeal(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.crm });
      queryClient.invalidateQueries({ queryKey: queryKeys.activities });
      queryClient.invalidateQueries({ queryKey: queryKeys.executiveBriefing });
    },
  });
}

export function useUpdateDealStageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: DealStage }) => api.updateDealStage(id, stage),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.crm });
      queryClient.invalidateQueries({ queryKey: queryKeys.activities });
      queryClient.invalidateQueries({ queryKey: queryKeys.executiveBriefing });
    },
  });
}

export function useGenerateDealOutreachMutation() {
  return useMutation({
    mutationFn: (id: string) => api.generateDealOutreach(id),
  });
}

// Pillar 2: Finance Hooks
export function useFinanceSummaryQuery() {
  return useQuery({
    queryKey: queryKeys.financeSummary,
    queryFn: () => api.getFinanceSummary(),
    staleTime: 1000 * 30,
  });
}

export function useFinanceTransactionsQuery() {
  return useQuery({
    queryKey: queryKeys.financeTransactions,
    queryFn: () => api.getFinanceTransactions(),
    staleTime: 1000 * 30,
  });
}

export function useCreateFinanceTransactionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<FinanceTransaction, 'id'>) => api.createFinanceTransaction(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.financeSummary });
      queryClient.invalidateQueries({ queryKey: queryKeys.financeTransactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.activities });
      queryClient.invalidateQueries({ queryKey: queryKeys.executiveBriefing });
    },
  });
}

// Pillar 3: Decisions Hooks
export function useDecisionsQuery() {
  return useQuery({
    queryKey: queryKeys.decisions,
    queryFn: () => api.getDecisions(),
    staleTime: 1000 * 60,
  });
}

export function useCreateDecisionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Decision, 'id'>) => api.createDecision(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.decisions });
      queryClient.invalidateQueries({ queryKey: queryKeys.activities });
      queryClient.invalidateQueries({ queryKey: queryKeys.executiveBriefing });
    },
  });
}

// Pillar 4: Executive Briefing Hook
export function useExecutiveBriefingQuery() {
  return useQuery({
    queryKey: queryKeys.executiveBriefing,
    queryFn: () => api.getExecutiveBriefing(),
    staleTime: 1000 * 20,
    refetchInterval: 20000,
  });
}

import { Router, Request, Response } from 'express';
import { Deal } from '../models/Deal';
import { FinanceTransaction } from '../models/FinanceTransaction';
import { Task } from '../models/Task';
import { Goal } from '../models/Goal';
import { AIEmployee } from '../models/AIEmployee';
import { Employee } from '../models/Employee';
import { requireAuth, type AuthUser } from './authRoutes';

const router = Router();

const getCompanyCode = (req: Request): string => {
  const user = (req as Request & { user?: AuthUser }).user;
  return user?.companyCode ?? 'FO-2026-7X4K';
};

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

router.get('/briefing', requireAuth, async (req: Request, res: Response) => {
  try {
    const companyCode = getCompanyCode(req);

    const [deals, transactions, tasks, goals, aiStaff, humanStaff] = await Promise.all([
      Deal.find({ companyCode }),
      FinanceTransaction.find({ companyCode }),
      Task.find({ companyCode }),
      Goal.find({ companyCode }),
      AIEmployee.find({ companyCode }),
      Employee.find({ companyCode }),
    ]);

    // 1. CRM Metrics
    const openDeals = deals.filter((d) => !['WON', 'LOST'].includes(d.stage));
    const pipelineValue = openDeals.reduce((sum, d) => sum + (d.value || 0), 0);
    const stalledDeals = openDeals.filter((d) => {
      if (!d.lastContactDate) return false;
      const daysSince =
        (Date.now() - new Date(d.lastContactDate).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince >= 3;
    });

    // 2. Finance Metrics
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const cashBalance = Math.max(0, 125000 + totalIncome - totalExpense);
    const monthlyBurn = 14500;
    const monthlyMRR = 18200;
    const netMonthlyBurn = Math.max(0, monthlyBurn - monthlyMRR);
    const runwayMonths = netMonthlyBurn > 0 ? Number((cashBalance / netMonthlyBurn).toFixed(1)) : 24.0;

    // 3. Project & Task Metrics
    const pendingReviews = tasks.filter((t) => t.status === 'SUBMITTED' || t.status === 'REVIEW');
    const urgentTasks = tasks.filter(
      (t) => t.priority === 'URGENT' && !['COMPLETED', 'CANCELLED'].includes(t.status)
    );

    // 4. Team & Strategy
    const runningAi = aiStaff.filter((a) => a.status === 'running').length;
    const avgGoalProgress = goals.length
      ? Math.round(goals.reduce((sum, g) => sum + g.progressPercent, 0) / goals.length)
      : 0;

    // Build Critical Attentions
    const criticalAttentions: ExecutiveBriefing['criticalAttentions'] = [];

    if (stalledDeals.length > 0) {
      const topStalled = stalledDeals.sort((a, b) => b.value - a.value)[0];
      criticalAttentions.push({
        id: 'crit-deal-stalled',
        level: 'critical',
        title: `${stalledDeals.length} High-Value Deal${stalledDeals.length > 1 ? 's' : ''} Stalled`,
        message: `Deal "${topStalled.title}" ($${topStalled.value.toLocaleString()}) has had no outreach in 3+ days.`,
        actionLabel: 'Review CRM Pipeline',
        actionType: 'navigate_crm',
        targetId: String(topStalled._id),
      });
    }

    if (pendingReviews.length > 0) {
      criticalAttentions.push({
        id: 'crit-ai-review',
        level: 'warning',
        title: `${pendingReviews.length} Deliverable${pendingReviews.length > 1 ? 's' : ''} Awaiting Founder Review`,
        message: `Deliverable draft for "${pendingReviews[0].title}" submitted by ${pendingReviews[0].assigneeName} is ready for approval.`,
        actionLabel: 'Review Submission',
        actionType: 'open_task',
        targetId: String(pendingReviews[0]._id),
      });
    }

    if (runwayMonths < 8) {
      criticalAttentions.push({
        id: 'crit-runway',
        level: 'warning',
        title: `Cash Runway at ${runwayMonths} Months`,
        message: `Estimated net burn rate is $${monthlyBurn.toLocaleString()}/mo against $${cashBalance.toLocaleString()} reserves.`,
        actionLabel: 'View Financials',
        actionType: 'navigate_finance',
      });
    }

    // Build Top 3 Priorities
    const topPriorities: ExecutiveBriefing['topPriorities'] = [
      {
        id: 'prio-1',
        rank: 1,
        title: pendingReviews.length > 0
          ? `Review AI Deliverable: "${pendingReviews[0].title.slice(0, 42)}..."`
          : 'Audit & Finalize Weekly Sprint Deliverables',
        context: pendingReviews.length > 0
          ? 'Autonomous draft submitted and waiting for managerial sign-off to update OKRs.'
          : 'Ensure all active tasks across Engineering & Operations have clear blocking paths.',
        category: 'Project',
        actionLabel: 'Open Task Board',
        targetView: 'tasks',
      },
      {
        id: 'prio-2',
        rank: 2,
        title: stalledDeals.length > 0
          ? `Re-engage Stalled Deal: "${stalledDeals[0].title}"`
          : 'Expand Enterprise Pipeline & Schedule Demos',
        context: stalledDeals.length > 0
          ? `Client ${stalledDeals[0].clientName} is evaluating proposal ($${stalledDeals[0].value.toLocaleString()}).`
          : 'High conversion rate in Qualified stage justifies launching new targeted outreach.',
        category: 'CRM',
        actionLabel: 'Open CRM Deals',
        targetView: 'crm',
      },
      {
        id: 'prio-3',
        rank: 3,
        title: 'Review Financial Runway & Resource Allocation',
        context: `Current runway stands at ${runwayMonths} months with $${cashBalance.toLocaleString()} liquid balance.`,
        category: 'Finance',
        actionLabel: 'Open Finance Command',
        targetView: 'finance',
      },
    ];

    const briefing: ExecutiveBriefing = {
      date: new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      criticalAttentions,
      topPriorities,
      pillarHealth: {
        crm: {
          pipelineValue,
          openDeals: openDeals.length,
          stalledDeals: stalledDeals.length,
        },
        finance: {
          cashBalance,
          monthlyBurn,
          runwayMonths,
        },
        projects: {
          totalTasks: tasks.length,
          inReview: pendingReviews.length,
          urgentCount: urgentTasks.length,
        },
        team: {
          humans: humanStaff.length,
          aiAgents: aiStaff.length,
          runningNow: runningAi,
        },
        strategy: {
          avgGoalProgress,
          totalGoals: goals.length,
        },
      },
    };

    res.json(briefing);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate executive briefing' });
  }
});

export default router;

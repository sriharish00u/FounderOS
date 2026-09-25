import { Router, Request, Response } from 'express';
import { Task } from '../models/Task';
import { Employee } from '../models/Employee';
import { AIEmployee } from '../models/AIEmployee';
import { Goal } from '../models/Goal';
import { requireAuth, type AuthUser } from './authRoutes';

const router = Router();

router.get('/summary', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as Request & { user?: AuthUser }).user;
    const companyCode = user?.companyCode ?? 'FO-2026-7X4K';

    const tasksCount = await Task.countDocuments({ companyCode });
    const completedCount = await Task.countDocuments({ companyCode, status: 'COMPLETED' });
    const inProgressCount = await Task.countDocuments({ companyCode, status: { $in: ['IN_PROGRESS', 'SUBMITTED', 'REVIEW'] } });
    const employeesCount = await Employee.countDocuments({ companyCode });
    const aiCount = await AIEmployee.countDocuments({ companyCode });
    const goals = await Goal.find({ companyCode });

    res.json({
      tasks: {
        total: tasksCount,
        completed: completedCount,
        inProgress: inProgressCount,
      },
      workforce: {
        humans: employeesCount,
        ai: aiCount,
      },
      goalsCount: goals.length,
      historicalCompleted: completedCount,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

router.get('/analytics', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as Request & { user?: AuthUser }).user;
    const companyCode = user?.companyCode ?? 'FO-2026-7X4K';
    const { range } = req.query;

    const humanTasksCompleted = await Task.countDocuments({ companyCode, assigneeType: 'human', status: 'COMPLETED' });
    const aiTasksCompleted = await Task.countDocuments({ companyCode, assigneeType: 'ai', status: 'COMPLETED' });
    const pendingReviews = await Task.countDocuments({ companyCode, status: { $in: ['SUBMITTED', 'REVIEW'] } });

    const allTasks = await Task.find({ companyCode }).sort({ createdAt: -1 });
    const deptBreakdown: Record<string, { total: number; completed: number }> = {};
    for (const t of allTasks) {
      const dept = t.department || 'General';
      if (!deptBreakdown[dept]) deptBreakdown[dept] = { total: 0, completed: 0 };
      deptBreakdown[dept].total += 1;
      if (t.status === 'COMPLETED') deptBreakdown[dept].completed += 1;
    }

    const goals = await Goal.find({ companyCode });

    res.json({
      range: range || 'all',
      humanTasksCompleted,
      aiTasksCompleted,
      pendingReviews,
      totalTasks: allTasks.length,
      deptBreakdown,
      goals: goals.map((g) => ({
        id: String(g._id),
        title: g.title,
        progressPercent: g.progressPercent,
        status: g.status,
        department: g.department,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
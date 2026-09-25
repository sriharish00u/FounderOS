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

export default router;
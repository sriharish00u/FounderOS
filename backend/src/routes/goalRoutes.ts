import { Router, Request, Response } from 'express';
import { Goal } from '../models/Goal';
import { Activity } from '../models/Activity';
import { requireAuth, type AuthUser } from './authRoutes';

const router = Router();

router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as Request & { user?: AuthUser }).user;
    const companyCode = user?.companyCode ?? 'FO-2026-7X4K';
    const goals = await Goal.find({ companyCode }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as Request & { user?: AuthUser }).user;
    const companyCode = user?.companyCode ?? 'FO-2026-7X4K';
    const newGoal = await Goal.create({
      ...req.body,
      companyCode
    });
    await Activity.create({
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      companyCode,
      actorName: user?.name ?? 'Founder',
      actorType: 'founder',
      action: 'created company goal',
      target: newGoal.title,
      category: 'goal'
    });
    res.status(201).json(newGoal);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

export default router;
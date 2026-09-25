import { Router, Request, Response } from 'express';
import { Activity } from '../models/Activity';
import { requireAuth, type AuthUser } from './authRoutes';

const router = Router();

router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as Request & { user?: AuthUser }).user;
    const companyCode = user?.companyCode ?? 'FO-2026-7X4K';
    const activities = await Activity.find({ companyCode }).sort({ createdAt: -1 }).limit(30);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as Request & { user?: AuthUser }).user;
    const companyCode = user?.companyCode ?? 'FO-2026-7X4K';
    const act = await Activity.create({ ...req.body, companyCode });
    res.status(201).json(act);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

export default router;
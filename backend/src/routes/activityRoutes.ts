import { Router, Request, Response } from 'express';
import { Activity } from '../models/Activity';
import { requireAuth, type AuthUser } from './authRoutes';

const router = Router();

router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as Request & { user?: AuthUser }).user;
    const companyCode = user?.companyCode ?? 'FO-2026-7X4K';
    const { category, search, format } = req.query;

    const filter: Record<string, unknown> = { companyCode };
    if (category && typeof category === 'string' && category !== 'all') {
      filter.category = category;
    }
    if (search && typeof search === 'string') {
      filter.$or = [
        { actorName: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
        { target: { $regex: search, $options: 'i' } },
      ];
    }

    const activities = await Activity.find(filter).sort({ createdAt: -1 }).limit(format === 'csv' ? 500 : 50);

    if (format === 'csv') {
      const header = 'Timestamp,Actor,ActorType,Action,Target,Category\n';
      const rows = activities
        .map(
          (a) =>
            `"${a.timestamp}","${a.actorName}","${a.actorType}","${a.action.replace(/"/g, '""')}","${a.target.replace(/"/g, '""')}","${a.category}"`
        )
        .join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=founder_os_audit_log.csv');
      return res.send(header + rows);
    }

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
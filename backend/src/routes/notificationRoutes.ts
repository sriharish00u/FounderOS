import { Router, Request, Response } from 'express';
import { Notification } from '../models/Notification';
import { requireAuth, type AuthUser } from './authRoutes';

const router = Router();

router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as Request & { user?: AuthUser }).user;
    const companyCode = user?.companyCode ?? 'FO-2026-7X4K';
    const notifications = await Notification.find({ companyCode }).sort({ createdAt: -1 }).limit(20);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

router.get('/stream', requireAuth, (req: Request, res: Response) => {
  const user = (req as Request & { user?: AuthUser }).user;
  const companyCode = user?.companyCode ?? 'FO-2026-7X4K';

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);

  const interval = setInterval(async () => {
    try {
      const unreadCount = await Notification.countDocuments({ companyCode, read: false });
      res.write(`data: ${JSON.stringify({ type: 'heartbeat', unreadCount, timestamp: new Date().toISOString() })}\n\n`);
    } catch {
      // ignore
    }
  }, 15000);

  req.on('close', () => {
    clearInterval(interval);
  });
});

router.patch('/:id/read', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as Request & { user?: AuthUser }).user;
    const companyCode = user?.companyCode ?? 'FO-2026-7X4K';
    const { id } = req.params;
    const notif = await Notification.findOneAndUpdate({ _id: id, companyCode }, { read: true }, { new: true });
    res.json(notif);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

export default router;
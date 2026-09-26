import { Router, Request, Response } from 'express';
import { Decision, DecisionCategory } from '../models/Decision';
import { Activity } from '../models/Activity';
import { requireAuth, type AuthUser } from './authRoutes';

const router = Router();

const getCompanyCode = (req: Request): string => {
  const user = (req as Request & { user?: AuthUser }).user;
  return user?.companyCode ?? 'FO-2026-7X4K';
};

router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const companyCode = getCompanyCode(req);
    const decisions = await Decision.find({ companyCode }).sort({ date: -1 });
    res.json(decisions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch decisions' });
  }
});

router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const companyCode = getCompanyCode(req);
    const user = (req as Request & { user?: AuthUser }).user;
    const { title, category, context, decision, rationale, impact, stakeholders } = req.body;

    if (!title || !context || !decision || !rationale) {
      return res.status(400).json({ error: 'Title, context, decision, and rationale are required' });
    }

    const newDecision = await Decision.create({
      companyCode,
      title: title.trim(),
      category: (category as DecisionCategory) || 'Strategy',
      context: context.trim(),
      decision: decision.trim(),
      rationale: rationale.trim(),
      impact: impact?.trim() || '',
      stakeholders: Array.isArray(stakeholders) ? stakeholders : [user?.name || 'Founder'],
      date: new Date().toISOString().split('T')[0],
      status: 'active',
      ownerName: user?.name || 'Founder',
    });

    await Activity.create({
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      companyCode,
      actorName: user?.name || 'Founder',
      actorType: 'founder',
      action: 'logged corporate decision',
      target: newDecision.title,
      category: 'system',
    });

    res.status(201).json(newDecision);
  } catch (error) {
    res.status(500).json({ error: 'Failed to record decision' });
  }
});

router.patch('/:id/status', requireAuth, async (req: Request, res: Response) => {
  try {
    const companyCode = getCompanyCode(req);
    const { id } = req.params;
    const { status } = req.body;

    const item = await Decision.findOneAndUpdate(
      { _id: id, companyCode },
      { status },
      { new: true }
    );
    if (!item) {
      return res.status(404).json({ error: 'Decision not found' });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update decision' });
  }
});

export default router;

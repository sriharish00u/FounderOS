import { Router, Request, Response } from 'express';
import { Deal, DealStage } from '../models/Deal';
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
    const deals = await Deal.find({ companyCode }).sort({ updatedAt: -1 });

    const pipelineValue = deals
      .filter((d) => d.stage !== 'LOST')
      .reduce((sum, d) => sum + (d.value || 0), 0);
    const wonValue = deals
      .filter((d) => d.stage === 'WON')
      .reduce((sum, d) => sum + (d.value || 0), 0);
    const openDealsCount = deals.filter((d) => !['WON', 'LOST'].includes(d.stage)).length;

    res.json({
      deals,
      metrics: {
        totalDeals: deals.length,
        openDealsCount,
        pipelineValue,
        wonValue,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch deals' });
  }
});

router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const companyCode = getCompanyCode(req);
    const user = (req as Request & { user?: AuthUser }).user;
    const { title, clientName, contactEmail, value, stage, probability, notes } = req.body;

    if (!title || !clientName) {
      return res.status(400).json({ error: 'Deal title and client name are required' });
    }

    const newDeal = await Deal.create({
      title: title.trim(),
      clientName: clientName.trim(),
      contactEmail: contactEmail?.trim() || '',
      value: Number(value) || 0,
      stage: (stage as DealStage) || 'LEAD',
      probability: probability !== undefined ? Number(probability) : 50,
      ownerName: user?.name || 'Founder',
      notes: notes || '',
      companyCode,
      lastContactDate: new Date().toISOString().split('T')[0],
      aiRecommendation: 'Initial outreach recommended. Establish decision criteria and budget.',
    });

    await Activity.create({
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      companyCode,
      actorName: user?.name || 'Founder',
      actorType: 'founder',
      action: 'created deal',
      target: `${newDeal.title} ($${newDeal.value.toLocaleString()})`,
      category: 'system',
    });

    res.status(201).json(newDeal);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create deal' });
  }
});

router.patch('/:id/stage', requireAuth, async (req: Request, res: Response) => {
  try {
    const companyCode = getCompanyCode(req);
    const user = (req as Request & { user?: AuthUser }).user;
    const { id } = req.params;
    const { stage } = req.body;

    const deal = await Deal.findOne({ _id: id, companyCode });
    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    const oldStage = deal.stage;
    deal.stage = stage as DealStage;
    deal.lastContactDate = new Date().toISOString().split('T')[0];

    if (stage === 'WON') {
      deal.probability = 100;
      deal.aiRecommendation = 'Deal closed successfully! Initiate customer onboarding workflow.';
    } else if (stage === 'LOST') {
      deal.probability = 0;
      deal.aiRecommendation = 'Log reason for loss and set re-engagement reminder in 90 days.';
    } else if (stage === 'NEGOTIATION') {
      deal.probability = 80;
      deal.aiRecommendation = 'Finalize contract terms, address pricing concessions, lock close date.';
    } else if (stage === 'PROPOSAL') {
      deal.probability = 60;
      deal.aiRecommendation = 'Follow up within 48 hours to walk through proposal scope with stakeholders.';
    }

    await deal.save();

    await Activity.create({
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      companyCode,
      actorName: user?.name || 'Founder',
      actorType: 'founder',
      action: `moved deal from ${oldStage} to ${stage}`,
      target: deal.title,
      category: 'system',
    });

    res.json(deal);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update deal stage' });
  }
});

router.post('/:id/generate-outreach', requireAuth, async (req: Request, res: Response) => {
  try {
    const companyCode = getCompanyCode(req);
    const { id } = req.params;
    const deal = await Deal.findOne({ _id: id, companyCode });
    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    const subject = `Following up on ${deal.title} — Founder OS`;
    const draft = `Hi ${deal.clientName},\n\nI wanted to follow up regarding our discussion on ${deal.title}. We've aligned our operational roadmap to support your specific milestone requirements.\n\nCould we jump on a brief 10-minute check-in this week to finalize the details?\n\nBest regards,\nFounder OS Executive Team`;

    deal.aiRecommendation = `Draft prepared on ${new Date().toLocaleDateString()}: Ready for dispatch.`;
    await deal.save();

    res.json({ subject, draft, deal });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate outreach draft' });
  }
});

export default router;

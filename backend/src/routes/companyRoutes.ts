import { Router, Request, Response } from 'express';
import { Company } from '../models/Company';
import { requireAuth, type AuthUser } from './authRoutes';

const router = Router();

router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as Request & { user?: AuthUser }).user;
    const companyCode = user?.companyCode ?? 'FO-2026-7X4K';
    const company = await Company.findOne({ code: companyCode });
    if (!company) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch company details' });
  }
});

router.put('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as Request & { user?: AuthUser }).user;
    const companyCode = user?.companyCode ?? 'FO-2026-7X4K';
    const updated = await Company.findOneAndUpdate({ code: companyCode }, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update company details' });
  }
});

export default router;
import { Router, Request, Response } from 'express';
import { FinanceTransaction, TransactionType, TransactionCategory } from '../models/FinanceTransaction';
import { Activity } from '../models/Activity';
import { requireAuth, type AuthUser } from './authRoutes';

const router = Router();

const getCompanyCode = (req: Request): string => {
  const user = (req as Request & { user?: AuthUser }).user;
  return user?.companyCode ?? 'FO-2026-7X4K';
};

router.get('/summary', requireAuth, async (req: Request, res: Response) => {
  try {
    const companyCode = getCompanyCode(req);
    const transactions = await FinanceTransaction.find({ companyCode }).sort({ date: -1 });

    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const cashBalance = Math.max(0, 125000 + totalIncome - totalExpense);

    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthExpenses = transactions
      .filter((t) => t.type === 'expense' && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + t.amount, 0);

    const monthIncome = transactions
      .filter((t) => t.type === 'income' && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyBurn = monthExpenses || 14500;
    const monthlyMRR = monthIncome || 18200;
    const netMonthlyBurn = Math.max(0, monthlyBurn - monthlyMRR);
    const runwayMonths = netMonthlyBurn > 0 ? Number((cashBalance / netMonthlyBurn).toFixed(1)) : 24.0;

    const categoryBreakdown: Record<string, number> = {};
    for (const t of transactions.filter((t) => t.type === 'expense')) {
      categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
    }

    res.json({
      cashBalance,
      monthlyBurn,
      monthlyMRR,
      netMonthlyBurn,
      runwayMonths,
      totalIncome,
      totalExpense,
      categoryBreakdown,
      transactionCount: transactions.length,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch financial summary' });
  }
});

router.get('/transactions', requireAuth, async (req: Request, res: Response) => {
  try {
    const companyCode = getCompanyCode(req);
    const transactions = await FinanceTransaction.find({ companyCode }).sort({ date: -1 }).limit(100);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

router.post('/transactions', requireAuth, async (req: Request, res: Response) => {
  try {
    const companyCode = getCompanyCode(req);
    const user = (req as Request & { user?: AuthUser }).user;
    const { title, type, amount, category, date, notes, account } = req.body;

    if (!title || !type || amount === undefined) {
      return res.status(400).json({ error: 'Title, type, and amount are required' });
    }

    const tx = await FinanceTransaction.create({
      companyCode,
      title: title.trim(),
      type: type as TransactionType,
      amount: Number(amount),
      category: (category as TransactionCategory) || 'Operations',
      date: date || new Date().toISOString().split('T')[0],
      account: account || 'Primary Operating (HDFC)',
      notes: notes || '',
      status: 'cleared',
    });

    await Activity.create({
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      companyCode,
      actorName: user?.name || 'Founder',
      actorType: 'founder',
      action: `recorded ${tx.type}`,
      target: `${tx.title} ($${tx.amount.toLocaleString()})`,
      category: 'system',
    });

    res.status(201).json(tx);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

router.delete('/transactions/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const companyCode = getCompanyCode(req);
    const { id } = req.params;
    await FinanceTransaction.deleteOne({ _id: id, companyCode });
    res.json({ message: 'Transaction removed', id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

export default router;

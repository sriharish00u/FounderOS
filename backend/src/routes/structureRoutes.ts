import { Router, Request, Response } from 'express';
import { Department } from '../models/Department';
import { Role } from '../models/Role';
import { Activity } from '../models/Activity';
import { requireAuth, type AuthUser } from './authRoutes';

const canManageStructure = (user?: AuthUser) =>
  !!user && ['founder', 'co_founder', 'manager'].includes(user.role);

const router = Router();

router.get('/departments', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as Request & { user?: AuthUser }).user;
    const companyCode = user?.companyCode ?? 'FO-2026-7X4K';
    const departments = await Department.find({ companyCode });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

router.get('/roles', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as Request & { user?: AuthUser }).user;
    const companyCode = user?.companyCode ?? 'FO-2026-7X4K';
    const roles = await Role.find({ companyCode });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

router.post('/departments', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as Request & { user?: AuthUser }).user;
    if (!canManageStructure(user)) {
      return res.status(403).json({ error: 'Only founders and managers can create departments' });
    }
    const companyCode = user?.companyCode ?? 'FO-2026-7X4K';
    const { name, lead } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Department name is required' });
    }

    const exists = await Department.findOne({ companyCode, name: name.trim() });
    if (exists) {
      return res.status(409).json({ error: 'Department already exists' });
    }

    const dept = await Department.create({
      name: name.trim(),
      companyCode,
      lead: lead?.trim() || user?.name || 'Unassigned',
      memberCount: 0,
      aiCount: 0,
      progress: 0,
      color: '#6366f1'
    });

    await Activity.create({
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      companyCode,
      actorName: user?.name ?? 'Founder',
      actorType: 'founder',
      action: 'created department',
      target: dept.name,
      category: 'system'
    });

    res.status(201).json(dept);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create department' });
  }
});

router.post('/roles', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as Request & { user?: AuthUser }).user;
    if (!canManageStructure(user)) {
      return res.status(403).json({ error: 'Only founders and managers can create roles' });
    }
    const companyCode = user?.companyCode ?? 'FO-2026-7X4K';
    const { name, description, department, priority, responsibilities, permissions } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Role name is required' });
    }

    const role = await Role.create({
      name: name.trim(),
      companyCode,
      description: description?.trim() || '',
      department: department?.trim() || '',
      priority: priority || 'MEDIUM',
      responsibilities: Array.isArray(responsibilities) ? responsibilities : [],
      permissions: Array.isArray(permissions) ? permissions : [],
      memberCount: 0
    });

    await Activity.create({
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      companyCode,
      actorName: user?.name ?? 'Founder',
      actorType: 'founder',
      action: 'created role',
      target: role.name,
      category: 'system'
    });

    res.status(201).json(role);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create role' });
  }
});

export default router;
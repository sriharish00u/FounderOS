import { Router, Request, Response } from 'express';
import { Department } from '../models/Department';
import { Role } from '../models/Role';
import { Employee } from '../models/Employee';
import { AIEmployee } from '../models/AIEmployee';
import { Task } from '../models/Task';
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

router.delete('/departments/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as Request & { user?: AuthUser }).user;
    if (!canManageStructure(user)) {
      return res.status(403).json({ error: 'Only founders and managers can delete departments' });
    }
    const companyCode = user?.companyCode ?? 'FO-2026-7X4K';
    const { id } = req.params;

    const dept = await Department.findOne({ _id: id, companyCode });
    if (!dept) {
      return res.status(404).json({ error: 'Department not found' });
    }

    const humanCount = await Employee.countDocuments({ companyCode, department: dept.name });
    const aiCount = await AIEmployee.countDocuments({ companyCode, department: dept.name });
    const openTasks = await Task.countDocuments({ companyCode, department: dept.name, status: { $nin: ['COMPLETED', 'CANCELLED'] } });

    if (humanCount > 0 || aiCount > 0 || openTasks > 0) {
      return res.status(409).json({
        error: `Cannot delete department "${dept.name}". Active associations: ${humanCount} employees, ${aiCount} AI agents, ${openTasks} open tasks.`
      });
    }

    await Department.deleteOne({ _id: id, companyCode });

    await Activity.create({
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      companyCode,
      actorName: user?.name ?? 'Founder',
      actorType: 'founder',
      action: 'deleted department',
      target: dept.name,
      category: 'system'
    });

    res.json({ message: 'Department deleted successfully', id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete department' });
  }
});

router.delete('/roles/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as Request & { user?: AuthUser }).user;
    if (!canManageStructure(user)) {
      return res.status(403).json({ error: 'Only founders and managers can delete roles' });
    }
    const companyCode = user?.companyCode ?? 'FO-2026-7X4K';
    const { id } = req.params;

    const role = await Role.findOne({ _id: id, companyCode });
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    const humanCount = await Employee.countDocuments({ companyCode, role: role.name });
    const aiCount = await AIEmployee.countDocuments({ companyCode, role: role.name });

    if (humanCount > 0 || aiCount > 0) {
      return res.status(409).json({
        error: `Cannot delete role "${role.name}". Active associations: ${humanCount} employees, ${aiCount} AI agents.`
      });
    }

    await Role.deleteOne({ _id: id, companyCode });

    await Activity.create({
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      companyCode,
      actorName: user?.name ?? 'Founder',
      actorType: 'founder',
      action: 'deleted role',
      target: role.name,
      category: 'system'
    });

    res.json({ message: 'Role deleted successfully', id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete role' });
  }
});

export default router;
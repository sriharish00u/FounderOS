import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Employee } from '../models/Employee';
import { User } from '../models/User';
import { Activity } from '../models/Activity';
import { requireAuth, type AuthUser } from './authRoutes';

const normalizePhone = (raw: string): string => {
  const trimmed = String(raw || '').trim();
  const leading = trimmed.startsWith('+') ? '+' : '';
  return leading + trimmed.replace(/[^\d]/g, '');
};

const toDTO = (doc: any) => {
  const plain = doc.toObject ? doc.toObject() : doc;
  return { ...plain, id: String(doc._id) };
};

const router = Router();

router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as Request & { user?: AuthUser }).user;
    const companyCode = user?.companyCode ?? 'FO-2026-7X4K';
    const employees = await Employee.find({ companyCode }).sort({ createdAt: -1 });
    res.json(employees.map(toDTO));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

router.post('/hire', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as Request & { user?: AuthUser }).user;
    if (!user || !['founder', 'co_founder', 'manager'].includes(user.role)) {
      return res.status(403).json({ error: 'Only founders and managers can hire employees' });
    }
    const companyCode = user?.companyCode ?? 'FO-2026-7X4K';
    const { name, email, phone, role, department } = req.body;

    if (!email || !phone) {
      return res.status(400).json({ error: 'Email and phone are required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ error: 'An account already exists for this email' });
    }
    const existingEmp = await Employee.findOne({ email: normalizedEmail });
    if (existingEmp) {
      return res.status(409).json({ error: 'An account already exists for this email' });
    }

    const count = await Employee.countDocuments({ companyCode });
    const codeNum = String(count + 1).padStart(3, '0');
    const password = normalizePhone(phone);

    const newEmp = await Employee.create({
      name: name || normalizedEmail.split('@')[0],
      companyCode,
      email: normalizedEmail,
      phone,
      role: role || 'Engineer',
      department: department || 'Engineering',
      employeeCode: `${companyCode}-EMP${codeNum}`,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0],
      tasksCompleted: 0,
      tasksInProgress: 0
    });

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      name: newEmp.name,
      email: normalizedEmail,
      phone,
      password: hashedPassword,
      role: 'employee',
      companyCode,
      department: newEmp.department,
      status: 'active',
      mustChangePassword: true
    });

    await Activity.create({
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      companyCode,
      actorName: user?.name ?? 'Founder',
      actorType: 'founder',
      action: 'hired employee',
      target: `${newEmp.name} (${newEmp.role})`,
      category: 'hire'
    });

    res.status(201).json(toDTO(newEmp));
  } catch (error) {
    res.status(500).json({ error: 'Failed to hire employee' });
  }
});

router.patch('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as Request & { user?: AuthUser }).user;
    if (!user || !['founder', 'co_founder', 'manager'].includes(user.role)) {
      return res.status(403).json({ error: 'Only founders and managers can edit employees' });
    }
    const companyCode = user?.companyCode ?? 'FO-2026-7X4K';
    const { name, email, phone, role, department } = req.body;

    const emp = await Employee.findOne({ _id: req.params.id, companyCode });
    if (!emp) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const oldEmail = emp.email;
    const oldPhone = emp.phone;
    const newEmail = email ? String(email).trim().toLowerCase() : oldEmail;
    if (newEmail !== oldEmail) {
      const clash = await User.findOne({ email: newEmail });
      if (clash || (await Employee.findOne({ email: newEmail, _id: { $ne: emp._id } }))) {
        return res.status(409).json({ error: 'An account already exists for this email' });
      }
    }

    emp.name = name || emp.name;
    emp.email = newEmail;
    emp.phone = phone || emp.phone;
    emp.role = role || emp.role;
    emp.department = department || emp.department;
    await emp.save();

    const linked = await User.findOne({ email: oldEmail });
    if (linked) {
      const passwordChanged = normalizePhone(oldPhone) !== normalizePhone(emp.phone);
      linked.name = emp.name;
      linked.email = newEmail;
      linked.phone = emp.phone;
      linked.department = emp.department;
      if (passwordChanged) {
        linked.password = await bcrypt.hash(normalizePhone(emp.phone), 10);
      }
      await linked.save();
    }

    await Activity.create({
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      companyCode,
      actorName: user?.name ?? 'Founder',
      actorType: 'founder',
      action: 'updated employee profile',
      target: `${emp.name} (${emp.role})`,
      category: 'hire'
    });

    res.json(toDTO(emp));
  } catch (error) {
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

export default router;
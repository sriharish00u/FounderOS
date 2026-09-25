import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { User } from '../models/User';
import { Company } from '../models/Company';
import { Employee } from '../models/Employee';
import { Activity } from '../models/Activity';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again later.' }
});

const normalizePhone = (raw: string): string => {
  const trimmed = String(raw || '').trim();
  const leading = trimmed.startsWith('+') ? '+' : '';
  return leading + trimmed.replace(/[^\d]/g, '');
};

const JWT_SECRET = process.env.JWT_SECRET || 'founder_os_secret_jwt_key_dev';
const TOKEN_EXPIRY = '30d';

const generateCompanyCode = (): string => {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `FO-${year}-${code}`;
};

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'founder' | 'co_founder' | 'manager' | 'employee' | 'ai';
  companyCode: string;
  department?: string;
  departmentId?: string;
}

export const signToken = (user: {
  id: string;
  email: string;
  name: string;
  role: string;
  companyCode: string;
  department?: string;
  departmentId?: string;
}): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      companyCode: user.companyCode,
      department: user.department,
      departmentId: user.departmentId
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
};

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthUser;
    (req as Request & { user?: AuthUser }).user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired session' });
  }
};

const publicUser = (user: {
  _id: unknown;
  email: string;
  phone?: string;
  name: string;
  role: string;
  companyCode: string;
  department?: string;
  departmentId?: string;
  status: string;
  mustChangePassword?: boolean;
  level?: string;
  bio?: string;
  skills?: string[];
  profile?: Record<string, unknown>;
  preferences?: Record<string, unknown>;
}) => ({
  id: String(user._id),
  email: user.email,
  phone: user.phone,
  name: user.name,
  role: user.role,
  companyCode: user.companyCode,
  department: user.department,
  departmentId: user.departmentId,
  status: user.status,
  mustChangePassword: user.mustChangePassword ?? false,
  level: user.level,
  bio: user.bio,
  skills: user.skills ?? [],
  profile: user.profile ?? {},
  preferences: user.preferences ?? {}
});

router.post('/register', authLimiter, async (req: Request, res: Response) => {
  try {
    const { company, founder } = req.body;

    if (!company?.name || !founder?.email || !founder?.name || !founder?.password) {
      res.status(400).json({ error: 'Company name, founder name, email, and password are required' });
      return;
    }

    if (founder.password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    const email = String(founder.email).trim().toLowerCase();
    const existingUser = await User.findOne({ email }).setOptions({ bypassTenancy: true });
    if (existingUser) {
      res.status(409).json({ error: 'An account already exists for this email' });
      return;
    }

    const existingCompany = await Company.findOne({ name: company.name });
    if (existingCompany) {
      res.status(409).json({ error: 'A company with this name is already registered' });
      return;
    }

    const code = generateCompanyCode();

    const hashedPassword = await bcrypt.hash(founder.password, 10);

    const newCompany = await Company.create({
      name: company.name,
      code,
      type: company.type || 'AI Software & Operating Systems',
      address: company.address || 'Bengaluru, India',
      isOnline: true,
      owner: {
        name: founder.name,
        phone: founder.phone || '+91 00000 00000',
        email,
        address: 'Bengaluru, India'
      },
      coFounders: []
    });

    const newUser = await User.create({
      name: founder.name,
      email,
      phone: founder.phone,
      password: hashedPassword,
      role: 'founder',
      companyCode: code,
      status: 'active'
    });

    await Activity.create({
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      companyCode: code,
      actorName: founder.name,
      actorType: 'founder',
      action: 'registered the company',
      target: company.name,
      category: 'system'
    });

    const token = signToken({
      id: String(newUser._id),
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      companyCode: newUser.companyCode
    });

    res.status(201).json({
      token,
      user: publicUser(newUser),
      company: {
        name: newCompany.name,
        code: newCompany.code,
        type: newCompany.type,
        address: newCompany.address,
        isOnline: newCompany.isOnline,
        owner: newCompany.owner,
        coFounders: newCompany.coFounders
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', authLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).setOptions({ bypassTenancy: true });
    if (!user || !user.password) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const passwordMatch = await bcrypt.compare(String(password), user.password);
    if (!passwordMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const company = await Company.findOne({ code: user.companyCode });

    await Activity.create({
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      companyCode: user.companyCode,
      actorName: user.name,
      actorType: 'founder',
      action: 'signed in',
      target: 'FounderOS',
      category: 'system'
    });

    const token = signToken({
      id: String(user._id),
      email: user.email,
      name: user.name,
      role: user.role,
      companyCode: user.companyCode,
      department: user.department,
      departmentId: user.departmentId
    });

    res.json({
      token,
      user: publicUser(user),
      company: company
        ? {
            name: company.name,
            code: company.code,
            type: company.type,
            address: company.address,
            isOnline: company.isOnline,
            owner: company.owner,
            coFounders: company.coFounders
          }
        : null
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const authUser = (req as Request & { user?: AuthUser }).user;
    if (!authUser) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const user = await User.findById(authUser.id).setOptions({ bypassTenancy: true });
    if (!user) {
      res.status(401).json({ error: 'Account no longer exists' });
      return;
    }

    const company = await Company.findOne({ code: user.companyCode });

    res.json({
      user: publicUser(user),
      company: company
        ? {
            name: company.name,
            code: company.code,
            type: company.type,
            address: company.address,
            isOnline: company.isOnline,
            owner: company.owner,
            coFounders: company.coFounders
          }
        : null
    });
  } catch (error) {
    console.error('Session restore error:', error);
    res.status(500).json({ error: 'Failed to restore session' });
  }
});

router.patch('/onboarding', requireAuth, async (req: Request, res: Response) => {
  try {
    const authUser = (req as Request & { user?: AuthUser }).user;
    if (!authUser) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const user = await User.findById(authUser.id).setOptions({ bypassTenancy: true });
    if (!user) {
      res.status(401).json({ error: 'Account no longer exists' });
      return;
    }

    const {
      name,
      phone,
      department,
      role,
      level,
      managerId,
      managerName,
      password,
      bio,
      skills,
      profile,
      preferences
    } = req.body;

    if (name && String(name).trim()) user.name = String(name).trim();
    if (phone && String(phone).trim()) user.phone = String(phone).trim();
    if (department && String(department).trim()) user.department = String(department).trim();
    if (level && String(level).trim()) user.level = String(level).trim();
    if (typeof bio === 'string') user.bio = bio.trim();
    if (Array.isArray(skills)) user.skills = skills.map(s => String(s).trim()).filter(Boolean);
    if (profile && typeof profile === 'object') user.profile = { ...(user.profile || {}), ...profile };
    if (preferences && typeof preferences === 'object') {
      user.preferences = { ...(user.preferences || {}), ...preferences };
    }

    if (password) {
      const passwordStr = String(password);
      if (passwordStr.length < 6) {
        res.status(400).json({ error: 'Password must be at least 6 characters' });
        return;
      }
      if (normalizePhone(user.phone || '') === normalizePhone(passwordStr)) {
        res.status(400).json({ error: 'Password must be different from your phone number' });
        return;
      }
      user.password = await bcrypt.hash(passwordStr, 10);
    }

    user.mustChangePassword = false;
    await user.save();

    const emp = await Employee.findOne({ companyCode: user.companyCode, email: user.email });
    if (emp) {
      if (name && String(name).trim()) emp.name = user.name;
      if (phone && String(phone).trim()) emp.phone = String(phone).trim();
      if (department && String(department).trim()) emp.department = String(department).trim();
      if (role && String(role).trim()) emp.role = String(role).trim();
      if (level && String(level).trim()) emp.level = String(level).trim();
      if (managerId && String(managerId).trim()) emp.managerId = String(managerId).trim();
      if (managerName && String(managerName).trim()) emp.managerName = String(managerName).trim();
      if (typeof bio === 'string') emp.bio = String(bio).trim();
      if (Array.isArray(skills)) emp.skills = skills.map(s => String(s).trim()).filter(Boolean);
      if (profile && typeof profile === 'object') emp.profile = { ...(emp.profile || {}), ...profile };
      if (preferences && typeof preferences === 'object') {
        emp.preferences = { ...(emp.preferences || {}), ...preferences };
        if (preferences.avatar) emp.avatar = String(preferences.avatar);
      }
      await emp.save();
    }

    await Activity.create({
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      companyCode: user.companyCode,
      actorName: user.name,
      actorType: 'founder',
      action: 'completed onboarding',
      target: `${user.name} (${user.role})`,
      category: 'system'
    });

    res.json({ user: publicUser(user) });
  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({ error: 'Failed to complete onboarding' });
  }
});

export default router;
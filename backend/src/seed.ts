import mongoose from 'mongoose';
import { Company } from './models/Company';
import { Department } from './models/Department';
import { Role } from './models/Role';
import { Employee } from './models/Employee';
import { AIEmployee } from './models/AIEmployee';
import { Task } from './models/Task';
import { Goal } from './models/Goal';
import { Activity } from './models/Activity';
import { Notification } from './models/Notification';
import { User } from './models/User';
import bcrypt from 'bcryptjs';

const upsertBy = async (model: mongoose.Model<any>, key: string, docs: any[]): Promise<void> => {
  if (!docs.length) return;
  const result = await model.bulkWrite(
    docs.map((doc) => ({
      updateOne: {
        filter: { [key]: doc[key] },
        update: { $set: doc },
        upsert: true
      }
    }))
  );
  console.log(`  ${model.modelName}: ${result.upsertedCount ?? 0} created, ${result.modifiedCount ?? 0} updated`);
};

const backfillCompanyCode = async (code: string): Promise<void> => {
  const tenantModels = [Employee, AIEmployee, Task, Goal, Department, Role, Activity, Notification];
  for (const model of tenantModels) {
    const res = await (model as any).updateMany({ companyCode: { $exists: false } }, { $set: { companyCode: code } });
    if (res.modifiedCount > 0) {
      console.log(`  Backfilled companyCode on ${model.modelName}: ${res.modifiedCount} docs`);
    }
  }
};

const insertIfEmpty = async (model: mongoose.Model<any>, docs: any[]): Promise<void> => {
  if (!docs.length) return;
  const count = await model.countDocuments();
  if (count > 0) return;
  await model.insertMany(docs);
};

export const seedDatabaseIfEmpty = async (): Promise<void> => {
  const companyCode = 'FO-2026-7X4K';
  console.log('Syncing Founder OS database in MongoDB Atlas (idempotent seed)...');

  const hashedPassword = await bcrypt.hash('founder123', 10);

  await upsertBy(Company, 'code', [
    {
      name: 'Founder OS Tech Labs',
      code: companyCode,
      type: 'AI Software & Operating Systems',
      address: 'Suite 402, Quantum Tower, Bengaluru, India',
      isOnline: true,
      owner: {
        name: 'Sri Harish',
        phone: '+91 98765 43210',
        email: 'founder@founderos.io',
        address: 'Indiranagar, Bengaluru'
      },
      coFounders: [
        {
          id: 'cf-1',
          name: 'Rohan Verma',
          email: 'rohan@founderos.io',
          phone: '+91 98765 43211'
        }
      ]
    }
  ]);

  await upsertBy(User, 'email', [
    {
      name: 'Sri Harish',
      email: 'founder@founderos.io',
      phone: '+91 98765 43210',
      password: hashedPassword,
      role: 'founder',
      companyCode,
      department: 'Operations & HR',
      departmentId: 'dept-hr',
      status: 'active'
    },
    {
      name: 'Vikram Mehta',
      email: 'vikram@founderos.io',
      phone: '+91 98111 22334',
      password: hashedPassword,
      role: 'manager',
      companyCode,
      department: 'Engineering',
      departmentId: 'dept-eng',
      status: 'active'
    },
    {
      name: 'Priya Sharma',
      email: 'priya@founderos.io',
      phone: '+91 98222 33445',
      password: hashedPassword,
      role: 'manager',
      companyCode,
      department: 'Growth & Marketing',
      departmentId: 'dept-mkt',
      status: 'active'
    },
    {
      name: 'Arun Sundaram',
      email: 'arun@founderos.io',
      phone: '+91 98333 44556',
      password: hashedPassword,
      role: 'employee',
      companyCode,
      department: 'Engineering',
      departmentId: 'dept-eng',
      status: 'active'
    },
    {
      name: 'Ananya Roy',
      email: 'ananya@founderos.io',
      phone: '+91 98444 55667',
      password: hashedPassword,
      role: 'manager',
      companyCode,
      department: 'Sales & Revenue',
      departmentId: 'dept-sales',
      status: 'active'
    },
    {
      name: 'Siddharth Rao',
      email: 'sid@founderos.io',
      phone: '+91 98555 66778',
      password: hashedPassword,
      role: 'employee',
      companyCode,
      department: 'Engineering',
      departmentId: 'dept-eng',
      status: 'active'
    }
  ]);

  await upsertBy(Department, 'name', [
    { name: 'Engineering', lead: 'Vikram Mehta', memberCount: 8, aiCount: 3, progress: 78, color: '#6366f1' },
    { name: 'Growth & Marketing', lead: 'Priya Sharma', memberCount: 5, aiCount: 2, progress: 84, color: '#ec4899' },
    { name: 'Sales & Revenue', lead: 'Ananya Roy', memberCount: 4, aiCount: 2, progress: 71, color: '#f59e0b' },
    { name: 'Operations & HR', lead: 'Kavita Nair', memberCount: 3, aiCount: 1, progress: 92, color: '#10b981' }
  ]);

  await upsertBy(Role, 'name', [
    {
      name: 'Lead Fullstack Architect',
      description: 'Oversees architecture and code quality across web and backend systems.',
      department: 'Engineering',
      priority: 'HIGH',
      responsibilities: ['Architecture design', 'Code reviews', 'Sprint execution'],
      permissions: ['code_commit', 'deploy_staging', 'review_tasks'],
      memberCount: 2
    },
    {
      name: 'Growth Marketing Manager',
      description: 'Leads multichannel acquisition, brand campaigns, and organic growth.',
      department: 'Growth & Marketing',
      priority: 'HIGH',
      responsibilities: ['Campaign design', 'Content strategy', 'Funnel optimization'],
      permissions: ['manage_campaigns', 'assign_tasks', 'review_tasks'],
      memberCount: 1
    },
    {
      name: 'AI Copy & Creative Generator',
      description: 'Autonomous content generation engine executing ad copy, briefs, and social calendars.',
      department: 'Growth & Marketing',
      priority: 'MEDIUM',
      responsibilities: ['Write high-CTR ad copy', 'Draft weekly newsletter', 'Social captions'],
      permissions: ['create_drafts', 'execute_prompts'],
      memberCount: 1
    },
    {
      name: 'AI Code Reviewer & QA Bot',
      description: 'Automated test suite generator and static security analysis specialist.',
      department: 'Engineering',
      priority: 'HIGH',
      responsibilities: ['Automated PR triage', 'Lint & security audit', 'Unit test generation'],
      permissions: ['read_repos', 'generate_tests', 'submit_prs'],
      memberCount: 1
    },
    {
      name: 'B2B Enterprise Closer',
      description: 'Manages enterprise deal pipeline and client onboarding calls.',
      department: 'Sales & Revenue',
      priority: 'HIGH',
      responsibilities: ['Client demos', 'Contract closing', 'Account expansion'],
      permissions: ['crm_access', 'create_contracts'],
      memberCount: 3
    }
  ]);

  await upsertBy(Employee, 'email', [
    {
      name: 'Vikram Mehta',
      email: 'vikram@founderos.io',
      phone: '+91 98111 22334',
      role: 'Lead Fullstack Architect',
      department: 'Engineering',
      employeeCode: 'FO-2026-7X4K-DEV001',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      status: 'active',
      joinedDate: '2026-01-15',
      address: 'Koramangala, Bengaluru',
      tasksCompleted: 48,
      tasksInProgress: 3
    },
    {
      name: 'Priya Sharma',
      email: 'priya@founderos.io',
      phone: '+91 98222 33445',
      role: 'Growth Marketing Manager',
      department: 'Growth & Marketing',
      employeeCode: 'FO-2026-7X4K-MGR001',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      status: 'active',
      joinedDate: '2026-02-01',
      address: 'HSR Layout, Bengaluru',
      tasksCompleted: 39,
      tasksInProgress: 2
    },
    {
      name: 'Arun Sundaram',
      email: 'arun@founderos.io',
      phone: '+91 98333 44556',
      role: 'Frontend UI/UX Engineer',
      department: 'Engineering',
      managerName: 'Vikram Mehta',
      employeeCode: 'FO-2026-7X4K-EMP003',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      status: 'active',
      joinedDate: '2026-03-10',
      address: 'Whitefield, Bengaluru',
      tasksCompleted: 24,
      tasksInProgress: 4
    },
    {
      name: 'Ananya Roy',
      email: 'ananya@founderos.io',
      phone: '+91 98444 55667',
      role: 'Sales Lead',
      department: 'Sales & Revenue',
      employeeCode: 'FO-2026-7X4K-EMP004',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      status: 'active',
      joinedDate: '2026-04-01',
      address: 'Indiranagar, Bengaluru',
      tasksCompleted: 31,
      tasksInProgress: 2
    },
    {
      name: 'Siddharth Rao',
      email: 'sid@founderos.io',
      phone: '+91 98555 66778',
      role: 'DevOps & Cloud Engineer',
      department: 'Engineering',
      managerName: 'Vikram Mehta',
      employeeCode: 'FO-2026-7X4K-EMP005',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      status: 'onboarding',
      joinedDate: '2026-09-18',
      address: 'Electronic City, Bengaluru',
      tasksCompleted: 5,
      tasksInProgress: 2
    }
  ]);

  await upsertBy(AIEmployee, 'name', [
    {
      name: 'Nova - Copy & Strategy AI',
      role: 'AI Copy & Creative Generator',
      department: 'Growth & Marketing',
      managerName: 'Priya Sharma',
      provider: 'Anthropic',
      model: 'claude-3-5-sonnet-20241022',
      priority: 'HIGH',
      status: 'running',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      permissions: ['write_marketing_copy', 'analyze_campaign_metrics', 'submit_content_briefs'],
      tasksCompleted: 142,
      tasksRunning: 2,
      successRate: 98.4,
      lastActive: '2 mins ago',
      memory: {
        identitySummary: 'Nova is Founder OS’s Senior AI Growth & Direct-Response Copy Specialist.',
        responsibilities: [
          'Produce multi-angle paid social ad copy for Meta and TikTok',
          'Draft viral LinkedIn authority posts and founder stories',
          'Maintain consistent brand tone: direct, high-agency, punchy, no jargon'
        ],
        companyContext: 'Founder OS is a next-generation Company OS where founders, human staff, and AI agents collaborate seamlessly under unified OKRs and real-time execution pipelines.',
        instructions: 'Always adhere to the PAS (Problem-Agitate-Solution) and BAB frameworks. Keep hooks under 90 characters. Ensure all claims are substantiated by data metrics.',
        preferences: [
          'Prefers concise bulleted breakdowns over wordy prose',
          'Uses active voice strictly',
          'Never outputs filler text or fake hype'
        ],
        keyLearnings: [
          'Q3 campaigns with founder vulnerability narratives yielded 3.8x CTR',
          'B2B SaaS comparison copy outperforms generic feature lists by 42%'
        ],
        previousOutputsSummary: 'Generated 45 ad variants, 18 LinkedIn posts, and 6 high-converting product email sequences.',
        tokenCount: 4280,
        lastUpdated: '2026-09-24 10:15 AM'
      }
    },
    {
      name: 'Sentinel - Code Review & QA Bot',
      role: 'AI Code Reviewer & QA Bot',
      department: 'Engineering',
      managerName: 'Vikram Mehta',
      provider: 'OpenAI',
      model: 'gpt-4o',
      priority: 'HIGH',
      status: 'idle',
      avatar: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=150&auto=format&fit=crop&q=80',
      permissions: ['analyze_pull_requests', 'generate_vitest_specs', 'lint_security_scans'],
      tasksCompleted: 215,
      tasksRunning: 0,
      successRate: 99.1,
      lastActive: '14 mins ago',
      memory: {
        identitySummary: 'Sentinel is the autonomous QA and TypeScript architecture specialist.',
        responsibilities: [
          'Scan incoming pull requests for edge-case errors',
          'Ensure 100% strict TypeScript compliance with no implicit any',
          'Verify zero console warnings and complete test coverage'
        ],
        companyContext: 'Tech stack: React 19, Vite, TypeScript, Express, PostgreSQL / SQLite. Zero tolerance for unhandled promise rejections or unsanitized user inputs.',
        instructions: 'Report code review feedback organized into: 🔴 Blocker, 🟡 Suggestion, 🟢 Performance Win. Always provide exact diff snippets.',
        preferences: [
          'Enforces immutable state updates in React',
          'Favors early return guards'
        ],
        keyLearnings: [
          'Express async routes require centralized error middleware wrapper',
          'Tailwind v4 theme variables must stay synchronized with CSS tokens'
        ],
        previousOutputsSummary: 'Audited 88 PRs, discovered 14 race condition bugs, and generated 120 automated test assertions.',
        tokenCount: 6150,
        lastUpdated: '2026-09-24 09:40 AM'
      }
    },
    {
      name: 'Apex - Lead Research & Prospector',
      role: 'B2B Enterprise Closer',
      department: 'Sales & Revenue',
      managerName: 'Ananya Roy',
      provider: 'Google',
      model: 'gemini-1.5-pro',
      priority: 'MEDIUM',
      status: 'running',
      avatar: 'https://images.unsplash.com/photo-1633493106185-520e5272a74c?w=150&auto=format&fit=crop&q=80',
      permissions: ['search_leads', 'draft_cold_outreach', 'update_crm_pipeline'],
      tasksCompleted: 98,
      tasksRunning: 1,
      successRate: 96.2,
      lastActive: 'Just now',
      memory: {
        identitySummary: 'Apex generates qualified enterprise leads and drafts custom value propositions.',
        responsibilities: [
          'Identify fast-growing tech companies scaling beyond 50 employees',
          'Extract founder/CTO pain points regarding human + AI team management',
          'Draft personalized 3-sentence outreach emails'
        ],
        companyContext: 'Target ICP: Seed to Series B startups in US, EU, and India building AI products or scaling cross-functional teams.',
        instructions: 'Keep emails under 75 words. Include clear social proof (e.g., 34% reduction in sprint cycle time).',
        preferences: [
          'Uses personalized hook based on recent company funding or hiring signals'
        ],
        keyLearnings: [
          'Founders reply 3x more when mentioning AI workforce orchestration rather than standard project management'
        ],
        previousOutputsSummary: 'Sourced 350 enterprise leads with verified emails and 28 booked demo sessions.',
        tokenCount: 3890,
        lastUpdated: '2026-09-24 10:28 AM'
      }
    }
  ]);

  await insertIfEmpty(Task, [
    {
      title: 'Design & Code Interactive Landing Page Hero for Founder OS V1',
      description: 'Implement the high-conversion hero section highlighting human + AI unified workforce with live preview cards and CTA modal.',
      creatorId: 'user-founder',
      creatorName: 'Sri Harish (Founder)',
      assigneeId: 'emp-3',
      assigneeName: 'Arun Sundaram',
      assigneeType: 'human',
      assigneeAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      assigneeRole: 'Frontend UI/UX Engineer',
      department: 'Engineering',
      priority: 'URGENT',
      status: 'IN_PROGRESS',
      deadline: '2026-09-26',
      goalTitle: 'Launch Founder OS V1 Public Beta',
      submissions: [],
      activityLogs: [
        {
          id: 'act-1',
          timestamp: '2026-09-23 09:00',
          action: 'Task created and assigned to Arun Sundaram',
          performedBy: 'Sri Harish'
        },
        {
          id: 'act-2',
          timestamp: '2026-09-23 11:30',
          action: 'Status changed from NOT_STARTED to IN_PROGRESS',
          performedBy: 'Arun Sundaram'
        }
      ]
    },
    {
      title: 'Generate 20 Multi-Angle Paid Ad Copy Variants for Product Hunt & Meta',
      description: 'Create high-converting copy across TOFU, MOFU, and BOFU stages highlighting autonomous AI employees and unified team memory.',
      creatorId: 'emp-2',
      creatorName: 'Priya Sharma (Marketing Lead)',
      assigneeId: 'ai-1',
      assigneeName: 'Nova - Copy & Strategy AI',
      assigneeType: 'ai',
      assigneeAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      assigneeRole: 'AI Copy & Creative Generator',
      department: 'Growth & Marketing',
      priority: 'HIGH',
      status: 'SUBMITTED',
      deadline: '2026-09-25',
      goalTitle: 'Acquire 500 Active Founding Teams in Q4',
      submissions: [
        {
          id: 'sub-102-1',
          submittedAt: '09:45 AM',
          submittedBy: 'Nova - Copy & Strategy AI',
          submitterType: 'ai',
          deliverableSummary: 'Generated 20 ad copy variants segmented into 3 frameworks (PAS, BAB, AIDA) with CTR projections and character count validations.',
          notes: 'Includes 6 video script hooks and 8 headline variants optimized for high click-through rates.'
        }
      ],
      activityLogs: [
        {
          id: 'act-102-a',
          timestamp: '08:30 AM',
          action: 'Task assigned to Nova AI',
          performedBy: 'Priya Sharma'
        },
        {
          id: 'act-102-b',
          timestamp: '09:45 AM',
          action: 'Task output submitted for Manager Review',
          performedBy: 'Nova - Copy & Strategy AI'
        }
      ]
    },
    {
      title: 'Implement Multi-Tenant Organization & Role-Based Auth Middleware',
      description: 'Ensure strict separation between Founder, Co-founder, Manager, Employee, and AI access tokens with session expiry and audit trail logging.',
      creatorId: 'user-founder',
      creatorName: 'Sri Harish (Founder)',
      assigneeId: 'emp-1',
      assigneeName: 'Vikram Mehta',
      assigneeType: 'human',
      assigneeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      assigneeRole: 'Lead Fullstack Architect',
      department: 'Engineering',
      priority: 'URGENT',
      status: 'COMPLETED',
      deadline: '2026-09-24',
      goalTitle: 'Launch Founder OS V1 Public Beta',
      submissions: [
        {
          id: 'sub-103-1',
          submittedAt: '08:15 AM',
          submittedBy: 'Vikram Mehta',
          submitterType: 'human',
          deliverableSummary: 'Auth middleware built with JWT + refresh token cookies, RBAC route guards, and company code validator FO-2026-7X4K.',
          reviewStatus: 'approved',
          reviewedBy: 'Sri Harish',
          reviewedAt: '08:50 AM',
          reviewNotes: 'Verified security test pass. Excellent performance.'
        }
      ],
      activityLogs: [
        {
          id: 'act-103-a',
          timestamp: '08:15 AM',
          action: 'Submitted deliverable',
          performedBy: 'Vikram Mehta'
        },
        {
          id: 'act-103-b',
          timestamp: '08:50 AM',
          action: 'Approved & Completed by Founder',
          performedBy: 'Sri Harish'
        }
      ]
    }
  ]);

  await insertIfEmpty(Goal, [
    {
      title: 'Launch Founder OS V1 Public Beta',
      description: 'Complete core platform loop: Company Registration -> Roles -> Human & AI Hiring -> Task Management -> Reports.',
      targetMetric: 'V1 Modules Shipped',
      currentValue: '28 / 31',
      targetValue: '31 Modules',
      progressPercent: 90,
      deadline: '2026-09-30',
      ownerName: 'Sri Harish',
      ownerRole: 'Founder & CEO',
      department: 'Engineering',
      status: 'on_track'
    },
    {
      title: 'Acquire 500 Active Founding Teams in Q4',
      description: 'Drive high-velocity onboarding for tech startups seeking unified human + AI team management.',
      targetMetric: 'Registered Companies',
      currentValue: '184',
      targetValue: '500 Companies',
      progressPercent: 37,
      deadline: '2026-12-31',
      ownerName: 'Priya Sharma',
      ownerRole: 'Growth Marketing Manager',
      department: 'Growth & Marketing',
      status: 'on_track'
    },
    {
      title: 'Reach ₹10L Monthly Recurring Revenue',
      description: 'Scale annual and tier subscriptions across human seat licenses and AI token compute bundles.',
      targetMetric: 'Monthly ARR',
      currentValue: '₹6.8L',
      targetValue: '₹10.0L',
      progressPercent: 68,
      deadline: '2026-12-31',
      ownerName: 'Ananya Roy',
      ownerRole: 'Sales Lead',
      department: 'Sales & Revenue',
      status: 'on_track'
    }
  ]);

  await insertIfEmpty(Activity, [
    {
      timestamp: '10:32 AM',
      actorName: 'Nova - Copy & Strategy AI',
      actorType: 'ai',
      action: 'submitted deliverable for',
      target: 'Generate 20 Multi-Angle Paid Ad Copy Variants',
      category: 'task'
    },
    {
      timestamp: '10:15 AM',
      actorName: 'Vikram Mehta',
      actorType: 'human',
      action: 'completed task',
      target: 'Multi-Tenant Organization & Role-Based Auth Middleware',
      category: 'task'
    },
    {
      timestamp: '09:40 AM',
      actorName: 'Sentinel - Code Review AI',
      actorType: 'ai',
      action: 'generated 42 unit test suites for',
      target: 'AI Model Provider Gateway',
      category: 'task'
    }
  ]);

  await insertIfEmpty(Notification, [
    {
      timestamp: '5 mins ago',
      title: 'Task Submission Ready for Review',
      message: 'Nova AI submitted 20 ad copy variants for Priya Sharma to review.',
      type: 'review',
      read: false
    },
    {
      timestamp: '40 mins ago',
      title: '🚀 Development Milestone Reached!',
      message: 'Engineering completed 78% of sprint deliverables ahead of schedule.',
      type: 'milestone',
      read: false
    }
  ]);

  await backfillCompanyCode(companyCode);

  console.log('Database synced successfully.');
};

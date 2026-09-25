# Founder OS — Implementation & Engineering Roadmap (TODO)

## Phase 0: Authentication, Onboarding & Security Hardening
- [x] **Employee First-Login & Onboarding Wizard (PRD Section 7 & 8)**
  - [x] Add `mustChangePassword` flag to `User` and `Employee` schemas (`backend/src/models/User.ts`, `backend/src/models/Employee.ts`)
  - [x] Create 4-step `OnboardingWizard.tsx` (Personal Profile, Department/Role, Password, Preferences)
  - [x] Implement `PATCH /api/auth/onboarding` endpoint with password validation and profile sync (`backend/src/routes/authRoutes.ts:288-379`)
  - [x] Route new hires directly to onboarding wizard before application access (`frontend/src/App.tsx:87-89`)
- [x] **Dedicated Employee Experience (PRD Section 18)**
  - [x] Create `EmployeeDashboard.tsx` showing Department stats, open assigned tasks, and personal queue
  - [x] Role-based dashboard switching in `App.tsx` (Employee vs Founder/Manager)
- [x] **AI API Key Encryption at Rest (P0 - Security)**
  - [x] Implement AES-256-GCM encryption/decryption utility in `backend/src/utils/crypto.ts`
  - [x] Store encrypted API keys + IV/tag in `AIEmployee` schema (`backend/src/models/AIEmployee.ts:73`)
  - [x] Redact `apiKey` from all `GET /api/ai-employees` and `/api/ai-employees/:id` responses
- [x] **Tenant Isolation Hardening (P0 - Security)**
  - [x] Implement Mongoose tenancy plugin to auto-scope queries by `companyCode` across all models
  - [x] Audit all route handlers (`backend/src/routes/*.ts`) to ensure user session `companyCode` is strictly enforced
  - [x] Add rate limiting (`express-rate-limit`) on `/api/auth/login` and `/api/auth/register`

---

## Phase 1: Data Integrity & Database Indexing (P1 - High Priority)
- [x] **ACID Multi-Document Transactions**
  - [x] Wrap submission review and task completion in MongoDB sessions (`mongoose.startSession()`) (`backend/src/routes/taskRoutes.ts:146-206`)
  - [x] Ensure atomic updates across `Task`, `Employee`/`AIEmployee` counters, and `Activity` log generation
- [x] **Compound Index Optimization**
  - [x] `Task`: Add compound index on `{ companyCode: 1, status: 1 }`, `{ companyCode: 1, assigneeId: 1, status: 1 }`, and `{ companyCode: 1, createdAt: -1 }`
  - [x] `Activity`: Add compound index on `{ companyCode: 1, createdAt: -1 }`
  - [x] `Notification`: Add compound index on `{ companyCode: 1, userId: 1, read: 1 }`
  - [x] `Employee` & `AIEmployee`: Add compound index on `{ companyCode: 1, status: 1 }`
- [x] **Model Schemas & Relational Integrity**
  - [x] Validate references (`departmentId`, `roleId`, `managerId`, `goalId`) on creation and deletion
  - [x] Implement soft deletion or cascade protection for departments and roles assigned to active workers

---

## Phase 2: AI Workforce Autonomous Execution Engine (P2 - Core Differentiator)
- [x] **Background Execution Queue**
  - [x] Build background worker/queue service (`backend/src/services/aiExecutionService.ts`)
  - [x] Trigger autonomous task execution when a task is assigned to an `AIEmployee`
  - [x] Construct LLM prompts using `AIMemory` (identity, company context, instructions, preferences, key learnings)
  - [x] Handle fallback models on API timeouts or quota rate limits
  - [x] Auto-generate deliverable draft and submit to `TaskSubmissions` with status `SUBMITTED` (`reviewStatus: 'pending'`) for managerial review
- [x] **Dynamic Model Discovery & Health Check**
  - [x] Cache discovered model lists per provider endpoint
  - [x] Add ping/health verification for configured AI provider endpoints (`/models` / `/v1/models`)
- [x] **AI Memory Update & Learning Loop**
  - [x] Automatically summarize approved deliverables and append key learnings to `AIMemory` upon managerial task approval
  - [x] Token count tracking and automated pruning for memory context windows

---

## Phase 3: Frontend Architecture & Performance (P2 - High Priority)
- [x] **Server-State Management Migration**
  - [x] Introduce TanStack React Query (or SWR) for caching, deduplication, and background refetching
  - [x] Replace monolithic `AppContext` remote data polling with fine-grained query hooks (`useTasksQuery`, `useEmployeesQuery`, `useAIEmployeesQuery`, `useGoalsQuery`, `useCompanyQuery`)
- [x] **Optimistic UI & Mutation Boundaries**
  - [x] Standardize mutation hooks with rollback on failure for status updates and deliverable reviews
  - [x] Split UI state (active modals, view selection, filter states) from remote domain entities
- [x] **Role-Based Routing & View Hardening**
  - [x] Prevent unprivileged deep-linking or component mounting for employee/AI restricted views

---

## Phase 4: Reporting, Metrics & Notifications (P3 - Polish & Analytics)
- [x] **Real-time Event Notifications**
  - [x] Implement Server-Sent Events (SSE) / WebSockets for instant task assignment and submission alerts
  - [x] Unread notification badge synchronization in `Header.tsx`
- [x] **Historical Reporting & Analytics**
  - [x] Implement date-range filtering (Weekly, Monthly, Quarterly, Custom) in `ReportsView.tsx`
  - [x] Add completion velocity metrics, workforce split (Human vs AI output), and goal trajectory graphs
- [x] **Audit Trail & Activity Search**
  - [x] Add category filter and actor search to activity stream
  - [x] Export audit logs (CSV / JSON) for compliance and founder review
- [x] **Proactive Motivation & Reminder Layer (PRD Section 29)**
  - [x] Display contextual nudges (milestone achievements, overdue warnings) on company and employee dashboards

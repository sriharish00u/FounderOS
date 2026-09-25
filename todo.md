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
- [ ] **AI API Key Encryption at Rest (P0 - Security)**
  - [ ] Implement AES-256-GCM encryption/decryption utility in `backend/src/utils/crypto.ts`
  - [ ] Store encrypted API keys + IV/tag in `AIEmployee` schema (`backend/src/models/AIEmployee.ts:73`)
  - [ ] Redact `apiKey` from all `GET /api/ai-employees` and `/api/ai-employees/:id` responses
- [ ] **Tenant Isolation Hardening (P0 - Security)**
  - [ ] Implement Mongoose tenancy plugin to auto-scope queries by `companyCode` across all models
  - [ ] Audit all route handlers (`backend/src/routes/*.ts`) to ensure user session `companyCode` is strictly enforced
  - [ ] Add rate limiting (`express-rate-limit`) on `/api/auth/login` and `/api/auth/register`

---

## Phase 1: Data Integrity & Database Indexing (P1 - High Priority)
- [ ] **ACID Multi-Document Transactions**
  - [ ] Wrap submission review and task completion in MongoDB sessions (`mongoose.startSession()`) (`backend/src/routes/taskRoutes.ts:146-206`)
  - [ ] Ensure atomic updates across `Task`, `Employee`/`AIEmployee` counters, and `Activity` log generation
- [ ] **Compound Index Optimization**
  - [ ] `Task`: Add compound index on `{ companyCode: 1, status: 1 }`, `{ companyCode: 1, assigneeId: 1, status: 1 }`, and `{ companyCode: 1, createdAt: -1 }`
  - [ ] `Activity`: Add compound index on `{ companyCode: 1, createdAt: -1 }`
  - [ ] `Notification`: Add compound index on `{ companyCode: 1, userId: 1, read: 1 }`
  - [ ] `Employee` & `AIEmployee`: Add compound index on `{ companyCode: 1, status: 1 }`
- [ ] **Model Schemas & Relational Integrity**
  - [ ] Validate references (`departmentId`, `roleId`, `managerId`, `goalId`) on creation and deletion
  - [ ] Implement soft deletion or cascade protection for departments and roles assigned to active workers

---

## Phase 2: AI Workforce Autonomous Execution Engine (P2 - Core Differentiator)
- [ ] **Background Execution Queue**
  - [ ] Build background worker/queue service (`backend/src/services/aiExecutionService.ts`)
  - [ ] Trigger autonomous task execution when a task is assigned to an `AIEmployee`
  - [ ] Construct LLM prompts using `AIMemory` (identity, company context, instructions, preferences, key learnings)
  - [ ] Handle fallback models on API timeouts or quota rate limits
  - [ ] Auto-generate deliverable draft and submit to `TaskSubmissions` with status `SUBMITTED` (`reviewStatus: 'pending'`) for managerial review
- [ ] **Dynamic Model Discovery & Health Check**
  - [ ] Cache discovered model lists per provider endpoint
  - [ ] Add ping/health verification for configured AI provider endpoints (`/models` / `/v1/models`)
- [ ] **AI Memory Update & Learning Loop**
  - [ ] Automatically summarize approved deliverables and append key learnings to `AIMemory` upon managerial task approval
  - [ ] Token count tracking and automated pruning for memory context windows

---

## Phase 3: Frontend Architecture & Performance (P2 - High Priority)
- [ ] **Server-State Management Migration**
  - [ ] Introduce TanStack React Query (or SWR) for caching, deduplication, and background refetching
  - [ ] Replace monolithic `AppContext` remote data polling with fine-grained query hooks (`useTasksQuery`, `useEmployeesQuery`, `useAIEmployeesQuery`, `useGoalsQuery`, `useCompanyQuery`)
- [ ] **Optimistic UI & Mutation Boundaries**
  - [ ] Standardize mutation hooks with rollback on failure for status updates and deliverable reviews
  - [ ] Split UI state (active modals, view selection, filter states) from remote domain entities
- [ ] **Role-Based Routing & View Hardening**
  - [ ] Prevent unprivileged deep-linking or component mounting for employee/AI restricted views

---

## Phase 4: Reporting, Metrics & Notifications (P3 - Polish & Analytics)
- [ ] **Real-time Event Notifications**
  - [ ] Implement Server-Sent Events (SSE) / WebSockets for instant task assignment and submission alerts
  - [ ] Unread notification badge synchronization in `Header.tsx`
- [ ] **Historical Reporting & Analytics**
  - [ ] Implement date-range filtering (Weekly, Monthly, Quarterly, Custom) in `ReportsView.tsx`
  - [ ] Add completion velocity metrics, workforce split (Human vs AI output), and goal trajectory graphs
- [ ] **Audit Trail & Activity Search**
  - [ ] Add category filter and actor search to activity stream
  - [ ] Export audit logs (CSV / JSON) for compliance and founder review
- [ ] **Proactive Motivation & Reminder Layer (PRD Section 29)**
  - [ ] Display contextual nudges (milestone achievements, overdue warnings) on company and employee dashboards

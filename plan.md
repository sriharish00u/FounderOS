# Founder OS — 5-Pillar Executive Architecture Plan (`plan.md`)

## 1. Executive Summary & Vision

Founder OS is an **Executive Operating System** designed for founders and leadership teams to operate the company as a unified organism. Rather than acting as separate siloed point tools (CRM vs PM vs ERP), Founder OS unifies:

> **Understand ➔ Decide ➔ Recommend ➔ Execute**

```text
                         FOUNDER / CEO
                               │
                ┌──────────────▼──────────────┐
                │   FOUNDEROS COMMAND HUB     │
                │  "Understand ➔ Decide ➔ Act" │
                └──────────────┬──────────────┘
                               │
       ┌───────────┬───────────┼───────────┬───────────┐
       ▼           ▼           ▼           ▼           ▼
     [CRM]    [PROJECTS]   [FINANCE]    [TEAM]    [STRATEGY]
   Customers    Tasks      Cashflow     People      Goals
     Leads     Delivery    Expenses       HR      Decisions
     Deals     Timeline     Runway      AI Staff   Roadmap
```

---

## 2. Core Architectural Pillars

### Pillar I: CRM & Deal Pipeline
- **Models:** `Lead`, `Deal`, `Customer`
- **Stages:** `LEAD` ➔ `QUALIFIED` ➔ `PROPOSAL` ➔ `NEGOTIATION` ➔ `WON` ➔ `LOST`
- **Capabilities:**
  - Deal pipeline value aggregations.
  - Stalled deal detection (unattended for >3 days).
  - AI automated follow-up drafts and contact history.

### Pillar II: Financial Intelligence & Runway Tracking
- **Models:** `FinanceTransaction` (`income` | `expense`), `FinancialSummary`
- **Capabilities:**
  - Real-time Cash Balance, Monthly Revenue (MRR), Monthly Burn Rate.
  - Calculated Runway in months with burn velocity warnings.
  - Category breakdown (Payroll, Cloud Compute, AI APIs, Marketing, Operations).

### Pillar III: Projects & Delivery Pipeline (Active & Enhanced)
- **Models:** `Task`, `TaskSubmission`
- **Capabilities:**
  - ACID Multi-Document Review & Approval.
  - Autonomous AI workforce execution on `PORT: 20128`.
  - Delivery timelines and blocking task detection.

### Pillar IV: Team & AI Workforce (Active & Enhanced)
- **Models:** `Employee`, `AIEmployee`, `Department`, `Role`
- **Capabilities:**
  - 4-Step Onboarding Wizard.
  - AES-256-GCM encrypted API keys for AI models.
  - Continuous memory update loops (`AIMemory`).

### Pillar V: Strategy & Corporate Decision Log
- **Models:** `Goal` (OKRs), `Decision` (Executive Log)
- **Capabilities:**
  - Strategic milestone tracking with task linkage.
  - Corporate Decision Register (Context, Rationale, Stakeholders, Impact).

---

## 3. Executive Intelligence Layer ("Daily Founder Briefing")
- Synthesizes cross-pillar signals:
  1. **Critical Alerts:** Low runway, stalled high-value deals, goal-blocking tasks.
  2. **Top Priorities:** Top 3 actions requiring the founder's direct decision today.
  3. **One-Click Dispatch:** Instant approvals, email draft dispatch, task unblocking.

---

## 4. Implementation Steps

1. **Backend Schemas & Routes:**
   - Create `Deal.ts`, `FinanceTransaction.ts`, `Decision.ts` models with Tenancy plugin + indexes.
   - Create `crmRoutes.ts`, `financeRoutes.ts`, `decisionRoutes.ts`, and `executiveRoutes.ts`.
   - Register routes in `backend/src/index.ts` and add seed data.
2. **Frontend Architecture:**
   - Define TypeScript interfaces in `frontend/src/types/index.ts`.
   - Update `api.ts` and `queries.ts` with TanStack React Query mutations & queries.
   - Build `CRMView.tsx`, `FinanceView.tsx`, and `StrategyView.tsx`.
   - Build `ExecutiveBriefingCard.tsx` inside `CompanyDashboard.tsx`.
   - Update `Sidebar.tsx` and `App.tsx` navigation.
3. **Verification & Deployment:**
   - Compile backend & frontend.
   - Test E2E flows via API/UI.
   - Commit & push to GitHub.
   - Deploy frontend to Vercel and verify live production endpoints.

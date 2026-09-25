Absolutely. Here's the **master PRD** for the Founder OS V1, consolidated from everything we've defined so far.

# Founder OS — Master PRD

**Product:** Founder OS
**Version:** V1 — Human + AI Company Operating System
**Core principle:** *People and AI work together toward company goals.*

---

## 1. Product Vision

Founder OS is a company operating system where **founders, co-founders, managers, employees, and AI employees** work inside one organizational structure.

Instead of simply assigning tasks to an AI, a company can:

> **Create company → define roles → hire people/AI → assign goals → assign tasks → execute → submit → review → complete → measure → improve.**

The platform should help companies **remember what matters, stay on time, maintain accountability, and stay motivated toward growth.**

---

# 2. Core Users

| User Type           | Purpose                                               |
| ------------------- | ----------------------------------------------------- |
| **Founder / Owner** | Creates and controls the company                      |
| **Co-Founder**      | Works alongside founder with company permissions      |
| **Manager**         | Manages teams, roles and tasks                        |
| **Employee**        | Completes assigned work                               |
| **AI Employee**     | Performs assigned work using a connected AI API/model |

### Important

A person initially exists as a **normal Founder OS user**.

A company can then hire that user.

AI employees are organizational members, but are created through the **Hire AI** workflow.

---

# 3. Core Product Architecture

```text
                    FOUNDER OS
                         │
                    COMPANY
                         │
          ┌──────────────┼──────────────┐
          │              │              │
       PEOPLE          ROLES        AI EMPLOYEES
          │              │              │
       Managers       Departments      Models
          │              │              │
       Employees      Permissions      Memory
          │              │              │
          └──────────────┼──────────────┘
                         │
                    COMPANY GOALS
                         │
                      TARGETS
                         │
                       TASKS
                         │
              ┌──────────┴──────────┐
              │                     │
           HUMAN                  AI
              │                     │
              └──────────┬──────────┘
                         │
                    COMPLETION
                         │
                    REPORTS
                         │
                  COMPANY GROWTH
```

---

# 4. Authentication

## Login

A single login system should support:

* Company users
* Employees
* Managers
* Founders
* Co-founders
* AI-related management access

### Login inputs

* Email / phone
* Password or OTP
* Company context where required

The system determines the user's company and role after authentication.

---

# 5. Company Registration

Only a user registering a new company uses the company-registration flow.

### Company information

* Company name
* Company code
* Company type
* Company address
* Online/offline indicator

### Owner information

* Name
* Phone
* Email
* Address

### Co-Founder

Toggle:

```text
Do you have co-founders?

[ OFF ] [ ON ]
```

When enabled:

```text
Co-Founder 1
Name
Phone
Email

+ Add Co-Founder
```

Allow multiple co-founders.

### Company code

Founder OS generates or validates a unique company code.

Example:

```text
FO-2026-7X4K
```

---

# 6. Employee Hiring

The hiring workflow should be extremely simple.

## Hire

Company clicks:

```text
+ Hire
```

Popup:

```text
Hire

[ 👤 Employee ] [ 🤖 AI Employee ]
```

---

## Human Employee

The company **does not enter the entire employee profile**.

Only:

```text
Email
Phone
```

are required.

### Flow

```text
Company
   ↓
Hire Employee
   ↓
Enter Email + Phone
   ↓
Send Invitation
   ↓
Employee First Login
   ↓
Onboarding
   ↓
Employee enters profile
   ↓
Profile saved
   ↓
Company can view/edit
```

---

# 7. Employee Onboarding

On first login, a newly hired employee is detected as:

```text
NEW EMPLOYEE — COMPLETE YOUR PROFILE
```

### Information

* Full name
* Email
* Phone
* Address
* Profile photo
* Basic personal information

The system generates an employee ID.

Example:

```text
FO-2026-7X4K-EMP001
```

Possible formats:

```text
FO-2026-7X4K-EMP001
FO-2026-7X4K-MGR001
FO-2026-7X4K-DEV001
```

The exact format can be configured later by the company.

---

# 8. Employee Data Ownership

### Employee initially provides:

* Name
* Phone
* Email
* Address
* Profile photo

### Company controls:

* Employee ID
* Role
* Department
* Manager
* Permissions
* Employment status
* Tasks
* Organizational information

The company can **view and edit the employee's organizational record**.

---

# 9. Roles

Companies can create custom roles.

Example:

```text
Software Developer
Marketing Manager
Sales Executive
HR Manager
Content Writer
Finance Manager
```

Each role can contain:

* Role name
* Description
* Responsibilities
* Department
* Priority
* Permissions
* Reporting manager

---

# 10. Company Organization

The organization should support:

```text
Founder
   │
   ├── Co-Founder
   │
   ├── CEO
   │
   ├── Manager
   │      ├── Employee
   │      ├── Employee
   │      └── AI Employee
   │
   └── Manager
          ├── Employee
          └── AI Employee
```

The exact hierarchy should remain configurable.

---

# 11. Hire AI 🤖

This is one of the platform's major differentiators.

Company selects:

```text
+ Hire
   ↓
🤖 AI Employee
```

### AI Employee information

* AI employee name
* Role
* Responsibilities
* Manager
* Priority
* Permissions

### AI connection

```text
AI Provider
API URL
API Key
```

After connecting:

```text
[ Fetch Models ]
```

Founder OS calls the supplied API and displays available models.

Example:

```text
Available Models

○ Model A
○ Model B
○ Model C
○ Model D

[ Select Model ]
```

The selected model becomes the AI employee's execution engine.

---

# 12. AI Employee Memory

Every AI employee has persistent organizational context.

### Memory includes

* Employee identity
* Role
* Responsibilities
* Company context
* Department
* Manager
* Instructions
* Permissions
* Assigned tasks
* Completed tasks
* Previous outputs
* Important company information
* Preferences
* Performance history

Example:

```text
AI Employee
Marketing Assistant

Role:
Marketing

Manager:
Marketing Manager

Responsibilities:
• Create campaigns
• Generate content
• Analyze campaign data

Current Priority:
Lead generation

Previous Work:
...
```

The goal is:

> **The AI should remember what job it was hired to do.**

---

# 13. Tasks

Tasks are the central execution unit.

A task contains:

* Title
* Description
* Creator
* Assignee
* Role
* Priority
* Deadline
* Status
* Attachments
* Comments
* Activity history

### Status

```text
NOT STARTED
     ↓
IN PROGRESS
     ↓
SUBMITTED
     ↓
REVIEW
     ↓
COMPLETED
```

Optional:

```text
BLOCKED
CANCELLED
```

---

# 14. Task Assignment

Managers/founders can assign tasks to:

* Employee
* Manager
* AI employee

Example:

```text
Task:
Create landing page

Assigned to:
John — Developer

Priority:
HIGH

Deadline:
September 30
```

Or:

```text
Task:
Generate 20 social media ideas

Assigned to:
🤖 Marketing AI

Priority:
MEDIUM
```

---

# 15. Employee Todos

Employees have a simple **My Todos** page.

```text
MY TODOS

Today

☐ Complete landing page
☐ Update database
☑ Submit weekly report
☐ Fix login issue
```

Each task opens a detail page.

---

# 16. Task Completion

Employee workflow:

```text
Open Task
   ↓
Start
   ↓
Work
   ↓
Submit as Done
   ↓
Manager Review
   ↓
Approved
   ↓
COMPLETED
```

If rejected:

```text
Manager requests changes
        ↓
Employee edits
        ↓
Resubmits
```

This creates accountability and a proper completion history.

---

# 17. Company Dashboard

The dashboard is the main company command center.

### Primary cards

```text
┌──────────────┐
│ COMPLETED    │
│     128      │
└──────────────┘

┌──────────────┐
│ IN PROGRESS  │
│      42      │
└──────────────┘

┌──────────────┐
│ NOT STARTED  │
│      17      │
└──────────────┘
```

### Dashboard sections

* Total tasks
* Completed tasks
* In-progress tasks
* Not-started tasks
* Overdue tasks
* Today's priorities
* Upcoming deadlines
* Employee workload
* AI workload
* Recent activity
* Company goals
* Progress

---

# 18. Employee Dashboard

Employees see:

* Today's tasks
* Pending tasks
* Completed tasks
* Deadlines
* Priority tasks
* Personal progress
* Notifications
* Company updates

The interface should answer:

> **"What do I need to do now?"**

---

# 19. Goals

Companies can define high-level goals.

Example:

```text
Goal:
Reach ₹10L revenue

Deadline:
December 31

Owner:
Founder
```

Goals can contain targets and tasks.

```text
Goal
 ↓
Target
 ↓
Project
 ↓
Tasks
 ↓
People / AI
 ↓
Completion
```

---

# 20. Progress

Progress should be available at multiple levels:

### Company

```text
Company Progress: 72%
```

### Department

```text
Marketing: 81%
Development: 68%
Sales: 74%
```

### Employee

```text
Employee Progress
Completed: 18
In Progress: 4
Pending: 2
```

### AI

```text
AI Employee
Tasks completed: 25
Tasks running: 2
Failed: 1
```

---

# 21. Reports

Reports provide historical company performance.

### Monthly

```text
September 2026

Tasks completed: 486
Tasks pending: 72
Tasks overdue: 14

Employees active: 32
AI employees: 6

Goals completed: 8/11
```

### Yearly

```text
2026

Jan
Feb
Mar
...
Dec
```

Show:

* Task trends
* Completion rates
* Employee activity
* Department performance
* Goal progress
* AI activity
* Monthly comparison

Allow:

```text
Monthly
Yearly
Custom Range
```

---

# 22. Notifications

Notifications include:

* New task
* Task deadline
* Overdue task
* Task submission
* Task approval
* Task rejection
* New employee
* Hiring invitation
* Company announcement
* Goal milestone
* AI task completion

---

# 23. Activity Feed

A company-wide activity stream.

Example:

```text
09:42 AM
Arun completed "Landing Page"

09:31 AM
Marketing AI completed "Campaign Draft"

09:10 AM
Priya started "Customer Research"

08:45 AM
Founder created a new company goal
```

---

# 24. Company Reports & Accountability

Every important organizational action should have a history.

Track:

* Who created task
* Who assigned it
* Who started it
* Who submitted it
* Who approved it
* When it happened
* Changes made
* AI actions

This becomes the foundation for the audit system.

---

# 25. Main Navigation

Keep the UI clean.

```text
FOUNDER OS

🏠 Dashboard

🎯 Goals
✅ Tasks
📁 Projects

👥 People
   ├── Employees
   ├── Roles
   └── Departments

🤖 AI Workforce
   ├── AI Employees
   ├── Hire AI
   ├── Models
   └── Activity

📊 Reports

💬 Team
🔔 Notifications

🧠 Memory

⚙️ Settings
```

For employees, navigation should be reduced:

```text
🏠 Dashboard
✅ My Todos
🎯 My Goals
📊 My Progress
💬 Team
🔔 Notifications
👤 Profile
```

---

# 26. Core Database Entities

The backend should be designed around these primary entities:

```text
User
Company
CompanyMember
Founder
CoFounder
Department
Role
Employee
AIEmployee
AIProvider
AIModel
AIMemory
Goal
Target
Project
Task
TaskSubmission
TaskComment
Notification
Activity
Report
Permission
CompanySettings
AuditLog
```

---

# 27. Important Relationships

```text
User
 │
 └── CompanyMember
        │
        ├── Employee
        │
        ├── Founder
        │
        └── Manager

Company
 │
 ├── Departments
 ├── Roles
 ├── Employees
 ├── AI Employees
 ├── Goals
 ├── Projects
 ├── Tasks
 └── Reports

AI Employee
 │
 ├── AI Provider
 ├── AI Model
 ├── Memory
 └── Tasks
```

---

# 28. Permissions

Permissions must be role-based.

### Founder

Full company control.

### Co-Founder

Configurable high-level access.

### Manager

Can generally:

* View team
* Assign tasks
* Review submissions
* Manage relevant employees
* View team reports

### Employee

Can:

* View own profile
* View assigned tasks
* Complete tasks
* Submit work
* View permitted company information

### AI Employee

Only receives explicitly granted permissions.

---

# 29. Motivation & Reminder Layer

Founder OS should not become another boring enterprise dashboard.

The system should continuously help users remember important things.

Examples:

> 🔔 **You have 3 high-priority tasks due today.**

> 🎯 **Your team completed 82% of this week's target.**

> 🚀 **Development reached its monthly milestone.**

> ⚠️ **3 tasks have been inactive for 4 days.**

The tone should be **motivational but useful**, not cheesy.

---

# 30. V1 Product Loop

The complete MVP experience should be:

```text
REGISTER
   ↓
CREATE COMPANY
   ↓
SET ROLES
   ↓
HIRE
   ↓
┌───────────────┐
│ HUMAN         │
│ OR            │
│ AI EMPLOYEE   │
└───────────────┘
   ↓
ASSIGN GOALS
   ↓
CREATE TASKS
   ↓
EXECUTE
   ↓
SUBMIT
   ↓
REVIEW
   ↓
COMPLETE
   ↓
DASHBOARD
   ↓
REPORT
   ↓
IMPROVE
```

---

# 31. V1 Must-Have Pages

If we're building the **first usable version**, don't build every future feature immediately.

### Phase 1 — Foundation

1. Landing
2. Login
3. Company Registration
4. Company Dashboard
5. Employee Dashboard
6. Employee Onboarding
7. Employees
8. Employee Profile
9. Hire Employee
10. Roles

### Phase 2 — Execution

11. Tasks
12. Assign Task
13. My Todos
14. Task Detail
15. Task Review
16. Goals
17. Progress

### Phase 3 — AI

18. Hire AI
19. AI Model Selection
20. AI Employee Profile
21. AI Memory
22. AI Tasks
23. AI Activity

### Phase 4 — Intelligence

24. Reports
25. Monthly Report
26. Yearly Report
27. Notifications
28. Activity Feed
29. Company Memory
30. Settings / Audit

---

# 32. The Core Product Philosophy

The most important design decision:

> **Founder OS should organize work around people and outcomes, not around AI.**

AI is a **workforce member**, not the entire product.

A company should be able to operate completely with humans:

```text
Founder → Manager → Employee
```

Then gradually add AI:

```text
Founder → Manager → Employee
                    ↓
                 AI Employee
```

And eventually:

```text
Company
   │
   ├── Humans
   │
   └── AI Workforce
          ↓
      Shared Goals
          ↓
       Shared Tasks
          ↓
       Shared Progress
```

That gives Founder OS its central identity:

## **One company. One workspace. Humans + AI. One direction.** 🚀

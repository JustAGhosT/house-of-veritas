# Long-Term Capital Project Planner PRD

**Module/Feature Name:** Long-Term Capital Project Planner  
**Marketing Name:** VeritasVault CapEx Roadmap  
**Readiness:** Draft — full multi-phase project/project Gantt/schedule, ROI analysis, budget/expense sync, doc approval/cert flow

---

## Platform/Mesh Layer(s)

| Layer | Technology |
|-------|------------|
| Frontend | Next.js/React (project planner, timeline, ROI builder, dependency map) |
| Backend | Azure Functions (project state, analytics, alert), Baserow (project/phase/tracker) |
| Storage | Azure Blob (docs, budget, certificates, reports) |

---

## Primary Personas

- **Owners**
- **Board/Admins**
- **Project Leads**
- **Estate Managers**
- **Auditors/Financiers**

---

## Core Value Proposition

Design, track, and report complex, multi-year estate capital projects—capture all phases, budgets, approvals, dependencies, team/role milestones, and ROI impact for every stakeholder.

---

## Priority & License

- **Priority:** P1/P0 for premium estates and long-term investment planning
- **License Tier:** Enterprise (advanced roadmap, SSO owner/board view, multi-estate/project, export/report, compliance)

---

## Business Outcome/Success Metrics

- All major capital projects tracked/synced
- Reduced budget overrun
- Scheduled milestone hit rate
- Risk/event log closure
- 90% audit/export accuracy

---

## Integration Points

- Financial/Expense
- Compliance/Doc Locker
- Analytics
- Survey/Feedback
- Maintenance/Chore
- Asset Lifecycle
- Incident/Alert
- Board/Admin export

---

## TL;DR

Everything you need to scope, phase, budget, approve, manage, and audit large projects—full milestone/task/event, Gantt timeline, ROI calculation, phase gating, team/role control, and cross-module hooks.

---

## Problem Statement

Large capital projects consistently slip out of timeline and budget, approvals are slow, future owners/stakeholders lack historical trace, post-event ROI and underlying reasons are lost, and audits remain highly manual and fragmented.

---

## Core Challenge

Link every task and phase with its associated cost, risk, dependency, and required approval; connect to documentation; surface at-risk, overbudget, or delayed phases; and continuously capture ROI and project history.

---

## Current State

Users rely on loose spreadsheets, ad hoc or slow approval chains, fragmented or lost documentation, and only partial or manual phase planning—leading to frustration among owners, board, and financiers.

---

## Why Now?

Modern estates increasingly require demonstrable cost control, future-proofing, and a high degree of owner/board/financier trust. This module forms the foundation for ROI transparency, compliance, and sustained asset value.

---

## Goals & Objectives

### Business Goals

- 100% of capital projects fully planned and board-approved
- Less than 10% schedule and cost deviation
- All phase and task history recorded
- Full audit chain record/export
- Owner, board, and financier approval
- Zero document or event loss
- Reduce cost/timeline overruns
- Boost audit/compliance rates
- Build owner/stakeholder trust
- Maximize asset/capex ROI
- Deliver board-ready risk control/reporting

### User Goals

- Visualize project plan, timeline, and cost
- Track tasks/milestones and role assignments
- Automated reminders and approval/alert workflows
- Audit by phase/step, export/report in full compliance

### Non-Goals (Out of Scope)

- Live RPA project schedule/Gantt sync at MVP
- Deep contractor/vendor triggers or manual signature flows in phase 1

---

## Measurable Objectives

| Objective | Target |
|-----------|--------|
| Overrun on tracked projects | Less than 10% |
| Approval log/board/cert phase capture | 99% |
| Late/owner/compliance event failures | Zero |

---

## Stakeholders

| Role | Responsibility |
|------|----------------|
| Owner/Board | Creation, approval, export, and oversight |
| Project Manager | Setup, tracking, reporting, risk/action management |
| Admin | Assignment, alerts, and support |
| Resident | Status, feedback |
| Maintenance/Asset | Phase/task execution, closure |
| Auditor/Financier | Audit/export for compliance and risk review |
| Compliance/Doc Lead | Documentation, certification, regulatory reporting |

---

## User Personas & Stories

### Primary Personas

- **Owner/Board:** Needs transparent oversight, approval rights, ROI visualization, and board-ready exports
- **Project Manager:** Creates, schedules, updates, and closes all phases/tasks; flags risks, manages docs, sends reminders
- **Admin:** Assigns roles, supports phase/task management, and supports approvals
- **Auditor:** Exports histories, checks traceability, and reviews event/risk closure

### User Stories

1. **Owner:** As an owner, I want to see, approve, and track the full project plan, phases, budget, and ROI, and export for board or audit.
2. **Project Manager:** As a project manager, I want to create, track, and update milestones, tasks, and documentation, flag risks, send reminders, and close or report on phases or tasks.
3. **Stakeholder:** As a stakeholder, I want to see project, phase, and task schedules, provide feedback, and check status.

---

## Use Cases & Core Flows

### Primary Use Cases

- Creation of project/phase/task/budget/approval logs
- Milestone/timeline/alerting/schedule/audit tracking
- Expense and document export/owner approval
- Gantt/schedule builder and analytics
- Stakeholder/board feedback and action capture

### User Flow Diagram

```text
[Add/Approve Project] → [Milestone/Schedule/Doc] → [Budget/Alert] → [Phase Approve/Close] → [Export/Audit]
```

### Edge Cases

- Missed event/approval
- Document or budget lags
- Dependency failures delaying downstream tasks
- Late audits/exports or board signoff failures
- Project overruns or tie-approvals
- PDF/report export errors
- Duplicate, retire, archive/recover scenarios

---

## Functional Requirements

- Support for project, phase, task, milestone, budget, schedule, documentation, approval, and board logs
- Expense cross-linking and notification system
- Embedded Gantt/timeline builder
- Approval, alert, and risk/event tracking
- Analytics, export, and audit logging/archiving
- Full mobile/desktop parity and batch operation performance
- Role-based and team assignment with SSO
- Recovery/duplication/archiving support

---

## Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Gantt/schedule load and render | Under 1 second |
| Security | All files and exports encrypted in cloud storage |
| Event/archive retention | >7 years; batch export support |
| Accessibility | ARIA timeline/alert features; accessible color/role charting |
| Concurrency | Multi-team/phase; support for high report burst volumes |

---

## Mesh Layer Mapping

| Layer | Components | Roles/Responsibilities |
|-------|------------|------------------------|
| Frontend | Planner, timeline | Visual planning, schedule/event builder, feedback/export |
| Backend | Project DB, events | Tracking phase/milestone, budget, analytics |
| Storage | Blob/archive | Document/photos/certificates, event logs, approvals |

---

## APIs & Integrations

### Required APIs

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /api/project | POST/GET | Create, retrieve projects |
| /api/phase | POST/GET | Create, retrieve phases |
| /api/task | POST/GET | Create, retrieve tasks |
| /api/approve | POST | Approval workflow |
| /api/schedule | POST | Schedule management |
| /api/timeline | GET | Timeline/Gantt data |
| /api/export | POST | Export reports |
| /api/audit | POST | Audit logging |
| /api/owner/role | PATCH | Owner/role assignment |

### External Dependencies

- Baserow (project/phase/task tracking)
- Azure Functions
- Gantt chart library
- Doc/export service
- SSO/Identity provider
- Notifications/alerts
- Compliance/report provider

---

## Data Models

| Entity | Key Fields |
|--------|------------|
| Project | ID, name, scope, owner, team, phases, budget, timeline, docs, status, event/audit/export/archive |
| Phase | ProjectID, name, status, tasks, budget, docs, close/approve/log, alerts, events |
| Task | PhaseID, desc, assigned, budget, due, docs, status, expense, approval/log |
| Audit | ProjectID, event, action, actor, time, export, archive/cert |

---

## User Experience & Entry Points

### Entry Points

- Project/timeline dashboards
- Schedule/Gantt builder
- Audit/export tools
- Role-based approval
- Feedback/event analysis and reporting
- Mobile access

### Onboarding Flow

- **Owner/Board:** Guided creation, approval, alert/track walkthrough
- **Admin:** Schedule/milestones, team assignment
- **PM:** Event/alerting, schedule/phase creation
- **Stakeholder:** Feedback access, event/schedule status

### Primary UX Flows

- Add project/phases/board
- Schedule tasks/alerts/exports
- Audit/status review
- Role-based approval
- Archive/close/recover flows

---

## Accessibility Requirements

- ARIA Gantt/timeline chart
- Table and board color/role assignment
- Audit/export tooltips/voice hints
- Milestone/board event accessibility support

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Milestone/board completion % | >90% |
| Schedule/cost deviation | <10% |
| Approval log/cert phase capture | >99% |
| Event log closure | 100% |
| Audit/export accuracy | >90% |
| Zero doc/event loss | 100% compliance |

### Leading Indicators

- New project/phase/schedule additions
- Alerts/approvals triggered and actioned
- Budget progress tracked
- Owner/board/event engagement
- SSO login/event capture

### Lagging Indicators

- Audit/export frequency/outcomes
- Missed approvals or event/archive errors
- Owner/board trend insights
- Outcome attribution to long-term events

### Measurement Plan

- Centralized dashboard for all board/project metrics
- Automated project/task/event tracking
- Role/board action logs and export analytics
- Regular trend and compliance reporting

---

## Timeline & Milestones

| Phase | Scope | Target Date |
|-------|-------|-------------|
| Phase 1 | Project/phase/task/schedule, approval/audit/log | Q3 2025 |
| Phase 2 | Budget/analytics/Gantt, alert/milestone/event | Q4 2025 |
| Phase 3 | Compliance/export/feedback/report/day/incident | Q1 2026 |

---

## Known Constraints & Dependencies

### Technical Constraints

- High report/export/doc volume
- API/event performance scaling (>1s Gantt load)
- Secure SSO/board-based permissions
- Real-time audit/logging

### Business Constraints

- Board/owner approval requirements
- Compliance and audit trail retention
- Role feedback/event monitoring
- Resource allocation for multi-estate clients

### Dependencies

- **Upstream:** Project/task/phase module, SSO, Baserow, Azure Functions
- **Downstream:** Budget/expense, export/report, audit/feedback/incident modules, Gantt library

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Approval/report/event lag | Missed milestones, audit gaps | Medium | Automated reminders, escalation |
| Export/archive failure | Compliance/audit deficiency | Low | Redundant storage, export tests |
| Board drift/overrun | Delayed/overbudget projects | High | Real-time analytics/alerting |
| Event/audit record loss | Regulatory/audit failure | Low | Multi-layer backup |
| Feedback/action gaps | Loss of owner/trust, actionability | Medium | Mandatory feedback phases |

---

## Open Questions

| Question | Owner | Target Date | Impact if Unresolved |
|----------|-------|-------------|---------------------|
| Gantt/schedule builder at MVP? | Product Lead | Q2 2024 | Delay in timeline value |
| Is audit/event/export phased w/ MVP? | Product Lead | Q2 2024 | Post-launch patch needed |
| Feedback/history/phase sequence design? | UX/PM | Q3 2024 | Integration slip |
| Incident feedback loop, how deep at launch? | Engineering | Q3 2024 | Limits board trust |
| Budget/event/export completeness? | QA/Compliance | Q3 2024 | Audit holes |

---

## Appendix

### Research & Data

- Owner/board interviews on estate finance and project history gaps
- Market analysis of current capital planning and PropTech solutions
- Compliance/certification and reporting regulatory review

### Design Mockups

- Project/phase/task and scheduling UI
- Feedback/event flows
- Timeline/Gantt, audit/export dashboards

### Technical Feasibility

- Next.js/React frontend with Gantt, event, and feedback modules
- Azure Functions/Blob for reporting and archive
- Baserow for relational project/channel/phase management

### Competitive Analysis

VeritasVault CapEx Roadmap offers deeper auditability, automation, and cross-linking of expenses, incidents, schedules, and owner events than any comparable PropTech or capital planner. Unlike rivals, it provides mobile plus board parity, exportable schedules, and Gantt, with every event tied to compliance and owner/board approval.

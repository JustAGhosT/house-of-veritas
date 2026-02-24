# Multi-Estate/Portfolio Management PRD

**Module/Feature Name:** Multi-Estate/Portfolio Management  
**Marketing Name:** VeritasVault Portfolio Central  
**Readiness:** Draft — cross-estate modules/jobs set up, user/role and analytics, owner/SSO, export/report, error/audit hooks under development

---

## Platform/Mesh Layer(s)

| Layer | Technology |
|-------|------------|
| Frontend | Next.js/React (portfolio dashboard, estate switching, SSO experience) |
| Backend | Azure Functions (estate API/event sync, cross-venue analytics) |
| Data Layer | Baserow (estate registry, role DB) |
| Identity Layer | SSO/IdP |

---

## Primary Personas

- **Owner/Portfolio Admin**
- **Property Managers**
- **Compliance/Finance/Audit**
- **Resident** (per-estate context)

---

## Core Value Proposition

Unified, secure, and role-configurable single pane for portfolio owners, admins, and managers—see, act, and report estate-wide, with estate/venue-level switching and full SSO/audit coverage.

---

## Priority & License

- **Priority:** P0 — Enterprise backbone for estate operations, audit, and reporting
- **License Tier:** Enterprise (multi-estate SSO, full module join/export, owner/portfolio admin UX, guest/demo summary)

---

## Business Outcome/Success Metrics

- Reduce owner/admin review and operations time by 75%
- Complete estate/venue-level alert and trend coverage
- Minimize role drift and errors
- Zero SSO friction or pain points
- 100% portfolio compliance and audit readiness

---

## Integration Points

- Core modules: chores, expense, incidents, docs, analytics, tools, AI/nudge
- SSO/IdP integration
- Alert/notification systems
- Export/BI API
- Cross-estate role and scene assignment

---

## TL;DR

One dashboard for your entire real estate portfolio: view, switch, and manage any property, user, event, or report in real time with full SSO integration and granular, estate-level filtering, alerting, and exporting to boards, insurance, or partners.

---

## Problem Statement

Multi-property owners and admins are burdened by tool fragmentation, leading to missed alerts, compliance/operations risks, lack of real-time status, SSO and role drift, alerting gaps, and error-prone reporting workflows.

---

## Core Challenge

Build a real-time, highly secure, and flexible join and filtering system across estates/venues, ensuring all audit/events are managed, alerting/analytics/reporting/export are perfectly in sync across every estate, and cross-scene errors are eliminated.

---

## Current State

- Users maintain multiple log-ins
- Oversight is manual—exports, reporting are late or duplicated
- No unified analytics or dashboard
- Frequent drift in access/roles
- High friction and error rate in SSO, audit, export, and reporting

---

## Why Now?

The surge in multi-estate and enterprise property ownership, plus increasing regulatory demand and market competition, creates a need for seamless join/leave, SSO, alerts, export and audit capabilities unifying estate portfolio management.

---

## Goals & Objectives

### Business Goals

- Boost confidence and oversight for owners/treasurers/partners
- Champion auditability and insight, reduce error and role/event drift
- Set market and regulatory leadership in multi-estate operations

### User Goals

- Universal, frictionless SSO (never log in twice)
- Instantly toggle, switch, or join estates
- Immediate, reliable alerts
- Seamless estate-level analytics
- Manage residents, modules, and audits by venue/event

### Non-Goals (Out of Scope)

- Full real-time data mesh APIs (deferred to phase 2)
- Deep property/asset search/compare in MVP
- Full auto-propagation of module events across the mesh at scale (batch-only in v1)
- Mobile/PWA switching at MVP

---

## Measurable Objectives

| Objective | Baseline | Target | Timeline |
|-----------|----------|--------|----------|
| Sub-2s estate switch/join | 5–10s | <2s | 6 months |
| Missed alert/audit/offline logs | 10–20% | 0% | 3 months |
| Export/log report time for owners/audit | 2–4 days | <24 hours | 6 months |

---

## Stakeholders

| Role | Responsibility |
|------|----------------|
| Portfolio Owner/Admin | Overall control, SSO, audit, export |
| Property Manager | Day-to-day estate management, roles, alerts |
| Resident | Limited read/view per estate context |
| Finance/Compliance Partner | Reporting, compliance oversight |
| Auditor/Insurer | Audit access, compliance, insurance checks |

---

## User Personas & Stories

### Primary Personas

- **Portfolio Owner/Admin:** Motivated by risk reduction, compliance, and simplicity. Wants fast audit/export and total estate coverage in one glance.
- **Manager:** Hands-on with roles and reports by estate; needs bulk and batch actions, streamlined incident management.
- **Owner/Board:** Board-level user interested in big-picture oversight, compliance, and exportable data.
- **Limited Resident:** Only sees relevant estate/activity; desires privacy and timely notifications.

### User Stories

1. **Owner/Portfolio Admin:** As an owner/portfolio admin, I want to SSO-login, see all my estates at once, switch between them, and run audits, so I can get complete reports and never miss an alert.
2. **Manager:** As a manager, I want to batch set roles and assign or retire users per estate, export logs, and manage incidents, so that portfolio administration is seamless and accurate.
3. **Resident:** As a resident, I want to view limited stats/events/actions by estate based on my role, ensuring my privacy and clarity.

---

## Use Cases & Core Flows

### Primary Use Cases

- Portfolio SSO-login and instant switch/join/leave estates
- Add/batch/retire users/roles on a per-estate basis
- Export batch event/alert/report logs
- View per-estate dashboard/analytics
- Maintain a complete event/audit/action log with history

### User Flow Diagram

**Owner:**

```text
[SSO/Login] → [Estate Dashboard] → [Switch] → [Event/Alert/Analytics] → [Audit/Export]
```

**Manager:**

```text
[SSO/Login] → [Manage Estates] → [Batch Actions] → [Event/Export]
```

**Resident:**

```text
[SSO/Login] → [Limited Estate Dashboard]
```

**ASCII Diagram:**

```text
[SSO/Login] → [Estate Dashboard] → [Switch] → [Event/Alert/Analytics] → [Audit/Export]
```

### Edge Cases

- Role drift or assignment errors between estates
- Duplicate user or estate entries
- SSO error/timeout or session loss
- Batch export or report failures
- Cross-role permission inconsistencies
- Estate join/leave record fails
- Audit log entries missing or incomplete

---

## Functional Requirements

- Owner SSO/login/join/switch estate and scene
- Owner/manager add/retire roles (single/batch), trigger alerts/audit
- Dashboard filtered by estate/module/owner
- Event/alert/report/export for each estate
- Audit log & action history for every event
- Scene assign/remove for multi-property roles
- Estate-level privacy/notification settings, compliance/audit hooks

---

## Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| SSO/login/switch | Sub-2s |
| Security | Encrypted role/event/alert data in transit and at rest |
| Audit log & data retention | 7 years |
| Accessibility | Full ARIA dashboard and WCAG 2.1 AA compliance |
| Scale | Batch operations, 100+ estates |
| Role drift/error rate | Maximum 5% |

---

## Mesh Layer Mapping

| Layer | Components | Responsibilities |
|-------|------------|------------------|
| Frontend | Dashboard, switch/view, alert | UI, user actions, event filtering |
| Backend | API, event/log/role batch, audit | Data sync, analytics, compliance |
| Storage | Logs, export, batch/event tables | Secure records, retention, exports |

---

## APIs & Integrations

### Required APIs

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /api/estate | POST/GET | Create, retrieve estates |
| /api/user | POST/GET | Manage users |
| /api/role | POST/PATCH | Role assignment and edits |
| /api/event | POST/GET | Event creation and logs |
| /api/alert | POST/GET | Alert notifications |
| /api/export | POST/GET | Batch export/report |
| /api/audit | GET | Retrieve audit logs |
| /api/switch | POST/GET | Estate switch/join actions |

API hooks for all modules (chores, expense, incidents, docs, analytics, tools, AI).

### External Dependencies

- SSO/IdP provider (authorize, role, join/leave, audit)
- Baserow (estate registry, role event log/data)
- Audit/export/notification systems
- Board/compliance partner APIs

---

## Data Models

| Entity | Key Fields |
|--------|------------|
| Estate | ID, name, owner/admin, modules, created, log/export |
| User | UserID, role(s), estate(s), join/leave/history |
| Event | EstateID, module, context, value, date |
| Role | UserID, estateID, type, expiry/history |
| Audit | EstateID, action, by, time, log, export |

---

## User Experience & Entry Points

### Onboarding Flow

- **Owner:** SSO demo, estate/scene add, walkthrough of event/alert/audit, export, batch role manage/approve
- **Admin:** SSO/join, batch onboarding, estate/role/event reporting
- **Resident:** SSO/join, per-estate summary/event/alert demo

### Primary UX Flows

- **Owner:** SSO-login/join → estate/scene switch → alert/event/log → export/audit
- **Admin:** Batch role/user/event/export
- **Resident:** Estate/event limited view

---

## Accessibility Requirements

- ARIA-compliant dashboard (color/state/text)
- Full parity on mobile and desktop
- Role-specific feedback and info states
- WCAG 2.1 AA adherence

---

## Success Metrics

### Leading Indicators

- New estate addition, join, or switch events
- Number of event/batch exports
- Count of role/owner join/leave actions
- Alert/event volume by estate

### Lagging Indicators

- Frequency and coverage of audit/report/export actions
- Owner SSO events/logs
- Count of compliance/alert errors
- Rate of resident drift/export/stat discrepancies

### Measurement Plan

- Track event/log/stat export and report frequency (dashboard + admin panel)
- Monitor SSO and switch times per user (automated logging)
- Scheduled review of owner/audit stats and batch events (monthly/quarterly reports)

---

## Timeline & Milestones

| Phase | Scope | Target Date | Dependencies |
|-------|-------|-------------|-------------|
| Phase 1 | SSO, estate join/switch, event/alert/log/export | Mo+0–3 | — |
| Phase 2 | Multi-property dashboard, batch/owner manage, roles | Mo+4–6 | — |
| Phase 3 | Board/audit API export/report, BI partner hooks | Mo+7–12 | BI partners, module hooks, SSO/IdP readiness |

---

## Known Constraints & Dependencies

### Technical Constraints

- High reliability required for SSO/session management
- Scalable audit/event/log export (batch size/volume)
- Fully encrypted state for all switch/join/event activity
- Mobile feature parity considered but not in MVP

### Business Constraints

- Owner and role approval flows
- Board-compliance for export and incident logs
- Privacy/onboarding must not block SSO or real-time features

### Dependencies

- All module API hooks operational at launch
- Owner/admin/SSO authentication
- BI partner export
- Notification/compliance audit API

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Role/estate drift | High | Medium | Batch/admin audit/export, bi-weekly reconciliation |
| SSO failure or outage | High | Low–Medium | Secondary admin-owner fallback, manual export support |
| Compliance/audit lag | High | Medium | Automated backups, scheduled exports, retention policy |
| Batch/export scaling issues | Medium | Medium | Cap batch size, monitoring, asynchronous retries |

---

## Open Questions

| Question | Owner | Target Date | Impact if Unresolved |
|----------|-------|-------------|---------------------|
| Mass/batch resident add/remove enabled? | Product | TBD | May delay admin onboarding flows |
| Owner-only SSO/control at MVP? | Lead Dev | Pre-Alpha | Impacts initial access model |
| Per-estate privacy/notification per role? | PM | Sprint 2 | Delays notification compliance/audit |

---

## Appendix

### Research & Data

- Multi-estate/board/stat logs analysis
- SSO board pilot results
- Partner BI export interviews (finance, insurance)
- User/owner feedback from incident/audit logs

### Design Mockups

- Estate switch, dashboard/event/export UI
- Batch/role management screens
- Board/owner BI & audit log views
- Notifications, mobile UIs for parity

### Technical Feasibility

- Confirmed with Azure Functions, Baserow, and SSO partners: feasible SSO/batch/export, scalable up to 100+ portfolios, proven event/audit mechanisms

### Competitive Analysis

No other estate suite currently offers true, real-time portfolio control, unified SSO, robust team/role/BI integration, incident/export management, and regulatory-grade compliance audit—all in a single board/owner dashboard. Portfolio Central positions VeritasVault as the backbone for enterprise-class estate operations, raising the industry bar for compliance, audit, and operational excellence.

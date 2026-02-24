# Estate Survey & Feedback Engine PRD

**Module/Feature Name:** Estate Survey & Feedback Engine  
**Marketing Name:** VeritasVault Voice & Pulse  
**Readiness:** Draft — focusing on builder/anonymous engine, per-event/project pulse, admin analytics/export, and alert threshold setup

---

## Platform/Mesh Layer(s)

| Layer | Technology |
|-------|------------|
| Frontend | Next.js/React (survey builder, poll/vote UX, analytics dashboard) |
| Backend | Baserow (survey/response database), Azure Functions (anonymity handling, alerting, analytics) |
| Storage | Blob (data exports); Notification/alert engines |

---

## Primary Personas

- **Residents**
- **Admins**
- **Owners**
- **Survey Designer/Analyst**
- **HR/Compliance/Auditor**

---

## Core Value Proposition

Capture authentic, actionable resident feedback across events, projects, services, and policies—anonymously or opt-in. Benchmark satisfaction, detect risks/opportunities, and close the action loop, all in real time.

---

## Priority & License

- **Priority:** P0 — Critical for high-engagement estates, conflict prevention, and regulatory/operational excellence
- **License Tier:** Enterprise (full builder, analytics, export, cross-module triggers); Free (summary access for opt-in participants)

---

## Business Outcome/Success Metrics

- Achieve 95%+ response rates per survey
- Ensure 100% of events/incidents are paired with feedback
- 90%+ of feedback yields actionable insight for owners/admins
- <1 hour from survey design to deploy
- Reduced resident churn and incident reporting spikes

---

## Integration Points

- All core modules (chore, event, incident, marketplace, expenses, recognition)
- Notification system/alerting
- Analytics/trend reporting
- Compliance Vault
- Admin/owner export module

---

## TL;DR

Every project, event, or service can trigger a custom, privacy-compliant survey. Residents respond (anonymously or opt-in); admins analyze and act in real time; owners/auditors have immediate access to benchmarks and insight trends.

---

## Problem Statement

Estate teams lack regular, honest feedback—key events or sources of friction and bias often go undetected. Owners and admins struggle to learn from and respond to issues, leading to lower satisfaction and unresolved concerns.

---

## Core Challenge

Develop a transparent, highly configurable survey and pulse engine that enforces privacy and consent, delivers targeted analytics, collects per-event or per-project feedback, and directly connects insight to action, alerting, and reporting outputs.

---

## Current State

Surveys are paper-based or distributed via infrequent email, resulting in low response, privacy leaks, delayed owner/admin review, and poor closure or benchmarking.

---

## Why Now?

Stakeholder expectations have shifted to real-time, data-driven decision-making. Regulatory mandates now require compliance-grade feedback collection and reporting. Resident loyalty is increasingly tied to responsiveness and transparency.

---

## Goals & Objectives

### Business Goals

- Build board/owner trust in estate management
- Drive operational and policy improvements via actionable feedback
- Reduce incident rates and resident churn
- Deliver regulatory and business intelligence value
- Foster increased resident loyalty by closing the feedback-action loop

### User Goals

- Make it fast and simple for residents to join surveys and share their input
- Guarantee privacy and anonymity (when opted)
- Surface fast-turnaround results and show residents that their feedback leads to tangible action

### Non-Goals (Out of Scope)

- Mass-market/public-facing survey tools
- HR/exit survey (permitted only for module/intake/move out)
- Survey marketplace functionality
- Rewards/incentives ecosystem (outside MVP)

---

## Measurable Objectives

| Objective | Baseline | Target | Timeline |
|-----------|----------|--------|----------|
| Avg. survey completion time | N/A | <2 min | Launch +1mo |
| Admin build-to-launch time | N/A | <1 hour | Launch |
| Feedback-to-action/reply/alert time | N/A | <1 week | Ongoing |
| Survey response bias | N/A | <10% | Ongoing |
| Response rate per event/project | Varies | 80%+ | Launch +1mo |
| Owner export/report lag | N/A | <24 hours | Ongoing |

---

## Stakeholders

| Role | Responsibility |
|------|----------------|
| Residents/Respondents | Provide feedback; see closure and privacy maintained |
| Admins/Designers | Build/deploy surveys; monitor and act on feedback; compliance |
| Owners | Oversight of trends and actions; ensure closure and export of feedback |
| Analyst/Board | Review feedback data, trends, compliance reporting |
| HR/Compliance/Audit | Monitor privacy adherence and regulatory compliance |

---

## User Personas & Stories

### Primary Personas

- **Resident Respondent:** Motivated to contribute feedback, ensure privacy, see results. Pain points: slow/complex surveys, privacy fears, feedback ignored. Work context: mobile and desktop, routine estate events, ad hoc incidents/events.
- **Admin Designer:** Motivated to gather actionable insights, rapid deployment, compliance. Pain points: time-consuming survey setup, ensuring privacy, event-pair consistency. Work context: back office, event management cycles.
- **Owner/Auditor:** Motivated by oversight, regulatory compliance, reduce risk/incidents. Pain points: delayed access, incomplete closure, action cycle lags. Work context: reviews/export, auditing dashboards.
- **Analyst/Board:** Motivated by benchmarking, operational BI, policy guidance. Pain points: fragmented data, trend loss, compliance tracking.

### User Stories

1. **Resident:** As a resident, I want to provide survey feedback easily and securely so that my concerns are heard without risking privacy.
2. **Admin:** As an admin, I want to deploy event-linked surveys rapidly, monitor response, and alert the owner so that actions can be taken promptly.
3. **Owner:** As an owner, I want to review and export feedback and action data to ensure transparency and compliance.

---

## Use Cases & Core Flows

### Primary Use Cases

- Admin builds and launches a survey, paired with an event or project
- Resident receives the survey, responds (anonymously or opt-in)
- Admin reviews incoming feedback, triggers alerts or tasks for unresolved/critical issues, exports results as necessary
- Owner or analyst benchmarks trends, ensures action closure, and exports reports for audits

### User Flow Diagram

```text
[Build/Deploy] → [Respond] → [Feedback/Action] → [Review/Export/Closure]
```

**Admin:** design/deploy → trigger event → monitor/export → alert/act  
**Resident:** join/respond → privacy see/close → feedback  
**Owner:** review/alert/export/trend, close action

### Edge Cases

- **Low/No Response:** Automated nudge/reminders; escalate to owner if action unresolved
- **Privacy Leak:** Immediate admin/owner notification; forced survey closure
- **Admin Bias/Feedback Suppression:** Automated bias check, audit trail, compliance alert
- **Duplicate/Incident Pair Fail:** Notification; prompt for manual repair
- **Export Error:** Retry, notify admin, auto-recover/restore if possible

---

## Functional Requirements

- Survey builder (drag-and-drop, question/pulse pair, event/project linking)
- Anonymous/opt-in response workflow
- Per-event/project trigger and auto-assignment
- Admin/owner export and batch alerting
- Closure/task linkage workflow
- Mobile/desktop support, ARIA compliance
- Privacy toggle and role-based visibility controls
- Trend/pulse analytics dashboard
- Compliance and audit-ready reporting

---

## Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Response/loading time | <2s for all actions |
| Security | All data encrypted in transit and at rest |
| Accessibility | ARIA compliance across mobile and desktop |
| Processing | Reliable batch/event processing |
| Export | Robust admin export/report capability |
| Access | Role-based access/logging |
| Privacy | Privacy-by-design testing |

---

## Mesh Layer Mapping

| Layer | Responsibility |
|-------|----------------|
| Frontend | Survey build, respond, event pairing, alerts |
| Backend | Survey/response/event logging, privacy controls, analytics |
| Storage | Batch/export/role logs, trend/benchmarking |

---

## APIs & Integrations

### Required APIs

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /api/survey | POST/GET | Create or retrieve survey |
| /api/response | POST/GET | Submit or list responses |
| /api/action | POST/PATCH | Mark action, closure |
| /api/export | POST | Trigger export |
| /api/alert | POST | Send alert |
| /api/benchmark | GET | Trend analytics |
| /api/privacy | PATCH | Set privacy/consent |

API hooks into all core modules (event, chore, incident, etc.).

### External Dependencies

- Baserow: Primary survey/response/event database
- Azure Functions: Batch operations, triggers, export, alerting
- Notification/Alert system: Internal messaging and alerts
- Compliance/Export tool

---

## Data Models

| Entity | Key Fields |
|--------|------------|
| Survey | ID, event/project, type, question/pulse, role/privacy, status, log |
| Response | SurveyID, event, user/anon status, answer, time, alert, feedback |
| Action/Alert | SurveyID, event, admin, close, role, export, trend |

---

## User Experience & Entry Points

### Entry Points

- Centralized survey hub/dashboard for admins/owners
- Build/participate/status panels for residents
- Alert/close/action points for unresolved feedback
- Export/trend review dashboards
- Batch operations for large event rollouts

### Onboarding Flow

- Admin completes builder onboarding/demo
- Event or project triggers survey (auto/manual)
- Residents receive/respond to survey
- Admin/owner reviews feedback and closes action items

### Primary UX Flows

- Survey build → deploy/trigger event → resident respond → admin monitor/alert/export → owner closure/benchmark review

---

## Accessibility Requirements

- Full ARIA labeling and event forms
- Privacy labeling and opt-in/opt-out at every step
- Mobile/desktop parity for all major workflows
- Affirmative/negative feedback confirmation

---

## Success Metrics

### Leading Indicators

- Number of new surveys/responses/alerts issued
- Percentage of events with paired feedback
- Number of trend pulse analytics used
- Volume of owner export/closure actions

### Lagging Indicators

- Owner export/closure rate
- Incident/churn reduction post-action
- Privacy/audit compliance achieved

### Measurement Plan

- All metrics surfaced in admin trends & export dashboards
- Owner/role-based export logs for audits and compliance
- Analytics cross-referenced against incident, churn, retention data
- Batch feedback and event/incident pairing tracked automatically

---

## Timeline & Milestones

| Phase | Scope | Target Date |
|-------|-------|-------------|
| Phase 1 | Build/respond/trigger/export | Month 1 |
| Phase 2 | Batch/benchmark/event pairing/action integration | Months 2–3 |
| Phase 3 | Action closure/export, trend/BI owner/analyst tools | Month 4+ |

---

## Known Constraints & Dependencies

### Technical Constraints

- Event/DB integration and form builder flexibility
- Full ARIA/accessibility implementation
- Data export and alerting performance/reliability
- Batch role and ownership traceability

### Business Constraints

- Owner/event alerting requirements
- Compliance mandates around privacy/export
- Batch survey/feedback cycles
- Administrative resource bandwidth

### Dependencies

- Survey form complexity and event-pairing reliability
- Batch handling and export/reporting at scale
- Mobile/desktop responsive design and privacy toggling
- Alert/trend/closure workflows across roles/events
- Event/project triggers across modules
- Role/owner assignment and export rights
- Alert/export integration with core and external BI/compliance tools

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Event/survey pair missed | Incomplete feedback | Medium | Automated checks, manual repair prompts |
| Privacy/data leak | Regulatory/compliance | Low | Encrypted comms, admin alert, force closure |
| Admin bias/exclusion | Low trust | Medium | Automated bias detection, audit logging |
| Alert/export failure | Reporting delays | Low | Automated retries, admin notifications |

---

## Open Questions

| Question | Owner | Target Date | Impact if Unresolved |
|----------|-------|-------------|---------------------|
| Anonymous survey at MVP? | Product Lead | Pre-dev | Privacy compliance, trust uptake |
| Incentive for repeated survey engagement? | Owner/Admin | MVP+2 | Response/engagement rates |
| Owner role on batch/closure? | PM/Owner | Pre-launch | Accountability, workflow design |
| Export/alert on trend/incident spike? | Analyst | MVP | Incident response optimization |

---

## Appendix

### Research & Data

- Results from survey/feedback/batch pilots
- Event/incident trigger mapping studies
- Owner/role/alert and BI review sessions
- Regulatory compliance case studies

### Design Mockups

- Survey build, participate, and dashboard interfaces
- Mobile event/alert workflows
- Export/action/trend/benchmark modules

### Technical Feasibility

- Survey builder/live summary/role log tested in demo
- Prototype event trigger, batch export, privacy/alert flows

### Competitive Analysis

Current PropTech and HR tools lack matched event-pairing, batch/benchmark features, or true BI with role/owner export and privacy-first analytics. VeritasVault Voice & Pulse uniquely delivers compliant, flexible, mesh-native pulse capturing—from the resident to the owner level, per event/project, with seamless privacy and action closure.

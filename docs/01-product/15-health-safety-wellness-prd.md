# Health, Safety & Wellness Logbook PRD

**Module/Feature Name:** Health, Safety & Wellness Logbook  
**Marketing Name:** VeritasVault Safety Central  
**Readiness:** Draft — compliant, real-time, evidence-ready; multi-channel input and notification

---

## Platform/Mesh Layer(s)

| Layer | Technology |
|-------|------------|
| Frontend | Next.js/React (incident report, checklist, logs, mobile emergency flows) |
| Backend | Baserow (incident/event/trend/tracker), Azure Functions (alert, escalation, analytics, reminder) |
| Storage | Azure Blob (photos, reports, attachments) |

---

## Primary Personas

- **Residents**
- **Admins**
- **First Aiders**
- **Safety Owner**
- **Owner/Auditor**

---

## Core Value Proposition

A single source-of-truth for every incident, near-miss, injury/allergy, audit, and safety/wellness event—cross-module, real-time, compliant, and actionable.

---

## Priority & License

- **Priority:** P0 — core for liability, care, and admin peace-of-mind; compliance-critical
- **License Tier:** Enterprise with time-limited/role-limited audit access

---

## Business Outcome/Success Metrics

- Zero missed/legal/compliance-actionable event
- Reduction in incidents/accident recurrence
- Improved wellness reporting
- Audit/insurance pass
- Resident & staff confidence

---

## Integration Points

- Resident Directory
- Incident/Event module
- Maintenance/Task/Asset module
- Compliance/Doc module
- Notification/Emergency Alert module
- Analytics Engine

---

## TL;DR

Every incident—safety, near-miss, health, allergy, or wellness—is reported and analyzed in real time. Transparent audits, fast responses, seamless cross-linking to maintenance/tasks, evidence logging, and complete reporting are all tracked and reviewable for legal, operational, and care needs.

---

## Problem Statement

Critical events are often missed or forgotten. Incident logs are kept on paper or managed manually, feedback opportunities are limited, escalation is slow or unreliable, and audits are forced and retroactive with major gaps—creating liability, anxiety, and operational inefficiency.

---

## Core Challenge

Enable easy and safe reporting; direct linkage to maintenance/tasks; admin and owner-level audits; event trend and action tracking; and clear feedback/closure loops, all backed by immutable logs.

---

## Current State

- Manual, paper-based incident and first-aid logbooks
- Decentralized, unconnected data (e.g., medical logs, audits)
- Allergy and risk data not surfaced to relevant stakeholders
- No action history or trend analysis capability
- Compliance processes are retroactive and resource-draining

---

## Why Now?

- Increased legal, insurance, and resident expectation pressure
- Proven reduction in cost/incident recurrence through digital health & safety
- Value add for long-term audit, resale, and regulatory compliance

---

## Goals & Objectives

### Business Goals

- Achieve zero regulatory fails
- Reduce incident and insurance costs
- Demonstrably improved audit performance
- Enhance well-being and trust across the community

### User Goals

- Enable easy and, if desired, anonymous reporting
- Provide real feedback and closure with proof of action
- Make trends and summary statistics visible and actionable
- Ensure clear escalation pathways, control, and reset functions

### Non-Goals (Out of Scope)

- Medical diagnosis or intervention
- High-risk wellness surveillance that could compromise privacy
- Data sharing with third parties without explicit consent

---

## Measurable Objectives

| Objective | Baseline | Target | Timeline |
|-----------|----------|--------|----------|
| Percentage of events captured in real-time | <40% | >99% | 3 months |
| Incidents/actions closed within 24h | <50% | >90% | 3 months |
| First feedback delivered in <1 day | <70% | 100% | Launch |
| Allergy/recurrence flags reported | Spotty | 100% | Ongoing |
| Missed on-call/first-aider alerts | Often | Zero | 1 month |

---

## Stakeholders

| Role | Responsibilities |
|------|------------------|
| Residents | Report, track, and receive feedback on incidents/wellness events |
| Admins/Safety | Triage, escalate cases, close events, maintain audit trails |
| First Aiders | Respond, log actions, track & close medical cases |
| Owner/Auditor | Review logs, ensure compliance, escalate, onboard credits/resets |

---

## User Personas & Stories

### Primary Personas

**Reporting Resident**

- Motivated by personal or collective safety, wishes for anonymity where required, experiences frustration with complex or unresponsive processes.

**Admin/Safety Manager**

- Needs quick, reliable access to incident data; responsible for regulatory compliance, trend analysis, and action tracking.

**First Aider**

- Responds to on-site emergencies, must document outcomes, escalate as needed, and synchronize with admin teams.

**Owner**

- Interested in transparent compliance reporting, risk reduction, and operational oversight.

**Auditor**

- Requires immutable logs, batch report export, and clear audit histories for review.

### User Stories

1. **Resident:** As a resident, I can report or track safety, incident, allergy, or wellness events and receive status feedback.
2. **Admin:** As an admin, I obtain dashboard visibility, escalate cases, flag priorities, manage closure, and ensure full audit logs.
3. **First-aider:** As a first-aider, I receive emergency alerts, log actions taken, document escalation, and ensure admins are notified.
4. **Owner/Auditor:** As an owner/auditor, I extract reports, review full action logs, check compliance, and manage drill/test approvals.

---

## Use Cases & Core Flows

### Primary Use Cases

1. Quick mobile/desktop incident reporting with optional anonymity, evidence/photo, and context
2. Feedback loops: Admin triage/escalate/close events, link to maintenance or tasks
3. Automated alerts: On-call response, at-risk or recurrent events trigger escalations
4. Trend analytics, compliance tracking, owner/audit export and review

### User Flow Diagram

**Resident:**

```text
Report (anon/identified) → set priority/upload attachments → receive feedback → track status/closure
```

**Admin:**

```text
View/triage → take action/escalate → close case or escalate to owner → export for audit
```

**First Aider:**

```text
Notified → Respond on-site → Log medical actions/escalate → Close in system
```

**Owner:**

```text
Audit/review exported logs → Approve credits/trigger drills
```

**Core flow:**

```text
[Submit Incident] → [Admin Triage] → [Action/Escalate] → [Feedback→Close/Audit]
       ↑                    ↓                                    ↑
[Mobile/Anon/At-Risk]   [On-Call]      [Linked Maintenance/Task]   [Monthly/Audit Export]
```

### Edge Cases

- Anonymous vs. identified reports
- Missed/failed feedback loops
- Unresponsive admin/first-aid escalation
- Multiple recurrences of same event
- Allergy/no-action updates
- Photo/evidence upload loss
- Missing audit entries
- Admin override/compliance override with justification
- Opt-out from wellness event logging due to privacy

---

## Functional Requirements

- Incident, deviation, and near-miss logging (with context, photo, priority, timestamp, notification)
- Full allergy/event/recurrence history tracking
- Feedback/action/closure loop for every report
- Triage and escalation workflows, with on-call/owner notifications
- Real-time notification & alerting, batch export and trend analytics modules
- Audit-proof logs: write-once, with admin reset override (signature/justification required)
- Anonymous user opt-in modes, owner-configurable privacy parameters
- Multi-channel reporting (desktop, mobile), admin override, direct linkage to maintenance/task/compliance modules

---

## Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| UX | Mobile-first responsive input and alert flows |
| Response time | Sub-2 second for all core actions |
| Security | End-to-end encryption, GDPR/POPIA compliance |
| Audit retention | 5 years immutable audit log retention |
| Concurrency | All residents/admins simultaneously |
| Accessibility | Full ARIA compliance for dashboards/reports |

---

## Mesh Layer Mapping

| Layer | Components | Responsibilities |
|-------|-------------|------------------|
| Frontend | Incident entry, status tracking, dashboard, feedback, alert | User interaction |
| Backend | Incident/event log, trend/tracker, feedback, escalation logic, analytics | Logic, persistence |
| Storage | Photos, supporting documents, logs, export files | Evidence, archives |
| Notification | Incident/action status alerts | Real-time communication |
| Integration | Maintenance/task/asset management, owner/incident export utility | Cross-module sync |

---

## APIs & Integrations

### Required APIs

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /api/incident/report | POST/GET | Submit, view incident log |
| /api/incident/feedback | POST/GET | Admin/first-aider feedback & status |
| /api/incident/escalate | POST/GET | Escalate event to owner/on-call |
| /api/audit/export | POST/GET | Export/batch audit logs |
| /api/incident/allergy | POST/GET | Submit/view allergy/recurrence |
| /api/notify | POST/GET | Trigger incident/alert notification |
| /api/trend/analytics | GET | Provide incident/event trend analytics |

### External Dependencies

- Baserow (incident, evidence log)
- Notification system (internal/external push)
- Blob storage for docs/photos/receipts
- Compliance checklists, audit/report export tools
- Owner SLA tracking, optional insurer/legal framework integration

---

## Data Models

| Entity | Fields/Relations |
|--------|-------------------|
| Incident | ID, type, priority, location, anon, timestamp, reporter, assigned, feedback, linked maintenance/owner, status, notes, trend, audit |
| Feedback | IncidentID, user, status, comment, closure, rating |
| Allergy | IncidentID, user, type, recurrence, closure, flag |
| Escalation | IncidentID, from/to, when, status |
| Audit | IncidentID, action, by, time, prior, export |

---

## User Experience & Entry Points

### Onboarding Flow

- **Admin:** Import legacy log, set up checklists/alerts, demo audit requests to owner
- **Resident:** Guided incident entry, practice with feedback, at-risk alert explanation, privacy introduction

### Primary UX Flows

- Mobile quick log and contextual evidence capture
- Feedback notifications/status dashboard
- Closure flows with historical tracking
- Admin escalation path
- Audit/reporting/export for owner oversight

---

## Accessibility Requirements

- Full ARIA implementation for all dashboards and menus
- Alt text for evidence uploads
- Color/label guidance for urgent cases
- Feedback/comments accessible via screen reader

---

## Success Metrics

### Leading Indicators

- Number of immediate new reports vs. triaged
- Percentage escalated to owner/first-aider
- Allergy/repeat occurrence tracking
- Incident closure within SLA/timelines
- Quantity and compliance of photo evidence attached

### Lagging Indicators

- Incident and near-miss reduction (quarter-over-quarter)
- Decrease in repeat events/recurrences
- Audit SLA compliance rate
- User/stakeholder satisfaction surveys

### Measurement Plan

- Real-time dashboards and exportable reports
- Automated audit logs tracked per incident
- Owner SLA summary in admin panel
- Timelines for incident lifecycle
- Monthly trend and closure analytics

---

## Timeline & Milestones

| Phase | Scope | Target | Dependencies |
|-------|-------|--------|--------------|
| 1 | Incident log, admin triage, feedback loop, export | Month 1–2 | Baserow, Next.js, Azure |
| 2 | Analytics, maintenance/task cross-link | Month 3 | Notification, task integration |
| 3 | Owner audit, insurer SLA, mobile/offline | Month 4–6 | Compliance, mobile dev |

---

## Known Constraints & Dependencies

### Technical Constraints

- Image/evidence storage scaling
- Real-time notifications on limited/resident Wi-Fi
- Mobile-friendly feedback loops
- End-to-end privacy/security on all layers

### Business Constraints

- Compliance/insurance SLAs and required retention
- Budget for scaling storage/notification
- Resource availability for training and onboarding

### Dependencies

- Notification system uptime
- Baserow for core log storage
- Maintenance/task platform sync accuracy
- Legal/insurer onboarding for audits

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Missed/hidden reports | High | Medium | Mobile-first UI, reminders, owner audits |
| Unresponsive admin escalation | High | Medium | Auto-escalate after timeout |
| Lost photo/evidence uploads | Medium | Low | Redundancy, manual retrain/upload process |
| Compliance override/abuse | High | Low | Admin/owner signature & justification logging |

---

## Open Questions

| Question | Impact |
|----------|--------|
| What degree of privacy/anon logging is required at MVP launch? | |
| Should trend analytics be visible to all, or owner-only? | |
| What level of insurer/legal alert integration is required out-of-the-box? | |

---

## Appendix

### Research & Data

- Legal and insurance guidance from incident reviews
- PropTech pilot analyses of digital safety systems
- Owner/auditor feedback and requirements surveys

### Design Mockups

- Resident mobile quick-log flow
- Admin feedback management dashboard
- Audit/export view for owner/reviewer
- Owner-facing drill/test reports

### Technical Feasibility

- Proven stable incident/feedback/event/notification stack
- Audit log and trend analytics retention reviewed for scale
- Early AI/edge/OCR for incident explanation inbound
- Demo SLAs/interface ready for owner testing

### Competitive Analysis

While most digital safety tools capture incidents only after the fact, VeritasVault Safety Central is proactive, factory-complete for real-time trend analytics, direct integration with tasks/assets, owner escalation, insurer/audit SLAs, and bi-directional feedback. Competitors lack real-time feedback, actionable audit trails, or seamless cross-link to operational and compliance modules, placing Safety Central as a significant leader for multi-resident estates and compliance-driven verticals.

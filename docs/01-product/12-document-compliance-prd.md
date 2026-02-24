# Document Locker & Compliance Portal PRD

**Module/Feature Name:** Document Locker & Compliance Portal  
**Marketing Name:** VeritasVault Compliance Vault  
**Readiness:** Draft – core flows, expiry/alerts, e-signature, versioning, audit trail

---

## Platform/Mesh Layer(s)

| Layer    | Technology                                                                                   |
| -------- | -------------------------------------------------------------------------------------------- |
| Frontend | Next.js/React (document dashboard, expiry/alert/invite modals)                               |
| Backend  | Baserow (document registry, expiry tracker), Azure Functions (alerting, renewal, role audit) |
| Storage  | Secure Blob/File system                                                                      |

---

## Primary Personas

- **Residents**
- **Admins/Compliance Officers**
- **Estate Owners**
- **Auditors**

---

## Core Value Proposition

One secure location for all estate legal, HR, operational, and compliance documents—track, renew, audit, and share with the right people, on time, every time.

---

## Priority & License

- **Priority:** P0 – Critical for all mature estates and regulatory-compliant properties.
- **License Tier:** Enterprise (with optional auditor read-only/temporary access)

---

## TL;DR

Store, manage, renew, and distribute all estate documentation in one place: never miss a deadline, control who can see/sign, and pass any audit painlessly.

---

## Business Outcome/Success Metrics

- Zero compliance misses/overdues
- Reduced legal risk
- <24h doc/data request response
- 100% auditable status/log
- Increased resident/owner trust
- Measurable staff time savings

---

## Integration Points

- User Directory
- Notification Service
- DocuSeal (e-signature)
- Incident/Task/Expense Logs
- Analytics

---

## Problem Statement

Premature document expiry, missed reviews, lack of visibility, and forgotten signatures create risk, unnecessary costs, and regulatory headaches; current document sharing is insecure and ad hoc.

---

## Core Challenge

Balance security and rights management with ease-of-access and renewals; centralize control without increasing friction or workload for residents or admins; guarantee a 100% audit trail and review chain.

---

## Current State

Processes rely on spreadsheets, manual email reminders, and disorganized cloud folders, resulting in hard-to-audit setups, lack of systematic expiry tracking, and increased risk of accidental deletion or leaks.

---

## Why Now?

With heightened legal liability, insurance scrutiny, and the demand for best-in-class operations, premium and growing estates require robust document control and transparent proof of review/action.

---

## Goals & Objectives

### Business Goals

- Achieve >99% on-time review/renewal/expiry (green status)
- Enable <1hr audit request fulfillment
- Ensure 100% signature/completion tracking
- Provide full action log protection
- Enforce role-based access for each document

### User Goals

- Give users peace of mind that their documents are safe, accessible, and trusted
- Avoid chasing signatures or missing renewal notices
- Maintain clear status at a glance

### Non-Goals (Out of Scope)

- External e-filing to government/state
- Built-in legal review/interpretation (link-out only)
- Deep workflow/ERP integration for MVP

---

## Measurable Objectives

| Objective                    | Target |
| ---------------------------- | ------ |
| Zero late/overdue signatures | Yes    |
| Audit log export time        | <1hr   |
| On-time review compliance    | 99%    |
| Onboarding for new docs      | <10min |

---

## Stakeholders

| Stakeholder           | Role               | Responsibilities                       |
| --------------------- | ------------------ | -------------------------------------- |
| Residents             | End users          | View, sign, verify doc status          |
| Admin/Compliance Lead | Ops & Compliance   | Track, enforce, export docs, configure |
| Owner                 | Estate management  | Review, configure settings, escalate   |
| Auditor/Inspector     | External assurance | Access, filter/export, validate audit  |

---

## User Personas & Stories

### Primary Personas

**Resident**

- Prioritizes ease, clarity, and never wanting to miss an action. Needs secure access from anywhere.

**Admin/Compliance Lead**

- Needs total status visibility, granular controls, and effortless reporting/export.

**Estate Owner**

- Seeks assurance, oversight, and the ability to spot trends or compliance gaps quickly.

**Auditor/Inspector**

- Needs fast, limited-time access with robust audit trail/access log controls for proof and export.

### User Stories

1. As a resident, I can see all my required docs, track my signing/compliance, and get notified of actions needed.
2. As an admin, I see what's missing, overdue, or upcoming; can add/configure docs, send/track reminders, and export logs instantly.
3. As an owner/auditor, I get quick, secure access, with audit logs, version/expiry, and historical proof for every doc.

---

## Use Cases & Core Flows

### Primary Use Cases

1. Upload/add doc with metadata, assign required signers/checks.
2. Resident notification/workflow—view, sign, take action; status/alerts auto-update.
3. Admin dashboard—full doc status, manage overdue, audit log, rapid report/export.
4. Expiry/renewal logic—auto-alerts, assignment queues, locked access on expiry, retro auditing.

### User Flow Diagram

```text
[Upload/Add Doc] → [Assign/Tag/Link] → [Sign/View/Reminder] → [Status/Expiry/Alert] → [Audit/Export/Access]
```

**Resident:** View docs → Sign → Status updates/alerts/audit review

**Admin:** Add/track doc → Dashboard → Notify users → Audit/export

**Auditor:** Temp access → Filter/export → Review log

### Edge Cases

- **Lost doc/accidental delete:** System must support archival/recovery.
- **Resident leaves/role changes:** Auto-reassign outstanding documents.
- **Expired doc locks:** Manual unlock/escalate process for emergencies.
- **Auditor access fails:** System supports renewal/sharing workflow.
- **Duplicate doc detection:** Prevents upload conflicts through AI/metadata matching.

---

## Functional Requirements

- Secure doc upload with metadata, expiry, assignment
- Role-based access controls; time-limited auditor links
- Document lifecycle states: pending, signed, overdue, active, archived
- Auto-alerts: expiry, renewal, missing signature/action
- Audit log/action export for every doc, every user
- Owner/admin dashboard: filter, sort, batch export
- Versioning; recover/restore for deleted docs
- Feedback/incident reporting tied to Incidents module
- Batch reminder/notification capability

---

## Non-Functional Requirements

| Requirement               | Target                                |
| ------------------------- | ------------------------------------- |
| Dashboard filter/load     | Under 2s                              |
| Encryption                | End-to-end (in transit & rest)        |
| Audit/event log retention | >5 years                              |
| Availability              | Automatic failover; high-availability |
| Compliance                | GDPR, POPIA, ISO                      |
| Accessibility             | Full ARIA dashboard accessibility     |

---

## Mesh Layer Mapping

| Layer        | Component/Responsibility                                                        |
| ------------ | ------------------------------------------------------------------------------- |
| Frontend     | Role-based doc views, alerts, e-signature, batch ops                            |
| Backend      | Baserow (doc/status registry), Azure Functions (expiry/alerting, audit exports) |
| Storage      | Secure Blob/files                                                               |
| Cross-Module | Incident/task connections, user/role authentication                             |

---

## APIs & Integrations

### Required APIs

| API                   | Purpose                                                  | Method         |
| --------------------- | -------------------------------------------------------- | -------------- |
| /api/doc              | Upload, edit, archive docs; batch upload, filter, export | POST/GET/PATCH |
| /api/sign             | Trigger/view/sign, update                                | POST           |
| /api/remind           | Notify, resend, alert                                    | POST/PATCH     |
| /api/role             | Get/assign access roles                                  | GET            |
| /api/auditlog         | Action logs/export                                       | POST/GET       |
| /api/signature/update | E-sign webhook/status                                    | Webhook        |

### External Dependencies

- DocuSeal (e-signature)
- Baserow (doc registry)
- Secure Blob storage (Azure/GCP)
- Notification service (email/SMS)
- User directory/role management
- (Future): Compliance training, ERP/system integrations

---

## Data Models

| Model       | Fields                                                                                                |
| ----------- | ----------------------------------------------------------------------------------------------------- |
| Doc         | ID, type, file, owner/assigned, signers, status, expiry, renew, audit trail, access links, action log |
| Signature   | DocID, user, status, timestamp                                                                        |
| Role        | UserID, access, expiry date                                                                           |
| Audit       | DocID, action, user, timestamp, version/history                                                       |
| AccessGrant | DocID, user, time window, status                                                                      |

---

## User Experience & Entry Points

- Role-based dashboards (resident/admin/owner/auditor)
- Upload/new doc flow
- Sign/remind widgets
- Audit log sidebar, batch export buttons
- Alert banners for urgent/overdue status
- Audit console for external requests
- Temporary/secure external access links

---

## Onboarding Flow

- Admin imports/setup docs
- Assigns any missing/required docs to users
- Initial alert/notification batch is triggered
- Export/audit demo workflow available

---

## Primary UX Flows

- **Resident:** dashboard → sign → notify → status update
- **Admin:** import → assign/alert → dashboard → audit/export
- **Auditor:** receive temp link → filter/export → audit log review

---

## Accessibility Requirements

- Full ARIA labels for interactive elements
- Keyboard navigation for dashboards and tables
- Status/icons paired with color and text cues
- Doc/image uploads require alt/text descriptions
- User notification preferences and control

---

## Success Metrics

### Key Metrics

- Zero missed or overdue signatures
- <2h document/audit request turnaround
- No successful data breaches (security incidents)
- Documented satisfaction from owner/admin roles

### Leading Indicators

- % of new doc uploads triggering reminders
- Time-to-completion per document
- Increase in audit/export/log activities
- Number of expiry/renewal flags raised before due date

### Lagging Indicators

- Audit/inspection failures
- Late/overdue events detected
- Data breaches or negative security events
- Owner escalation or complaint rates

### Measurement Plan

- Real-time tracking via admin/owner dashboards
- Exportable logs and batch export downloads
- Monthly compliance reviews
- Automated audit trail collection and review

---

## Timeline & Milestones

| Phase | Scope                                   | Target   |
| ----- | --------------------------------------- | -------- |
| 1     | MVP (upload, role, alert, audit)        | 2 weeks  |
| 2     | Expiry/renewal, e-sign, auditor access  | +2 weeks |
| 3     | Feedback/incidents, versioning, scaling | +2 weeks |

---

## Known Constraints & Dependencies

### Technical Constraints

- Storage and log retention volume scaling
- Secure file format and blob handling
- Webhook/event spam prevention
- Minimum 3-year audit log retention requirement
- Rollback and access escalation audit functionality

### Business Constraints

- Training needs for admins/staff
- Maintaining privacy compliance (GDPR, POPIA)
- Role changes, partner onboarding
- External auditor SLAs

### Dependencies

- DocuSeal, Baserow, and blob storage readiness
- Notification infrastructure
- Admin role configuration/convention
- Initial access/expiry onboarding

---

## Risks & Mitigations

| Risk                   | Impact               | Probability | Mitigation                                    |
| ---------------------- | -------------------- | ----------- | --------------------------------------------- |
| Missed expiry/renewals | Compliance failure   | Medium      | Multi-interval alerts, role alert queues      |
| Document deletion      | Data loss            | Low         | Archive + restore, restricted delete          |
| E-signature error      | Legal risk           | Low/Med     | Fallback/manual flag, auto-notify admins      |
| Access/role drift      | Unauthorized access  | Medium      | History/event log review, role reconciliation |
| Audit/export failure   | Audit non-compliance | Low         | 24/7 batch export availability                |

---

## Open Questions

| Question                                                                             | Impact |
| ------------------------------------------------------------------------------------ | ------ |
| Should residents see all signed docs or only those currently assigned to their role? |        |
| Can owners filter and view audit logs by user granularity?                           |        |
| Should the system enable fallback to physical/manual signatures if e-sign fails?     |        |

---

## Appendix

### Research & Data

- Compliance log reviews from pilot estates
- Insights from lawyer/insurer interviews
- Regulator-required checklist mapping
- PropTech pilot field test summaries

### Design Mockups

- Document dashboard UX flow
- Audit console layouts
- Role setup/config modals
- Notification/alert banners and flows
- External/examiner access link templates

### Technical Feasibility

- Blob/registry/log infrastructure validated in testbed
- E-signature APIs and event webhooks tested/verified
- Audit/retention policies confirmed scalable
- External/SSO-enabled access in active development

### Competitive Analysis

Traditional estate management platforms offer basic upload and reminders but lack:

- Proactive expiry and renewal
- Integrated e-signature and full audit trails
- Granular access controls and rapid batch exports for auditors

VeritasVault's "frictionless alert+remind+audit+e-sign" delivers what fragmented/legacy or spreadsheet-based solutions cannot: a unified, trusted compliance backbone for estates and property managers.

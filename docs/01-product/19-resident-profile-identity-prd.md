# Resident Profile & Identity Hub PRD

**Module/Feature Name:** Resident Profile & Identity Hub  
**Marketing Name:** VeritasVault MyResidence Profile  
**Readiness:** Draft — profile flows and admin UX drafted, privacy/event logic fleshed out, SSO/MFA/role implementation defined, API/data model and audit-chain ready for build out

---

## Platform/Mesh Layer(s)

| Layer    | Technology                                                                                                                                                           |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend | React/Next.js (resident profile dashboard, settings, cross-module panel)                                                                                             |
| Backend  | Baserow (central profile repository, role management, resident attributes), Azure Functions (privacy computation, data sync, notification logic, core orchestration) |
| Storage  | Secure Blob (ID, photos, verified documents, resident-related attachments)                                                                                           |

---

## Primary Personas

- **Residents** (end-users)
- **Admins** (property, HR, module admins)
- **Owners** (estate/portfolio compliance, HR/ops/certification leads)
- **Auditors/HR/Compliance Officers**
- **Project Leads** (cross-module data integration)

---

## Core Value Proposition

A unified platform for viewing, editing, and managing all resident attributes, preferences, and access settings—integrating privacy, allergies, skills, awards, notifications, and audit history across modules for seamless compliance and superior user experience.

---

## Priority & License

- **Priority:** P0 — Foundation for all personal, compliance, safety, skill, and notification flows across the platform
- **License Tier:** Enterprise (full features, multi-estate/role support, SSO/IdP integration); Free/PWA (summary read-only for onboarding and first-contact)

---

## Business Outcome/Success Metrics

- Zero misattributed access events
- 100% tracked allergies, skills, certifications, and awards per resident
- Onboarding completion within 48 hours
- No privacy-related SLEs (Service Level Events)
- Owner, audit, export, and retire role compliance met for all estates

---

## Integration Points

- User/Auth/SSO (including MFA and role switching)
- Notification/Alert system
- Allergy/Skill/Incident modules
- Chores and task assignment modules
- Awards/Gamification modules
- Compliance Vault (auditing and policy management)
- Multi-estate/portfolio management

---

## TL;DR

Every resident receives a privacy-compliant, cross-module profile enabling self-service editing of core data, preference and notification management, and secure switching between roles and estates—all with deep auditability and fast onboarding, powered by SSO.

---

## Problem Statement

Resident profile information is fragmented and inconsistent, leading to ignored allergies/skills, siloed award/feedback history, lack of privacy controls, and difficult audits or offboarding. There is no unified location for managing preferences, notifications, or consent history.

---

## Core Challenge

Guaranteeing data integrity and up-to-date attributes across modules and events, providing robust controls for privacy toggling, scoped role/estate visibility, ensuring complete onboarding nudges, and delivering powerful admin/owner audits without overloading support teams or users.

---

## Current State

- Profile, skills, and allergy data is maintained in disconnected spreadsheets or isolated apps
- No integration with notification or award modules
- Admins lack tools for batch updates
- No audit trails; HR/certification/role events are not surfaced or exportable

---

## Why Now?

- Modern compliance standards, user self-service expectations, privacy/consent requirements, and regulated role/event operations demand centralized profiles with fully auditable histories—functionality that current tools cannot offer.

---

## Goals & Objectives

### Business Goals

- Ensure complete auditability of all resident events and attribute changes
- Reduce onboarding errors and time to activation
- Drive higher compliance and feedback engagement levels
- Improve retention and overall user experience
- Lower direct admin interventions through automation/self-service

### User Goals

- Enable residents to easily view, edit, and verify their profile and preferences
- Provide intuitive privacy controls and skill/certification proofs
- Allow residents to configure notification modes and track awards/roles/certifications
- Deliver frictionless onboarding with SSO and mobile access
- Support full auditability for every event/action by profile

### Non-Goals (Out of Scope)

- Direct mass onboarding via email campaigns
- Family/child linked accounts (deferral to post-MVP)
- Deep integrations with HR or payroll platforms at MVP

---

## Measurable Objectives

| Objective                                   | Baseline | Target    | Timeline |
| ------------------------------------------- | -------- | --------- | -------- |
| Profile onboarding completeness             | N/A      | 100% <48h | 1 month  |
| Incomplete allergy/skill reports            | >30%     | 0%        | 1 month  |
| Privacy/notification self-configure success | N/A      | >95%      | 2 months |
| Owner/audit event trace coverage            | <50%     | >90%      | 2 months |

---

## Stakeholders

| Role                  | Responsibility                              |
| --------------------- | ------------------------------------------- |
| Residents             | Primary data owners                         |
| Admins                | Profile, attributes, batch management       |
| Owners                | Compliance, privacy, audit reporting/export |
| HR/Certification Lead | Certification/allergy/incident updates      |
| Module Owners         | Integration points for other services       |

---

## User Personas & Stories

### Primary Personas

**Engaged Resident**

- Values privacy, wants to keep skills/allergies up to date, expects easy onboarding, and insights into awards/events.

**Owner/Admin**

- Responsible for compliance, privacy, and onboarding; needs batch tooling and audit features.

**Skill/Incident Lead**

- Manages certifications, incident responses, and profile triggers.

**Auditor/Compliance**

- Verifies historical actions, ensures export and retire processes are audit-ready.

### User Stories

1. **Resident:** As a resident, I want to set my skills and allergies, configure my privacy preferences, and review my awards in one place.
2. **Administrator:** As an administrator, I need to batch-update residents, audit profiles, and retire outdated data for compliance.
3. **Owner:** As an owner, I need to export all profiles for compliance, onboard efficiently, and audit all profile-linked events.

---

## Use Cases & Core Flows

### Primary Use Cases

1. Resident SSO onboarding, attribute editing, privacy/role toggling
2. Admin: batch role assignment/edit, profile merge/retire, allergy/skill certification, notification/bulk alerts
3. Owner: full audit/compliance trace of resident profile and related event logs, export/snapshot/archive for reporting

### User Flow Diagram

**Resident:**

```text
[Create/Login] → [Onboard/Edit Profile] → [Skills/Allergy] → [Privacy/Notify] → [Award/Linked Records] → [Audit/Event Export]
```

**Admin:**

```text
[Batch Add/Edit] → [Audit/Merge] → [Compliance/Export/Retire]
```

### Edge Cases

- SSO or MFA loss/recovery
- Profile or skill duplication on batch import
- Resident privacy opt-out or profile deletion
- Event/audit processing errors or missing logs
- Role retire, merge, or estate cross-link failures
- Incomplete onboarding or attribute reports
- Incident notifications not triggered due to profile gaps
- Admin override or export failure

---

## Functional Requirements

- Secure SSO/MFA onboarding for all residents/admins
- Profile creation, edit, merge, and retirement
- Skill, allergy, award, and notification/role management
- Privacy controls and user consent tracking
- Batch admin actions: add, review, merge, retire, and export profiles
- Comprehensive cross-module event log/audit trail
- Exportable compliance snapshots for owners/auditors

---

## Non-Functional Requirements

| Requirement                | Target                                 |
| -------------------------- | -------------------------------------- |
| Profile/location edits     | <2s response                           |
| Platform parity            | Desktop and mobile equal functionality |
| Security                   | Data encrypted at rest and in transit  |
| Audit/export success rate  | ≥99%                                   |
| Accessibility              | ARIA-compliant forms and modals        |
| Bulk export                | >10 records per minute                 |
| Event/action log retention | ≥5 years                               |

---

## Mesh Layer Mapping

| Layer        | Component/Responsibility                                   |
| ------------ | ---------------------------------------------------------- |
| Frontend     | SSO/login, resident profile UI, privacy/award UX           |
| Backend      | Profile/role DB, admin sync/merge tool, audit/export logic |
| Notification | Cross-module feed, inbox, alerting                         |
| Storage      | Skill/allergy documents, ID photos, award badges           |

---

## APIs & Integrations

### Required APIs

| Endpoint          | Method   | Purpose                           |
| ----------------- | -------- | --------------------------------- |
| /api/profile      | POST/GET | Create, get resident profiles     |
| /api/skill        | POST/GET | Add, retrieve skill data          |
| /api/allergy      | POST/GET | Record or fetch allergy info      |
| /api/award        | POST/GET | Log or view awards                |
| /api/notify       | POST/GET | Configure notifications           |
| /api/privacy/role | PATCH    | Privacy setting and role toggling |
| /api/audit/export | POST     | Export audit logs                 |
| /api/onboard      | POST     | Trigger onboarding flow           |
| /api/retire/merge | PATCH    | Merge/retire profile operations   |

### External Dependencies

- Baserow/user record storage and sync
- Corporate SSO/IdP (OAuth2/OpenID Connect)
- Notification microservice
- Secure Blob storage events (for asset attachments)
- HR/certification sync (for compliance modules)
- Insurance/compliance export gateways

---

## Data Models

| Model         | Attributes                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------ |
| Profile       | ID, name, email, estate, role, privacy, skills, allergy, notifications, awards, status/log |
| Award         | ProfileID, type, module, badge, date                                                       |
| Skill         | ProfileID, type, cert, expiry, verified                                                    |
| Allergy       | ProfileID, type, severity, expiry, documentation                                           |
| Audit/Consent | ProfileID, user, action, timestamp, policy/version                                         |

---

## User Experience & Entry Points

### Entry Points

- Profile home/dashboard
- Onboarding and edit flow (dynamic fields for new skills/allergies/awards)
- Batch admin dashboard (merge/retire functionality)
- Cross-event/audit activity feed
- Notification configuration center
- Bulk export for owner/HR review

### Onboarding Flow

- Admin imports or seeds residents via batch/CSV or SSO
- Resident receives onboarding invite (SSO/MFA link)
- Initial profile edit screen prompts for skill/allergy and notification preferences
- Award/role preview and demo of activity timeline/audit
- User walks through consent/privacy review
- Profile completion triggers audit log entry for compliance

### Primary UX Flows

- **Resident:** SSO login/create → Profile edit → Skill/allergy update → Privacy/notify config → Award/certification inspection → Linked audit/events view
- **Admin:** Batch add/merge → Audit activity → Role/export/retire execution → Compliance log/archive

---

## Accessibility Requirements

- WCAG 2.1 AA compliance
- ARIA labels for all forms, events, and dashboard interactions
- Alt text for user photos, certificates, awards, and attachments
- Keyboard navigation and batch editing fully functional on desktop and mobile

---

## Success Metrics

### Key Metrics

| Dimension         | Metric                             |
| ----------------- | ---------------------------------- |
| Usability         | Onboard/edit time per profile      |
| Data Completeness | Skills/allergy/award report rates  |
| Compliance        | Privacy compliance audit pass/fail |
| Efficiency        | Admin batch success rate           |
| Auditability      | Event/audit coverage breadth       |

### Leading Indicators

- SSO/import entries created
- Skill/allergy/award updates logged
- Notification events configured
- Awards logged per profile
- Admin batch updates and exports

### Lagging Indicators

- Profile or event revision/export lags
- Audit log gaps detected by compliance review
- Privacy/notification incidents or complaints

### Measurement Plan

- Onboard/edit activity timestamped in audit log
- Export, batch, and admin action logs accessible in reporting dashboard
- Owner/admin operates approval and compliance tracking displays
- Activity feeds for cross-module compliance and audit events

---

## Timeline & Milestones

| Phase | Scope                                          | Target Date | Dependencies          |
| ----- | ---------------------------------------------- | ----------- | --------------------- |
| 1     | Profile onboarding, creation, edit             | Month 1–2   | SSO, UI/UX            |
| 2     | Admin batch tools, profile merge/retire        | Month 3     | Backend, Baserow      |
| 3     | Cross-module event log, export, audit, SSO MFA | Month 4     | Notification, HR sync |

---

## Known Constraints & Dependencies

### Technical Constraints

- SSO outage or error handling
- Merge or role drift during batch admin
- Audit/event log latency or failure
- Mobile/desktop UI bugs
- Batch import/export reliability at scale

### Business Constraints

- Timeline linked to SSO/IdP onboarding
- Compliance/owner reporting deadlines
- Admin training/resource ramp-up
- Export/archive data retention requirements

### Key Dependencies

- SSO and IdP integrations
- Baserow/user record platform
- HR/certification feed
- Compliance/owner review team
- Notification worker microservice
- Audit data pipeline

---

## Risks & Mitigations

| Risk                      | Impact | Probability | Mitigation                            |
| ------------------------- | ------ | ----------- | ------------------------------------- |
| SSO Functionality Failure | High   | Med–High    | Manual onboarding fallback            |
| Audit/Event Log Latency   | Med    | Medium      | Admin override trigger, backup export |
| Profile Data Loss         | High   | Low         | File/archive backup, restore process  |
| Action Consent Error      | Med    | Low         | Owner/manual check, consent prompts   |
| Privacy Breach            | High   | Low         | Policy opt-in/opt-out, constant audit |

---

## Open Questions

| Question                                | Owner        | Target Date  | Impact if not resolved           |
| --------------------------------------- | ------------ | ------------ | -------------------------------- |
| Which SSO/IdP provider at MVP?          | Tech Lead    | End of Month | Impacts onboarding architecture  |
| Minimum required onboarding fields?     | Product Lead | 2 weeks      | Blocks UI/UX design finalization |
| Owner edit or force retire allowed?     | Compliance   | 2 weeks      | Legal/compliance review needed   |
| Should export to HR/insurance partners? | Project Lead | 1 month      | Could affect data model/export   |

---

## Appendix

### Profile/Award/Skill Notification Log Samples

- Examples of log formats and typical entries for resident actions

### Allergy/Certification Asset Management

- Reference architecture for encrypted document upload and retrieval flows

### SSO/Batch Import & Export Demos

- Pilot scripts/prototypes for batch onboarding and bulk exports

### Audit/Event Feed Mockups

- Sample dashboards and admin tools for event tracing

### Research & Data

- Resident interviews and onboarding logs
- HR/safety/certification documentation studies
- Privacy/offboarding case reviews
- Baserow batch/admin pilot feedback

### Design Mockups

- Onboarding and profile edit UI screens
- Batch admin edit and merge flows
- SSO/certification stepper wizard
- Notification, privacy settings, audit log, and award display modules
- Event/event feed reporting dashboard

### Technical Feasibility

- Baserow event log with profile/award/skill linkage confirmed
- SSO and cross-module admin actions demoed in test/Pilot
- Owner export and HR Sync POC performed successfully

### Competitive Analysis

Most legacy and competitor tools lack robust, unified tracking for awards, skills, allergies, privacy, notifications, and cross-module audit; silo user data and provide limited admin compliance features. MyResidence Profile stands out by multiplexing these in one compliant, audit-equipped, user-friendly hub, supporting seamless ownership/estate transitions and modern privacy requirements.

# Maintenance & Smart Issue Reporting PRD

**Module/Feature Name:** Maintenance & Smart Issue Reporting  
**Marketing Name:** Smart Issue Board  
**Readiness:** Draft – requirements finalized, ready for design and technical planning

---

## Platform/Mesh Layer(s)

| Layer | Technology |
|-------|------------|
| Frontend | Next.js/React |
| Backend | Baserow (issues/assets), Azure Functions (AI routing, notification processing) |
| Storage | Azure Blob (photos, documents) |
| Integration | Map/Spatial Overlay (estate pin or area selection) |

---

## Primary Personas

- **Residents**
- **Admin** (Maintenance Lead)
- **Onsite Staff**
- **Estate Owner**

---

## Core Value Proposition

Make reporting, tracking, and resolving any estate or asset issue fast, visible, and actionable—reducing admin overhead, improving response time, and surfacing maintenance risks proactively.

---

## Priority & License

- **Priority:** P0 – Critical operational backbone
- **License Tier:** Enterprise (with estate-level white-label support)

---

## TL;DR

Residents report issues anywhere—by map, room, asset, or freeform. Admins triage, assign, and track all reports from a central dashboard, with full status, analytics, photos, notifications, and feedback loops. All reports are always attributed; anonymous reporting is never supported.

---

## Business Outcome/Success Metrics

- Increased resident reporting
- Reduced issue-to-close time
- SLA compliance
- Repeat/recurring issues tracked
- Issue audit trails used in annual maintenance planning

---

## Integration Points

- Estate Map & Spatial Overlay (pin and area selection)
- Task/Chore Scheduler (automatic task creation)
- Notification API
- Baserow Issue & Asset tables
- Admin dashboard

---

## Problem Statement

Current estate issue reporting is ad hoc, often hidden or delayed, leading to missed repairs, increased operational costs, and significant resident frustration. The process lacks a centralized, live view and comprehensive audit/history, making it difficult for stakeholders to monitor and improve maintenance performance.

---

## Core Challenge

Enable frictionless, anywhere reporting without noise or duplication, surface issues spatially for precise action, keep all parties informed in real time, and tightly connect reporting to follow-up tasking and audits—all while enforcing user attribution to ensure accountability.

---

## Current State

Reporting is manual, based on emails or informal chats, making tracking inconsistent and slow. Most reports are lost or delayed, without systemic aggregation or analytics, and there is no audit trail to support preventive planning or risk mitigation.

---

## Why Now?

Rising user expectations for transparency, mounting maintenance complexity, and clear ROI evidence for platforms with frontline reporting and live monitoring make this upgrade urgent. Market trends show that estates extending real-time, resident-led issue flows see higher satisfaction and cost savings.

---

## Goals & Objectives

### Business Goals

- **Primary:** Reduce repeat and recurring issues, tighten issue-to-close intervals, and inform preventive maintenance through robust data.
- **Supporting:** Improve resident satisfaction, demonstrate insurance/risk compliance, and reduce overhead.
- **Revenue Impact:** Strengthen estate value proposition for owners by supporting premium white-label service tiers.

### User Goals

- **Primary:** Allow residents and staff to quickly, easily report any issue from anywhere, track status, and know who is accountable.
- **Additional:** Speed resolution, reduce uncertainty, enable photo-based contextual reports, and maintain feedback/audit loops.

### Non-Goals (Out of Scope)

- Anonymous reporting (always attributed)
- Escalation outside the estate
- Full vendor billing/export
- Insurance claims module (future phase consideration)

---

## Measurable Objectives

| Metric | Baseline | Target | Timeline |
|--------|----------|--------|----------|
| Percentage of issues triaged same day | 70% | 99% | 1 month post-launch |
| Percentage of issues assigned within 8h | 60% | 90% | 2 months |
| Attribution rate | 80% | 95%+ | Immediate |
| Admin overhead (vs. baseline) | 100% | <25% | 3 months |
| Percentage of issues with 1st response within 24h | ~60% | 100% | 1 month |

---

## Stakeholders

| Stakeholder | Role & Responsibilities |
|-------------|--------------------------|
| Residents | Report issues, receive updates, give feedback |
| Admin/Maintenance Lead | Triage, assign, supervise, close issues |
| Onsite Staff/Repairers | Execute tasks, update status, upload completion evidence |
| Estate Owner | Review analytics, audit logs, oversee compliance |

---

## User Personas & Stories

### Primary Personas

**Resident**

- Motivation: Wants quick fixes and visible follow-up for problems encountered anywhere on the estate.
- Pain Points: Slow/uncertain response, reporting friction, unclear resolution.
- Workflow: Snap and submit an issue with photo—track timeline and see handler assigned.

**Admin (Maintenance Lead)**

- Motivation: Needs total visibility, must prioritize and fulfill SLAs, cannot tolerate duplicates/spam.
- Pain Points: Scattered info, manual overhead, lack of systemic overview, risk of missed issues.
- Workflow: Live dashboard view, prioritize, assign, escalate/close, full audit capability.

**Staff/Repair Lead**

- Motivation: Prompt notification and clear assignment, minimal manual admin, evidence of task completed.
- Pain Points: Poor handover, lack of info, no proof requirement.
- Workflow: Get assigned tasks immediately, update progress/completion with notes/photos.

**Owner/Auditor**

- Motivation: Needs reliable analytics, compliance transparency, patterns of risk.
- Pain Points: No report history, no preventive insight, manual compliance reporting.
- Workflow: Review summary analytics and audit trails as needed.

### User Stories

1. As a resident, I can pin an issue anywhere in the estate (map/room/asset/freeform), add description/photos, and track real-time status.
2. As an admin, I have a live dashboard for all reports, can filter by status/location, and assign or escalate as needed.
3. As staff, I am notified instantly of assignments, can update status and upload completion photos directly.
4. As an owner, I can view audit logs and analytics to surface maintenance patterns and ensure compliance.

---

## Use Cases & Core Flows

### Primary Use Cases

1. **Anywhere Issue Reporting:** Resident reports through map, room, asset, or open form—includes photo, description, always attributed.
2. **Admin Dashboard Triage:** Admin views all new and active issues, filters by location/status, prioritizes and assigns with SLA tracking.
3. **Staff Task Feedback Loop:** Staff receive assignments, update work status, add notes/photos for completion, trigger notifications.
4. **Audit and Remind:** Owner/auditor or admin reviews comprehensive action trail for each issue, with automatic reminders for overdue actions.

### User Flow Diagram

```text
Resident: Pin/Select → Describe → Upload Photo → Submit
Admin:   See all issues (dashboard) → Prioritize → Assign staff → Close
Staff:   See assignments → Update status → Upload completion proof → Mark done
```

### Edge Cases

- Duplicate issues in the same room/zone (system suggests merge, flags suspected duplication)
- Submission missing required photo or detail (prompt user)
- Unresponsive staff (auto-reminder → escalate to admin)
- Issue spam/misuse (enforced attribution, audit logging, AI pattern detection)
- Asset or room not yet mapped (fallback to freeform reporting, later mapping)

---

## Functional Requirements

- Universal reporting from anywhere (supports map, room, asset, or freeform entry)
- Attribution required for all reports, actions and updates (no anonymous tickets)
- Easy photo/document upload (secure, blob storage)
- Central admin dashboard with live updates, status filters, and assignment panel
- Assignment flow with timestamps, SLA tracking, and notification triggers
- For major/cost-linked issues, auto-create linked tasks and surface in Task/Chore module
- Robust audit log of all issue actions/edits, visible by owner and admin

---

## Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Responsive | Mobile-first design |
| Performance | Reporting/viewing operations complete in <2 seconds |
| Scalability | Support 5–10 concurrent reporters/admins |
| Security | All images and log data secured at-rest and in transit |
| Real-time | Dashboard refresh without manual reload |

---

## Mesh Layer Mapping

| Layer | Components |
|------|------------|
| Frontend | Report UI (anywhere), Dashboard, Notifications overlay |
| Backend | Baserow (issues/assets/tasks), Assignment logic, Audit log, Notification processing |
| Storage | Azure Blob for all images/docs |
| Integration | Map overlays (pin, area, or room selection), Task/Chore scheduler module |

---

## APIs & Integrations

### Required APIs

| Endpoint | Purpose |
|----------|---------|
| POST /api/issue/report | Submit new issue (location/type/photo) |
| GET/POST /api/issues | List/filter issues (for dashboard/staff) |
| PATCH /api/issue/:id/status | Update status (progress, block, complete) |
| POST /api/issue/assign | Assign staff/admin to issue |
| Notification endpoints | Send push/email on status/assignment |
| Baserow CRUD | Sync issues, assets, action logs |

### External Dependencies

- Azure Blob (image/doc storage)
- Baserow (data store, workflow)
- Notification Service (push, email, SMS—e.g. Twilio or Azure Communication Services)
- Map Overlay (interactive estate map)
- AI Suggest (optional for duplicate/grouping/triage)

---

## Data Models

| Entity | Fields |
|--------|--------|
| Issue | ID, type, location/ref, description, photo(s), status, assigned, reporter (attributed), linked asset/room/map, timestamps |
| Action Log | Issue ID, user, action, timestamp |

---

## User Experience & Entry Points

- **Report button:** Prominent in map, room, asset details, and admin dashboard
- **Admin dashboard:** Live, default filter to "new" issues
- **Staff 'My Task' panel:** Personalized queue of open assignments
- **Audit trail/audit view:** For owners/auditors to access full log

---

## Onboarding Flow

- First-use guide for reporting via map/room/asset/freeform
- Sample/test mode for users to simulate a submission
- Real-time issue/demo in admin dashboard for onboarding/training new admins/staff

---

## Primary UX Flows

- **Resident:** Pin/select → describe → upload photo → submit; see status and timeline
- **Admin:** Dashboard (filter, status, assignment), manage SLAs, close/resolve or escalate
- **Staff:** Notification, assignment details, progress/completion update, upload supporting photo

---

## Accessibility Requirements

Fully accessible UI (WCAG 2.1 AA): alt tags, labeled map/data, keyboard/tab navigation, large tap targets, accessible photo upload prompts.

---

## Success Metrics

### Leading Indicators

- Number of new issues filed per week
- Percentage of issues triaged same day
- Percentage assigned within SLA (8 hours)

### Lagging Indicators

- Average resolution speed (open-to-close)
- Number of issues per asset/room
- Repeat incident ratio (recurring reports in same asset/zone)

### Measurement Plan

- Real-time reporting dashboard (admins)
- Weekly summary analytics (owner)
- Monthly audit trail exports for compliance/audit
- Ongoing SLA status display for all in-progress/completed issues

---

## Timeline & Milestones

| Phase | Scope | Target |
|-------|-------|--------|
| 1 | Core reporting, admin dashboard, photo status | +1 month |
| 2 | Map pinning, AI/duplication, feedback loop | +2–3 months |

**Dependencies:** Asset/room mapping, notification integration, Task/Chore connection, owner buy-in

---

## Known Constraints & Dependencies

### Technical Constraints

- Secure, reliable Azure Blob photo uploads
- Real-time dashboard updates must scale to concurrent editor/reporters
- Baserow action log must support high activity rates

### Business Constraints

- Keep notification costs within budget
- Map/asset onboarding requires upfront data and coordination

### Dependencies

- Asset/room mapping availability
- Notification service API stability
- Task/Chore module connection operational
- Stakeholder/owner approval and adoption

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|--------------|------------|
| Spam/fake issues | Admin overload, trust | Medium | Require attribution, log all actions, AI grouping |
| Staff lag on assignments | Delayed resolutions | Medium | Auto-reminders, admin escalation route |
| Partial/late asset mapping | Gaps in coverage | High | Fallback to freeform reporting, mark for mapping |
| Notification failures | Missed updates | Medium | Fallback email/SMS, escalate repetitive failures |

---

## Open Questions

| Question | Owner |
|----------|-------|
| Should certain issue types require a severity (priority) rating? | Owner/Admin |
| Will image AI be used to pre-fill type/context? | Research/technical feasibility |
| Do we record non-issue (preventive/regular) maintenance within the same flow? | Scope decision |

---

## Appendix

### Research & Data

- Review of past estate maintenance incident logs—quantified missed/follow-up rates
- Resident interviews highlighting friction and lack of status visibility
- PropTech case studies: increased reporting volume and 30–40% faster resolutions post–smart reporting

### Design Mockups

- Resident report flow (map select/photo/describe/submit)
- Admin dashboard (priority/status filters, assignment panel)
- Staff 'My Tasks' view
- Audit log timeline sample

### Technical Feasibility

- Proven: Baserow as issue/task data source, integrated with Blob for secure storage, Next.js/React for map-based entry
- AI triage/grouping is a future in-phase 2, feasible via Azure Functions with ML

### Competitive Analysis

Few property/estate platforms support map-native and photo-based reporting anywhere, with full admin dashboards and audit support. Market leaders lack true spatial overlay, instant assignment, and non-anonymous accountability—Smart Issue Board's always-attributed, map-driven design is a key differentiator for enterprise estates.

---

# Engineering Handoff (Advanced)

## 1. Issue Submission Flow (Resident → System)

### Flow Diagram

```text
[Resident]
    |
+-------+
| Pin   |----+
+-------+    |
             v
  [Room select?]-----------+
    |                      |
    | (if not mapped)      | (else)
    |                      v
    +------------->(Describe Problem)----+
                                         |
               +-------------------------+
               v
            [Upload Photo(s)] --(at least 1 required)
                    |
                    v
             [Submit Button]
                    |
                    v
         API: POST /api/issue/report
                    |
                    v
            [Baserow Issue Table]
                    |
                    v
              [Notify Admin]
                    |
                    v
             [UI: Confirmation Page/Status Board]
```

**Annotations:**

- "Asset not mapped" inserts a manual description.
- Duplicate detection triggered before submit using location + type.
- Client-side mandates photo upload before enabling submit.

### Event Flow Table

| Step | Frontend Action | API Endpoint | System Logic | User Feedback |
|------|-----------------|--------------|--------------|---------------|
| Select area/asset | Pin/asset UI | - | - | Show "Is this mapped?" |
| Describe issue | Freeform/structured | - | - | Typed input required |
| Photo upload | Minimum 1 enforced | - | - | Required for submit |
| Duplicate check | Pre-submit debounce | /api/issue/check-dup | If match, suggest merge/redirect | "Similar issue exists" popup |
| Submit | Button (photo req'd) | /api/issue/report | Store in Baserow, photo in Blob | Confirmation/status |

### Submission Edge Cases

| Scenario | System Response | UX/Engineering Notes |
|----------|-----------------|------------------------|
| Missing asset mapping | "Other asset" mode; additional field rendered, flagged in Baserow | Logs admin task to map asset |
| Duplicate detected | Warns, link to matching issue, option to merge/continue as separate | Related in Baserow (parent/child) |
| Bad photo upload | Retry + error, submission held, persistent failure triggers admin alert | Ensure Blob resilience |
| Submission timeout | Save as draft, retry on reconnect | Indexed in browser local storage |

---

## 2. Triage & Assignment Flow (Admin Dashboard)

### Flow Diagram

```text
[Admin Dashboard]
    |
    v
+-------------------------+
|Open Issues Table        |<-----------+
+-------------------------+            |
    |                                  |
    v                                  |
[Filter & Sort: location/age/asset]    |
    |                                  |
    +----[Detect Duplicates]-----------+
    |         |
    |         v
    |      [UI: Suggest Merge/Group]  <---+
    v                                     |
[Select/Assign Staff]                      |
    |                                     |
    v                                     |
[Bulk Action: Close/Merge/Reassign]        |
    |                                     |
    v                                     |
[API: Assign, Bulk-close, Merge]           |
    |                                     |
    v                                     |
[Log Action + Trigger Notifications] ------+
```

**Annotations:**

- Duplicates grouped, bannered, and bulk actions surfaced.
- SLA timers for assignment/closure displayed per issue.
- Assignment/refusal/escalation actions fully logged.

### Assignment Event Table

| Action | API Endpoint | System Update | Notification(s) | Log Entry |
|--------|--------------|---------------|-----------------|-----------|
| Assign | POST /api/issue/assign | Updates assignedTo, SLA timer starts | Push/email to staff | Yes |
| Bulk close | POST /api/issue/bulk-close | Mark many as closed | Batched notification | Yes |
| Merge dupes | POST /api/issue/merge | Parents/children grouped, all linked | - | Yes |
| Escalation | PATCH /api/issue/escalate | Status escalated, owner alerted | Admin/owner notified | Yes |

### Triage Edge Cases

| Edge Condition | System Behavior |
|----------------|-----------------|
| Asset not mapped | Groups "Other asset", sends admin to mapping queue |
| Staff refuses | Immediate admin alert, requires reassign/override |
| Duplicate after assign | Prompts admin to merge or leave separate |
| Overdue issue (>SLAs) | Auto-flag, escalation email/push |
| Bulk action canceled | No state change, instance logged |

---

## 3. Notification Event Sequence

### Notification Flow

```text
[Issue Submitted] --(via API)--> [Admin Alert]
      |
      v
[Admin Assigns] --> [Staff Notified] --(SLA Timer Begins)-->
      |
      v
+--------------------------+
| Staff Mark Progress      |
|  or Mark as Complete     |
+--------------------------+
             |
             v
 [Status Change: UI, Audit, API]
             |
             v
 [Reporter notified (Push/email)]
             |
     +-------+-------+
     |               |
[No staff action]   [Completion]
     |                   |
[Auto-reminders to staff]|
     |                   |
[>2 reminders: escalate] |
     |                   |
[Owner/Admin alerted]    |
     |                   |
[Audit log entry]        |
     |                   |
[Status closed; feedback prompt]
```

### Notification & Escalation Event Table

| Trigger | Target | Notification Mode | Conditions for Escalation |
|---------|--------|-------------------|---------------------------|
| New issue | Admin | Push/email | None |
| Assignment | Staff | Push/SMS/email | Unopened in 1h → resend |
| SLA breach (assign/response) | Staff, Admin | Push/email | 2 consecutive → escalate |
| Issue closed (by staff/admin) | Reporter | Push/email | - |
| Feedback prompt overdue | Reporter | Reminder push/email | - |
| Bulk close | All affected Reporters | Batched email | - |
| Audit/Owner review | Admin, Owner | - | Manual audit/analysis |

---

## 4. Data Model Relationships (Expanded)

### Entity-Relationship Model

```text
+---------+      1  n      +-----------+
| Issue   |<-------------->| ActionLog |
+---------+                +-----------+
| ID      |-------+        | IssueID   |
| Type    |       |        | UserID    |
| Location|       |        | Action    |
| AssetID |---+   |        | Timestamp |
| Status  |   |   |        +-----------+
| Photos  |   |   |
| Reporter|   |   v
+---------+   | +-----------+
              +>|  Asset    |
                +-----------+
                | AssetID   |
                | Desc      |
                +-----------+
```

**Mappings:**

- Freeform asset: AssetID is null; description required.
- Each Issue has a many-to-one to Asset, optionally.
- ActionLog is many-to-one to Issue.
- Photos stored as secure Blob URIs, referenced as array.

### Data Model Edge Cases

| Edge/Scenario | Data Model Handling |
|---------------|---------------------|
| Asset unmapped | AssetID null, assetDesc string populated |
| Duplicate issues | childIssues[] links, parentIssueID for master |
| Bulk close | ActionLog: ENTRY per closed issue |
| Feedback attached | Issue.feedbackResponse (object, timestamped) |
| Photo upload fail | issue.photos[i].status=FAILED; trigger retry UI |

---

## 5. Full API Reference

| Endpoint | Method | Input | Downstream Action | Notification | Audit Log |
|----------|--------|-------|-------------------|--------------|-----------|
| /api/issue/report | POST | json:issue, photo | Create Baserow row, Blob photo | Notify Admin | Yes |
| /api/issue/check-dup | POST | json:location/type | Query open issues, suggest merge; see algorithm below | - | No |
| /api/issue/:id/status | PATCH | status | Update status, fire webhooks | Notify Reporter | Yes |
| /api/issue/assign | POST | id, staff_id | Update assignment, SLA start | Notify Staff | Yes |
| /api/issue/bulk-close | POST | [ids] | Close multiple, trigger summary | Notify Batch | Yes |
| /api/issue/feedback | POST | id, rating, notes | Save feedback, update analytics | - | Yes |
| /api/assets/unmapped | GET | - | Return unmapped for admin queue | - | No |
| /api/issue/merge | POST | parent, children | Link/group issues, update log | - | Yes |
| /api/issue/escalate | PATCH | id, reason | Update state, notify owner/admin | Notify Owner | Yes |

### /api/issue/check-dup Algorithm

Duplicates are detected by: (a) spatial proximity within 10 meters, (b) same issue type or same asset ID, and (c) a computed `similarityScore` with threshold 0.8 (80%). Response fields:

| Field | Type | Description |
|-------|------|-------------|
| similarityScore | number | 0–1; weighted combination of spatial, type, and asset match |
| spatialDistanceMeters | number | Distance to nearest candidate issue |
| typeMatch | boolean | True if issue type matches |
| assetMatch | boolean | True if asset ID matches |
| isDuplicate | boolean | True when `similarityScore >= 0.8` AND (`spatialDistanceMeters <= 10` OR `assetMatch == true`) |

---

## 6. Advanced User Stories & Acceptance Criteria

### Resident (US-R1)

**As a resident**, I submit maintenance issues by map, asset, or freeform. I must attach at least one photo. If a duplicate (same type/location), I'm asked to merge.

**Acceptance:**

- Submit disabled until 1+ photos uploaded.
- Duplicate detection (within 10m, same type/asset per check-dup algorithm) prompts confirmation dialog.
- After submission, status auto-loads in my dashboard.
- Asset not mapped shows "Describe asset" input; submission logs asset as unmapped.
- Broken upload triggers minimal-loss retry; after 3 fails, saves text-only, alerts admin.

### Admin (US-A1)

**See all open, active, grouped, and suspected duplicate issues.** Merge, bulk-close, reassign with full action attribution.

**Acceptance:**

- Issues flagged when >80% match (duplicate algorithm).
- SLA countdown and overdue status on all cards.
- Bulk action applies to all selected, logs per-issue entry.
- Audit view sortable/filterable; export as CSV via dashboard.
- Merge flows retain original reporters (notifications route to all).

### Staff (US-S1)

**Get instant notifications, see only assigned issues, upload finish photo, and "not my expertise" rejection with reason.**

**Acceptance:**

- Assignment push within 2s (device log/API trace).
- Cannot mark "complete" without proof photo (API enforced).
- "Reject" disables action until admin reassigns.
- "In progress" status logs start time; inaction >4h triggers auto-reminder.

### Owner/Auditor (US-O1)

**Download grouped stats, export audits, flag patterns of recurring/overdue/duplicate issues for preventive plans.**

**Acceptance:**

- Dashboard has filter for recurrence/overdues (>=3 in 30d).
- Export of all audit events, filterable by user, action, asset.
- Owner manual audit can "flag for root cause" (admin prompted to add plan).

### Corner Case Clarifications

| Situation/Case | System Behavior |
|----------------|-----------------|
| Bulk submission (network loss) | Save locally, retry post-reconnect, notify user of recover/save status |
| Asset unmapped (recurring) | After 3x "Other asset" at same location, triggers auto-admin mapping alert |
| Escalation loop (no action) | After 2 escalations, issue triggers "urgent" state, pings owner/admin SMS |
| Non-photo completion attempt | API blocks, frontend prompts for required photo; audit logs refusal |
| Feedback not given post-close | Single auto-reminder at 24h, flags in analytics dashboard as "missing" |
| Blob persistently fails | Notify admin for manual remediation. All other fields retained; "photo-missing" flag |
| Merge-related issues | Children issues get "resolved via merge" status + link to feeder |

---

## 7. Technical Architecture

```text
[Resident/WebApp/Frontend]
        |
        v
[Next.js/React] <------> [Map & Asset Overlay]
        |            (location/asset select, filter)
        v
[API Gateway]
        |
        v
[Azure Function Layer]
    |          |        |
    v          v        v
[Baserow]  [Azure Blob] [Notification Service]
    |          |        |
    v          v        v
[Audit Log / Analytics / Exports]
        |
[Owner/Admin Dashboards]
```

**Key Points:**

- All events (actions, assignments, merges, escalations) emit audit log entries.
- Real-time events use WebSockets (assignment/status), HTTP(S) for atomic CRUD, and Azure Function event hooks (photo, AI trigger, duplicate checking).
- Notification system is modular; allows custom delivery backends (Twilio, email, push).

**Architectural note (WebSockets vs stateless Azure Functions):** The platform uses stateless Azure Functions for backend logic, while real-time assignment/status events require persistent WebSocket connections. Implementers must choose one of: (a) **Azure Web PubSub** as a managed WebSocket relay for push events, or (b) **Durable Functions** with `waitForExternalEvent` to bridge stateful signaling. See platform layer table and future ADR for chosen approach.

**Security:**

- Blob URIs time-limited; images/docs never exposed directly.
- Audit & analytics endpoints admin/owner-gated (JWT scoped).
- All API endpoints rate-limited, action-logged.

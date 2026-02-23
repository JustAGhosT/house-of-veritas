# Equipment, Tool & Loan Library PRD

**Module/Feature Name:** Equipment, Tool & Loan Library  
**Marketing Name:** VeritasVault Shared Gear Library  
**Readiness:** Draft – core flows, APIs, functional diagrams, and gamification modeled; ready for detailed design and engineering breakdown

---

## Platform/Mesh Layer(s)

| Layer | Technology |
|-------|------------|
| Frontend | Next.js/React (asset search/list; mobile scan/image intake; feedback/leaderboards) |
| Backend | Baserow (asset/loan/feedback DB), Azure Functions (overdue logic; analytics; notification API) |
| Storage | Azure Blob (asset photos, scan history, audit logs) |

---

## Primary Personas

- **Residents**
- **Workshop/Admin**
- **Maintenance Staff**
- **Guests** (view-only)

---

## Core Value Proposition

Track, share, and empower rapid self-service for all estate assets—drive utilization, fairness, and accountability with transparent booking, check-out/check-in, reminders, usage history, and recognition.

---

## Priority & License

- **Priority:** P0 – Core to asset value, dispute reduction, and resident engagement; sets estate experience apart.
- **License Tier:** Enterprise, with roadmap for multi-tenant white-label application.

---

## TL;DR

Enable residents to check out, reserve, and return shared tools effortlessly using phone or browser; view live status, audit history, and contribute to feedback/recognition. Overdue, maintenance, and gamified achievements are automatic, which reduces disputes and maximizes usage across the estate.

---

## Business Outcome/Success Metrics

- 80%+ of assets checked in/out monthly
- <5% asset loss/overdue items per month
- 25% reduction in admin workload (hours)
- Downtime per asset reduced 40%
- Resident satisfaction >95%
- Actionable audit logs for 100% of tracked items

---

## Integration Points

- Asset Inventory (Baserow)
- Resident Directory
- Notification API (Azure)
- Chore/Task Scheduler (future/optional)
- Gamification engine
- Analytics dashboard

---

## Problem Statement

Frequent equipment loss, hoarding, and poor traceability increase costs and resident frustration. Paper sheets and legacy logs fail to ensure transparency, track actual usage, or deliver timely reminders and feedback.

---

## Core Challenge

Remove friction from checking out and returning equipment and tools for all users, while ensuring live status tracking, reminders, and accountability, with minimum admin overhead and robust transparency.

---

## Current State

Manual sign-out sheets, ad hoc records, significant confusion about available tools, and no robust method to track who has an asset, for how long, or what condition it's in after use.

---

## Why Now?

Shared assets are essential in dense residential/communal settings. Mobile-first, scan-enabled flows are now expected, and digital traceability is both feasible and demanded by residents.

---

## Goals & Objectives

- Track & monitor 70%+ of all estate tools/assets
- At least 80% check-out/check-in compliance
- <2 days average overdue item time
- ≥95% satisfaction among active users
- Complete audit trails for assets

### Business Goals

| Objective | Target Metric | Expected Revenue Impact |
|-----------|---------------|-------------------------|
| Reduce loss/damage | <5% monthly asset loss | Asset write-offs drop; reduced replacement spend |
| Maximize shared asset usage | 80%+ checked in/out per month | ROI on communal inventory investments |
| Promote responsibility & community engagement | 90%+ self-service actions | Higher resident retention |
| Accelerate dispute resolution | 100% traceable audits | Fewer escalations and claims |
| Prove operational ROI | Admin hours reduced by 25% | Lowered staff costs, showcase to potential tenants |

### User Goals

- Search/find/check out equipment in under 30 seconds
- See real-time asset availability (status, feedback, ETA)
- Receive reminders for returns and gain recognition for positive actions
- Track personal asset usage; view badges/awards earned

### Non-Goals (Out of Scope)

- No direct integration with paid rental/vendors at launch
- No payment/fine/chargeback flows in MVP
- RFID/geotracking not required for MVP
- No punitive enforcement for late returns at MVP

---

## Measurable Objectives

| Objective | Baseline | Target | Timeline |
|-----------|----------|--------|----------|
| Monthly check-in/out compliance | 45% | ≥80% | 6 months |
| Overdue/loss rate | ~12% | <5% | 4 months |
| Resident self-service | 50% | ≥90% | 3 months |
| Full audit logging | Partial | 100% assets | At launch |

---

## Stakeholders

| Stakeholder | Role/Responsibility |
|-------------|---------------------|
| Residents | Book, check-out/in, review, receive gamification/alerts |
| Workshop/Admin | Asset mapping, maintenance, repair, escalation, approval flows |
| Maintenance Staff | Repair, mark ready/out of order, action logs |
| Owner/Analytics | Monitor usage, run audits, approve item flows |
| Gamification Lead | Curate recognition schemes, manage contests/leaderboards |

---

## User Personas & Stories

### Primary Personas

**Power User**

- Motivated by speed, recognition, and tool mastery. Resents manual admin, expects digital fluidity.

**Occasional/First-time User**

- Needs assurance ("can I trust this?"), prioritizes clarity and reminders.

**Tool/Admin**

- Focused on minimizing loss, supporting maintenance, and quick intervention only as needed.

**Owner/Analytics**

- Wants robust audit trails, high utilization, concrete proof of ROI.

### User Stories

1. As a resident, I need to check out and return tools using a QR scan in <30 seconds, and get notified if I forget.
2. As admin, I need to batch update status, review logs, and intervene only in exception cases.
3. As a resident, I want to see feedback before borrowing and earn visible points for safe, timely returns.

---

## Use Cases & Core Flows

### Primary Use Cases

1. Reserve Item
2. Checkout/Return (with scan/photo/ID)
3. Overdue Escalation & Nudge
4. Usage Feedback & Gamification
5. Item Search/Locate
6. Repair/Maintenance Request

### Functional Flows

#### 1. Reserve Tool/Equipment

1. Search/scan for tool in app.
2. See live status: 'Available' (tap reserve or check out) or 'Unavailable' (join waitlist, view ETA).
3. Reservation confirmed, item locked for N minutes/hours.
4. Resident notified (push/SMS/email).
5. (Optional) Admin can override/cancel reservation.

#### 2. Check-Out & Return Flow

Reserve (optional) → Scan/Check out → Use → Return/Scan → Feedback

1. Select or scan asset's tag/QR code (camera or barcode).
2. System checks 'Available' status.
3. Resident confirms checkout; system logs user, timestamp, photo (optional).
4. Usage timer starts; asset marked 'Checked Out'.
5. On return, user scans asset (matching tag/barcode) → select 'Check In.'
6. System confirms match; ends timer, updates status, logs feedback request.
7. If next reservation in queue, assigned+notified.

#### 3. Overdue, Notification & Escalation

- On overdue (predefined threshold): system sends auto-nudge (push/SMS/email).
- Escalates to admin after 2x reminder intervals.
- Admin console provides quick-view of overdue, triggers batch/manual notifications or locks.

#### 4. Usage Feedback & Gamified Recognition

- After return, user prompted for quick feedback (rating, comment).
- Points awarded for positive/safe/early returns; lost for repeat overdue or skip feedback.
- Leaderboards visible (by opt-in or role).
- Periodic awards for streaks, top contributors.

#### 5. Asset Maintenance & Repair

- Any user can flag an issue at check-in (photo/note), auto-routes to admin/maintenance.
- Asset can be locked/blocked by admin during repair.

### User Flow Diagram

```text
[Search Tool/Item]→[Reserve?]→[Check-Out/Scan]→[In Use/Timer]→[Reminder]→[Return/Scan]→[Feedback+Points+History]
       ↑                                                                   ↓
   [Unavailable - Join Waitlist/See ETA]                                 [Overdue→Nudge/Alert/Admin Escalation]
```

**Item Status:** [Available]→[Reserved?]→[Checked Out]→[Overdue/Returned]→[Under Maintenance]

### Edge Cases

- **Attempted double-checkout:** System rejects second; surfaces ETA/waitlist option.
- **Missing/lost tag or QR:** User flagged; fallback manual entry plus admin approval.
- **Asset not returned (resident leaves, abandons):** Auto-escalation; admin lock, owner review.
- **Item is damaged:** During check-in, user prompted for issue note+photo; triggers repair block, disables further check-out.
- **Reservation dropped (no show):** Asset set 'Available' after grace period.
- **Item not yet mapped:** Residents can propose/add with self-onboard flow, admin to approve.

---

## Functional Requirements

| Requirement | Phase | Priority | Notes |
|-------------|-------|----------|-------|
| Asset registry: ID, photo, tag, location | 1 | P0 | Baserow as source of truth |
| Reservation, waitlist, real-time status | 1/2 | P0 | Includes live ETA, batch actions |
| Check-out/in with scan/photo | 1 | P0 | Mobile-first flow, fallback to ID |
| Usage timer, overdue detection | 1/2 | P0 | Azure logic for reminders |
| Notifications: push/email/SMS | 1/2 | P1 | Adjustable per user preference |
| Usage feedback; star/comment/post-return | 2 | P1 | Inline with return flow |
| Gamification: points, streaks, leaderboards | 2 | P1 | Opt-in for visibility |
| Admin console: audit log, repair/lock/reset | 2 | P1 | Drill-down by asset/user status |
| Self-onboarding for new/missing assets | 3 | P2 | Admin approval required |

---

## Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Dashboard refresh | Auto-refresh ≤30s |
| Scan-to-action latency | ≤5s |
| Mobile | Responsive; offline scan/caching |
| Concurrency | Support concurrent edits (multi-user) |
| Scan reliability | ≥99% photo/tag scan in field conditions |
| Audit retention | 3-year audit/event retention |
| Accessibility | Full ARIA/WCAG 2.1 AA on all screens |

---

## Mesh Layer Mapping

| Layer | Components | Responsibilities |
|-------|-------------|------------------|
| Frontend | React/Next.js, mobile scan, feedback UI | User flows, status views, scan/image, audit display |
| Backend | Baserow, Azure Functions | Asset/loan DB, workflow logic, timing, analytics |
| Storage | Blob/Image store, gamification cache | Asset photos, feedback, action history, recognition |

---

## APIs & Integrations

### Required APIs

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /api/asset | GET | List/search assets |
| /api/asset | POST | Add new asset (admin/self-onboard) |
| /api/asset/{id} | PATCH | Update asset status, repair flag, lock/unlock |
| /api/loan | POST | Create new loan/check-out/in/reserve |
| /api/loan | GET | Query loan status/history |
| /api/feedback | POST | Add rating/comment on return |
| /api/feedback | GET | Aggregate per asset/user |
| /api/notify | POST | Send notification (reminder, overdue, escalation) |
| /api/points/leaderboard | GET | Pull gamified rankings |

### Data Flow Diagram

```text
[Frontend] → (REST) → [Backend: Baserow/Azure] → [Blob Storage]
         → /api/asset/:id
         → /api/loan
         → /api/notify
         → /api/feedback
```

### External Dependencies

- Baserow: Asset/loan/feedback DB
- Blob Storage: Image uploads, audit/action logs
- QR/Barcode SDK: Mobile scan support
- Notification Service: Outbound SMS/push/email
- Optionally: Asset tracking/maintenance module for repair workflow

---

## Data Models

| Model | Key Fields | Relationships |
|-------|------------|---------------|
| Asset | ID, Name, Location, Photo/Tag, Status, Type, Usage Count, Condition, Owner, Created/Updated | 1-to-many: Loans; 1-to-many: Feedback; 1-to-many: Audit |
| Loan | AssetID, UserID, CheckoutTime, Due/ETA, ReturnTime, Overdue, Status, FeedbackID, Points | Linked to Asset, User, Feedback |
| Waitlist | AssetID, UserIDs, JoinedTime, Assigned ETA | Many Users per Asset |
| Feedback | LoanID, UserID, Stars, Notes, Points | Linked to Loan and User |
| Audit | AssetID, Action, By, Timestamp | 1-to-1: Asset/Action |

### Visual Model

```text
Asset (1) —— (M) Loan (1) —— (1) Feedback
     |                  |
     |                  +—— Waitlist (per Asset)
     +—— (M) Audit
```

---

## User Experience & Entry Points

- Asset list/search (dashboard/home)
- Scan pop-up (QR/barcode/camera)
- Status alerts (overdue, ready, maintenance)
- Feedback/leaderboard entry
- Admin asset/loan dashboard (full audit, repair, intervention)

---

## Onboarding Flow

**Admin:** Asset import (CSV/manual), tag printing, approval console; onboarding guide for staff

**Resident:** Guided scan/search tutorial, feedback/recognition demo, prompt for first check-out

---

## Primary UX Flows

- Search/scan → live check-out or reserve
- Reminders and overdue alerts auto-triggered
- Quick check-in, feedback, badge/leaderboard (if enabled)
- Admin: repair/lock flows, lost asset flagging, escalated audit trail

---

## Accessibility Requirements

- Screen-reader support (ARIA labels)
- Colorblind-accessible status coloration
- 48px tap targets on touch devices
- Keyboard-shortcut for scan/entry
- Alt text on all images, readable QR/tag UI

---

## Success Metrics

### Key Metrics

| Metric | Target |
|--------|--------|
| Loss/overdue rate | <5% monthly |
| Avg. check-in/out speed | <30s user flow |
| Feedback positivity | ≥90% good+ |
| Admin intervention rate | <10% actions |

### Leading Indicators

- Count/rate of new assets added & tagged (per week)
- Reservation-to-checkout conversion % (weekly)
- Overdue rate by asset/user (early alerts)

### Lagging Indicators

- Year-on-year reduction in lost/damaged tools
- Top user streaks and engagement points
- Sustained high feedback positivity rates

### Measurement Plan

- Dashboard analytics (daily/weekly)
- Heatmaps of tool usage/feedback (monthly)
- Auto-generated overdue/audit reports (weekly)
- CSV exports for owner/board review

---

## Timeline & Milestones

| Phase | Scope | Date Range |
|-------|-------|------------|
| Phase 1 | Asset tagging/import, check-in/out core flows | Month 1–2 |
| Phase 2 | Waitlist, overdue/feedback logic, gamification, admin tools | Month 3–5 |
| Phase 3 | Advanced analytics, chore/task module cross-link, self-onboard | Month 6–8 |

---

## Known Constraints & Dependencies

### Technical Constraints

- ~5s scan-to-action latency guarantee
- Concurrent scan/edit collision prevention
- Blob storage <5MB avg. per image (quota monitored)
- Minimum 3-year retention for all audit/feedback data

### Business Constraints

- Tag/QR hardware/printing budget capped per asset
- Recognition/incentive prize pool limitation
- Admin mapping labor—requires initial ramp incentive

### Dependencies

- Baserow API for asset/user linkage
- Notification (Azure/3rd-party) infra
- QR/scan SDK licensing
- Early resident/admin onboarding and feedback
- Gamification engine design/finalization

### Constraints

- Tag/photo loss—manual fallback needed
- Scan reliability—must test various phone cameras
- Notification service transaction costs (SMS/push volume)
- Asset mapping ramp-up/backlog—bootstrapping required
- Scaling audit logs—archival strategies in place

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|---------------------|
| Asset loss (non-returned/mis-tagged) | Medium-High | Medium | Require scan/photo check-in; admin lock flow |
| System "gaming" for points | Medium | Low | Rate limit actions, audit flagged usage |
| Unresponsive admins (repair/flags) | Medium | Medium | Escalate via auto-notification/overdue |
| Asset backlog (mapping slow) | High | High | Self-onboarding, incentive for early tagging |
| Notification failure (lost reminders) | Medium | Low | Secondary/reminder failsafe by email |

---

## Open Questions

| Question | Owner | Target Date | Impact if Unresolved |
|----------|-------|-------------|---------------------|
| Should guests be allowed to check out items? | Product Lead | 2 weeks | Could restrict or expand usage |
| Points visibility: all, or opt-in? | Gamification Lead | 1 month | Affects engagement, privacy |
| Resident self-onboard: add assets w/ admin approval? | Admin Lead | 1 month | Key to scaling asset import/mapping |

---

## Appendix

### Design Mockups

- Asset/tag import interface mockup (Figma #442)
- Check-out/check-in scan demo clip (Notion/Google Drive link)
- Gamification/leaderboard wireframe (Figma #445)
- Feedback/rating popup (mobile, desktop)
- Sampling of scan reliability by tag/photo (% accurate by device)

### Research & Data

- Analysis 2025–2026: Loss, usage, feedback logs by asset category
- Summary: PropTech library UX study (N=42, 2026)
- User interview/vignette data (residents, admins)

### Technical Feasibility

- CRUD/scan API tested in Azure+Baserow
- Blob photos/upload events real-time + 48h retention
- Gamification modularized; points per event, streaks, opt-in leaderboards
- Waitlist, repair, recognition flows trialed in internal pilot app
- Analytics scaling plan for 10,000+ assets coded

### Competitive Analysis

- **Legacy (Excel, sheets):** No live tracking, no feedback, prone to error/misuse
- **Dedicated SaaS (Tool library, lending apps):** Often lack estate context, no scan/audit, weak gamification, no self-onboarding
- **VeritasVault advantage:** Scan-first, mobile, with per-user audit, actionable gamification, and rapid asset mapping; uniquely suited for community living/residential and modern SME/estate models where self-service and transparency are crucial.

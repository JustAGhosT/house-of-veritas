# Smart Cleaning & Chore Scheduler PRD

**Module/Feature Name:** Smart Cleaning & Chore Scheduler (with One-Off/Special Project Support)  
**Marketing Name:** VeritasVault Harmony Scheduler  
**Readiness:** Draft – core recurring and one-off flows, gamification, APIs, edge case coverage designed

---

## Platform/Mesh Layer(s)

| Layer    | Technology                                                                                |
| -------- | ----------------------------------------------------------------------------------------- |
| Frontend | Next.js/React (mobile & desktop web)                                                      |
| Backend  | Baserow (chore/task data), Azure Functions (rotation logic, swap, notification/analytics) |
| Storage  | Event/action logs, photo evidence, streak tracking                                        |

---

## Primary Personas

- **Residents**
- **Cleaning/Chore Admin**
- **Guests** (info-only access)
- **Maintenance/Support Staff**

---

## Core Value Proposition

A fair, transparent, and fully accountable system for distributing cleaning, maintenance, and special project tasks—eliminating drama, improving equity, and gamifying communal upkeep.

---

## Priority & License

- **Priority:** P0 – Immediate impact on engagement, conflict reduction, and owner trust.
- **License Tier:** Enterprise (with white-label/co-living brand options)

---

## TL;DR

Chores and special projects are distributed via a transparent, rotating board. Residents can swap, volunteer, or be assigned; all actions are tracked and recognized, with extra credit for one-off "hero" projects. Real-time reminders, proof uploads, and gamified streaks ensure every contribution is visible and fair.

---

## Business Outcome/Success Metrics

- Decreased missed/overdue tasks
- Improved perceived fairness
- Higher completion rates
- Reduced admin intervention
- Higher feedback/engagement
- Increased streaks/points earned
- Owner and resident satisfaction

---

## Integration Points

- Resident Directory
- Notification/Reminder system
- Gamification engine
- Asset/Inventory (tools used)
- Incident/Feedback tracking
- Analytics/Calendar sync

---

## Problem Statement

Manually-managed chore schedules result in resentment, missed responsibilities, and unsatisfactory communal spaces. There's no logging or recognition, no robust swap/trade options, and little incentive to take on ad hoc or "hero" projects—leading to admin overload and disputes.

---

## Core Challenge

Automating fair assignment while allowing flexible swap/volunteer options, with real-time feedback and escalation for both routine and unplanned special tasks. Every action must be accessible, audited, and gamified to ensure accountability and engagement.

---

## Current State

Currently, schedules are shared via printouts or email, with inconsistent rule enforcement and no tracking for opt-ins or challenges. Admins bear the burden of fairness and dispute resolution, and engagement is low for non-mandatory chores.

---

## Why Now?

Demand for equitable division of labor, transparency, and individual recognition is increasing in communal living. Digital automation can reduce friction, admin workload, and 'chore fatigue'—now achievable due to modern notification/gamification platforms.

---

## Goals & Objectives

### Business Goals

- Make estate/co-living arrangements more attractive and marketable.
- Reduce administrative workload for task allocation by 70%.
- Decrease cleaning and maintenance costs via improved participation.
- Support incident/insurance audit readiness with clear logs.

### User Goals

- **Residents:** Simple, mobile-friendly interface to access, swap, or volunteer for tasks, receive timely reminders, earn clear recognition/rewards, and avoid unfair treatment.
- **Admins:** Efficient task monitoring, minimal intervention except for edge cases, escalation ability, and analytics visibility.
- **Project Volunteers:** Easy access to one-off opportunities, visible recognition/group credit, and seamless proof/feedback submission.

### Non-Goals (Out of Scope)

- Mandatory public "blame" logs
- Monetary penalties for missed tasks at MVP
- Third-party/contractor assignment flows

---

## Measurable Objectives

| Metric                         | Baseline | Target        | Timeline  |
| ------------------------------ | -------- | ------------- | --------- |
| Tracked task completion        | 55%      | >95%          | 3 months  |
| On-time completion             | 68%      | >85%          | 3 months  |
| Admin allocation/rotation time | High     | -70%          | 2 months  |
| Residents w/ streaks/points    | 18%      | >70%          | 2 months  |
| Resident satisfaction          | —        | Baseline +10% | Quarterly |

---

## Stakeholders

| Stakeholder               | Role                                        |
| ------------------------- | ------------------------------------------- |
| Residents                 | Assignment recipients, volunteers, swappers |
| Admin                     | Schedule oversight, approval/escalation     |
| Maintenance/Support Staff | Update & report on incidents/tasks          |
| Owners/Analysts           | Review, reporting, audit                    |
| Gamification Lead         | Points/recognition system management        |

---

## User Personas & Stories

### Primary Personas

**Engaged Resident**

- Seeks points, streaks, flexible swaps, enjoys recognition

**Passive/Busy Resident**

- Wants minimal hassle, just reminders

**Chore Admin**

- Prioritizes fairness, only intervenes on disputes or missed tasks

**Project Hero (Volunteer)**

- Motivated to earn group credit for special projects

### User Stories

1. As a resident, I receive a clear list of my upcoming chores and volunteer opportunities, with due dates and easy options to nudge/trade or volunteer.
2. As an admin, I want a dashboard overview, ability to approve swaps, handle missed tasks/escalations, and highlight hero projects.
3. As a project volunteer, I can self-assign or join a special project, submit proof easily, and visibly earn group credit.

---

## Use Cases & Core Flows

### Primary Use Cases

1. Chore assignment, auto-rotation, and swap/trade flows
2. Special project/one-off creation & volunteer flows
3. Task completion, proof upload, and feedback loop
4. Admin escalation/dispute resolution
5. Leaderboard, streak, and group reward tracking

### User Flow Diagram

**Resident Flow:**

```text
[Chore Board] → [Assignment] → [Notify] → [Resident Accept] → [Swap/Volunteer] → [Complete/Upload Proof] → [Feedback] → [Points/Badges]
```

**Admin Flow:**

```text
[Dashboard] → [Monitor/Approve Swaps] → [Escalate/Miss] → [View Analytics/Points]
```

**Special Project Flow:**

```text
[Post] → [Volunteer/Assign] → [Track as 'Hero'] → [Group Credit] → [Extra Points]
```

### Edge Cases

- Overdue or abandoned tasks
- Conflicted swaps
- Volunteer drop-out or non-performance
- Task disputes (photo/proof or effort)
- No participants for hero project
- Repeated missed chores/same resident
- Resident new/absent (swap/trade unavailability)
- Feedback/proof disputes, admin override, special approvals

---

## Functional Requirements

- Support for recurring and one-off/special project tasks
- Resident opt-in, swap, volunteer; admin approval where required
- Real-time notifications for task assignments/reminders/due/missed
- Feedback/incident logging, with complete audit trail
- Points, streak, and leaderboard gamification
- Chore/project creation by admin or (admin-reviewed) resident
- Upload of photo/notes for proof or dispute workflows
- Automatic reminders, escalation, and reporting

---

## Non-Functional Requirements

| Requirement      | Target                                |
| ---------------- | ------------------------------------- |
| Responsive       | Mobile-first design                   |
| Performance      | Instant dashboard/status updates      |
| Feedback latency | <2 seconds                            |
| Audit retention  | Event log/audit retention for 3 years |
| Security         | Data encryption at rest and transit   |
| Accessibility    | Full ARIA/WCAG 2.1 AA compliance      |

---

## Mesh Layer Mapping

| Layer    | Component/Responsibility                                      |
| -------- | ------------------------------------------------------------- |
| Frontend | Chore/project board, swap/volunteer/feedback, streaks, badges |
| Backend  | Scheduler logic, notification engine, audit log, gamification |
| Storage  | Proof uploads, event/actions, streaks log                     |

---

## APIs & Integrations

### Required APIs

| Endpoint            | Purpose               |
| ------------------- | --------------------- |
| /api/chore          | CRUD chore assignment |
| /api/project        | CRUD special project  |
| /api/swap           | Propose/accept swap   |
| /api/feedback       | Submit/view feedback  |
| /api/notify         | Trigger notifications |
| /api/leaderboard    | Gamification data     |
| /api/chore/escalate | Escalation management |

### External Dependencies

- Baserow: Chore scheduling, event storage
- Notification service: Push/reminders
- Blob storage: Proof/photo evidence
- Gamification module: Points/badge allocation
- Optional Analytics: Data export, trends
- OCR: For proof of completion/receipts
- Asset cross-link: Tool/equipment assignment

---

## Data Models

| Entity      | Key Fields                                                                       |
| ----------- | -------------------------------------------------------------------------------- |
| Chore       | ID, type, assigned, due, status, completed, proof, points, streak, feedback link |
| Project     | ID, description, volunteers, deadline, approval, reward, feedback                |
| Swap        | ChoreID, from/to, status, proof, admin approval                                  |
| Feedback    | ChoreID, rating, notes, dispute                                                  |
| Streaks     | UserID, days/tasks/points                                                        |
| Audit/Event | Action, by, when, details                                                        |

---

## User Experience & Entry Points

- Chore/project board (tasks view)
- Personal dashboard (my tasks, reminders)
- Notification center (alerts, due/missed tasks)
- Volunteer/swap/feedback flows
- Leaderboard and streaks (status and recognition)
- Admin console (monitoring dashboards)

---

## Onboarding Flow

**Admin:** Seeds initial tasks, sets first "hero" project, presents streaks/points, demos swap/feedback

**Resident:** Accesses board, tries swap/volunteer, completes one-off, uploads proof, receives immediate gamified recognition

---

## Primary UX Flows

- **Routine:** Assignment → Notify → Accept/swap → Complete → Feedback
- **One-off:** Project creation → Volunteer → Admin approval → Track/credit
- **Missed/escalation:** Auto-nudge → Escalation route → Admin/peer feedback

---

## Accessibility Requirements

- Full ARIA compliance for screen readers
- Color mapping for task types (with text/icon support)
- Large tap targets for swaps/accept
- Alt text for all proof uploads and feedback
- Stepwise, guided action flows

---

## Success Metrics

### Leading Indicators

- Chore acceptance → swap → completion ratio
- Project volunteer and group credit instances
- Feedback count per period
- Average time-to-close for tasks

### Lagging Indicators

- Incident rate (e.g. disputes, missed tasks)
- Repeat absences/missed assignments
- Admin interventions required
- Resident satisfaction and audit compliance rates

### Measurement Plan

- Real-time task/completion board accessible to admin and residents
- Weekly exports and analysis (audit, streaks, swaps, disputes)
- Analytics dashboard for trend review and reporting

---

## Timeline & Milestones

| Phase   | Scope                          | Target  | Dependencies            |
| ------- | ------------------------------ | ------- | ----------------------- |
| Phase 1 | Recurring chores/auto-rotation | Month 1 | Notification infra, DB  |
| Phase 2 | One-off/hero project           | Month 2 | Task scheduler complete |
| Phase 3 | Gamification/analytics         | Month 3 | Full data/event flows   |

---

## Known Constraints & Dependencies

### Technical Constraints

- Real-time data/sync with concurrent board edits
- High-volume event/audit logs
- Notification queue scalability

### Business Constraints

- Incentive/reward budget cap
- Privacy for swaps and dispute workflows
- Limited admin review bandwidth

### Dependencies

- Notification and points infrastructure
- Baserow and DB connectivity
- OCR integration for photo/proof verification
- Asset tool cross-link for special chores
- Resident/admin onboarding support

---

## Risks & Mitigations

| Risk                            | Impact | Probability | Mitigation                                        |
| ------------------------------- | ------ | ----------- | ------------------------------------------------- |
| Task backlog during peak times  | High   | Med         | Auto-reminders, admin escalation, incentives      |
| Resident dropout                | Med    | Med-High    | Gamification points, flexible swaps, group credit |
| Swap abuse/system gaming        | Med    | Med         | Audit logs, admin veto, swap limits               |
| Proof/photo upload loss         | Med    | Low         | Redundant storage, nudge for resubmission         |
| Calendar/time zone misalignment | Med    | Med         | Localized reminders, explicit due timestamp       |
| Admin intervention lag          | Low    | Low         | Dashboard alerts, escalation prioritization       |

---

## Open Questions

| Question                                                                         | Impact |
| -------------------------------------------------------------------------------- | ------ |
| Should one-off projects be volunteer-only or allow admin-assigned participation? |        |
| Should chore schedules and swap histories be public to all, or private?          |        |
| Will anonymous but justified swap/trade be allowed, and under what constraints?  |        |

---

## Appendix

### Design Mockups

- Chore swap/streak logs, event and incident data samples
- Badge/points and leaderboard mockups
- Feedback form templates
- Streak leader demonstration screens

### Research & Data

- Review of estate chore, incident, and feedback logs
- Pilot data from similar co-living/PropTech platforms
- Analysis of gamification/leaderboard engagement

### Technical Feasibility

- Task scheduler, notification, and gamification modules validated in parallel projects
- Swap/event log performance at scale confirmed
- OCR/photo proof features in pilot and ongoing tuning
- Analytics layer leveraging existing stack, scalable as usage grows

### Competitive Analysis

Most co-living/estate tools stick to admin-driven lists, without flexible swap fairness or proper one-off "hero" project support. VeritasVault Harmony distinguishes itself with real-time, gamified, fully auditable task flows and explicit group recognition, directly addressing both equity and motivation.

# AI/Smart Suggestion Engine PRD

**Module/Feature Name:** AI/Smart Suggestion Engine  
**Marketing Name:** VeritasVault Insight & Nudge Engine  
**Readiness:** Draft – AI/nudge flows, cross-module hooks, explainable feedback, admin controls, observability instrumentation

---

## Platform/Mesh Layer(s)

| Layer     | Technology                                                                        |
| --------- | --------------------------------------------------------------------------------- |
| Frontend  | Next.js/React (nudge banners, dashboards, suggestion notices)                     |
| Backend   | Azure Functions (AI core suggestion engine, event analytics, explainability logs) |
| Storage   | Baserow (history, user context), Azure Blob (evidence, exports)                   |
| API Hooks | Required for all active modules (bidirectional ingest and action)                 |

---

## Primary Personas

- **Residents**
- **Admins**
- **Owners**
- **Maintenance/Sustainability Champions**
- **Project Leads**

---

## Core Value Proposition

Proactively surface the most valuable, urgent, or impactful next actions—across ALL estate modules—using multi-source data, explainable AI, and transparent admin override mechanisms.

---

## Priority & License

- **Priority:** P0/Platform-Critical – Unlocks data-driven estate operations, reduces risk, drives user engagement, and delivers measurable value at scale.
- **License Tier:** Enterprise (admin-tunable trigger logic, API sandboxing for extensibility and third-party integrations)

---

## TL;DR

A cross-platform AI suggestion engine that interprets estate-wide events to recommend high-ROI actions in real-time to residents, admins, and owners, builds transparent logs, and empowers admin oversight/override. By bridging all estate modules, the engine delivers proactive impact, slashes time-to-resolution, and builds measurable trust in smart decision support.

---

## Business Outcome/Success Metrics

- Increase in high-value action adoption
- Reduction in time-to-resolution for key issues/events
- Higher resident engagement (measurable nudge interaction)
- Improved rate of data-driven decisions by staff/admins
- Quantifiable risk/cost avoidance logged per suggestion event

---

## Integration Points

- Chore Scheduler (task events, reminders)
- Maintenance/Issue Management (tickets, alerts)
- Compliance/Docs (e-sign cues, renewal reminders)
- Sustainability/Green Actions (initiatives, reporting)
- Equipment (maintenance, status)
- Budget/Expense (anomaly detection, spend optimization)
- Poll/Event (community engagement)
- User Profiles (contextual targeting, preferences)

---

## Problem Statement

Residents and staff are flooded with options and alerts, while critical or high-value actions are overlooked—decision triage is ad hoc, inconsistent, and often colored by bias or delay. The lack of a unified, explainable prioritization layer leads to missed issues, slow response, and disengagement.

---

## Core Challenge

Design and deploy an AI/ML-driven engine that programmatically blends historic, peer, contextual, and real-time estate data to deliver the 'next best action'—ensuring every suggestion is explainable, can be overridden, and feeds structured feedback across modules.

---

## Current State

- Manual review of filtered lists, dashboards, and alerts in siloed modules
- No cross-module AI triage or 'single view' of priorities
- No explainable link between data and suggested priorities
- Frequent omission of critical tasks/projects
- Lack of clarity on urgency/importance hierarchy

---

## Why Now?

- Estates generate an abundance of data, but actionable focus is lacking
- Admin/owner time and trust are stretched by administrative overhead and "alert fatigue"
- AI/ML tech has matured to deliver explainable, transparent, and tunable suggestions
- Urgent need for scalable, unbiased prioritization—outpacing what human review offers

---

## Goals & Objectives

### Business Goals

- Reduce decision/response latency by 30%+ vs. baseline
- Ensure optimal allocation of time and resources (as logged by module)
- Measurable reduction of risk/cost/issue "miss" rates (>20% targeted)
- Build demonstrable system trust (admin/owner satisfaction and adoption)

### User Goals

- **Residents:** Always see the most valuable/responsible next action, never miss a critical/urgent notice, understand "why" each nudge appears
- **Admins:** Monitor, adjust, and override suggestion rules, minimize override friction, rapidly surface actionable system insights
- **Owners:** Track analytic impact, validate ROI, configure nudge adoption per module

### Non-Goals (Out of Scope)

- Workflow/process automation is not enforced; override is always available
- No creation or enforcement of policy frameworks (HR, employee conduct)
- No 'hard-gate' AI: users retain ability to ignore/postpone/modify suggestions

---

## Measurable Objectives

| Metric                   | Baseline | Target | Timeline             |
| ------------------------ | -------- | ------ | -------------------- |
| Nudge Adoption Rate      | 45%      | 70%    | 3 months post-launch |
| Urgent Response Time     | 3 hours  | <1 hr  | 1 month post-go-live |
| Nudge Satisfaction Score | —        | 80%+   | Bi-weekly reviews    |
| Admin Override Rate      | —        | <15%   | Steady-state Q2      |

---

## Stakeholders

| Role            | Responsibilities                                       |
| --------------- | ------------------------------------------------------ |
| Residents       | View & act on nudges, provide feedback                 |
| Admins          | Configure, monitor, override, and analyze suggestions  |
| Owners          | Review performance/ROI, approve modules, tune risk     |
| Module Owners   | Integrate triggers, monitor nudge impact in their area |
| AI/Product Team | Quality, override, event audits                        |
| Support         | Handle explainability fails, permission issues         |

---

## User Personas & Stories

### Primary Personas

**Resident**

- Wants actionable guidance, simplified choices, quick feedback, and transparency for why a nudge is presented.

**Task/Project Lead**

- Needs to prioritize, monitor, and delegate smartly across competing estate demands.

**Admin**

- Oversees system accuracy, modifies configuration, audits override rates, and reduces alert overload.

**Owner/Analyst**

- Seeks measurable ROI, system trust, and risk reduction analytics.

### User Stories

1. **Resident:** As a resident, I see "most valuable next" actions, understand why, and choose to accept, postpone, or skip.
   - **Acceptance:** Resident receives actionable nudge, explain modal is accessible, response recorded in system.
2. **Admin:** As an admin, I can audit, retune, or batch-modify suggestion rules and monitor key override and impact stats.
   - **Acceptance:** Admin console displays real-time nudge stats, tuning panel allows adjustment, override/audit logs visible.
3. **Owner:** As an owner, I access analytics, impact logs, and request system reasoning for all nudges by module.
   - **Acceptance:** Owner dashboard provides drill-down, export of audit and impact logs, and reason/explain access.

---

## Use Cases & Core Flows

### Primary Use Cases

1. Renovation/project prioritization based on resource, urgency, ROI signals
2. Detection and surfacing of urgent maintenance or compliance issues
3. Smart signature, renewal, or compliance action reminders
4. Chore, green action, or volunteer recommendations at optimal time
5. Expense/budget anomaly alerts and recommendations
6. Engagement and poll surfacing to drive resident interaction
7. Risk/incident alerts with evidence and action path
8. Escalation of event-relevant actions (weather, outages, deadlines)

### User Flow Diagram

```text
[Ingest Data] → [Engine] → [Nudge/Explain UI] → [User (Accept/Override/Act)] → [Log/Feedback] → [Refine/Future Suggestion]
```

**Resident:**

```text
Data/Context → Nudge → Action/Feedback → Points/Impact
```

**Admin:**

```text
Event → Nudge Rule/Trigger → Override/Retune → Monitor Logs
```

### Edge Cases

- Idle/stale data modules (no suggestion)
- Outlier, noisy, or conflicting event signals (AI must suppress or rank appropriately)
- Multi-admin feedback conflicts (last override or ensemble decision)
- Ignored/skipped nudges (log reason, track patterns)
- Explainability API fail (fallback to admin/manual reasoning)
- Permission errors, access violation attempts
- Event floods or nudge suppression on overload (user setting, system throttle)

---

## Functional Requirements

- **Cross-Module Data Ingestion:** Capture and normalize structured events from all active modules.
- **Pluggable/ML Suggestion Engine:** Azure Functions-driven core, supports ongoing module/model expansion.
- **Explainable Suggestions:** Present context, reason, triggering data, and historic match for user/admin in UI.
- **Action/Nudge UI:** Resident/Admin "accept", "delay", "skip", or "override" actions, with feedback reasons/log.
- **Admin Controls:** Enable/disable specific nudge types, batch retune rules by module, real-time analytics, event feed.
- **Audit Trail:** Per-action/event logs for all AI suggestions and user/admin decisions; exportable traces for compliance.
- **Feedback Capture:** Structured fields for rate/impact/ignore/accept per nudge, downstream for core retraining.

### Implementation Notes

- Ensure all module event APIs are backward-compatible and emit according to ingestion spec.
- All UI/logic must surface explainability modal within one click/tap.
- Admin override panel must log actor, timestamp, and impact reason.
- ML core modular: enable drop-in for new modules (ticketing, engagement, equipment).

---

## Non-Functional Requirements

| Requirement                | Target                                                  |
| -------------------------- | ------------------------------------------------------- |
| Suggestion/nudge delivery  | <3s (95th percentile)                                   |
| Event ingestion            | <10ms                                                   |
| Audit/event data retention | 3+ years, encrypted (Azure/Baserow)                     |
| Accessibility              | ARIA compliance, all explain modals screen-reader ready |
| Dashboard refresh          | Sub-2s for admin/owner analytics                        |
| Horizontal scaling         | Up to 10,000 suggestions per hour across modules        |
| API authentication         | SSO-authenticated event/action endpoints                |

---

## Mesh Layer Mapping

| Layer        | Component Roles/Responsibilities                               |
| ------------ | -------------------------------------------------------------- |
| Frontend     | Nudge UI, Explain modals, Feedback, Dashboard panels           |
| Backend      | Event ingestion, ML logic, Audit/Override recorder, Monitoring |
| Notification | Batch/push notifications, explain modals, points/impact alerts |
| Storage      | Event logs, suggestion histories, feedback, evidence blobs     |

---

## APIs & Integrations

### Required APIs

| Endpoint          | Method | Purpose                                      |
| ----------------- | ------ | -------------------------------------------- |
| /api/event/ingest | POST   | Receive new module events                    |
| /api/suggest/next | POST   | Return high-ROI, prioritized suggestions     |
| /api/nudge/post   | POST   | Capture user or admin nudge interaction      |
| /api/explain/:id  | GET    | Explain AI suggestion (why/context/evidence) |
| /api/override     | POST   | Record/administer manual override actions    |
| /api/feedback     | POST   | Collect structured feedback from actions     |
| /api/log/audit    | GET    | Query audit, suggestion, and override logs   |

### External Dependencies

- Baserow (ingest/logging)
- Azure AI/LLM (core ML suggestions, explainable AI)
- Notification/Core API (event push, nudge banners)
- SSO/User Auth (secure action logging, permissions)

---

## Data Models

| Model           | Fields                                             |
| --------------- | -------------------------------------------------- |
| Event           | ID, module, user, context, value, timestamp        |
| Suggestion      | ID, user, reason, weight, history, explain, module |
| Accept/Override | SuggestionID, actor, action, timestamp, reason     |
| Log             | user, action, event, feedback, impact              |
| Feedback        | nudgeId, rating, outcome, user/context, timestamp  |

**Relationships:**

- One Event can trigger multiple Suggestions.
- Each Suggestion maintains links to the Events that influenced its ranking.
- Logs and Feedback are keyed by SuggestionID and User.

---

## User Experience & Entry Points

- **Nudge Banner:** Prominent, non-intrusive suggestion UI activated on dashboard and relevant module home.
- **Dashboard Panel:** Nudge feed showing recent and high-priority system recommendations.
- **Action Center:** Aggregated view of open nudges, status, impact, and feedback.
- **Explain Modal:** "Why am I seeing this?" context, always one click away from each nudge.
- **Admin Tuning Console:** Rules review, override, frequency, and impact analytics.
- **Audit Feed:** Monitor system, user, and admin actions logged per module.
- **Trend Report:** Periodic impact and adoption summaries.

---

## Onboarding Flow

- Intro Modal: Explain UI and feedback intro for all users on first nudge.
- Demo Override: Click-through demo of manual override mechanics and tracking.
- Admin Training: Walkthrough of config/tuning options, override reporting.
- Live Example: Resident receives/test-acts on example nudge.
- Analytics Board: Owner/Analyst guided tour of impact tracking.

---

## Primary UX Flows

- **Resident:** Receives nudge → explains/context → acts or provides feedback
- **Admin:** Reviews nudge stats → tunes rules or overrides → audits logs
- **Error Handling:** Fallbacks for API or explain fail (admin message, suppression until resolved)
- **Mobile/Desktop Parity:** All flows tested and optimized for both

---

## Accessibility Requirements

- Full ARIA and WCAG 2.1 AA compliance for all nudge/explain modals and core actions
- Opt-out and delay function accessible by keyboard/screen reader
- Contrast and focus state tested for banners, console panels, and feedback screens

---

## Success Metrics

### Key Metrics

| Metric                    | Method          | Target              |
| ------------------------- | --------------- | ------------------- |
| Nudge open/view rate      | UI logs         | 95%+                |
| Suggestion adoption       | Action logs     | 60%+                |
| Issue miss rate (nudge)   | Admin audit     | <10%                |
| Override/suppression rate | Admin dashboard | <15%                |
| Feedback form fills       | Logs/analytics  | 100+ wk post-launch |

### Leading Indicators

- Nudge seen/opened per user/session
- Act, delay, or ignore rate per module
- Explain/clicks per nudge type
- Cross-module trigger volume

### Lagging Indicators

- Time-to-close for high/critical projects and incidents
- Improvements in estate-level KPIs (risk reduction, cost savings)
- Volume of admin overrides/complaints
- Retrospective "misses" marked by admin/owners

### Measurement Plan

- Event-based tracking of every nudge/action/override, linked to user and module
- Dashboard analytics for trends and weekly adoption, displayed centrally for all admins/owners
- Override reports delivered weekly to owners, including impact and tuning history
- Owner and Board analytics: Compliance, ROI, and engagement summaries delivered biweekly

---

## Timeline & Milestones

| Phase | Scope                                                         | Target    | Dependencies           |
| ----- | ------------------------------------------------------------- | --------- | ---------------------- |
| 1     | Chores, Maintenance, Budget/Green ingest + nudge core         | Month 1–2 | Module API hooks ready |
| 2     | Renovation, Events, Compliance expansion; explain modals      | Month 3–4 | Feedback/event tuning  |
| 3     | Analytics scaling, full admin tuning, cross-module deep links | Month 5–6 | Owner/admin input      |

---

## Known Constraints & Dependencies

### Technical Constraints

- 3s total round-trip nudge delivery latency (module to UI)
- <10ms event ingestion per module
- Explainability throughput for all user-permissioned suggestions
- Audit log retention (encrypted, 3+yrs)
- Secure partitioned user feedback storage

### Business Constraints

- AI model training and inference cost (Azure quota)
- SSO privacy/onboarding requirements (legal and compliance)
- Admin and owner capacity for rule tuning and onboarding
- Module owner bandwidth for integration and quality review

### Dependencies

- Module event APIs (up-to-date and fully documented)
- Azure AI/LLM contract in place
- Notification event display services integrated into all core UIs
- Owner and admin commitment to review/tune post-launch
- Resident feedback uptake in first 3 sprints

### Constraints

- Backlog risk on event ingestion if module APIs not standardized
- Explain API/UI may fail on incomplete/legacy event records
- Spike in volume must auto-scale or buffer; triggers may need suppression/queueing
- Each module must implement hook according to ingestion/feedback contract

---

## Risks & Mitigations

| Risk                 | Probability | Impact     | Mitigation                                |
| -------------------- | ----------- | ---------- | ----------------------------------------- |
| Explain API/UI Fails | Medium      | Med/High   | Fallback to admin notes, log for fix      |
| Feedback/Nudge Bias  | Medium      | Medium     | Ongoing model audits, weighted sampling   |
| Nudge Overload       | High        | Medium     | User-level throttle, admin suppression    |
| Override Friction    | Medium      | Low/Medium | Streamlined override flows, clear logs    |
| Privacy Issues       | Low         | High       | SSO enforced, all event/API access logged |

---

## Open Questions

| Question                                                                                               | Impact |
| ------------------------------------------------------------------------------------------------------ | ------ |
| Which modules/events must be prioritized for daily nudges in early phases?                             |        |
| Should residents see full nudge/action history or only current/active items?                           |        |
| To what granularity should admin/owner be able to see impact logs for rejected/suppressed suggestions? |        |

---

## Appendix

### Sample UIs

- Nudge and explain modals (wireframes)
- Admin rule editing flows/screens
- Audit/analytics dashboard snapshots

### Research & Data

- Estate nudge pilot: adoption, action, and feedback rates (see logs)
- Survey of resident/admin priorities and satisfaction with existing tools

### Design Mockups

- Admin nudge/feed panel
- Explain slideout/modal
- Nudge config UI
- Event/audit feed

### Technical Feasibility

- Azure AI functions, ingest pipelines, and logs load-tested and validated for anticipated volumes
- Explainable AI API interface and spec ready
- Modular UI/Feedback components built for rapid deployment
- Admin owner controls (beta) ready for expanded logic

### Competitive Analysis

Current market lacks cross-module, explainable AI with override/feedback loop and governance: leading solutions offer only generic, module-specific, or opaque "wizard" prompts—without scale, transparency, or rigorous audit trails. This module positions VeritasVault for differentiated, scalable, and trusted digital estate operations across all verticals.

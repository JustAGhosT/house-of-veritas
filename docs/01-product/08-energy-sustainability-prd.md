# Energy, Water & Sustainability Dashboard PRD

**Module/Feature Name:** Energy, Water & Sustainability Dashboard  
**Marketing Name:** GreenPulse: Live Estate Sustainability & Utility Board  
**Readiness:** Draft – manual MVP, extensible data model, challenge logic, analytics

---

## Platform/Mesh Layer(s)

| Layer | Technology |
|-------|------------|
| Frontend | Next.js/React (desktop & mobile) |
| Backend | Baserow (manual inputs), Azure Functions (nudge/challenge logic, analytics) |
| Storage | Data logs, image uploads |
| Integration | Map/room overlays, resident/room registry |

---

## Primary Personas

- **Residents**
- **Admin/Estate Manager**
- **Owners**
- **Sustainability Champion**

---

## Core Value Proposition

Motivate conscious usage and community participation by turning every resident, room, and appliance into a visible contributor to sustainability—complete with real-time feedback, personalized nudges, gamified challenges, and analytics.

---

## Priority & License

- **Priority:** P0 – Differentiates estate, supports compliance, drives engagement.
- **License Tier:** Enterprise with roadmap for multi-tenant, IoT/pro API.

---

## TL;DR

Manual per-room and appliance entry of energy, water, and waste data at launch; mapped to live dashboards with social nudges, challenges, and analytics. Positioned to evolve with smart meters and deep sustainability tracking, delivering real-time engagement and measurable impact.

---

## Business Outcome/Success Metrics

- Reduced utility spend
- Documented 'green' action rates
- Challenge completion
- Positive nudge response
- Reduction in environmental incidents
- Admin workflow efficiency

---

## Integration Points

- Room registry
- Resident directory
- Map overlays
- Notification engine
- Incident log (for burst/leak detection)
- Planned IoT import API

---

## Problem Statement

Sustainability is opaque and unevenly adopted—waste, expense, and compliance risks are persistent. There is no live, personalized feedback, and scant motivation to change or celebrate improvements across the estate.

---

## Core Challenge

Making sustainability data visible, actionable, and engaging (not punitive); balancing privacy and accountability while rewarding improvement—not just quotas.

---

## Current State

Currently, periodic manual reviews (monthly/quarterly) or unexpected bills are the norm. There are no feedback loops, high friction for resident reporting, and a lack of transparency across rooms/devices.

---

## Why Now?

Utility costs and eco-compliance obligations are escalating. Engaging residents is proven to drive measurable impact, and the readiness of sensors/integration options is rapidly growing.

---

## Goals & Objectives

- **Engagement:** Engage over 70% of residents in at least one challenge
- **Impact:** Cut per-room/estate utility by 10% within 6 months
- **Visibility:** Track/visualize over 90% of recycling/green actions
- **Automation:** Automate over 50% of all nudge/reminder communications

### Business Goals

- Reduce costs via lower utility consumption and early leak/waste detection
- Achieve regulatory green compliance and auditability
- Enhance estate/resident satisfaction, boosting retention and PR value
- Data-driven upgrades: inform future investment and green transformations

### User Goals

- Enable residents to see and track their impact in real time
- Motivate friendly competition/collaboration, with transparent progress
- Provide actionable alerts before problems escalate
- Recognize and reward individual and group sustainable behaviors

### Non-Goals (Out of Scope)

- Fully automated metering at MVP
- Resident-level billing/penalties
- Carbon offset sales
- Non-utility incident/maintenance flows

---

## Measurable Objectives

| Objective | Baseline | Target | Timeline |
|-----------|----------|--------|----------|
| Leak/overuse detection rate | <20% | >50% | 3 months |
| Challenge participation | None | >80% of rooms | 6 months |
| Green event logging | None | >90% completeness | 6 months |
| Automated nudge/alert handling | Manual only | >50% auto | 6 months |
| Admin workflow efficiency gain | N/A | 30% less manual | 6 months |

---

## Stakeholders

| Stakeholder | Role |
|-------------|------|
| Residents | Provide usage input; receive feedback, nudges, and rewards |
| Admin/Estate Manager | Configure, monitor, and act on trends; set nudges/challenges; review analytics |
| Owner/Principal | Review aggregated results, cost savings, and regulatory readiness |
| Sustainability Champion | Run coaching/events; advocate for adoption; amplify green culture |

---

## User Personas & Stories

### Primary Personas

**Engaged Resident**

- Motivated to reduce costs and be recognized for green practices. Seeks feedback, likes challenges, and values social proof.

**Passive/Budget Resident**

- Motivated by cost savings and ease. Typically only engages if guided or incentivized.

**Sustainability Lead/Admin**

- Invested in compliance, cost savings, and community reputation. Prioritizes efficiency, reliable data, and incident prevention.

**Owner/Principal**

- Concerned with aggregate impact, regulatory compliance, and value enhancement for the estate.

### User Stories

1. **Resident:** As a resident, I want to track my room/device usage, get nudges, and see live progress, so I know how to improve and can be recognized for good habits.
2. **Admin:** As an admin, I want to configure, monitor, assign nudges, and launch estate-wide challenges so I can visualize performance instantly and close feedback loops quickly.
3. **Owner:** As an owner, I want to review monthly/quarterly analytics and compare estates/regions over time, so I can understand performance and risk.

---

## Use Cases & Core Flows

### Primary Use Cases

1. Manual input (per room/device/estate level) of usage or green actions, with proof uploads
2. Immediate visualization of trend and comparison data
3. Receiving and responding to nudges and alerts
4. Participating in individual or group challenges; tracking progress and results

### User Flow Diagram

**Resident:**

```text
Enter usage/green event → See real-time feedback/nudge/badge → Option to join or create a challenge
```

**Admin:**

```text
Monitor usage/events data → Set challenges/targets → Issue nudges or auto-alerts → Track responses and analytics
```

**Data Flow:**

```text
[Resident Data Input] → [Usage DB] → [Nudge Engine] → [Resident UI]
[Admin Set Goals] → [Challenge Logic] → [Dashboards]
[IoT/API future]: [Smart Meter] → [API Import] → [Analytics/Dashboards]
```

### Edge Cases

- No or late data: Generate scheduled reminders or assign to admin
- False/gamed input: Flag entries for peer/admin audit; alert on outliers
- Spikes/unusual use: Auto-alert for leak/surge events; escalate if unresolved
- Social challenge dropout: Allow re-entry or completion incentives
- Privacy: Opt-out from public leaderboards; robust privacy controls

---

## Functional Requirements

- Manual data entry per room/device and bulk entry (with numeric, photo/pdf upload)
- Scheduled/targeted nudge engine and UI
- Challenge creation (weekly/monthly/benchmark/team)
- Analytics dashboards for residents/admins/owners
- Green event (recycling/commuting/gardening) logging
- Badging/leaderboards/social status, with full privacy setting support
- Extensible API for future IoT feeds and partner integration

---

## Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Responsive | Mobile-first design |
| Performance | Fast feedback/confirmation (<2s per action) |
| Security | Secure, auditable activity logging and encrypted storage of uploads |
| Scalability | Graceful handling of 10+ concurrent room/device entries |
| Compliance | Adherence to GDPR/POPIA |
| Accessibility | Full screen-reader and ARIA accessibility |

---

## Mesh Layer Mapping

| Layer | Component | Role/Responsibility |
|-------|-----------|---------------------|
| Frontend | Room/device input, dashboards | Data input, feedback, social |
| Backend | Usage DB, nudge/challenge logic | Persistence, automations |
| Analytics Engine | Azure Functions | Trend detection, reporting |
| Storage | Logs, image uploads | Evidence, compliance |
| Integration | Notification/map overlays | Engagement, transparency |

---

## APIs & Integrations

### Required APIs

| Endpoint | Purpose |
|----------|---------|
| POST/GET /api/usage | Record and retrieve usage by room/device (room, appliance, time) |
| POST/GET /api/greenevent | Log and retrieve green behaviors |
| POST /api/nudge | Send nudges to residents/admins |
| POST/GET /api/challenge | Create/join challenges |
| GET /api/leaderboard | Retrieve challenge and usage rankings |
| POST /api/analytics/report | Generate and access usage/engagement analytics |
| GET /api/iot/import | (Planned) Ingest smart meter/IoT data |

### External Dependencies

- Baserow (data/case store)
- Notification engine (email/SMS/in-app)
- OCR/Document Intelligence for uploads
- Future IoT integrations and benchmarking APIs

---

## Data Models

| Entity | Fields |
|--------|--------|
| Usage | ID, resident, room, device, type, value/unit, timestamp, proof, challengeID, nudge status |
| GreenEvent | ID, resident, event type, timestamp, photo |
| Challenge | ID, type, target, status, participants, reward |

---

## User Experience & Entry Points

### Onboarding Flow

**Admin:**

- Set up map/room/device inputs
- Schedule first challenge/nudge and seed leaderboard
- Enable notifications and privacy settings

**Resident:**

- Guided add of first usage/green event
- Join group challenge
- View badge/reward sample and feedback

### Primary UX Flows

- Data input redirects to immediate visual feedback and status
- Leaderboard and badges prompt ongoing participation
- Easy entry and reporting from mobile or desktop
- Automated or manual error resolution prompts

---

## Accessibility Requirements

- Full screen-reader and alternative input support (WCAG 2.1 AA)
- High-contrast and customizable UI cues
- All forms have proper alt-text and labels
- Full keyboard navigation

---

## Success Metrics

### Leading Indicators

- New usage/events logged per room
- Time to first challenge join post-onboarding
- Number of flagged/false input reports

### Lagging Indicators

- Overall utility reduction (cost or kWh/kL)
- Trend in green event reporting
- Admin time per workflow
- Resident engagement streaks, opt-in rates

### Key Metrics

- Challenge/nudge participation rate
- Utility reduction (tracked vs. baseline)
- Frequency of logged green actions/events
- Number of nudges resolved by resident response (w/o admin follow-up)
- Leaderboard usage & badge reward claims

### Measurement Plan

- Real-time dashboard for admins and owners
- Weekly/monthly reports via analytics API
- Resident dashboards with 'top actions' and improvement milestones

---

## Timeline & Milestones

| Phase | Scope | Target |
|-------|-------|--------|
| 1 | Manual data entry, nudge/challenge UI | +3 weeks |
| 2 | Green event logging, rewards module | +2 weeks |
| 3 | IoT import, deeper analytics | Ongoing |

---

## Known Constraints & Dependencies

### Technical Constraints

- Fast, secure, and reliable DB writes and reads
- Scalable notification and automation infrastructure
- Extensible to API/IoT future use cases
- OCR/photo ingest speed and reliability

### Business Constraints

- Badge/reward incentive budget and models
- High mobile accessibility
- Initial admin onboarding workload (mapping rooms/devices)

### Dependencies

- Reliable resident/room mapping
- Notification and analytics infrastructure
- Reward/recognition partners
- IoT roadmap

### Constraints

- Manual input overhead (minimized by reminders, QR code/mobility support)
- Avoiding nudge/alert fatigue (throttling, personalization, opt-out)
- Strong privacy and audit controls
- Analytics/data quality limited by completeness of manual uploads in MVP
- Dependence on device/room mapping and resident lists

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|---------------------|
| Resident input fatigue | High | Medium | Gamify, rotate prompts, automate with IoT |
| Data spam/gaming | Medium | Low | Peer/admin audit, anomaly detection alerts |
| Challenge dropouts | Medium | Medium | Incentivize completion, allow re-join |
| Opt-out from public leader | Low | Medium | Visible private benefits, not just social status |

---

## Open Questions

| Question | Owner | Target Date | Impact if Unresolved |
|----------|-------|-------------|---------------------|
| Should some green events be private? | Product | MVP | Potential privacy backlash |
| Should public leaderboard opt-out be available? | Product | MVP | Resident engagement reduction |
| Should nudge logic escalate for high usage/leaks? | Product/Dev | MVP | Missed risk mitigation |

---

## Appendix

### Research & Data

- Estate green engagement studies (utility behavior impact on costs)
- User interviews conducted Feb–Mar 2024
- Global green tech platform analysis

### Design Mockups

- Sample dashboard, challenge, and nudge UIs
- Wireframes for badge and reward notification flow
- OCR/photo upload demo screens

### Technical Feasibility

- Manual MVP ready, proven DB/integration path
- Scalable analytics engine planned in Azure
- Reward/gamification codebase trivial to adapt
- OCR/photo ingest modules stable from inventory deployments

### Competitive Analysis

Most estate platforms focus on admin/reporting and miss:

- Real-time, spatially mapped, gamified engagement
- Social/recognition incentives for residents
- Integration of utility + behavior + green action (not siloed ESG/waste only)
- Flexible roadmap to add IoT, automation, and deep analytics as estate matures

Engagement and admin satisfaction are driven by the immediate visibility of impact, the ease of participation, social feedback loops (nudges, leaderboards, badges), actionable alerts, reduction of manual pain points, and the ability to translate actions into recognition and savings—establishing GreenPulse as both a tool for compliance and genuine behavioral change.

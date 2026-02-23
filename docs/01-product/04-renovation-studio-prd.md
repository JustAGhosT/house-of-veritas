# Renovation Studio Module PRD

**Module/Feature Name:** Renovation Studio (Collaborative Renovation Planning and Suggestion Suite)  
**Marketing Name:** Resident Renovation Studio  
**Readiness:** Draft (awaiting approval and backlog slotting)

---

## Platform/Mesh Layer(s)

| Layer | Technology |
|-------|------------|
| Frontend | Next.js/React |
| Backend | Baserow, Azure Functions |
| Storage | Azure Blob |
| AI Integration | Azure Foundry |

---

## Primary Personas

- **Residents**
- **Admin** (Estate/Property Manager)
- **Guests** (view-only)

---

## Core Value Proposition

Empowers residents and management to collaboratively propose, plan, and prioritize renovations with AI-assisted design and transparent costing.

---

## Priority & License

- **Priority:** P0 - Critical. Strategic differentiator and major engagement driver.
- **License Tier:** Enterprise (default for House of Veritas), with optional customization tiers for future licensing.

---

## TL;DR

A map-driven, collaborative renovation management module enabling all residents to suggest, visualize, vote, and refine renovation projects—with AI-powered imaging and procurement integration. Admins approve, cost, and track projects, reducing overhead and boosting resident satisfaction.

---

## Business Outcome/Success Metrics

- Increased resident engagement
- Faster project approval cycle
- Reduced renovation contention
- Improved use of in-house materials

**Metrics:** Number of suggestions, votes, approved projects, AI-driven cost savings.

---

## Integration Points

- Baserow (renovation tables, asset links)
- Azure Blob (photo/archive)
- Azure Functions (AI triggers, notifications)
- DocuSeal (project approvals)
- Expense/Task/Asset modules

---

## Problem Statement

Renovation and facility improvements are historically ad hoc, with little transparency or structured input from residents. Disagreements, lost ideas, and duplicate spending are frequent. A digital solution is needed to streamline, democratize, and document renovation projects—from inspiration to execution.

---

## Core Challenge

Enable open, safe suggestion and voting while keeping costing and project approval under admin (property manager) control. Surface ideas without overwhelming users or admins with noise.

---

## Current State

Project ideas are managed via word-of-mouth or spreadsheets. Photos are scattered in chat or email. No formal process for inspiration, cross-area planning, or leveraging AI for design/costing.

---

## Why Now?

User engagement is a platform differentiator, and AI capabilities are maturing. There is pent-up demand among residents; the admin team needs efficiency and traceability.

---

## Goals & Objectives

Enable open suggestion (all rooms/areas), structured voting/prioritization, AI design/refinement, secure admin signoff, transparent budgeting/costing, archival and traceable project histories.

### Business Goals

- Increase engagement: Track suggestions per user
- Reduce renovation disputes: Improved transparency and documentation
- Optimize asset/material use: Reduce external spend by maximizing in-house inventory
- Improve facility quality
- Demonstrate innovation: Position as an industry differentiator

### User Goals

- Easy input (photo, map, text)
- Ability to shape their environment
- See visual feedback (AI, other residents)
- Ability to influence outcomes via voting
- Transparency on what's planned/done

### Non-Goals (Out of Scope)

- Payment processing
- E-commerce integration
- AI photorealism for every proposal (initial release)
- Room-level inheritance or "undo stacks" beyond basic versioning
- No external contractor management

---

## Measurable Objectives

| Objective | Baseline | Target | Timeline |
|-----------|----------|--------|----------|
| % residents who suggest/vote first cycle | TBD | >60% | Q1 Launch |
| % Projects with AI-aided material list | 0 | 70% | Q1 Launch |
| Admin time spent on renovation process | 100% | <40% of previous | Q2 Review |
| Archive coverage of executed changes | ~10% | >90% | Q2 Review |

---

## Stakeholders

| Stakeholder | Role | Responsibility |
|-------------|------|-----------------|
| Admin (PM) | Workflow definition, signoff | Cost tracking |
| Residents | Suggest, vote, track | Input and participation |
| Technical Lead | AI/UX integration | Delivery, API design |
| Support | Resident enablement | Training, troubleshooting |
| Compliance | Privacy/review/auditing | Policy checks |

---

## User Personas & Stories

### Primary Personas

**Family Resident**

- Motivated by a desire for an improved living space
- Wants their voice heard in decisions
- Least likely to engage unless process is simple and transparent

**Property Manager/Admin**

- Focuses on cost control and end-to-end traceability
- Needs efficiency and minimal overhead
- Accountable for project approval, inventory, and disputes

**Creative Resident**

- Enjoys suggesting and refining design ideas
- Curates mood/inspiration boards
- Advocates for collaborative thinking

### User Stories

1. As a resident, I upload a photo of my lounge and suggest a new archway; I see AI suggestions, upvote options, and track project status.
2. As a creative resident, I overlay my own ideas onto existing photos and join discussions about color/material options.
3. As an admin, I review suggestions for feasibility, select a plan, link to available assets, assign costs, and approve execution.
4. As a resident, I vote on preferred renovation options and get notified when a project progresses or is archived.
5. As a resident, I want to browse the history of completed and rejected projects for inspiration and transparency.
6. As an admin, I run an AI-driven procurement cost estimation job and receive a breakdown of in-house materials versus external purchases for each proposed project.
7. As a creative resident, I initiate an AI image refinement and review a preview before voting.
8. As an admin, I moderate potentially spammy or duplicate suggestions within a review queue.

---

## Acceptance Criteria

- Residents can submit photo- or text-based suggestions attached to any mapped location.
- Uploaded suggestions trigger an AI imaging pipeline for rendering and refinement.
- All users can see and vote (up/down) on suggestions within their building or group.
- Voting is rate-limited; users may vote only once per project per cycle.
- Admins have a clear costing workflow, with auto-suggested material breakdown and editable line items.
- Completed and denied projects are archived and searchable by date, location, and resident.
- AI failures are reported promptly to the user, with fallback to manual review.
- Admin approval actions trigger notifications and locking of project editing.
- All user actions (suggestion, vote, comment, approval, costing edit) are timestamped and logged.

---

## Use Cases & Core Flows

### Primary Use Cases

1. Suggest renovation for a room/area
2. Upload inspiration and attach to plan/area
3. Vote/refine others' ideas
4. Visualize before/after (AI-powered)
5. Costing/inventory linking, admin signoff

### User Flow Diagram

```text
+-------------------+
|Room/Area Selection|
+--------+----------+
         |
         v
+------------------+
| Upload Suggestion|
|  (Photo/Text/Map)|
+--------+---------+
         |
         v
+--------------------------+
|AI Imaging Pipeline Trigger|
+----+---------------------+
     |
     v
+-----------------------+
| View/Refine AI Output|
+-----+----------------+
      |
      v
+------------------+         +-------------------+
|    Voting        |<------->| Resident Comments |
+------------------+         +-------------------+
      |
      v
+-------------------+
| Admin Review/Cost |
+-------------------+
      |
      v
+-------------------+
| Project Approval  |
+--------+----------+
         |
         v
+-------------------+
| Execution/Archive |
+-------------------+
```

**Notes:**

- Branches for AI failures lead to manual review step.
- Voting triggers real-time update of project status/ordering.

### Edge Cases

- Idea spam or duplicate submissions
- AI service failure (fallback/manual mode)
- Voting abuse (e.g., brigading)
- Asset mismatch (suggested item not in inventory)
- Admin override of community preference
- Incomplete archival of finished projects
- Photo upload failures

---

## Functional Requirements

### Open Input & Display

- Open input for suggestions: photo, text, map location
- Display of suggestions (gallery, list, by map/area)

### Voting

- Structured upvote/downvote mechanism with moderation
- Resident voting limited to one vote per user per suggestion per cycle

### AI-Driven Imaging Pipeline

- **Sketch:** AI generates contour or concept render from photo/text
- **Refine:** User guides AI to adjust colors, textures, or features
- **Render:** Photorealistic or "inspiration board" output for user and admin review
- **Error/Fallback:** Manual mode enabled on AI/image error

### Voting Mechanisms

- Proposal ranking based on real-time aggregated upvotes/downvotes
- Voting closed automatically on admin approval
- Anti-abuse checks and moderation queue for spam or duplicate ideas

### Costing Workflow

- Admin triggers costing analysis for top proposals
- AI suggests in-house material matches, with line-item cost editing
- Option to lock costing and archive for compliance tracking
- Integration with Expense/Asset modules to suggest fulfillment quantities and pricing
- Project approval, notifications, and auditing via DocuSeal workflow
- Archive browser for completed/denied projects, with filtering/search

---

## Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Performance | UI response within 2 seconds |
| Scalability | Support for up to 10 concurrent users |
| Availability | Secure image/idea storage; robust archival |
| Security | RBAC for sensitive actions |
| Audit | Full audit log; all actions traceable |
| Accessibility | Basic compliance (minimum AA) |

---

## Mesh Layer Mapping

```text
+-------------------+      +------------------+      +-------------------+
|   Frontend (UI)   |<---->|    Backend       |<---->|AI Integration     |
| Next.js/React UI  |      | API, Baserow     |      |Azure Foundry      |
+-------------------+      +------------------+      +-------------------+
        |                           |                          |
        |                           |                          |
        v                           v                          |
--------------------------------------------------------------
|                  Storage/Data Mesh Layer                    |
|                    Azure Blob (images, logs)                |
--------------------------------------------------------------
```

- **Frontend:** Interactive map, suggestion gallery, voting widgets, modals for AI rendering and archive browsing
- **Backend:** Workflow state, voting and suggestion tables, project archives, admin dashboard, costing
- **AI Integration Layer:** Azure Foundry handles imaging, suggestion, asset matching jobs
- **Storage Layer:** Azure Blob (media, archives), Baserow (records, votes, assets)

---

## APIs & Integrations

### Required APIs

| API | Endpoint | Method | Description | Sample Payload/Notes |
|-----|----------|--------|-------------|---------------------|
| AI Suggestion | `/api/ai/suggest-renovation` | POST | Generate design concepts from photo/text input | `{ roomId, photoUrl, prompt }` |
| AI Imaging Pipeline (Sketch) | `/api/ai/render-sketch` | POST | Generate sketch/contour variant | `{ imageUrl, params }` |
| AI Imaging Pipeline (Refine) | `/api/ai/render-refine` | POST | Guided refinement of previous render | `{ imageId, adjustments }` |
| AI Imaging Pipeline (Render) | `/api/ai/render-final` | POST | Final photoreal/inspirational render | `{ imageId, style }` |
| Asset Matcher | `/api/ai/asset-match` | GET | Suggest matching assets/materials from in-house stock | `{ projectId, roomId }` |
| Suggestion CRUD | `/api/suggestion` | CRUD | Create, read, edit, delete suggestions | Standard REST |
| Voting | `/api/vote` | POST | Upvote/downvote by registered resident | `{ userId, suggestionId, vote }` |
| Blob Upload | `/api/blob/upload` | POST | Store photos, renders, or related artifacts | Multipart/form-data |
| Notification Trigger | `/api/notify/status` | POST | Trigger resident/admin notification (email/SMS/Web) | `{ userId, event, entityId }` |
| Project Archive | `/api/archive/project` | CRUD | Manage completed/denied projects | Standard REST |

### Azure Function Jobs

- **AI Pipeline Orchestrator:** Steps through suggestion → sketch → refinement → render, queueing jobs and error fallback
- **Costing Generator:** Generates and updates cost breakdowns, pulling in asset data and expense APIs
- **Moderation/Spam Filter:** Scans and flags duplicate or abusive suggestions, with real-time admin alerts
- **Vote Aggregator:** Periodically tallies and refreshes top proposals for each cycle

### External Dependencies

- Azure AI Foundry (AI imaging & suggestion)
- Azure Blob Storage (media & archive)
- Baserow (table management)
- DocuSeal
- Notification platform (e.g., SendGrid, Twilio)

---

## Data Models

### Entity-Relationship Diagram

```text
+--------------+           +---------------+           +----------------+
|   Room/Area  |<--------->| RenovationIdea|<--------->|     Vote       |
|   (roomId)   |   1..N    | (id, roomId)  |   1..N    | (ideaId, ... ) |
+--------------+           +---------------+           +----------------+
       |                             |
       |                             v
       |                        +------------------+
       |                        | AI_Image         |
       |                        | (ideaId, status) |
       |                        +------------------+
       |                             |
       |                             v
       |                        +-------------------+
       |                        | InspirationGallery|
       |                        | (id, ideaId, ...) |
       |                        +-------------------+
       |                             |
       +-------------------------+   v
                                 |Projects/Plan |
                                 |(id, ideaId, ...)
                                 +----------------+
                                      |
                                      v
                                 +-------------+
                                 | MaterialLink|
                                 |(projectId,..)|
                                 +-------------+
                                      |
                                      v
                                 +------------+
                                 |   Archive  |
                                 |(projectId) |
                                 +------------+
```

### Data Model Mapping Table

| Logical Model | Storage (Table) | Key Fields | Relationships/Notes |
|---------------|-----------------|------------|---------------------|
| Room/Area | Baserow: Rooms | roomId, label, status | N:1 with RenovationIdea |
| RenovationIdea | Baserow: Ideas | id, roomId, userId, text, photo | 1:N with AI_Image, Votes, Gallery |
| Vote | Baserow: Votes | id, ideaId, userId, value | FK to Idea, FK to User |
| AI_Image | Azure Blob/Baserow | id, ideaId, url, state | 1:N to Idea |
| InspirationGallery | Baserow: Gallery | id, ideaId, source | 1:N to Idea |
| Project/Plan | Baserow: Projects | id, ideaId, status, cost | 1:N to MaterialLink |
| MaterialLink | Baserow: Materials | id, projectId, assetId, qty | To Asset/Inventory module |
| Archive Log | Baserow: Archive | id, projectId, completed, denied | 1:1 with Project/Plan |

---

## User Experience & Entry Points

### Entry Points

- **Home Dashboard:** Quick links to current cycles, featured rooms, inspiration gallery
- **Room/Area Map:** Selectable, status-labeled spaces
- **Renovation Board:** Per-room summary of ideas in cycle, top votes, archives
- **Suggestion/Inspiration Gallery Modal:** Multi-source view and submission
- **AI Render Preview:** Inline, modal, or overlay rendering
- **Admin Dashboard:** Approval queue, costing, asset linking, and process overviews

### Onboarding Flow

1. Residents are prompted to select an area (interactive map).
2. Simple upload of a 'before' photo or input text idea.
3. Optional guided walkthrough of AI rendering/refinement process.

### Primary UX Flows

- Responsive for mobile and web
- Drag-and-drop for room selection/planning
- Modal/in-page visualization of AI-rendered before/after outcomes
- Graceful fallback and notifications if AI endpoints are occupied or fail
- Seamless transition from proposal to archived/completed project view

### Accessibility Requirements

- High-contrast, adjustable fonts for core flows
- Full keyboard navigation across all workflows
- ARIA labeling for suggestion, voting, and admin approval dashboards
- Alt-text requirements for all images

---

## Success Metrics

### Leading Indicators

- Number of new suggestions and votes per week
- Count of AI refinements submitted and rendered
- Number of asset matches performed

### Lagging Indicators

- Total renovations approved in cycle
- Adherence to budget per project
- Time (days) from suggestion to final signoff

### Measurement Plan

- All metrics displayed in the admin operations dashboard
- Weekly email summary to stakeholders
- Quarterly report on engagement, cycle time, and cost savings
- Comprehensive audit logs accessible upon request

---

## Timeline & Milestones

| Phase | Scope | Duration |
|-------|-------|----------|
| 1 | Core suggestion, voting, map UI, photo input | 2 weeks |
| 2 | AI imaging, suggestion refinement | 4 weeks |
| 3 | Asset match, costing workflow, archive browser | 2 weeks |

**Dependencies:** AI Foundry SLA/feature releases, Baserow updates.

---

## Known Constraints & Dependencies

### Technical Constraints

- Azure Blob storage quotas per organization
- Baserow API/table scaling limits
- AI pipeline queueing—throttle bursts/limit concurrency

### Business Constraints

- Budget ceiling (max R950/month for all running services)
- Rollout must complete inside quarterly development cycle
- Support team capacity for onboarding

### Dependencies

- Azure AI Foundry SLAs and availability
- Blob Storage health and capacity
- Baserow feature development and reliability
- Notification system integration and reliability

---

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| AI service outages | Medium | High | Fallback to manual review of ideas |
| Voting/suggestion spam | Medium | Medium | Rate limiting, moderation queue |
| Storage overruns | Low | Medium | Lifecycle archiving, quota alerting |
| Admin/Resident disengagement | Low | High | Prominent tracking of engagement metrics |

---

## Open Questions

| Question | Owner | Target Resolution | Impact if Unresolved |
|----------|-------|-------------------|----------------------|
| Do we allow anonymous suggestion? | Product | Sprint 2 | Privacy/process adjustments |
| Is per-room privacy granularly required? | Product | Sprint 2 | Possible scoping change |
| Can AI be trained on user-specific inspiration galleries in future cycles? | Product/AI | Pre go-live | Future roadmap, data privacy |

---

## Appendix

### Reference Docs

- [01-platform-specification.md](01-platform-specification.md)
- [03-product-requirements.md](03-product-requirements.md)
- [02-architecture/01-technical-design.md](../02-architecture/01-technical-design.md)

### Research & Data

- User interviews: Collected in 2025–2026, highlighting demand for input and frustration over lost ideas
- Incident logs: Catalogued renovation disputes and proposal bottlenecks
- Market analysis: Lack of open, AI-powered collaborative modules in competitive offerings

### Design Mockups

- Early Figma prototype – room/map interaction (pending)
- Mobile input and onboarding flows—storybook screenshots (TBD)

### Technical Feasibility

- Backend: All key components proven or present
- AI rendering: Feasible at current scale with budget monitoring
- UI: Map/room selector uses standard modern React components, medium engineering complexity

### Competitive Analysis

While a handful of standalone home design tools offer photorealistic imaging, estate/facility platforms rarely combine collaborative suggestion and AI-powered inspiration. The Renovation Studio will represent a unique market differentiator, streamlining execution and broadening engagement beyond admin-only workflows.

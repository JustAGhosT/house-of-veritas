# Collaborative Kitchen, Meal Planner & Intelligent Pantry PRD

**Module/Feature Name:** Collaborative Kitchen, Meal Planner & Intelligent Pantry  
**Marketing Name:** Smart Pantry & Collaborative Meal Planner  
**Readiness:** Draft – concept validated, ready for backlog preparation and technical spike

---

## Platform/Mesh Layer(s)

| Layer | Technology |
|-------|------------|
| Frontend | Next.js/React, mobile-first and desktop |
| Backend | Baserow, Azure Functions (AI, recipe search, OCR) |
| Storage | Azure Blob (receipts/photos) |

---

## Primary Personas

- **Residents/couples**
- **Kitchen Admin**
- **Guests** (view/meal joiner)
- **Shopping Leader**

---

## Core Value Proposition

Social, personalized, and allergy-aware meal planning for shared kitchens—combine collaborative shopping, advanced shelf/freshness status, real-time feedback, AI-driven recipes, and robust allergy/inventory integration for a safer, smarter, and more social kitchen.

---

## Priority & License

- **Priority:** P0 – High household impact, daily engagement, and platform stickiness.
- **License Tier:** Enterprise, with future white-label/licensing for property managers.

---

## TL;DR

A mesh-native, collaborative kitchen module featuring real-time shelf-scanning, explicit shelf freshness/status badges, social meal planning with real-time group chat, and collaborative shopping—leveraging AI and advanced allergy logic to suggest safe, relevant recipes for every household member.

---

## Business Outcome/Success Metrics

- Participation rate (shelves claimed, meal plans, shopping events)
- Reduction in double-buying and food waste
- Improvement in meal attendance/acceptance
- Avoided allergy incidents
- Number of AI-driven recipe completions/positive meal feedback

---

## Integration Points

- Inventory/Pantry module
- Resident profiles & allergy data
- Task module (shopping/planning)
- Incident/Medical event log
- Notification system
- AI Suggestion APIs
- OCR for receipt/photo import

---

## Problem Statement

Shared kitchens suffer inventory chaos, uninspired meals, unsafe food practices for allergic residents, and poorly coordinated shopping. Traditional group chats, spreadsheets, and static inventory systems fail to provide actionable freshness cues and robust social planning.

---

## Core Challenge

Centralize and gamify personal and group kitchen logistics so participation is rewarding, allergy-safety is automatic, inventory status is visible at a glance, and social dining is collaborative and enjoyable.

---

## Goals & Objectives

- **Maximize engagement:** Incentivize shelf claims, meal joins, and feedback through ease-of-use, mobile nudges, status visualizations (badges), and transparent group voting/chat.
- **Ensure safety and inclusion:** Allergy-inclusive AI suggestions and auditing; shelf freshness and risk flagged visually.
- **Eliminate chaos:** Explicit, live shelf freshness/claiming, collaborative shopping, integrated shelf scanning with real-time updates.
- **Foster social appetite:** Kitchen becomes a true digital social hub with group chat, feedback, and transparent meal planning.

### Business Goals

- Raise meal sharing frequency & meal event attendance
- Cut ingredient waste by making freshness/status visible
- Reduce accidental allergy incidents to zero
- Save admin/resident time
- Make the facility a model for smart, healthy co-living

### User Goals

- See shelf freshness/status instantly ("expiring soon," "all claimed") via badges
- Effortless, allergy-safe group meal planning—vote, chat, comment in real time
- Real-time shopping list edits with feedback/messages
- Passive or active involvement – join what's relevant, chat or react as desired
- Clear tracking and feedback on what works and what gets wasted

### Non-Goals (Out of Scope)

- Automated shelf re-stocking or e-commerce
- Mandatory checkout of every pantry item
- Direct external recipe API sync
- In-app billing

---

## Measurable Objectives

| Objective | Target |
|-----------|--------|
| Shelves claimed within 4 weeks | ≥80% |
| Meal plans inclusive of all resident dietary needs | ≥90% |
| Social meals/household/day logged | ≥1 |
| AI recipes allergy-safe for all invitees | ≥95% |
| Shelf status badges adopted for scanned inventory | 100% |

---

## Stakeholders

| Stakeholder | Role | Responsibilities |
|-------------|------|------------------|
| Residents | User | Claim shelves, plan/attend meals, feedback |
| Kitchen Admin | Superuser | Approve/mediate/resolve disputes |
| Shopping Leader | User/lead role | Organize shopping, meal logistics |
| Support/Tech Team | System/Infra | APIs, AI, OCR, feedback, allergy sync |

---

## User Personas & Stories

### Personas

**Allergy-Sensitive Resident**

- Wants assurance every shelf item, meal plan, and proposed recipe is labeled with clear allergy/freshness status and rationale.

**Creative Cook**

- Desires tools to see at a glance which shelf items are about to expire (badges), join/plan meals using group chat for ideas and feedback.

**Social Chef/Organizer**

- Needs centralized, real-time chat to plan meals, offer feedback, and coordinate shopping, all with shelf freshness statuses visible.

**Passive Resident**

- Seeks passive participation—clear status badges, minimal chat/interruption, but transparent access when needed.

### Expanded User Stories & Acceptance Criteria

#### Shelf Freshness & Status Badging

**As a resident**, I want each shelf item to show a live status badge—such as "All Claimed", "Expiring Soon" (within 48h/7 days), or "Unclaimed"—so I know what is available, urgent, or needs action.

**Acceptance:**

- Inventory UI overlays visible badges using color & icon (e.g., yellow clock for "Expiring Soon," green check for "All Claimed," red exclamation for "Unclaimed").
- Badges update in real time; user actions (claim, consume, discard) update badge state instantly for all viewers.
- **Edge:** If all items claimed but several about to expire, badge cycles or stacks ("Expiring Soon & All Claimed").

#### Real-Time Group Chat for Meal/Shopping Coordination

**As a meal planner**, I need a chat panel linked directly to each meal event and shopping run so group members can discuss options, give feedback, and share suggestions in real time—reducing fragmented messaging and ensuring feedback is recorded contextually.

**Acceptance:**

- Every meal/shopping list has a persistent, embedded chat feed (React/messages), supporting message, emoji, image, and "@" mention.
- Messages and comments are timestamped and persistently logged.
- Admins/mods may pin critical or allergy-related messages.
- From shopping lists: group chat supports inline comments on each list item; notifications and real-time editing are visible to all household members.

#### AI & Inventory API Integration

**As an allergy-aware AI module**, the recipe generation endpoint receives:

- Allergy union for all meal invitees
- Current inventory (including restricted/unavailable)
- Group meal preferences, dietary tags, and exclusions

**POST /api/ai/recipes:**

- Request payload includes `allergy_union`, `available_items`, `restricted_items`, `group_preferences`.
- Endpoint returns a list of recipes with rationale for each exclusion.
- On failure, returns fallback recipes with explicit reasons (e.g., insufficient safe ingredients); logs excluded recipes/ingredients.

#### Shopping List Real-Time API

- Exposes websocket/event-stream for live edits
- Household members see shopping list updates, comments, and edits instantly—each action generates a push event.
- Inline comments per item, with history, edit sources, and emoji reaction support.
- All edit/comment history is persistent and audit logged.

---

## UX Features & Entry Points

### Shelf Freshness / Status Badges

- **Visuals:** Color-coded, icon-labeled badges on every shelf/item in pantry view
  - Yellow clock: "Expiring Soon"
  - Green check: "All Claimed"
  - Red exclamation: "Unclaimed"
- **Hover/tooltip:** "Expires in 48h," "Claimed by Jamie," etc.
- **Interaction:** Clicking a badge brings up detail panel (item owner, expiry, latest edits)
- **Automatic update:** Status refreshes instantly as items are claimed, consumed, or edited.

### Real-Time Group Chat & Feedback

- **Meal Events & Shopping Lists:** Side panel with live message feed, threaded replies
- **Linked directly to the event** — context stays intact
- **Notifications:** Real-time pop for new message, comment, or @ mention
- **Feedback:** Residents can add meal feedback/comments during or after meal event; pinned comments elevate allergy or favorite-tagged responses.
- **Shopping List:** Each item allows comment/emoji thread; all changes archived for later review.

---

## API/Integration Requirements

### /api/ai/recipes

**Input must include:**

- Complete union of allergy profiles for involved users (block if incomplete)
- Explicit available/restricted inventory (sync to real-time shelf state)
- Specified group preferences (vegan, low-FODMAP, etc.)

**Output:**

- Safe recipes, each annotated with "Allergy Clearance: {allergens checked}"
- Rationales for every excluded recipe/ingredient

**Resilience:**

- On error, delivers fallback, logs incident to analytics for admin review

### Shopping List API

- Websocket or event-stream for all live edits, per-household
- Each shopping list exposes a timeline of adds, removals, and comments per item
- Pushes all changes to all editors in real time; supports inline historical playback ("rewind changes")

---

## Analytics & Measurement

### Shelf Heatmap & Utilization

- **Heatmap UI:** Visualizes shelf/location frequency, owner participation, and item turnover
- Color intensity shows usage rate (hot = used frequently/claimed, dull = stagnant/expired)
- Filter by time span, owner, or item type
- **Shelf Freshness Trends:** Track ratios of "Expiring Soon," "All Claimed," and "Unclaimed" over time; identify which shelves or owners have the most waste/expiry triggers

### Recipe Favorites & Feedback Aggregation

- **Group Feedback:** "Favorite" recipes tracked per household; meal event feedback/comments/rating aggregated for reporting
- **Top Recipes:** Display per-group "Household Favorites" and "Most Skipped" for meal planners
- **Feedback highlights:** Badge or flag popular/well-reviewed meals for fast re-use

### Waste & Allergy Analytics

**Wasted/Unclaimed Items:**

- Count/track items not claimed or consumed before expiry
- Historical trendlines for waste by item type, shelf, and user

**Allergy Incident Logs:**

- Record all suspected/confirmed incidents; assign to meal/shelf/event
- Admin dashboard: min/max/mean per month and per user, trend analysis for improvement
- Export and anonymized rollup for risk/audit
- **Triggering Alerts:** Surpass set waste/allergy threshold prompts user/admin action with visual cues and suggestion engine reminders

---

## Data Models

| Entity | Fields | Notes/Edge Handling |
|--------|--------|---------------------|
| Shelf | ID, Label, Owner, QR, Items[*], StatusBadge | Merges, claim logging, live badge state |
| Item | ID, Name, Barcode, AllergyTag[], Expiry | Duplicate/unrecognized, badge updates |
| Resident | ID, AllergyProfile, Meals[*] | Expired/incomplete profile warning |
| Meal Event | Participants[*], AIRecipe, Chat, Feedback | Timeout, critical pin, allergy comment pin |
| ShoppingList | Items[*], EditorLog, Chat, Comments | Real-time, audit logged, event-pushed |

---

## Success Metrics

- **Shelf Badge Utilization:** % of shelf items with correct, up-to-date badge
- **Group Meal Chat Engagement:** Messages, emoji, feedback per meal event
- **Allergy Incident Reduction:** Number and trend of flagged incidents
- **Waste Reduction:** Downward trend in wasted/unclaimed items per month
- **Favorite/Skipped Recipe Analytics:** Engagement and satisfaction scores
- **Response Latency:** Time from chat update to notification across users

---

## Timeline & Milestones

| Phase | Scope | Duration |
|-------|-------|----------|
| 1 | Core badge UX/logic, shelf real-time updates | Weeks 1–2 |
| 2 | Group chat build, API event push, shopping list live edits | Weeks 2–4 |
| 3 | Analytics pipeline, shelf heatmap/favorites, incident dashboards | Weeks 4–6 |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Allergy/medical edge | Block actions on incomplete/expired allergy data. Hard fail/alert for any unclaimed or expiring shelf items tied to allergies. |
| Real-time performance | Robust websocket/event handling and fallback UX for disconnects. |

---

## Appendix

### Reference Visuals

- Badge designs for shelf statuses
- Shelf heatmap mockup
- Group chat panel linked to meal/shopping event

### Summary

This expansion embeds status badge-driven shelf freshness, actionable analytics, and real-time, context-linked group chat as core parts of the collaborative kitchen experience. APIs and UX are designed for instantaneous, inclusive, and feedback-rich planning—minimizing allergy/waste risk and maximizing participation, visibility, and household satisfaction.

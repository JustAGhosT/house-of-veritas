# Estate Map & Spatial Overlay Module PRD

**Module/Feature Name:** Estate Map & Spatial Overlay Module – interactive map-based visualization and navigation for multi-property estates with room, area, and feature overlays  
**Marketing Name:** Estate Map Dashboard  
**Readiness:** Draft – conceptual signoff; technical spike required prior to full implementation

---

## Platform/Mesh Layer(s)

| Layer | Technology |
|-------|------------|
| Frontend | Next.js/React, geospatial libraries (Mapbox/Leaflet/SVG) |
| Backend | Baserow, Azure Functions |
| Storage | Azure Blob (map images and overlays) |

---

## Primary Personas

- **Admins** (Estate Managers)
- **Owners**
- **Residents** (view-only)
- **Guests** (optional)

---

## Core Value Proposition

Visually navigate, manage, and understand property layout and room-level data through an interactive estate map that links every area to site-specific actions and modules.

---

## Priority & License

- **Priority:** P0 – Strategic: immediate usability, foundation for future modules, engagement driver.
- **License Tier:** Enterprise (default), with scope for white-labeling and multi-tenant rollouts.

---

## TL;DR

An interactive, spatially-accurate estate map with live overlays for rooms, areas, and features. Admins can easily define overlays; residents and owners navigate and initiate actions such as renovations, incidents, asset review, and document access through a map-first interface, powered by instant quick actions tailored to each space.

---

## Business Outcome/Success Metrics

- Faster onboarding
- Reduced navigation effort
- Increased usage frequency
- Improved maintenance/issue response

**Key Metrics:**

- Average time to locate a room/module
- Click-throughs per week (map-driven)
- Setup completion rate (overlays per property)
- Number of context-driven actions initiated

---

## Integration Points

- Room/space registry
- Renovation Studio
- Inventory/Asset module
- Document/Incident/task modules
- Notification engine
- Baserow tables
- Azure Blob Storage

---

## Problem Statement

Without spatial context, estate management platforms are abstract—users struggle to locate, understand, or act on real-world data quickly. This leads to slow onboarding, errors, and missed opportunities for asset and issue management.

---

## Core Challenge

Delivering an intuitive experience for drawing and setting up accurate boundaries and features, with robust linkage to all modules and seamless, instant access to room-level quick actions from both desktop and mobile.

---

## Current State

All estate structure is managed using lists, spreadsheets, or basic tables, which have no visual or spatial relationship to real-world layouts. Users have to guess locations, resulting in time-consuming manual lookups and confusion, especially for new users. No map or visual navigation exists currently.

---

## Why Now?

- Rapid increase in user volume and estate complexity
- Growing need for quick cross-module data access
- Property tech competitors moving toward spatial overlays
- Higher user expectations around map-based navigation and self-service

---

## Goals & Objectives

### Business Goals

- Reduce support and onboarding costs through visual self-service
- Drive engagement with Renovation Studio, Inventory, and other modules
- Provide a sales differentiator for complex estates, unlocking multi-property deals

### User Goals

- Allow any user to instantly find and act on a room/area with high confidence
- Enable at-a-glance status review and direct access to common actions via map overlays and quick actions
- Ensure feature parity and easy navigation from desktop and mobile

### Non-Goals (Out of Scope)

- Public mapping or GIS-level detail
- Real-time asset tracking (future)
- Community editing of overlays
- Automated detection/drawing of rooms (future AI phase)

---

## Measurable Objectives

| Objective | Baseline | Target | Timeline |
|-----------|----------|--------|----------|
| Rooms/areas mapped in week 1 | 0% | ≥90% | 1 week |
| Navigation from map (vs lists) | 0% | >60% start rate | 2 weeks |
| User task success rate | Unknown | >95% | Launch |
| Admin overlay setup time | N/A | <10 min/property | Launch |

---

## Stakeholders

| Role | Responsibility |
|------|-----------------|
| Admins | Map setup and edit, data curation |
| Residents/Owners | Day-to-day navigation, quick actions |
| Dev Team | Data model, APIs, geospatial and UI/UX |
| Support | Onboarding assistance |
| Compliance | Privacy and data safety review |

---

## User Personas & Stories

### Primary Personas

**Owner/Admin**

- Motivations: Accurately set up, maintain, and use spatial navigation for the estate; streamline ongoing management.
- Pain Points: Tedious onboarding, inability for new residents to grasp layout quickly, time wasted contacting support.

**Resident**

- Motivations: Easily navigate the property, report problems, access information, and trigger estate actions.
- Pain Points: Unfamiliarity with estate layout, slow access to documents or reporting tools.

**Support**

- Motivations: Help clients onboard efficiently, reduce navigation- and confusion-related tickets.
- Pain Points: High support volume at tenant move-in/changeover.

### User Stories (Expanded: Advanced Flows)

1. **Admin Overlay Editing:** As an admin, I can upload a property floor plan (JPG, PNG, SVG), calibrate its scale, and precisely draw polygons or rectangles for each room/zone. I can edit corner nodes, set snap-to-grid for alignment, and use advanced tools (duplicate, merge, split, delete area). Overlays can be grouped by layer (e.g., buildings, floors) and labeled with custom attributes such as type, access level, or hazard status. Once finalized, overlays can be linked to Renovation, Asset, or Incident modules directly from the map UI.

2. **Resident Quick Actions/Popover:** As a resident, when I tap or click any overlay, I get an instant popover displaying space attributes (room name, last completed task, hazard indicators) and one-tap actions: file an incident, view documents, or request service. On mobile, quick actions are surfaced as thumb-friendly buttons in a bottom sheet. If a room is linked to multiple modules, I can swipe left/right or expand to see all available actions for that space.

3. **Owner/Portfolio Switching & Deep Linking:** As an owner managing several properties, I can switch between estate maps from a selector dropdown. Each property retains its own overlays, and clicking any overlay deep-links me directly into target modules (e.g., Room 201's compliance doc) in the relevant estate context without extra navigation.

4. **Mobile Overlay Drawing (Admin, Advanced):** As an admin on a tablet, I can draw or adjust overlays using touch gestures—supporting pan/zoom, pinch-to-scale, and single/double-tap to place or refine points. Node handles snap together, validation prompts guide and confirm closures, and undo/redo is accessible via floating controls.

5. **Bulk Actions & Error Handling:** As an admin, I can bulk-edit overlay attributes (layer/label/status) and receive real-time feedback if overlays overlap, are missing links, or fail validation (highlighted with animation and popover suggestions).

---

## Use Cases & Core Flows

### Primary Use Cases

1. Upload property image and draw room/area overlays
2. Assign features (door, walls, windows, paths)
3. Show contextual popover with live data & quick actions per overlay
4. Enable map-first navigation to internal modules
5. Support multi-property switching for portfolio managers

### User Flow Diagrams

**Admin Flow**

```text
+------------+     +---------------+     +-------------+     +-------------------+
| Upload Map |---> | Draw Areas    |---> | Attribute   |---> | Save/Link Actions |
+------------+     +---------------+     +-------------+     +-------------------+
                       |                       |
                       v                       v
               +----------------+    +---------------------+
               | Edit/Move Node |    | Link to Module/API  |
               +----------------+    +---------------------+
```

**Resident Flow**

```text
+----------+     +------------+     +-----------+    +-----------------+
| Open Map |---> | Tap/Click  |---> | Popover   |---> | Quick Action    |
+----------+     +------------+     +-----------+    +-----------------+
       |                                            |
       v                                            v
+-----------------+                        +-----------------------+
| Mobile: Swipe   |                        | Mobile: Bottom Sheet  |
+-----------------+                        +-----------------------+
```

### Overlay Data Model Diagram

```text
+--------------------+
|   Property Map     |
+--------+-----------+
         |
         v
+-------+---------+        +--------------------+
|   Overlay(s)    +------->+   Feature Types    |
| (Polygon/Rect)  |        | (Room, Wall, etc.) |
+-----------------+        +--------------------+
         |                          |
         |                          v
         |              +----------------------+
         +------------->|   Linked Modules     |
                        | (Renovation, Docs,   |
                        |  Incident, Asset)    |
                        +----------------------+
```

Overlay-to-module links are persisted as a map of [module_type, endpoint], stored in Overlay attributes.

---

## Functional Requirements

### Overlay Draw/Edit Logic

- Drawing toolkit for polygons, rectangles, lines, points; all support edit, move, add/delete nodes.
- Snap-to-grid/angle utility for precise geometries.
- Overlay editing mode: overlays are locked for non-admins.
- Undo/redo with visual feedback for every step.
- Overlay validation: must not self-intersect, must be within bounds of the base property image.
- Overlays can be merged or split; bulk-attribute edit.
- Each overlay can be assigned feature types (room, wall, window, etc.), and grouped by layer.
- Overlay calibration tool: set real-world scale on upload (with reference measurement tool).

### Popover Quick Actions

- Popover appears on hover/click (desktop) or tap (mobile).
- Displays overlay metadata (label, status, last activity).
- Quick actions shown based on configured module links; default actions:
  - Renovation Studio (open in context)
  - File Incident/Task (launch modal/form)
  - View/Edit Documents (download/upload)
  - Asset/Inventory list
  - See compliance status
- Fallback: if no action linked, show "Configure Action" (admin) or "No Actions Available" (resident).
- Long-press (mobile) triggers expanded action panel.
- Accessibility: all quick actions reachable via keyboard and screen reader.

### Mobile Flow

- Touch interface for map navigation, overlay selection, and drawing (admins only).
- Popovers transform into expandable bottom sheets for actions and details.
- Drawing: tap-tap node placement, pan-to-move, pinch-to-zoom, long-press for node edit/remove.
- Floating action buttons for undo/redo, save/cancel.
- Swipe gestures for cycling overlays or dismissing popover sheets.
- Full parity with desktop core flows (drawing, quick actions, navigation) except for advanced bulk or layer controls.

---

## Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Responsive | Mobile/desktop |
| Performance | Full overlay/map image set loads in <2s |
| Security | Secure image/overlay storage with permissions |
| Privacy | Room/overlay privacy and visibility controls |
| Accessibility | Popover and drawing tools accessible via keyboard and screen reader |
| Fallback | Tabular/list navigation if map or overlays fail |

---

## Mesh Layer Mapping

| Layer | Components/Responsibilities |
|-------|-----------------------------|
| UI/Frontend | Map rendering (Mapbox/Leaflet/SVG), Drawing Tools, Popover UI, Overlay editor (admin), Quick Actions Panel, Mobile bottom sheet |
| Backend | Overlay CRUD, Property CRUD, Overlay-to-Module mapping, Audit log |
| Storage | Azure Blob (images, overlay GeoJSON/SVG), Baserow tables |
| API Gateway | Auth, Permission checks, Request routing |
| Notification/Task | Link action triggers to Renovation, Incident, Asset, Docs |
| Event Engine | Overlay-clicked, action-initiated, area-selected emit events |

### Overlay-to-Module Data Flow

1. Overlay (with type, label, ID) is selected in UI.
2. Client requests linked actions via `/api/module-links` endpoint for overlay ID.
3. Server composes and returns enabled quick actions, including deep links & permission-filtered URLs.
4. On user action selection, front-end emits event to mesh layer; triggers module handoff via link, or opens modal/panel as configured.
5. Audit log records overlay click & action, notifies Notification module if configured.

### Event Flow Example

| Initiator | Trigger | Event | Consumed By | Result |
|-----------|---------|-------|-------------|--------|
| Admin | Save overlay | overlay:created | Backend, FE, Audit | Overlay is stored, timeline updated |
| Resident | Click overlay | overlay:selected | FE, API | Popover fetched, quick actions loaded |
| Owner | Action in popover | module:action_initiated | API/Event Engine | Module deep link, audit log updated |

---

## APIs & Integrations

### Required APIs

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/map/upload` | POST | Upload, calibrate map images; returns image_uri and mapping metadata |
| `/api/overlays` (polygons, lines, points) | GET/POST/PATCH | CRUD for overlay geometry and attribute elements |
| `/api/property/list` | GET | List all properties/estates with status/image references |
| `/api/overlay/:id/attributes` | PATCH | Update overlay label, status, feature type, module/action links |
| `/api/module-links` | GET | List quick-actionable modules for overlay by role/resource |
| `/api/overlay/:id/event` | POST | Post overlay-level events (select, edit, action) |

### External Dependencies

- Mapbox/Leaflet/OpenLayers (geospatial display/drawing)
- Azure Blob (image and overlay file storage)
- Baserow (overlay data tables)
- Downstream modules: Renovation, Incident, Asset, Docs

---

## Data Models

### Property

| Field | Type |
|-------|------|
| id | UUID |
| name | String |
| image_uri | String |

### Overlay

| Field | Type |
|-------|------|
| id | UUID |
| property_id | UUID |
| coordinates | GeoJSON (polygon/point/line) |
| type | Enum (polygon, point, line) |
| feature_type | Enum (room, wall, door, etc.) |
| label | String |
| linkedActions | Map[module, url] |
| attributes | JSON (status, areaId, lastActivity, hiRisk, color, etc.) |
| layer | String (building/floor/purpose) |

### Module Link (in Overlay)

| Field | Description |
|-------|-------------|
| module_type | Module identifier |
| deep_link_url | Target URL |
| enabled | Boolean |
| shown_to_roles | Role filter |

---

## User Experience & Entry Points

- Map entry on home sidebar/dashboard
- Popover as primary navigation trigger (hover/click/tap)
- Multi-property selector for portfolio users
- Admin overlay editor behind RBAC control
- Surface actionable shortcuts instantly in popover/bottom sheet whenever a mapped area is selected

---

## Onboarding Flow

**Admin:** Wizard: upload → calibrate scale → draw/adjust overlays (polygon, line, etc.) → assign types/labels → link to actions/modules → preview, save, or redo. Advanced onboarding includes a completeness checklist (e.g., all rooms mapped, all overlays linked to at least one action).

**Resident:** Map is visible; guided tooltip coach marks first time, popover hints with suggested quick actions.

---

## Primary UX Flows

- **Admin:** Toggle overlay editing, use grid/snap, calibration, batch edit, audit/revert.
- **Resident:** Click/tap overlays → instant popovers/bottom sheets → one-tap module shortcuts (Renovation, Task, Docs, Asset).
- **Mobile-specific:** All overlays editable by touch (admin), quick action ribbon optimized for thumb reach, swipe for module carousel if >3 actions.
- **Error:** Automatic fallback to list/table with deep links if map load fails.

---

## Accessibility Requirements

- High contrast, configurable overlay colors for low vision users
- All editing and quick actions accessible via keyboard (Tab, Enter, Esc, arrows)
- Popover/bottom sheet ARIA labeling, overlay alt/title attributes
- Event flow sequenced for screen readers: e.g., "Room 101 selected; Actions available: View Docs, File Incident"

---

## Success Metrics

### Leading Indicators

- Overlays drawn, % rooms mapped per property
- Time from map open to module navigation
- Popover/quick action open & completion rates

### Lagging Indicators

- Navigation-related support ticket reduction
- Increase in quick action usage from map overlays versus menu
- Uptake of Renovation/Incident/Asset features via map

### Measurement Plan

- Audit/log overlay edit/creation by user and event
- Analytics dashboard tracking overlay engagement, action launches, error fallbacks
- Regular review cycles between Product/CS/support

---

## Timeline & Milestones

| Phase | Scope | Target | Dependencies |
|-------|-------|--------|--------------|
| 1 | Map upload, draw/save room overlays, Renovation module link | 2 weeks | Overlay CRUD API, UI design |
| 2 | Door/wall/window features, multi-property switch | 3 weeks | Advanced drawing, property selector |
| 3 | Full quick action panel (all modules), mobile UX, accessibility | 2 weeks | Integration logic, mobile QA |

---

## Known Constraints & Dependencies

### Technical Constraints

- Front-end browser payload limits for high-res images and complex overlays
- Snap-to-grid/angle calibration for precision overlays
- Overlay and map versioning for undo/audit
- Multi-property indexing for fast property switching

### Business Constraints

- Map image licenses (floorplans)
- Privacy for sensitive property layouts
- Cost and quotas of Azure Blob for high-res maps

### Dependencies

- Timely acquisition/approval of property images
- Overlay API expansion and audit infra
- Geospatial/touch UX engineering resourcing
- Downstream module action integration (Renovation, Asset, etc.)

---

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Licensing delays for map imagery | Medium | High | Engage legal/estates team early |
| Admin errors in overlay setup | Medium | Medium | Undo, validation, preview features |
| Overlay "drift" or scaling inaccuracies | Medium | Medium | Snap-to-grid, calibration wizard |
| 3rd party browser incompatibility | Low | High | Cross-browser QA matrix |
| Accidental data exposure (map privacy) | Medium | High | Strict RBAC, privacy audit |

---

## Open Questions

| Question | Owner | Target |
|----------|-------|--------|
| Should users be able to print or export estate maps for offline use? | Owner/Support | TBC Q2 |
| Is a history log of overlay edits required for compliance? | Compliance/Dev | TBC Q2 |
| Would supporting live/camera-sync'd map overlays add major value? | Product/Dev | Research in later phases |

---

## Appendix

### Research & Data

- Facility management and PropTech UI audit (Mapbox, Archilogic, PlanRadar)
- User interviews: navigation pain points, new tenant onboarding, support logs on room/area confusion

### Design Mockups

- Early SVG overlay editor demo (internal)
- Annotated property map examples (under NDA)
- Figma: planned popover/overlay map flows (to be linked upon completion)

### Technical Feasibility

- Core map/overlay functionality validated with open-source Mapbox/Leaflet
- Multi-property indexing assessed—no major blockers
- Mobile overlay editing: only for admins, medium complexity, dependencies on geospatial touch libraries
- Overlay-to-module mapping: tested via dynamic config and API mock

### Competitive Analysis

Most PropTech/BMS platforms (PlanRadar, Archilogic) feature basic map views with static overlays, but lack actionable deep-linking and admin overlay setup. No competitor offers combined quick actions, granular visual module linking, and true parity for multi-property, room-first navigation—a key enterprise differentiator.

# ADR-006: Access Control Model — Roles vs Multiple Roles vs Responsibilities

**Status:** Accepted  
**Date:** 2026-02-21  
**Deciders:** Technical Lead, Product Owner

---

## Context

House of Veritas uses a single-role-per-user model (`admin`, `operator`, `employee`, `resident`).
Navigation and API permissions are driven by persona (hans, charl, lucky, irma), which maps 1:1 to role.
Users also have `specialty` (skills) and `responsibilities` (in user-management) that are underused.

**Current gaps:**

- Irma (resident) has no Projects page — residents cannot view or suggest projects
- Task assignment and permissions are role-only; skills/responsibilities are not used for access
- No way to grant a user access to specific features (e.g. Projects) without changing their primary role
- AI assignee suggestion uses specialty heuristically, not as a formal permission model

**Question:** Should we adopt multiple roles, responsibilities-based access, or extend the current model?

---

## Decision Drivers

1. **Flexibility** — Grant feature access (e.g. Projects) without changing a user’s primary role
2. **Task assignment** — Match users to tasks by skills/responsibilities, not just role
3. **Simplicity** — Avoid over-complex permission logic and UI
4. **Consistency** — One coherent model for nav, API, and project membership
5. **Migration** — Minimize breaking changes to existing code

---

## Options Considered

### Option A: Single Role (Current, Extended)

- Keep one role per user
- Add Projects to resident nav (hardcode for Irma)
- **Pros:** No schema change, minimal code
- **Cons:** No way to grant partial access; every resident gets Projects or none

### Option B: Multiple Roles per User

- User has `roles: UserRole[]` (e.g. `["resident", "operator"]`)
- Permission = union of all roles
- **Pros:** Flexible; one user can be resident + operator
- **Cons:** Role conflicts (admin + resident?), inheritance unclear, more complex RBAC

### Option C: Responsibilities-Based Access

- User has `responsibilities: string[]` (e.g. `["Household", "Projects", "Expenses"]`)
- Each feature/page declares required responsibility (or none)
- Access if user has required responsibility OR role grants it (admin = all)
- **Pros:** Granular, aligns with task assignment (skills), no role inflation
- **Cons:** New responsibility vocabulary to define and maintain

### Option D: Hybrid — Role + Responsibilities

- Keep primary `role` for broad API permissions (admin vs non-admin)
- Add `responsibilities` for feature-level access and nav
- Nav: show page if user has required responsibility OR role includes it
- **Pros:** Role for coarse control, responsibilities for fine-grained; reuses existing `responsibilities` in user-management
- **Cons:** Two concepts to understand

---

## Weighted Decision Matrix

**Criteria** (weights sum to 100):

| Criterion | Weight | Description |
| ----------- | -------- | ------------- |
| Flexibility | 25 | Grant Projects to Irma without making her operator |
| Task/permission alignment | 25 | Use same model for task assignment and access |
| Simplicity | 20 | Easy to reason about and configure |
| Migration effort | 15 | Minimal changes to existing code |
| Extensibility | 15 | Easy to add new features (e.g. Inventory) per user |

**Options scored 1–5** (5 = best):

| Criterion | A: Single Role | B: Multiple Roles | C: Responsibilities | D: Hybrid |
| ----------- | ---------------- | ------------------- | ---------------------- | ----------- |
| Flexibility | 2 | 4 | 5 | 5 |
| Task/permission alignment | 2 | 3 | 5 | 5 |
| Simplicity | 5 | 2 | 4 | 4 |
| Migration effort | 5 | 2 | 3 | 4 |
| Extensibility | 2 | 4 | 5 | 5 |
| **Weighted total** | **3.35** | **3.15** | **4.45** | **4.65** |

**Decision:** **Option D — Hybrid (Role + Responsibilities)**

---

## Chosen Model

### Role (Primary)

- **admin** — Full access; bypasses responsibility checks
- **operator** — Operations: tasks, time, assets, vehicles, documents, projects
- **employee** — Tasks, time, inventory, expenses, vehicles, documents, projects
- **resident** — Household: tasks, documents; plus any responsibilities

### Responsibilities (Feature-Level)

| Responsibility | Grants Access To |
| ---------------- | ------------------ |
| `Projects` | Projects page (view, suggest) |
| `Expenses` | Expenses page (submit, view own) |
| `Inventory` | Inventory page |
| `Household` | Household tasks, meal planning |
| `Assets` | Assets page (view, check out) |
| `Vehicles` | Vehicle log |
| `Time` | Time clock |
| `Documents` | Documents page |

### Default Responsibility Sets by Role

| Role | Default Responsibilities |
| ------ | -------------------------- |
| admin | (all — no explicit list needed) |
| operator | Projects, Assets, Vehicles, Time, Documents |
| employee | Projects, Inventory, Expenses, Vehicles, Time, Documents |
| resident | Household, Documents, Projects |

**Rationale for adding Projects to resident:** Residents may participate in household projects
(e.g. paint house internal, garden revamp). They should view projects and suggest new ones,
same as operators/employees.

### Permission Logic

```text
canAccess(feature) =
  user.role === "admin" OR
  feature.requiredResponsibility IN user.responsibilities OR
  (role default responsibilities include feature)
```

### Task Assignment

- AI assignee suggestion: use `specialty` and `responsibilities` to match task to user
- Project membership: user can be assigned to project based on responsibilities
- Permissions: task visibility follows project membership + role

---

## Implementation Plan

### Phase 1: Immediate ✓

1. Add Projects to Irma’s nav (resident default)
2. Create `app/dashboard/irma/projects/page.tsx` using `ProjectsPageContent` with `isAdmin={false}`
3. Define `DEFAULT_RESPONSIBILITIES_BY_ROLE` in `lib/access-config.ts`
4. Document the model in this ADR

### Phase 2: Responsibilities-Driven Nav ✓

1. `lib/nav-config.ts` — `getNavForPersona(role, responsibilities)` builds nav from page definitions
   and responsibility checks
2. `components/dashboard-layout.tsx` — Uses `getNavForPersona` with user role/responsibilities when viewing own dashboard
3. `lib/auth/rbac.ts` — `withResponsibility(required)` for optional API checks; `getAuthContext`
   includes responsibilities (from header or role defaults)
4. `lib/ai/azure-foundry.ts` — `suggestAssignee` accepts `userDetails` with responsibilities/specialty
   for better AI matching

### Phase 3: Task & Project Alignment ✓

1. **Project member suggestion** — `POST /api/ai/suggest-project-member` suggests members by project
   name and user responsibilities/specialty. Projects page has AI Suggest (Sparkles) button next
   to Add member.
2. **Responsibility-based task visibility** — Tasks API filters for non-admin users: show tasks
   assigned to them OR in projects they're a member of. `lib/projects.ts`:
   `getProjectNamesForMember(userId)`.

---

## Consequences

### Positive

- Irma (and any resident with `Projects`) can view and suggest projects
- Clear path to add new features per user without role inflation
- Responsibilities align with task assignment and project membership
- Reuses existing `responsibilities` in user-management schema

### Negative

- Two concepts (role, responsibilities) to explain to admins
- Need to maintain responsibility vocabulary and defaults

### Risks

- Default responsibilities must stay in sync with nav; consider single source of truth

**Mitigation:** `lib/access-config.ts` is the single source of truth for `RESPONSIBILITIES` and
`DEFAULT_RESPONSIBILITIES_BY_ROLE`. `lib/nav-config.ts` imports `requiredResponsibility` from
access-config and uses only values from `RESPONSIBILITIES`. When adding nav items, use
`requiredResponsibility: "Projects"` (etc.) from the shared constant — never hardcode
responsibility strings in nav-config.

---

## References

- `lib/users.ts`, `lib/auth/rbac.ts`, `lib/user-management.ts`
- `components/dashboard-layout.tsx` (NAV_ENTRIES)
- `lib/dashboard-config.ts` (role_dashboard_pages, required_responsibility)
- ADR-005 (Persistence Strategy)

# Operations Implementation Review

Full review of the House of Veritas operations implementation: bugs, gaps, missed opportunities, and recommendations.

---

## Critical Bugs

### 1. Incidents: Data Source Mismatch (API vs Workflows)

**Problem:** Incidents API stores data in an **in-memory array**, while `incident-repeat-linkage` and `incident-hazard-walk` workflows use `getIncidents()` from **Baserow**. Incidents created via POST never reach Baserow, so repeat linkage and hazard walks never see them.

**Impact:** Repeat incident escalation, policy review triggers, and related workflows are ineffective for incidents created through the app.

**Fix:** Either:
- Add `createIncident` to Baserow and persist incidents there when Baserow is configured, or
- Migrate incidents API to use Baserow as the primary store when configured, with in-memory fallback for dev.

---

### 2. Onboarding Workflows Never Trigger

**Problem:** `onboarding-reference-check` and `onboarding-it-provision` listen for `employee.created` and `onboarding.checklist.progressed`. These events are **never emitted** by any API or workflow.

**Impact:** Reference verification and IT provisioning workflows are dead code.

**Fix:** Emit events when:
- `employee.created`: When a new employee is created (e.g. POST to employees API, DocuSeal completion, or Baserow automation).
- `onboarding.checklist.progressed`: When onboarding checklist items are completed (requires an API or webhook that updates checklist progress).

---

### 3. Asset Late Return Lockout Not Enforced

**Problem:** `asset-late-return-lockout` sets `lateReturnLockoutUntil` on overdue assets, but there is **no checkout API** that checks this flag. The assets API has GET only; checkout/checkin is not implemented.

**Impact:** Lockout is recorded but never enforced. Users can still check out assets (via whatever manual process exists) without the system blocking them.

**Fix:** Add asset checkout/checkin API (e.g. PATCH `/api/assets/[id]`) that:
- Rejects checkout when `lateReturnLockoutUntil` is in the future.
- Updates `checkedOutBy`, `expectedReturnDate`, `checkOutDate` on checkout.

---

### 4. Tasks PATCH: Overly Permissive Authorization

**Problem:** Tasks PATCH allows `admin`, `operator`, and `employee` to update **any** task. There is no check that the user owns the task or has project access.

**Impact:** Any employee can change another employee's tasks (status, assignee, etc.).

**Fix:** Restrict PATCH so that:
- Admins can update any task.
- Operators/employees can only update tasks assigned to them or in projects they belong to.

---

## Incomplete Functionality

### 5. Victim Support Path Not Handled

**Problem:** Incidents API accepts `victimSupportPath` and stores it, but the incident workflow does not use it. Per swimlane: "sensitive cases trigger optional direct route to external/arbiter review, bypassing normal admin channel."

**Impact:** Victim support incidents are treated like normal ones; no special routing or confidentiality handling.

**Fix:** Extend `incident.created` payload with `victimSupportPath`. When true:
- Route notification to external/HR contact (configurable) instead of or in addition to Hans.
- Use different notification wording (e.g. "Confidential incident – external review required").
- Optionally suppress or limit internal visibility.

---

### 6. Asset Checkout/Checkin Missing

**Problem:** Baserow Assets table has `checkedOutBy`, `expectedReturnDate`, `lateReturnLockoutUntil`, `checkOutDate`, and `updateAsset` exists, but there is no API for checkout/checkin. `/api/assets` is GET-only; `/api/assets/enhanced` uses a separate in-memory store.

**Impact:** Asset tracking and late-return lockout cannot be used through the app.

**Fix:** Add checkout/checkin to the Baserow-backed assets API (or a dedicated route) and enforce `lateReturnLockoutUntil` on checkout.

---

### 7. Incident Repeat Linkage: Field Name Mismatch

**Problem:** `incident-repeat-linkage` expects Baserow incidents with `dateTime` and `relatedIncidentIds`. The incidents API uses `date` and `time` (no `dateTime`). Baserow schema may use different field names.

**Impact:** If Baserow incidents use different fields, repeat linkage logic may fail or misbehave.

**Fix:** Confirm Baserow incident schema and align field names in `getIncidents` / `mapRowToIncident` and in the repeat-linkage workflow.

---

## Missed Opportunities

### 8. USE_INNGEST_APPROVALS Not Documented in .env.example

**Problem:** `USE_INNGEST_APPROVALS` controls expense and kiosk approval flow (Inngest vs inline notifications) but may not be in `.env.example`.

**Fix:** Add to `.env.example` with a short comment explaining its effect.

---

### 9. Expense Duplicate Notifications (Already Correct)

**Status:** Expenses correctly use either `emitApprovalRequired` or `routeToInngest` based on `USE_INNGEST_APPROVALS`; no duplicate notifications.

---

### 10. Overtime: Break Duration Not Considered

**Problem:** `overtime-calculate` uses `parseHours(clockIn, clockOut)` without subtracting break duration. Baserow `TimeClockEntry` has `breakDuration`.

**Impact:** Overtime may be overstated when breaks are taken.

**Fix:** Subtract `breakDuration` (e.g. in minutes) from total hours before comparing to `STANDARD_HOURS`.

---

### 11. Recurring Tasks: Assignee Notification (Already Fixed)

**Status:** Recurring tasks now notify the assignee via `BASEROW_ID_TO_APP_ID`; Hans still gets the weekly summary. No change needed.

---

### 12. routeToInngest Error Handling (Already Correct)

**Status:** `routeToInngest` has try/catch and logs errors; it does not throw and break the HTTP request.

---

## Documentation Gaps

### 13. Workflow Spec vs Implementation

**Problem:** `docs/02-architecture/10-workflow-specifications.md` lists many items as "Spec only" (e.g. Asset Check-In/Out, Repeat Incident Escalation). Several are now implemented (e.g. `incident-repeat-linkage`, `asset-late-return-lockout`).

**Fix:** Update the workflow spec to reflect current implementation status and remaining gaps.

---

### 14. Incident Workflow Spec Mismatch

**Problem:** Spec says "Repeat Incident Escalation" is "Spec only — requires incident type + date aggregation." Inngest `incident-repeat-linkage` implements this, but incidents API does not persist to Baserow.

**Fix:** Update spec and note the data-source mismatch as a blocker for full effectiveness.

---

## Summary of Recommended Fixes (Priority Order)

| Priority | Item | Effort |
|----------|------|--------|
| P0 | Persist incidents to Baserow (or unify data source) | Medium |
| P0 | Add asset checkout API with lockout enforcement | Medium |
| P1 | Emit `employee.created` and `onboarding.checklist.progressed` | Medium |
| P1 | Restrict tasks PATCH to assignee/project | Low |
| P1 | Handle victim support path in incident workflow | Low |
| P2 | Overtime: subtract break duration | Low |
| P2 | Add USE_INNGEST_APPROVALS to .env.example | Trivial |
| P2 | Update workflow spec documentation | Low |

---

## Architecture Notes

- **Dual asset systems:** `/api/assets` (Baserow) and `/api/assets/enhanced` (in-memory) serve different use cases. Consider consolidating or clearly documenting when each is used.
- **Event emission coverage:** Several workflows depend on events that are never emitted. A simple audit of `routeToInngest` / `inngest.send` calls vs. event-driven function triggers would surface similar gaps.
- **Baserow optional:** Many workflows return empty arrays when Baserow is not configured. This is acceptable for dev, but production should ensure Baserow is configured for operational workflows.

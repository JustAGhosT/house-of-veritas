# Employees vs Users

## Dashboard: Persona vs User

The layout receives `persona` = dashboard owner (user id from URL segment, e.g. `/dashboard/charl` → charl).
Nav items are driven by that user's **role** (admin, operator, employee, resident), not by persona id.
So persona = whose dashboard we're viewing; role = what nav they see. Dashboard config
(`role_dashboard_pages`) is keyed by role.

## Distinction

|              | Users                                  | Employees                                           |
| ------------ | -------------------------------------- | --------------------------------------------------- |
| **Source**   | `lib/users` + PostgreSQL               | Baserow (operational DB)                            |
| **Purpose**  | Platform access (login, roles, auth)   | HR/operational roster (payroll, tasks, time, leave) |
| **Used for** | Authentication, RBAC, dashboard access | Task assignment, time clock, expenses, vehicle logs |

## Overlap

For House of Veritas, the same people (hans, charl, lucky, irma) exist in both systems.
The link is via `getBaserowEmployeeIdByAppId(personaId)` (name matching).

## When to keep separate

- **Employees without Users:** Contractors, temps, external workers who don't need platform login
- **Users without Employees:** Admins or auditors who need access but aren't on the HR roster

## UI consolidation

Hans sees both "User Management" and "Employees" in nav. Consolidated into **Team** page with:

- **Platform Users** tab: Auth accounts, roles, onboarding, offboarding
- **HR Roster** tab: Baserow employees (payroll, leave, contracts)
- Link indicator where a user has a matching employee record

# Onboarding Flow

## Steps

1. **Invite** – Admin (Hans) sends invite from Team page; link sent via in-app, email, SMS.
2. **Invite link** – User clicks `/onboarding/invite?token=xxx` → session created → redirect to `/onboarding`.
3. **Confirm role** – User confirms assigned role (admin, operator, resident, employee).
4. **Confirm responsibilities** – User confirms understanding of responsibilities.
5. **Set password** – Optional: user can set a password for future logins (min 6 chars).
   Can skip and set later from profile dropdown.
6. **Guided tour** – User clicks "Start Guided Tour" → overlay on dashboard with steps;
   "Finish"/"Skip" completes onboarding.

## Completion

- `POST /api/users/me/onboard` marks onboarding as completed.
- User is redirected to their dashboard.

## Further Steps (Future)

- Profile photo upload
- Notification preferences
- Two-factor authentication setup

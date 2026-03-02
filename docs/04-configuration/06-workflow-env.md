# Workflow Environment Variables

Environment variables for Inngest workflow orchestration and related features.

## Inngest Approvals

| Variable                | Description                                                                                                                                 | Default |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `USE_INNGEST_APPROVALS` | When `"true"`, expense and kiosk approvals use Inngest workflows instead of realtime event store. Tasks and maintenance always use Inngest. | `false` |

Add to `.env.local` (copy from `.env.example`):

```bash
# Use Inngest for approval workflows (expense, kiosk)
USE_INNGEST_APPROVALS=true
```

When enabled:

- **Expenses:** `routeToInngest` sends `expense.created`; `emitApprovalRequired` is skipped
- **Kiosk:** `routeToInngest` sends `kiosk.request.submitted`; inline `notifyManager` is skipped

## DocuSeal Webhook

| Variable                  | Description                            | Default                |
| ------------------------- | -------------------------------------- | ---------------------- |
| `DOCUSEAL_WEBHOOK_SECRET` | Secret for validating webhook payloads | (required for prod)    |
| `DOCUSEAL_WEBHOOK_HEADER` | Header name for signature              | `X-DocuSeal-Signature` |

Configure DocuSeal to POST to `/api/webhooks/docuseal`.

## Inventory & Shopping Cron

| Variable                  | Description                                                             | Default                 |
| ------------------------- | ----------------------------------------------------------------------- | ----------------------- |
| `NEXT_PUBLIC_APP_URL`     | Base URL for inventory low-stock cron (self-fetch)                      | `http://localhost:3000` |
| `VERCEL_URL`              | Used when `NEXT_PUBLIC_APP_URL` not set (Vercel)                        | (auto on Vercel)        |
| `SHOPPING_LEADER_USER_ID` | User ID to notify for weekly shopping list (Mondays 8am)                | `REQUIRED`              |
| `REORDER_ALERT_RECIPIENT` | User ID to receive reorder automation alerts (low-stock cron)           | `hans`                  |
| `EXPENSE_APPROVER_ID`     | User ID to receive expense approval reminders (>48h pending, daily 9am) | `hans`                  |

Set `SHOPPING_LEADER_USER_ID` explicitly to a valid user ID in your environment; it has no safe default.

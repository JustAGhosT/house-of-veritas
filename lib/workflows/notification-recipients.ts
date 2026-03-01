/**
 * Config-driven notification recipients for workflows.
 * Use env vars to override defaults; avoids hardcoding user IDs.
 */

const DEFAULT_ADMIN = "hans"

/** User ID for low-stock / reorder alerts. REORDER_ALERT_RECIPIENT or LOW_STOCK_NOTIFY_USER_ID. */
export function getLowStockNotificationRecipient(): string {
  return (
    process.env.REORDER_ALERT_RECIPIENT ?? process.env.LOW_STOCK_NOTIFY_USER_ID ?? DEFAULT_ADMIN
  )
}

/** User ID for generic admin alerts (approvals, system alerts, etc.). */
export function getAdminNotificationRecipient(): string {
  return process.env.ADMIN_ALERT_RECIPIENT ?? DEFAULT_ADMIN
}

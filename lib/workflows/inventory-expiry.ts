import { inngest } from "@/lib/inngest/client"
import { getInventory } from "@/lib/inventory-store"
import { sendNotification } from "@/lib/services/notification-service"

const THRESHOLDS = { URGENT: 7, WARNING: 30, NOTICE: 60 }

function daysUntilExpiry(expiryDate: string | undefined): number | null {
  if (!expiryDate) return null
  try {
    const expiry = new Date(expiryDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    expiry.setHours(0, 0, 0, 0)
    return Math.ceil((expiry.getTime() - today.getTime()) / 86400000)
  } catch {
    return null
  }
}

function getAlertLevel(days: number): "URGENT" | "WARNING" | "NOTICE" | "OK" {
  if (days <= 0) return "URGENT"
  if (days <= THRESHOLDS.URGENT) return "URGENT"
  if (days <= THRESHOLDS.WARNING) return "WARNING"
  if (days <= THRESHOLDS.NOTICE) return "NOTICE"
  return "OK"
}

export const inventoryExpiryCheck = inngest.createFunction(
  { id: "inventory-expiry-check", retries: 2 },
  { cron: "0 7 * * *" },
  async () => {
    const items = getInventory().filter((i) => i.expiryDate)
    const alerts: Array<{ item: { id: string; name: string; expiryDate: string }; days: number; level: string }> = []

    for (const item of items) {
      const days = daysUntilExpiry(item.expiryDate)
      if (days === null) continue
      const level = getAlertLevel(days)
      if (level !== "OK") {
        alerts.push({
          item: { id: item.id, name: item.name, expiryDate: item.expiryDate! },
          days,
          level,
        })
      }
    }

    for (const alert of alerts) {
      await sendNotification({
        type: "system_alert",
        userId: "hans",
        title: `Stock Expiry ${alert.level}: ${alert.item.name}`,
        message:
          alert.days <= 0
            ? `${alert.item.name} has expired (${alert.item.expiryDate}). Remove or dispose.`
            : `${alert.item.name} expires in ${alert.days} days (${alert.item.expiryDate})`,
        channels: ["in_app"],
        data: { itemId: alert.item.id, level: alert.level, days: alert.days },
        priority: alert.level === "URGENT" ? "urgent" : "medium",
      })
    }

    if (alerts.length > 0) {
      await sendNotification({
        type: "system_alert",
        userId: "hans",
        title: `Stock Expiry Summary: ${alerts.length} items need attention`,
        message: `URGENT: ${alerts.filter((a) => a.level === "URGENT").length}, WARNING: ${alerts.filter((a) => a.level === "WARNING").length}, NOTICE: ${alerts.filter((a) => a.level === "NOTICE").length}`,
        channels: ["in_app"],
        data: { totalCount: alerts.length },
        priority: "medium",
      })
    }

    return { checked: items.length, alertsSent: alerts.length }
  }
)

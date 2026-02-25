import { inngest } from "@/lib/inngest/client"
import { sendNotification } from "@/lib/services/notification-service"

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL.replace(/^https?:\/\//, "")}`
    : "http://localhost:3000")

export const inventoryLowStockCron = inngest.createFunction(
  { id: "inventory-low-stock-cron", retries: 2 },
  { cron: "0 8 * * *" },
  async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/inventory?lowStock=true`)
      if (!res.ok) return { checked: 0, alertsSent: 0 }
      const data = await res.json()
      const alerts = data.alerts as Array<{
        id: string
        name: string
        currentStock: number
        reorderPoint: number
        urgency: string
      }>
      if (!alerts?.length) return { checked: 1, alertsSent: 0 }

      await sendNotification({
        type: "system_alert",
        userId: "hans",
        title: `Daily Inventory: ${alerts.length} low-stock items`,
        message: alerts
          .map((a) => `${a.name} (${a.currentStock}/${a.reorderPoint})`)
          .join("; "),
        channels: ["in_app"],
        data: { count: alerts.length },
        priority: "medium",
      })

      return { checked: 1, alertsSent: alerts.length }
    } catch {
      return { checked: 1, alertsSent: 0 }
    }
  }
)

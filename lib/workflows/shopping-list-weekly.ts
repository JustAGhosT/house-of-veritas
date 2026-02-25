import { inngest } from "@/lib/inngest/client"
import { sendNotification } from "@/lib/services/notification-service"

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL.replace(/^https?:\/\//, "")}`
    : "http://localhost:3000")

const SHOPPING_LEADER = process.env.SHOPPING_LEADER_USER_ID || "hans"

export const shoppingListWeekly = inngest.createFunction(
  { id: "shopping-list-weekly", retries: 2 },
  { cron: "0 8 * * 1" },
  async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/inventory?lowStock=true`)
      if (!res.ok) return { generated: false }
      const data = await res.json()
      const items = (data.alerts ?? data.items ?? []) as Array<{
        name?: string
        currentStock?: number
        reorderPoint?: number
      }>
      if (items.length === 0) return { generated: true, itemCount: 0 }

      const listPreview = items
        .slice(0, 5)
        .map((a: { name?: string; currentStock?: number; reorderPoint?: number }) =>
          a.name ? `${a.name} (${a.currentStock ?? 0}/${a.reorderPoint ?? 0})` : ""
        )
        .filter(Boolean)
        .join("; ")

      await sendNotification({
        type: "system_alert",
        userId: SHOPPING_LEADER,
        title: `Weekly Shopping List: ${items.length} items to restock`,
        message: listPreview + (items.length > 5 ? ` ... and ${items.length - 5} more` : ""),
        channels: ["in_app"],
        data: { itemCount: items.length },
        priority: "medium",
      })

      return { generated: true, itemCount: items.length }
    } catch {
      return { generated: false }
    }
  }
)

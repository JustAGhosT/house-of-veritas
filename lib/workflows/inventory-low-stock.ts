import { inngest } from "@/lib/inngest/client"
import { sendNotification } from "@/lib/services/notification-service"
import type { InventoryLowStockPayload } from "./schema"

function getNotifyUserId(category: string): string {
  if (
    ["garden_supplies"].includes(category) ||
    category.toLowerCase().includes("garden")
  ) {
    return "lucky"
  }
  return "charl"
}

export const inventoryLowStock = inngest.createFunction(
  { id: "inventory-low-stock", retries: 2 },
  { event: "house-of-veritas/inventory.low_stock" },
  async ({ event, step }) => {
    const payload = event.data as InventoryLowStockPayload
    const userId = getNotifyUserId(payload.category)
    await step.run("send-notification", async () => {
      await sendNotification({
      type: "system_alert",
      userId,
      title: `Low Stock: ${payload.name}`,
      message: `${payload.name} at ${payload.location} - ${payload.currentStock} ${payload.reorderPoint > 1 ? "units" : "unit"} left (reorder at ${payload.reorderPoint}). ${payload.urgency === "critical" ? "Critical - order soon." : ""}`,
      channels: ["in_app"],
      data: {
        itemId: payload.itemId,
        category: payload.category,
        currentStock: payload.currentStock,
        reorderPoint: payload.reorderPoint,
        urgency: payload.urgency,
      },
      priority: payload.urgency === "critical" ? "high" : "medium",
      })
    })
    return { notified: true, itemId: payload.itemId }
  }
)

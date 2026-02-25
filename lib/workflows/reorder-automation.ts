import { inngest } from "@/lib/inngest/client"
import { getInventory } from "@/lib/inventory-store"
import { getKioskStore } from "@/lib/db/kiosk-store"
import { sendNotification } from "@/lib/services/notification-service"

function hasPendingOrderForItem(
  pendingOrders: { data: Record<string, unknown> }[],
  itemName: string
): boolean {
  const lower = itemName.toLowerCase()
  return pendingOrders.some((o) => {
    const orderItem = (o.data?.itemName as string)?.toLowerCase() ?? ""
    return lower.includes(orderItem) || orderItem.includes(lower)
  })
}

export const reorderAutomation = inngest.createFunction(
  { id: "reorder-automation", retries: 2 },
  { cron: "0 10 * * *" },
  async () => {
    const items = getInventory().filter((i) => i.currentStock <= i.reorderPoint)
    if (items.length === 0) return { created: 0 }

    const { store } = await getKioskStore()
    const pendingOrders = await store.find({
      type: "stock_order",
      status: "pending",
    })

    const created: { itemName: string; quantity: number }[] = []

    for (const item of items) {
      if (hasPendingOrderForItem(pendingOrders, item.name)) continue

      const quantity = Math.max(
        item.reorderPoint - item.currentStock + 1,
        item.maxStock - item.currentStock,
        1
      )

      await store.insertOne({
        type: "stock_order",
        employeeId: "system",
        employeeName: "System (Reorder Automation)",
        data: {
          itemName: item.name,
          quantity,
          urgency: item.currentStock <= item.minStock ? "urgent" : "normal",
          notes: `Auto-created: low stock (${item.currentStock}/${item.reorderPoint})`,
        },
        timestamp: new Date().toISOString(),
        status: "pending",
      })

      created.push({ itemName: item.name, quantity })
    }

    if (created.length > 0) {
      await sendNotification({
        type: "system_alert",
        userId: "hans",
        title: `Reorder automation: ${created.length} stock order(s) created`,
        message: created.map((c) => `${c.itemName} (qty ${c.quantity})`).join("; "),
        channels: ["in_app"],
        data: { created },
        priority: "medium",
      })
    }

    return { created: created.length }
  }
)

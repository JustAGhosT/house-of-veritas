import { inngest } from "@/lib/inngest/client"
import { sendNotification } from "@/lib/services/notification-service"
import type { PurchaseOrderCreatedPayload } from "./schema"

export const purchaseOrderCreated = inngest.createFunction(
  { id: "purchase-order-created", retries: 2 },
  { event: "house-of-veritas/purchase_order.created" },
  async ({ event }) => {
    const { poId, vendor, amount, items, createdBy } =
      event.data as PurchaseOrderCreatedPayload

    await sendNotification({
      type: "system_alert",
      userId: "hans",
      title: `Purchase order created: ${vendor} (R${amount.toLocaleString()})`,
      message: `PO ${poId} by ${createdBy}. ${items ? `Items: ${items}` : ""}`,
      channels: ["in_app"],
      data: { poId, vendor, amount, createdBy },
      priority: "medium",
    })

    return { notified: true, poId }
  }
)

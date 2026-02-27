import { inngest } from "@/lib/inngest/client"
import { getAdminNotificationRecipient } from "@/lib/workflows/notification-recipients"
import { sendNotification } from "@/lib/services/notification-service"
import { formatCurrency, runNotificationStep } from "@/lib/workflows/utils"
import type { PurchaseOrderCreatedPayload } from "./schema"

export const purchaseOrderCreated = inngest.createFunction(
  { id: "purchase-order-created", retries: 2 },
  { event: "house-of-veritas/purchase_order.created" },
  async ({ event, step }) => {
    const { poId, vendor, amount, items, createdBy } =
      event.data as PurchaseOrderCreatedPayload

    await runNotificationStep(step, async () => {
      await sendNotification({
        type: "system_alert",
        userId: getAdminNotificationRecipient(),
        title: `Purchase order created: ${vendor} (${formatCurrency(amount)})`,
        message: `PO ${poId} by ${createdBy}. ${items ? `Items: ${items}` : ""}`,
        channels: ["in_app"],
        data: { poId, vendor, amount, createdBy },
        priority: "medium",
      })
    })

    return { notified: true, poId }
  }
)

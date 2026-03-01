import { inngest } from "@/lib/inngest/client"
import { sendNotification, type NotificationChannel } from "@/lib/services/notification-service"
import { getAdminNotificationRecipient } from "@/lib/workflows/notification-recipients"
import { formatCurrency, runNotificationStep } from "@/lib/workflows/utils"
import type { KioskRequestPayload } from "./schema"

const TYPE_LABELS: Record<string, string> = {
  stock_order: "Stock Order",
  salary_advance: "Salary Advance Request",
  issue_report: "Issue Report",
}

export const kioskRequestSubmitted = inngest.createFunction(
  { id: "kiosk-request-submitted", retries: 2 },
  { event: "house-of-veritas/kiosk.request.submitted" },
  async ({ event, step }) => {
    const request = event.data as KioskRequestPayload
    const d = request.data as Record<string, unknown>
    let description = ""
    if (request.type === "stock_order") {
      description = `${d.quantity}x ${d.itemName}`
    } else if (request.type === "salary_advance") {
      description = `${formatCurrency(Number(d.amount) || 0)} - ${d.reason}`
    } else if (request.type === "issue_report") {
      description = `${d.assetName} - ${d.issueType}`
    }

    const channels: NotificationChannel[] = ["in_app"]
    if (d.urgency === "urgent" || d.issueType === "safety") {
      channels.push("sms")
    }

    await runNotificationStep(step, async () => {
      await sendNotification({
        type: "approval_required",
        userId: getAdminNotificationRecipient(),
        title: `New ${TYPE_LABELS[request.type]}`,
        message: `${request.employeeName} submitted: ${description}`,
        channels,
        data: {
          requestType: request.type,
          requestId: request.requestId,
          submittedBy: request.employeeName,
          description,
        },
        priority: d.urgency === "urgent" || d.issueType === "safety" ? "urgent" : "medium",
      })
    })

    return { notified: true, requestId: request.requestId }
  }
)

import { inngest } from "@/lib/inngest/client"
import { sendNotification } from "@/lib/services/notification-service"
import { getAdminNotificationRecipient } from "@/lib/workflows/notification-recipients"
import { formatCurrency, runNotificationStep } from "@/lib/workflows/utils"
import type { PettyCashPayload } from "./schema"

export const pettyCashRequestSubmitted = inngest.createFunction(
  { id: "petty-cash-request-submitted", retries: 2 },
  { event: "house-of-veritas/petty.cash.request.submitted" },
  async ({ event, step }) => {
    const data = event.data as PettyCashPayload

    await runNotificationStep(step, async () => {
      await sendNotification({
        type: "approval_required",
        userId: getAdminNotificationRecipient(),
        title: "Petty Cash Request Pending Approval",
        message: `Employee ${data.requesterId} requested ${formatCurrency(data.amount ?? 0)} - ${data.purpose || ""}`,
        channels: ["in_app"],
        data: {
          pettyCashId: data.id,
          requesterId: data.requesterId,
          amount: data.amount,
          purpose: data.purpose,
        },
        priority: "medium",
      })
    })

    return { notified: true, pettyCashId: data.id }
  }
)

export const pettyCashPolicyViolation = inngest.createFunction(
  { id: "petty-cash-policy-violation", retries: 2 },
  { event: "house-of-veritas/petty.cash.policy.violation" },
  async ({ event, step }) => {
    const data = event.data as PettyCashPayload

    await runNotificationStep(step, async () => {
      await sendNotification({
        type: "system_alert",
        userId: getAdminNotificationRecipient(),
        title: "Petty Cash Policy Violation",
        message: `Employee ${data.requesterId} attempted ${formatCurrency(data.amount ?? 0)} - ${data.reason || "Policy violation"}`,
        channels: ["in_app"],
        data: {
          requesterId: data.requesterId,
          amount: data.amount,
          purpose: data.purpose,
          reason: data.reason,
        },
        priority: "high",
      })
    })

    return { notified: true }
  }
)

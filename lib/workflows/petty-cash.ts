import { inngest } from "@/lib/inngest/client"
import { sendNotification } from "@/lib/services/notification-service"
import type { PettyCashPayload } from "./schema"

export const pettyCashRequestSubmitted = inngest.createFunction(
  { id: "petty-cash-request-submitted", retries: 2 },
  { event: "house-of-veritas/petty.cash.request.submitted" },
  async ({ event }) => {
    const data = event.data as PettyCashPayload

    await sendNotification({
      type: "approval_required",
      userId: "hans",
      title: "Petty Cash Request Pending Approval",
      message: `Employee ${data.requesterId} requested R${data.amount?.toLocaleString()} - ${data.purpose || ""}`,
      channels: ["in_app"],
      data: {
        pettyCashId: data.id,
        requesterId: data.requesterId,
        amount: data.amount,
        purpose: data.purpose,
      },
      priority: "medium",
    })

    return { notified: true, pettyCashId: data.id }
  }
)

export const pettyCashPolicyViolation = inngest.createFunction(
  { id: "petty-cash-policy-violation", retries: 2 },
  { event: "house-of-veritas/petty.cash.policy.violation" },
  async ({ event }) => {
    const data = event.data as PettyCashPayload

    await sendNotification({
      type: "system_alert",
      userId: "hans",
      title: "Petty Cash Policy Violation",
      message: `Employee ${data.requesterId} attempted R${data.amount?.toLocaleString()} - ${data.reason || "Policy violation"}`,
      channels: ["in_app"],
      data: {
        requesterId: data.requesterId,
        amount: data.amount,
        purpose: data.purpose,
        reason: data.reason,
      },
      priority: "high",
    })

    return { notified: true }
  }
)

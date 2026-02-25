import { inngest } from "@/lib/inngest/client"
import { sendNotification } from "@/lib/services/notification-service"
import type { ContractorMilestonePayload } from "./schema"

export const contractorMilestoneCompleted = inngest.createFunction(
  { id: "contractor-milestone-completed", retries: 2 },
  { event: "house-of-veritas/contractor.milestone.completed" },
  async ({ event }) => {
    const { contractorName, project, stage, amount } =
      event.data as ContractorMilestonePayload

    await sendNotification({
      type: "system_alert",
      userId: "hans",
      title: `Contractor milestone: ${stage} - ${contractorName}`,
      message: `${project}: ${stage} completed (R${amount.toLocaleString()}). Review and process payment if applicable.`,
      channels: ["in_app"],
      data: { contractorName, project, stage, amount },
      priority: "medium",
    })

    return { notified: true }
  }
)

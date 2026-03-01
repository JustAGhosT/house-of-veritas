import { inngest } from "@/lib/inngest/client"
import { getAdminNotificationRecipient } from "@/lib/workflows/notification-recipients"
import { sendNotification } from "@/lib/services/notification-service"
import { formatCurrency, runNotificationStep } from "@/lib/workflows/utils"
import type { ContractorMilestonePayload } from "./schema"

export const contractorMilestoneCompleted = inngest.createFunction(
  { id: "contractor-milestone-completed", retries: 2 },
  { event: "house-of-veritas/contractor.milestone.completed" },
  async ({ event, step }) => {
    const { contractorName, project, stage, amount } = event.data as ContractorMilestonePayload

    await runNotificationStep(step, async () => {
      await sendNotification({
        type: "system_alert",
        userId: getAdminNotificationRecipient(),
        title: `Contractor milestone: ${stage} - ${contractorName}`,
        message: `${project}: ${stage} completed (${formatCurrency(amount)}). Review and process payment if applicable.`,
        channels: ["in_app"],
        data: { contractorName, project, stage, amount },
        priority: "medium",
      })
    })

    return { notified: true }
  }
)

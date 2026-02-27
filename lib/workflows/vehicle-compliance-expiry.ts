import { inngest } from "@/lib/inngest/client"
import { getAssets, createTask } from "@/lib/services/baserow"
import { sendNotification } from "@/lib/services/notification-service"
import { getAdminNotificationRecipient } from "@/lib/workflows/notification-recipients"
import { toISODateString } from "@/lib/utils"

export const vehicleComplianceExpiry = inngest.createFunction(
  { id: "vehicle-compliance-expiry", retries: 2 },
  { cron: "0 8 1 * *" },
  async ({ step }) => {
    const assets = await getAssets({ type: "Vehicle" })
    if (assets.length === 0) return { tasksCreated: 0 }

    const task = await createTask({
      title: "Vehicle Compliance Review - License, Roadworthy, Insurance",
      description: `Review expiry dates for ${assets.length} vehicle(s)`,
      priority: "High",
      status: "Not Started",
      dueDate: toISODateString(),
      project: "Vehicle",
    })

    if (task) {
      await step.run("send-notification", async () => {
        await sendNotification({
        type: "task_assigned",
        userId: getAdminNotificationRecipient(),
        title: "Vehicle Compliance Review Due",
        message: "Monthly vehicle license/roadworthy/insurance expiry check",
        channels: ["in_app"],
        data: { taskId: task.id },
        priority: "medium",
        })
      })
    }

    return { tasksCreated: task ? 1 : 0 }
  }
)

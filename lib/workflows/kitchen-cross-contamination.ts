import { inngest } from "@/lib/inngest/client"
import { sendNotification } from "@/lib/services/notification-service"
import { getAdminNotificationRecipient } from "@/lib/workflows/notification-recipients"

export const kitchenCrossContamination = inngest.createFunction(
  { id: "kitchen-cross-contamination", retries: 2 },
  { event: "house-of-veritas/kitchen.cross.contamination" },
  async ({ event, step }) => {
    const data = event.data as { taskId?: number; description?: string; location?: string }

    await step.run("send-notification", async () => {
      await sendNotification({
      type: "system_alert",
      userId: getAdminNotificationRecipient(),
      title: "Cross-Contamination Hazard Reported",
      message: `${data.location || "Kitchen"}: ${data.description || "Hazard reported"} - Priority action required`,
      channels: ["in_app", "sms"],
      data: { taskId: data.taskId },
      priority: "urgent",
      })
    })

    return { notified: true }
  }
)

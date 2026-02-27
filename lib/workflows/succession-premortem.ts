import { inngest } from "@/lib/inngest/client"
import { sendNotification } from "@/lib/services/notification-service"
import { getAdminNotificationRecipient } from "@/lib/workflows/notification-recipients"

export const successionPremortem = inngest.createFunction(
  { id: "succession-premortem", retries: 2 },
  { cron: "0 10 1 1,4,7,10 *" },
  async ({ step }) => {
    await step.run("send-notification", async () => {
      await sendNotification({
      type: "system_alert",
      userId: getAdminNotificationRecipient(),
      title: "Pre-Mortem Scenario Review",
      message: "Quarterly 'what if' review - walkthrough fallback role/access scenarios",
      channels: ["in_app"],
      data: { type: "premortem" },
      priority: "medium",
      })
    })

    return { notified: true }
  }
)

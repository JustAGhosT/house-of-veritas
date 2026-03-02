import { inngest } from "@/lib/inngest/client"
import { sendNotification } from "@/lib/services/notification-service"
import { getAdminNotificationRecipient } from "@/lib/workflows/notification-recipients"

export const feedbackRecap = inngest.createFunction(
  { id: "feedback-recap", retries: 2 },
  { cron: "0 10 1 1,4,7,10 *" },
  async ({ step }) => {
    await step.run("send-notification", async () => {
      await sendNotification({
        type: "system_alert",
        userId: getAdminNotificationRecipient(),
        title: "Quarterly Feedback Recap",
        message: "Review aggregated pain points for quarterly improvement or sprint sessions",
        channels: ["in_app"],
        data: { type: "feedback_recap" },
        priority: "medium",
      })
    })

    return { notified: true }
  }
)

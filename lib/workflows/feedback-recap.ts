import { inngest } from "@/lib/inngest/client"
import { sendNotification } from "@/lib/services/notification-service"

export const feedbackRecap = inngest.createFunction(
  { id: "feedback-recap", retries: 2 },
  { cron: "0 10 1 1,4,7,10 *" },
  async () => {
    await sendNotification({
      type: "system_alert",
      userId: "hans",
      title: "Quarterly Feedback Recap",
      message: "Review aggregated pain points for quarterly improvement or sprint sessions",
      channels: ["in_app"],
      data: { type: "feedback_recap" },
      priority: "medium",
    })

    return { notified: true }
  }
)

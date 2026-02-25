import { inngest } from "@/lib/inngest/client"
import { sendNotification } from "@/lib/services/notification-service"

export const successionPremortem = inngest.createFunction(
  { id: "succession-premortem", retries: 2 },
  { cron: "0 10 1 1,4,7,10 *" },
  async () => {
    await sendNotification({
      type: "system_alert",
      userId: "hans",
      title: "Pre-Mortem Scenario Review",
      message: "Quarterly 'what if' review - walkthrough fallback role/access scenarios",
      channels: ["in_app"],
      data: { type: "premortem" },
      priority: "medium",
    })

    return { notified: true }
  }
)

import { inngest } from "@/lib/inngest/client"
import { sendNotification } from "@/lib/services/notification-service"
import { getAdminNotificationRecipient } from "@/lib/workflows/notification-recipients"

export const successionLiveTest = inngest.createFunction(
  { id: "succession-live-test", retries: 2 },
  { event: "house-of-veritas/succession.live.test" },
  async ({ event, step }) => {
    const data = event.data as { successorId?: string; duration?: string }

    await step.run("send-notifications", async () => {
      await sendNotification({
      type: "system_alert",
      userId: data.successorId ?? getAdminNotificationRecipient(),
      title: "Live Succession/Role Transfer Test",
      message: `Dry-run initiated - use credentials/data for test window (${data.duration ?? "1 hour"})`,
      channels: ["in_app"],
      data: { type: "live_test" },
      priority: "high",
      })

      await sendNotification({
        type: "system_alert",
        userId: getAdminNotificationRecipient(),
        title: "Succession Live Test Started",
        message: `Successor ${data.successorId ?? "unknown"} - monitor test window`,
        channels: ["in_app"],
        data,
        priority: "medium",
      })
    })

    return { notified: true }
  }
)

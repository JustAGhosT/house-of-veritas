import { inngest } from "@/lib/inngest/client"
import { sendNotification } from "@/lib/services/notification-service"
import { getAdminNotificationRecipient } from "@/lib/workflows/notification-recipients"

export const onboardingReferenceCheck = inngest.createFunction(
  { id: "onboarding-reference-check", retries: 2 },
  { event: "house-of-veritas/employee.created" },
  async ({ event, step }) => {
    const data = event.data as { employeeId?: number; name?: string; email?: string }
    const employeeId = data?.employeeId
    if (!employeeId) return { skipped: true }

    const displayName = data?.name || `#${employeeId}`
    await step.run("send-notification", async () => {
      await sendNotification({
      type: "approval_required",
      userId: getAdminNotificationRecipient(),
      title: "Reference Verification Required",
      message: `New employee ${displayName} - please initiate reference/background check`,
      channels: ["in_app"],
      data: { employeeId },
      priority: "medium",
      })
    })

    return { notified: true, employeeId }
  }
)

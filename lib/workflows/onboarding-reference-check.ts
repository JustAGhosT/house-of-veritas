import { inngest } from "@/lib/inngest/client"
import { getEmployees } from "@/lib/services/baserow"
import { sendNotification } from "@/lib/services/notification-service"

export const onboardingReferenceCheck = inngest.createFunction(
  { id: "onboarding-reference-check", retries: 2 },
  { event: "house-of-veritas/employee.created" },
  async ({ event }) => {
    const data = event.data as { employeeId?: number }
    const employeeId = data?.employeeId
    if (!employeeId) return { skipped: true }

    await sendNotification({
      type: "approval_required",
      userId: "hans",
      title: "Reference Verification Required",
      message: `New employee ${employeeId} - please initiate reference/background check`,
      channels: ["in_app"],
      data: { employeeId },
      priority: "medium",
    })

    return { notified: true, employeeId }
  }
)

import { inngest } from "@/lib/inngest/client"
import {
  getOnboardingChecklists,
  updateOnboardingChecklist,
  updateEmployee,
} from "@/lib/services/baserow"
import { sendNotification } from "@/lib/services/notification-service"
import { toISODateString } from "@/lib/utils"

export const onboardingItProvision = inngest.createFunction(
  { id: "onboarding-it-provision", retries: 2 },
  { event: "house-of-veritas/onboarding.checklist.progressed" },
  async ({ event }) => {
    const data = event.data as { checklistId?: number; employeeId?: number }
    const checklistId = data?.checklistId
    const employeeId = data?.employeeId
    if (!checklistId && !employeeId) return { skipped: true }

    if (employeeId) {
      await updateEmployee(employeeId, {
        itProvisionedAt: toISODateString(),
      })
    }

    await sendNotification({
      type: "task_assigned",
      userId: "hans",
      title: "IT Provisioning Required",
      message: `Create accounts and equipment for new employee ${employeeId || "unknown"}`,
      channels: ["in_app"],
      data: { checklistId, employeeId },
      priority: "medium",
    })

    return { notified: true }
  }
)

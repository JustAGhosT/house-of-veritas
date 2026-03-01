import { inngest } from "@/lib/inngest/client"
import {
  getEmployees,
  getOnboardingChecklists,
  updateOnboardingChecklist,
} from "@/lib/services/baserow"
import { sendNotification } from "@/lib/services/notification-service"
import { toISODateString } from "@/lib/utils"
import { BASEROW_ID_TO_APP_ID } from "./constants"

const BUDDY_DURATION_DAYS = 14

export const onboardingBuddyAssign = inngest.createFunction(
  { id: "onboarding-buddy-assign", retries: 2 },
  { cron: "0 8 * * *" },
  async ({ step }) => {
    const employees = await getEmployees()
    const checklists = await getOnboardingChecklists({ status: "In Progress" })

    let assigned = 0
    for (const oc of checklists) {
      if (oc.assignedBuddy) continue

      const emp = employees.find((e) => e.id === oc.employee)
      if (!emp || emp.role !== "Employee") continue

      const buddies = employees.filter((e) => e.id !== emp.id && e.role === "Employee")
      if (buddies.length === 0) continue

      const buddy = buddies[0]
      await updateOnboardingChecklist(oc.id, { assignedBuddy: buddy.id })
      assigned++

      const buddyAppId = BASEROW_ID_TO_APP_ID[buddy.id] ?? "hans"
      await step.run(`notify-buddy-${oc.id}`, async () => {
        await sendNotification({
          type: "task_assigned",
          userId: buddyAppId,
          title: "Buddy Assignment",
          message: `You are assigned as buddy/mentor for ${emp.fullName} (${BUDDY_DURATION_DAYS} days)`,
          channels: ["in_app"],
          data: { employeeId: emp.id, buddyId: buddy.id },
          priority: "medium",
        })
      })
    }

    return { checklistsChecked: checklists.length, assigned }
  }
)

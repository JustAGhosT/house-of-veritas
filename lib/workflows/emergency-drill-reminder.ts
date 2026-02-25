import { inngest } from "@/lib/inngest/client"
import { getEmployees } from "@/lib/services/baserow"
import { sendNotification } from "@/lib/services/notification-service"
import { createTask } from "@/lib/services/baserow"
import { toISODateString } from "@/lib/utils"

const BASEROW_ID_TO_APP_ID: Record<number, string> = {
  1: "hans",
  2: "charl",
  3: "lucky",
  4: "irma",
}

function getQuarterStart(d: Date): Date {
  const q = Math.floor(d.getMonth() / 3) + 1
  return new Date(d.getFullYear(), (q - 1) * 3, 1)
}

export const emergencyDrillReminder = inngest.createFunction(
  { id: "emergency-drill-reminder", retries: 2 },
  { cron: "0 8 1 1,4,7,10 *" },
  async () => {
    const now = new Date()
    const quarterStart = getQuarterStart(now)
    const drillDate = new Date(quarterStart)
    drillDate.setDate(drillDate.getDate() + 7)
    const drillDateStr = toISODateString(drillDate)

    const task = await createTask({
      title: `Emergency Drill - Q${Math.floor(now.getMonth() / 3) + 1} ${now.getFullYear()}`,
      description: "Quarterly emergency drill. All staff must participate.",
      dueDate: drillDateStr,
      priority: "High",
      status: "Not Started",
      project: "Safety",
    })

    const employees = await getEmployees()
    const staff = employees.filter((e) => !["Resident"].includes(e.role))

    for (const emp of staff) {
      const appUserId = BASEROW_ID_TO_APP_ID[emp.id] ?? "hans"
      await sendNotification({
        type: "system_alert",
        userId: appUserId,
        title: "Emergency Drill Scheduled",
        message: `Quarterly emergency drill scheduled for ${drillDateStr}. Please confirm attendance.`,
        channels: ["in_app"],
        data: { drillDate: drillDateStr, taskId: task?.id },
        priority: "high",
      })
    }

    return { taskCreated: !!task, staffNotified: staff.length }
  }
)

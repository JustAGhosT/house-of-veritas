import { inngest } from "@/lib/inngest/client"
import { createTask, getEmployees } from "@/lib/services/baserow"
import { sendNotification } from "@/lib/services/notification-service"
import { toISODateString } from "@/lib/utils"

const BASEROW_ID_TO_APP_ID: Record<number, string> = {
  1: "hans",
  2: "charl",
  3: "lucky",
  4: "irma",
}

export const incidentHazardWalk = inngest.createFunction(
  { id: "incident-hazard-walk", retries: 2 },
  { cron: "0 8 * * 1" },
  async () => {
    const employees = await getEmployees()
    const assignees = employees.filter((e) => e.role === "Employee")
    const assignee = assignees[0]
    if (!assignee) return { created: 0 }

    const task = await createTask({
      title: "Scheduled Hazard Walk",
      description: "Proactive safety walk - detect and prevent incidents",
      assignedTo: assignee.id,
      priority: "Medium",
      status: "Not Started",
      dueDate: toISODateString(),
      project: "Safety",
    })

    if (task) {
      const appId = BASEROW_ID_TO_APP_ID[assignee.id] ?? "hans"
      await sendNotification({
        type: "task_assigned",
        userId: appId,
        title: "Hazard Walk Assigned",
        message: "Weekly safety walk - complete and log findings",
        channels: ["in_app"],
        data: { taskId: task.id },
        priority: "medium",
      })
    }

    return { created: task ? 1 : 0 }
  }
)

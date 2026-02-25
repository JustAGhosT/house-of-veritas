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

export const kitchenLockerAudit = inngest.createFunction(
  { id: "kitchen-locker-audit", retries: 2 },
  { cron: "0 8 1,15 * *" },
  async () => {
    const employees = await getEmployees()
    const toAssign = employees.filter((e) => e.role === "Employee" || e.role === "Resident")
    const assignee = toAssign[0]
    if (!assignee) return { created: 0 }

    const task = await createTask({
      title: "Kitchen Locker/Food Space Audit",
      description: "Scheduled audit - check for unclean/unauthorized storage",
      assignedTo: assignee.id,
      priority: "Medium",
      status: "Not Started",
      dueDate: toISODateString(),
      project: "Kitchen",
    })

    if (task) {
      const appId = BASEROW_ID_TO_APP_ID[assignee.id] ?? "hans"
      await sendNotification({
        type: "task_assigned",
        userId: appId,
        title: "Locker Audit Assigned",
        message: "Kitchen locker/food space audit due",
        channels: ["in_app"],
        data: { taskId: task.id },
        priority: "medium",
      })
    }

    return { created: task ? 1 : 0 }
  }
)

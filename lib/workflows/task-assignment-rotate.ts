import { inngest } from "@/lib/inngest/client"
import { getTasks, getEmployees } from "@/lib/services/baserow"
import { sendNotification } from "@/lib/services/notification-service"

const BASEROW_ID_TO_APP_ID: Record<number, string> = {
  1: "hans",
  2: "charl",
  3: "lucky",
  4: "irma",
}

export const taskAssignmentRotate = inngest.createFunction(
  { id: "task-assignment-rotate", retries: 2 },
  { cron: "0 6 * * 1" },
  async () => {
    const allTasks = await getTasks()
    const tasks = allTasks.filter((t) => t.status !== "Completed")
    const employees = await getEmployees()
    const employeeRole = employees.filter((e) => e.role === "Employee")

    const assignCount: Record<number, number> = {}
    for (const e of employeeRole) assignCount[e.id] = 0

    for (const t of tasks) {
      if (t.assignedTo) assignCount[t.assignedTo] = (assignCount[t.assignedTo] ?? 0) + 1
    }

    const minCount = Math.min(...employeeRole.map((e) => assignCount[e.id] ?? 0))
    const overloaded = tasks.filter(
      (t) => t.assignedTo && (assignCount[t.assignedTo] ?? 0) > minCount + 2
    )

    if (overloaded.length > 0) {
      await sendNotification({
        type: "system_alert",
        userId: "hans",
        title: "Task Load Imbalance",
        message: `${overloaded.length} employee(s) have significantly more tasks - consider rotation`,
        channels: ["in_app"],
        data: { overloadedCount: overloaded.length },
        priority: "low",
      })
    }

    return { tasksChecked: tasks.length, imbalanceAlerts: overloaded.length }
  }
)

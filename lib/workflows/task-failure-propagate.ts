import { inngest } from "@/lib/inngest/client"
import { getTasks } from "@/lib/services/baserow"
import { sendNotification } from "@/lib/services/notification-service"

export const taskFailurePropagate = inngest.createFunction(
  { id: "task-failure-propagate", retries: 2 },
  { cron: "0 8 * * *" },
  async () => {
    const allTasks = await getTasks()
    const tasks = allTasks.filter((t) => t.status !== "Completed")
    const overdue = tasks.filter((t) => {
      if (!t.dueDate) return false
      return new Date(t.dueDate) < new Date()
    })

    const criticalOverdue = overdue.filter((t) => t.priority === "High" || t.priority === "Urgent")

    if (criticalOverdue.length > 0) {
      await sendNotification({
        type: "system_alert",
        userId: "hans",
        title: "Critical Task Failure - Blocking Risk",
        message: `${criticalOverdue.length} critical/urgent task(s) overdue - may block dependent workflows`,
        channels: ["in_app"],
        data: {
          taskIds: criticalOverdue.map((t) => t.id),
          count: criticalOverdue.length,
        },
        priority: "urgent",
      })
    }

    return { overdueCount: overdue.length, criticalOverdue: criticalOverdue.length }
  }
)

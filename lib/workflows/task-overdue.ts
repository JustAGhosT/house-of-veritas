import { inngest } from "@/lib/inngest/client"
import { getTasks } from "@/lib/services/baserow"
import { sendNotification } from "@/lib/services/notification-service"
import { toISODateString } from "@/lib/utils"

const OVERDUE_DAYS = 3

export const taskOverdueCheck = inngest.createFunction(
  { id: "task-overdue-check", retries: 2 },
  { cron: "0 9 * * *" },
  async () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const cutoff = new Date(today)
    cutoff.setDate(cutoff.getDate() - OVERDUE_DAYS)
    const cutoffStr = toISODateString(cutoff)

    const tasks = await getTasks()
    const overdue = tasks.filter(
      (t) =>
        t.status !== "Completed" &&
        t.dueDate &&
        t.dueDate < cutoffStr
    )

    if (overdue.length > 0) {
      await sendNotification({
        type: "system_alert",
        userId: "hans",
        title: `Task Escalation: ${overdue.length} overdue tasks`,
        message: overdue
          .slice(0, 5)
          .map((t) => `${t.title} (due ${t.dueDate})`)
          .join("; ") + (overdue.length > 5 ? ` +${overdue.length - 5} more` : ""),
        channels: ["in_app"],
        data: {
          count: overdue.length,
          taskIds: overdue.map((t) => t.id),
        },
        priority: "high",
      })
    }

    return { tasksChecked: tasks.length, overdueCount: overdue.length }
  }
)

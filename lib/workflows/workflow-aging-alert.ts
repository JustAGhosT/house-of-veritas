import { inngest } from "@/lib/inngest/client"
import { getTasks } from "@/lib/services/baserow"
import { sendNotification } from "@/lib/services/notification-service"

const STALE_DAYS = 14

export const workflowAgingAlert = inngest.createFunction(
  { id: "workflow-aging-alert", retries: 2 },
  { cron: "0 9 * * 1" },
  async () => {
    const tasks = await getTasks()
    const now = new Date()
    const cutoff = new Date(now.getTime() - STALE_DAYS * 24 * 60 * 60 * 1000)

    const stale = tasks.filter((t) => {
      if (t.status === "Completed") return false
      const updated = t.createdDate || t.dueDate
      if (!updated) return true
      return new Date(updated) < cutoff
    })

    if (stale.length > 0) {
      await sendNotification({
        type: "system_alert",
        userId: "hans",
        title: "Workflow Aging Alert",
        message: `${stale.length} task(s) not updated in ${STALE_DAYS}+ days - review for dead processes`,
        channels: ["in_app"],
        data: { taskIds: stale.map((t) => t.id) },
        priority: "low",
      })
    }

    return { tasksChecked: tasks.length, staleCount: stale.length }
  }
)

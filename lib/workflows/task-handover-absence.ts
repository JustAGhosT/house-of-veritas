import { inngest } from "@/lib/inngest/client"
import { getTasks, getLeaveRequests } from "@/lib/services/baserow"
import { sendNotification } from "@/lib/services/notification-service"
import { toISODateString } from "@/lib/utils"

const BASEROW_ID_TO_APP_ID: Record<number, string> = {
  1: "hans",
  2: "charl",
  3: "lucky",
  4: "irma",
}

export const taskHandoverAbsence = inngest.createFunction(
  { id: "task-handover-absence", retries: 2 },
  { cron: "0 7 * * *" },
  async () => {
    const today = toISODateString()
    const leaveRequests = await getLeaveRequests({ status: "Approved" })
    const onLeave = new Set(
      leaveRequests
        .filter((r) => r.startDate <= today && r.endDate >= today)
        .map((r) => r.employee)
    )

    if (onLeave.size === 0) return { onLeave: 0, handovers: 0 }

    const allTasks = await getTasks()
    const tasks = allTasks.filter((t) => t.status !== "Completed")
    const tasksToHandover = tasks.filter(
      (t) => t.assignedTo && onLeave.has(t.assignedTo)
    )

    let handovers = 0
    for (const task of tasksToHandover) {
      const assigneeId = task.assignedTo!
      await sendNotification({
        type: "task_assigned",
        userId: "hans",
        title: "Task Handover - Employee on Leave",
        message: `Task "${task.title}" assigned to employee on leave - needs reassignment`,
        channels: ["in_app"],
        data: { taskId: task.id, assigneeId },
        priority: "high",
      })
      handovers++
    }

    return { onLeave: onLeave.size, handovers }
  }
)

import { inngest } from "@/lib/inngest/client"
import { sendNotification } from "@/lib/services/notification-service"
import type { TaskPayload } from "./schema"

const BASEROW_ID_TO_APP_ID: Record<number, string> = {
  1: "hans",
  2: "charl",
  3: "lucky",
  4: "irma",
}

export const taskCreated = inngest.createFunction(
  { id: "task-created", retries: 2 },
  { event: "house-of-veritas/task.created" },
  async ({ event }) => {
    const payload = event.data as TaskPayload
    const userId = payload.assigneeId
      ? BASEROW_ID_TO_APP_ID[payload.assigneeId] ?? "hans"
      : "hans"
    await sendNotification({
      type: "task_assigned",
      userId,
      title: "New Task Assigned",
      message: `${payload.title}${payload.assigneeEmail ? ` (assigned to you)` : ""}`,
      channels: ["in_app"],
      data: { taskId: payload.id },
      priority: "medium",
    })
    return { notified: true, taskId: payload.id }
  }
)

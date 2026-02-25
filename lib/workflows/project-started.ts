import { inngest } from "@/lib/inngest/client"
import { sendNotification } from "@/lib/services/notification-service"
import { createTask } from "@/lib/services/baserow"
import { toISODateString } from "@/lib/utils"
import type { ProjectStartedPayload } from "./schema"

export const projectStarted = inngest.createFunction(
  { id: "project-started", retries: 2 },
  { event: "house-of-veritas/project.started" },
  async ({ event }) => {
    const { projectId, name, type } = event.data as ProjectStartedPayload

    await sendNotification({
      type: "system_alert",
      userId: "hans",
      title: `Project started: ${name}`,
      message: `${type} project is now in progress. Kickoff tasks can be assigned.`,
      channels: ["in_app"],
      data: { projectId, name, type },
      priority: "medium",
    })

    const task = await createTask({
      title: `Kickoff: ${name}`,
      description: `Project ${name} has started. Assign contractor, schedule site visit, confirm materials.`,
      dueDate: toISODateString(new Date(Date.now() + 7 * 86400000)),
      priority: "Medium",
      status: "Not Started",
      assignedTo: 2,
      project: name,
    })

    return { notified: true, projectId, kickoffTaskId: task?.id }
  }
)

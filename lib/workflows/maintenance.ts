import { inngest } from "@/lib/inngest/client"
import { sendNotification } from "@/lib/services/notification-service"
import type { MaintenancePayload } from "./schema"

export const maintenanceScheduled = inngest.createFunction(
  { id: "maintenance-scheduled", retries: 2 },
  { event: "house-of-veritas/maintenance.scheduled" },
  async ({ event }) => {
    const payload = event.data as MaintenancePayload
    const userId = payload.assigneeId ?? "charl"
    await sendNotification({
      type: "task_assigned",
      userId,
      title: "Maintenance Scheduled",
      message: `Maintenance scheduled for ${payload.scheduledDate}`,
      channels: ["in_app"],
      data: { maintenanceId: payload.id },
      priority: "medium",
    })
    return { notified: true, maintenanceId: payload.id }
  }
)

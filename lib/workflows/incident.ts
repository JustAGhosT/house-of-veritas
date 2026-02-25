import { inngest } from "@/lib/inngest/client"
import { sendNotification } from "@/lib/services/notification-service"
import type { IncidentPayload } from "./schema"

export const incidentCreated = inngest.createFunction(
  { id: "incident-created", retries: 2 },
  { event: "house-of-veritas/incident.created" },
  async ({ event }) => {
    const payload = event.data as IncidentPayload
    const isHighOrCritical = ["High", "Critical"].includes(payload.severity)
    await sendNotification({
      type: "system_alert",
      userId: "hans",
      title: `Incident Reported${isHighOrCritical ? " (Urgent)" : ""}`,
      message: `Incident ${payload.id} - Severity: ${payload.severity}`,
      channels: isHighOrCritical ? ["in_app", "sms"] : ["in_app"],
      data: { incidentId: payload.id, severity: payload.severity },
      priority: isHighOrCritical ? "urgent" : "high",
    })
    return { notified: true, incidentId: payload.id }
  }
)

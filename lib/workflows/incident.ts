import { inngest } from "@/lib/inngest/client"
import { sendNotification } from "@/lib/services/notification-service"
import type { IncidentPayload } from "./schema"

const VICTIM_SUPPORT_USER = process.env.VICTIM_SUPPORT_CONTACT || "hans"

export const incidentCreated = inngest.createFunction(
  { id: "incident-created", retries: 2 },
  { event: "house-of-veritas/incident.created" },
  async ({ event }) => {
    const payload = event.data as IncidentPayload
    const isHighOrCritical = ["High", "Critical"].includes(payload.severity)
    const isVictimSupport = !!payload.victimSupportPath

    if (isVictimSupport) {
      await sendNotification({
        type: "system_alert",
        userId: VICTIM_SUPPORT_USER,
        title: "Confidential Incident – External/HR Review Required",
        message: `Incident ${payload.id} (Victim Support Path) – route to external arbiter, bypass normal admin channel`,
        channels: ["in_app", "sms"],
        data: {
          incidentId: payload.id,
          severity: payload.severity,
          victimSupportPath: true,
        },
        priority: "urgent",
      })
    }

    await sendNotification({
      type: "system_alert",
      userId: "hans",
      title: `Incident Reported${isHighOrCritical ? " (Urgent)" : ""}${isVictimSupport ? " [Victim Support Path]" : ""}`,
      message: `Incident ${payload.id} - Severity: ${payload.severity}${isVictimSupport ? " - Confidential routing active" : ""}`,
      channels: isHighOrCritical ? ["in_app", "sms"] : ["in_app"],
      data: { incidentId: payload.id, severity: payload.severity, victimSupportPath: isVictimSupport },
      priority: isHighOrCritical ? "urgent" : "high",
    })

    return { notified: true, incidentId: payload.id }
  }
)

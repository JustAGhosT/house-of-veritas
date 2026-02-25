import { inngest } from "@/lib/inngest/client"
import { getPPERecords, updatePPERecord } from "@/lib/services/baserow"
import { sendNotification } from "@/lib/services/notification-service"

const BASEROW_ID_TO_APP_ID: Record<number, string> = {
  1: "hans",
  2: "charl",
  3: "lucky",
  4: "irma",
}

const EXPIRY_WARNING_DAYS = 14

export const ppeExpiryReminder = inngest.createFunction(
  { id: "ppe-expiry-reminder", retries: 2 },
  { cron: "0 9 * * *" },
  async () => {
    const records = await getPPERecords({ status: "Issued" })
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const expiring: { id: number; issuedTo: number; expiryDate: string }[] = []
    const expired: { id: number; issuedTo: number }[] = []

    for (const r of records) {
      if (!r.expiryDate) continue

      const exp = new Date(r.expiryDate)
      exp.setHours(0, 0, 0, 0)
      const daysUntil = Math.floor((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntil < 0) {
        expired.push({ id: r.id, issuedTo: r.issuedTo })
        await updatePPERecord(r.id, { status: "Expired" })
      } else if (daysUntil <= EXPIRY_WARNING_DAYS) {
        expiring.push({ id: r.id, issuedTo: r.issuedTo, expiryDate: r.expiryDate })
      }
    }

    for (const e of expiring) {
      const appId = BASEROW_ID_TO_APP_ID[e.issuedTo] ?? "hans"
      await sendNotification({
        type: "system_alert",
        userId: appId,
        title: "PPE Expiry Reminder",
        message: `PPE expires on ${e.expiryDate} - renew or return`,
        channels: ["in_app"],
        data: { ppeId: e.id },
        priority: "medium",
      })
    }

    if (expired.length > 0) {
      await sendNotification({
        type: "system_alert",
        userId: "hans",
        title: "PPE Expired - Block Access",
        message: `${expired.length} PPE record(s) expired - block access until renewed`,
        channels: ["in_app"],
        data: { expiredIds: expired.map((e) => e.id) },
        priority: "high",
      })
    }

    return { expiringCount: expiring.length, expiredCount: expired.length }
  }
)

import { inngest } from "@/lib/inngest/client"
import { getDocumentExpiryRows } from "@/lib/services/baserow"
import { sendNotification } from "@/lib/services/notification-service"

const AGING_MONTHS = 12

export const documentAgingAlert = inngest.createFunction(
  { id: "document-aging-alert", retries: 2 },
  { cron: "0 8 1 * *" },
  async () => {
    const docs = await getDocumentExpiryRows()
    const now = new Date()

    const aging: { id: number; name?: string; lastReview?: string }[] = []

    for (const d of docs) {
      const lastReview = d["Last Review"]
      if (!lastReview) continue

      const last = new Date(lastReview)
      const monthsSince = (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24 * 30)
      if (monthsSince >= AGING_MONTHS) {
        aging.push({
          id: d.id,
          name: d["Doc Name"],
          lastReview,
        })
      }
    }

    if (aging.length > 0) {
      await sendNotification({
        type: "system_alert",
        userId: "hans",
        title: "Aging Documents - Mandatory Review",
        message: `${aging.length} document(s) not reviewed in ${AGING_MONTHS}+ months`,
        channels: ["in_app"],
        data: { docIds: aging.map((a) => a.id) },
        priority: "medium",
      })
    }

    return { docsChecked: docs.length, agingCount: aging.length }
  }
)

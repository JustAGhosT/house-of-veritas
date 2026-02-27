import { inngest } from "@/lib/inngest/client"
import { getDocumentExpiryRows } from "@/lib/services/baserow"
import { sendNotification } from "@/lib/services/notification-service"
import { getAdminNotificationRecipient } from "@/lib/workflows/notification-recipients"
import {
  daysUntil,
  getAlertLevel,
  buildSummaryMessage,
} from "@/lib/workflows/utils"
import type { DocumentExpiryRow } from "@/lib/services/baserow"

export const documentExpiryCheck = inngest.createFunction(
  { id: "document-expiry-check", retries: 2 },
  { cron: "0 6 * * *" },
  async ({ step }) => {
    const documents = await getDocumentExpiryRows()
    const alerts: Array<{
      doc: DocumentExpiryRow
      docName: string
      docType: string
      nextReview: string
      days: number
      level: "URGENT" | "WARNING" | "NOTICE"
    }> = []

    for (const doc of documents) {
      const nextReview = doc["Next Review"] ?? ""
      const days = daysUntil(nextReview || undefined, 999) ?? 999
      const level = getAlertLevel(days)
      if (level !== "OK") {
        alerts.push({
          doc,
          docName: doc["Doc Name"] ?? "Unknown",
          docType: doc["Type"] ?? "Unknown",
          nextReview,
          days,
          level,
        })
      }
    }

    await step.run("send-expiry-notifications", async () => {
      for (const alert of alerts) {
        await sendNotification({
        type: "document_expiry",
        userId: getAdminNotificationRecipient(),
        title: `Document Expiry ${alert.level}: ${alert.docName}`,
        message: `${alert.docName} (${alert.docType}) expires in ${alert.days} days. Next review: ${alert.nextReview}`,
        channels: ["in_app"],
        data: {
          documentId: alert.doc.id,
          level: alert.level,
          days: alert.days,
        },
        priority: alert.level === "URGENT" ? "urgent" : "medium",
        })
      }

      if (alerts.length > 0) {
        await sendNotification({
        type: "document_expiry",
        userId: getAdminNotificationRecipient(),
        title: `Document Expiry Summary: ${alerts.length} documents need attention`,
        message: buildSummaryMessage(alerts),
        channels: ["in_app"],
        data: { totalCount: alerts.length },
        priority: "medium",
        })
      }
    })

    return { checked: documents.length, alertsSent: alerts.length }
  }
)

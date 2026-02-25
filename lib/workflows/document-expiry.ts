import { inngest } from "@/lib/inngest/client"
import { getDocumentExpiryRows } from "@/lib/services/baserow"
import { sendNotification } from "@/lib/services/notification-service"
import type { DocumentExpiryRow } from "@/lib/services/baserow"

const THRESHOLDS = { URGENT: 7, WARNING: 30, NOTICE: 60 }

function daysUntilExpiry(nextReview: string | undefined): number {
  if (!nextReview) return 999
  try {
    const review = new Date(nextReview)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    review.setHours(0, 0, 0, 0)
    return Math.ceil((review.getTime() - today.getTime()) / 86400000)
  } catch {
    return 999
  }
}

function getAlertLevel(days: number): "URGENT" | "WARNING" | "NOTICE" | "OK" {
  if (days <= THRESHOLDS.URGENT) return "URGENT"
  if (days <= THRESHOLDS.WARNING) return "WARNING"
  if (days <= THRESHOLDS.NOTICE) return "NOTICE"
  return "OK"
}

export const documentExpiryCheck = inngest.createFunction(
  { id: "document-expiry-check", retries: 2 },
  { cron: "0 6 * * *" },
  async () => {
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
      const days = daysUntilExpiry(nextReview)
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

    for (const alert of alerts) {
      await sendNotification({
        type: "document_expiry",
        userId: "hans",
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
        userId: "hans",
        title: `Document Expiry Summary: ${alerts.length} documents need attention`,
        message: `URGENT: ${alerts.filter((a) => a.level === "URGENT").length}, WARNING: ${alerts.filter((a) => a.level === "WARNING").length}, NOTICE: ${alerts.filter((a) => a.level === "NOTICE").length}`,
        channels: ["in_app"],
        data: { totalCount: alerts.length },
        priority: "medium",
      })
    }

    return { checked: documents.length, alertsSent: alerts.length }
  }
)

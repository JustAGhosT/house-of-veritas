import { NextRequest, NextResponse } from "next/server"
import { getKioskStore, sanitizeKioskDoc, sanitizeKioskDocs, type KioskRequestDoc } from "@/lib/db/kiosk-store"
import { sendNotification, NotificationChannel } from "@/lib/services/notification-service"
import { withRole } from "@/lib/auth/rbac"
import { ObjectId } from "mongodb"
import { logger } from "@/lib/logger"

// Re-export for tests that may reference SEED_DATA
export { KIOSK_SEED_DATA as SEED_DATA } from "@/lib/db/kiosk-store"

async function notifyEmployee(
  request: KioskRequestDoc,
  status: "approved" | "rejected",
  notes?: string
) {
  const typeLabels: Record<string, string> = {
    stock_order: "Stock Order",
    salary_advance: "Salary Advance",
    issue_report: "Issue Report",
  }

  const title = `Request ${status === "approved" ? "Approved" : "Rejected"}`
  let message = `Your ${typeLabels[request.type]} request has been ${status}.`

  if (request.type === "stock_order") {
    message += ` Item: ${(request.data as { itemName?: string }).itemName}`
  } else if (request.type === "salary_advance") {
    message += ` Amount: R${(request.data as { amount?: number }).amount}`
  } else if (request.type === "issue_report") {
    message += ` Asset: ${(request.data as { assetName?: string }).assetName}`
  }

  if (notes) {
    message += ` Note: ${notes}`
  }

  const channels: NotificationChannel[] = ["sms", "in_app"]
  try {
    const results = await sendNotification({
      type: status === "approved" ? "expense_approved" : "expense_rejected",
      userId: request.employeeId,
      title,
      message,
      channels,
      data: {
        requestId: request._id?.toString(),
        requestType: request.type,
        status,
      },
      priority: "high",
    })
    logger.info("Notification sent", { employeeName: request.employeeName, results })
    return results
  } catch (error) {
    logger.error("Notification error", { error: error instanceof Error ? error.message : String(error) })
    return []
  }
}

async function notifyManager(request: KioskRequestDoc) {
  const typeLabels: Record<string, string> = {
    stock_order: "Stock Order",
    salary_advance: "Salary Advance Request",
    issue_report: "Issue Report",
  }

  let description = ""
  const d = request.data as Record<string, unknown>
  if (request.type === "stock_order") {
    description = `${d.quantity}x ${d.itemName}`
  } else if (request.type === "salary_advance") {
    description = `R${d.amount} - ${d.reason}`
  } else if (request.type === "issue_report") {
    description = `${d.assetName} - ${d.issueType}`
  }

  const channels: NotificationChannel[] = ["in_app"]
  if (d.urgency === "urgent" || d.issueType === "safety") {
    channels.push("sms")
  }

  try {
    await sendNotification({
      type: "approval_required",
      userId: "hans",
      title: `New ${typeLabels[request.type]}`,
      message: `${request.employeeName} submitted: ${description}`,
      channels,
      data: {
        requestType: request.type,
        submittedBy: request.employeeName,
        description,
      },
      priority: d.urgency === "urgent" || d.issueType === "safety" ? "urgent" : "medium",
    })
  } catch (error) {
    logger.error("Manager notification error", { error: error instanceof Error ? error.message : String(error) })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { store, mode } = await getKioskStore()
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get("employeeId")
    const type = searchParams.get("type")
    const status = searchParams.get("status")

    const query: Record<string, unknown> = {}
    if (employeeId) query.employeeId = employeeId
    if (type) query.type = type
    if (status) query.status = status

    const requests = await store.find(query)
    const allRequests = await store.find({})
    const summary = {
      total: allRequests.length,
      pending: allRequests.filter((r) => r.status === "pending").length,
      approved: allRequests.filter((r) => r.status === "approved").length,
      rejected: allRequests.filter((r) => r.status === "rejected").length,
      byType: {
        stock_order: allRequests.filter((r) => r.type === "stock_order").length,
        salary_advance: allRequests.filter((r) => r.type === "salary_advance").length,
        issue_report: allRequests.filter((r) => r.type === "issue_report").length,
      },
    }

    return NextResponse.json({
      success: true,
      requests: sanitizeKioskDocs(requests),
      summary,
      storage: mode,
    })
  } catch (error) {
    logger.error("GET kiosk requests error", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { success: false, error: "Failed to fetch requests" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { store, mode } = await getKioskStore()
    const body = await request.json()
    const { type, employeeId, employeeName, data, timestamp } = body

    if (!type || !employeeId || !data) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    const newRequest: Omit<KioskRequestDoc, "_id"> = {
      type,
      employeeId,
      employeeName: employeeName || employeeId,
      data,
      timestamp: timestamp || new Date().toISOString(),
      status: "pending",
    }

    const result = await store.insertOne(newRequest)
    const insertedRequest: KioskRequestDoc = {
      ...newRequest,
      _id: result.insertedId,
    }

    await notifyManager(insertedRequest)
    logger.info("Kiosk: New request", { type, employeeName: employeeName || employeeId, data })

    return NextResponse.json({
      success: true,
      request: sanitizeKioskDoc(insertedRequest),
      message: getSuccessMessage(type),
      storage: mode,
    })
  } catch (error) {
    logger.error("POST kiosk request error", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { success: false, error: "Failed to create request" },
      { status: 500 }
    )
  }
}

export const PATCH = withRole("admin")(async (request) => {
  try {
    const { store, mode } = await getKioskStore()
    const body = await request.json()
    const { requestId, status, reviewedBy, notes } = body

    if (!requestId || !status) {
      return NextResponse.json(
        { success: false, error: "Missing requestId or status" },
        { status: 400 }
      )
    }

    let objectId: ObjectId
    try {
      objectId = new ObjectId(requestId)
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid request ID format" },
        { status: 400 }
      )
    }

    const existingRequest = await store.findOne({ _id: objectId })
    if (!existingRequest) {
      return NextResponse.json(
        { success: false, error: "Request not found" },
        { status: 404 }
      )
    }

    const updateData = {
      status,
      reviewedBy,
      reviewedAt: new Date().toISOString(),
      notes,
    }

    await store.updateOne({ _id: objectId }, { $set: updateData })
    const updatedRequest = { ...existingRequest, ...updateData }

    if (status === "approved" || status === "rejected") {
      await notifyEmployee(updatedRequest, status, notes)
    }

    return NextResponse.json({
      success: true,
      request: sanitizeKioskDoc(updatedRequest),
      storage: mode,
    })
  } catch (error) {
    logger.error("PATCH kiosk request error", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { success: false, error: "Failed to update request" },
      { status: 500 }
    )
  }
})

function getSuccessMessage(type: string): string {
  switch (type) {
    case "stock_order":
      return "Stock order request submitted. Management will review and process your order."
    case "salary_advance":
      return "Salary advance request submitted. This requires approval from management."
    case "issue_report":
      return "Issue report submitted. Maintenance will be scheduled accordingly."
    default:
      return "Request submitted successfully."
  }
}

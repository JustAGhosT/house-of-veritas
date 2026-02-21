import { NextRequest, NextResponse } from "next/server"
import { getCollection, sanitizeDocument, sanitizeDocuments } from "@/lib/db/mongodb"
import { sendNotification, NotificationChannel } from "@/lib/services/notification-service"
import { ObjectId } from "mongodb"

// Kiosk Request Interface
interface KioskRequestDoc {
  _id?: ObjectId
  type: "stock_order" | "salary_advance" | "issue_report"
  employeeId: string
  employeeName: string
  data: Record<string, any>
  timestamp: string
  status: "pending" | "approved" | "rejected" | "completed"
  reviewedBy?: string
  reviewedAt?: string
  notes?: string
}

// Seed data for initial setup
const SEED_DATA: Omit<KioskRequestDoc, "_id">[] = [
  {
    type: "stock_order",
    employeeId: "lucky",
    employeeName: "Lucky",
    data: {
      itemName: "Fertilizer bags",
      quantity: 5,
      urgency: "normal",
      notes: "For the front garden beds",
    },
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    status: "approved",
    reviewedBy: "hans",
    reviewedAt: new Date(Date.now() - 43200000).toISOString(),
    notes: "Approved. Please order from Stodels.",
  },
  {
    type: "issue_report",
    employeeId: "charl",
    employeeName: "Charl",
    data: {
      assetName: "Workshop drill press",
      issueType: "maintenance",
      description: "Belt needs replacement, making squeaking noise",
      location: "Workshop",
    },
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    status: "pending",
  },
  {
    type: "salary_advance",
    employeeId: "lucky",
    employeeName: "Lucky",
    data: {
      amount: 1500,
      reason: "School fees for my daughter due this week",
      repaymentPlan: "2months",
    },
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    status: "pending",
  },
  {
    type: "stock_order",
    employeeId: "charl",
    employeeName: "Charl",
    data: {
      itemName: "WD-40 lubricant spray",
      quantity: 3,
      urgency: "urgent",
      notes: "Gate motor making grinding noises, need to lubricate urgently",
    },
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    status: "pending",
  },
  {
    type: "issue_report",
    employeeId: "irma",
    employeeName: "Irma",
    data: {
      assetName: "Kitchen dishwasher",
      issueType: "broken",
      description: "Not draining water properly, leaves puddles inside after cycle",
      location: "Main Kitchen",
    },
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    status: "pending",
  },
  {
    type: "issue_report",
    employeeId: "lucky",
    employeeName: "Lucky",
    data: {
      assetName: "Pool pump room door",
      issueType: "safety",
      description: "Door lock is broken, pool chemicals accessible to anyone",
      location: "Pool area",
    },
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    status: "pending",
  },
  {
    type: "salary_advance",
    employeeId: "charl",
    employeeName: "Charl",
    data: {
      amount: 800,
      reason: "Car repairs needed for commute",
      repaymentPlan: "1month",
    },
    timestamp: new Date(Date.now() - 259200000).toISOString(),
    status: "rejected",
    reviewedBy: "hans",
    reviewedAt: new Date(Date.now() - 172800000).toISOString(),
    notes: "Please resubmit with vehicle repair quote attached.",
  },
]

// Initialize collection with seed data if empty
async function initializeCollection() {
  try {
    const collection = await getCollection<KioskRequestDoc>("kiosk_requests")
    const count = await collection.countDocuments()
    
    if (count === 0) {
      console.log("[KioskRequests] Seeding initial data...")
      await collection.insertMany(SEED_DATA)
      console.log(`[KioskRequests] Seeded ${SEED_DATA.length} requests`)
    }
    
    return collection
  } catch (error) {
    console.error("[KioskRequests] Init error:", error)
    throw error
  }
}

// Send notification to employee about request status
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
    message += ` Item: ${request.data.itemName}`
  } else if (request.type === "salary_advance") {
    message += ` Amount: R${request.data.amount}`
  } else if (request.type === "issue_report") {
    message += ` Asset: ${request.data.assetName}`
  }

  if (notes) {
    message += ` Note: ${notes}`
  }

  // Send via SMS and in-app
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
    
    console.log(`[Notification] Sent to ${request.employeeName}:`, results)
    return results
  } catch (error) {
    console.error("[Notification] Error:", error)
    return []
  }
}

// Notify manager of new request
async function notifyManager(request: KioskRequestDoc) {
  const typeLabels: Record<string, string> = {
    stock_order: "Stock Order",
    salary_advance: "Salary Advance Request",
    issue_report: "Issue Report",
  }

  let description = ""
  if (request.type === "stock_order") {
    description = `${request.data.quantity}x ${request.data.itemName}`
  } else if (request.type === "salary_advance") {
    description = `R${request.data.amount} - ${request.data.reason}`
  } else if (request.type === "issue_report") {
    description = `${request.data.assetName} - ${request.data.issueType}`
  }

  const channels: NotificationChannel[] = ["in_app"]
  // Add SMS for urgent/safety items
  if (request.data.urgency === "urgent" || request.data.issueType === "safety") {
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
      priority: request.data.urgency === "urgent" || request.data.issueType === "safety" ? "urgent" : "medium",
    })
  } catch (error) {
    console.error("[Notification] Manager notification error:", error)
  }
}

// GET: Retrieve requests with optional filters
export async function GET(request: NextRequest) {
  try {
    const collection = await initializeCollection()
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get("employeeId")
    const type = searchParams.get("type")
    const status = searchParams.get("status")

    // Build query
    const query: Record<string, any> = {}
    if (employeeId) query.employeeId = employeeId
    if (type) query.type = type
    if (status) query.status = status

    // Fetch requests
    const requests = await collection
      .find(query)
      .sort({ timestamp: -1 })
      .toArray()

    // Get summary (from all data, not filtered)
    const allRequests = await collection.find({}).toArray()
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
      requests: sanitizeDocuments(requests),
      summary,
      storage: "mongodb",
    })
  } catch (error) {
    console.error("GET kiosk requests error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch requests" },
      { status: 500 }
    )
  }
}

// POST: Create a new request
export async function POST(request: NextRequest) {
  try {
    const collection = await initializeCollection()
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

    const result = await collection.insertOne(newRequest as KioskRequestDoc)
    
    const insertedRequest = {
      ...newRequest,
      _id: result.insertedId,
    }

    // Notify manager of new request
    await notifyManager(insertedRequest)

    console.log(`[Kiosk] New ${type} request from ${employeeName}:`, data)

    return NextResponse.json({
      success: true,
      request: sanitizeDocument(insertedRequest),
      message: getSuccessMessage(type),
      storage: "mongodb",
    })
  } catch (error) {
    console.error("POST kiosk request error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create request" },
      { status: 500 }
    )
  }
}

// PATCH: Update request status (approve/reject)
export async function PATCH(request: NextRequest) {
  try {
    const collection = await initializeCollection()
    const body = await request.json()
    const { requestId, status, reviewedBy, notes } = body

    if (!requestId || !status) {
      return NextResponse.json(
        { success: false, error: "Missing requestId or status" },
        { status: 400 }
      )
    }

    // Find the request
    let objectId: ObjectId
    try {
      objectId = new ObjectId(requestId)
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid request ID format" },
        { status: 400 }
      )
    }

    const existingRequest = await collection.findOne({ _id: objectId })
    if (!existingRequest) {
      return NextResponse.json(
        { success: false, error: "Request not found" },
        { status: 404 }
      )
    }

    // Update the request
    const updateData = {
      status,
      reviewedBy,
      reviewedAt: new Date().toISOString(),
      notes,
    }

    await collection.updateOne(
      { _id: objectId },
      { $set: updateData }
    )

    const updatedRequest = { ...existingRequest, ...updateData }

    // Send notification to employee
    if (status === "approved" || status === "rejected") {
      await notifyEmployee(updatedRequest, status, notes)
    }

    return NextResponse.json({
      success: true,
      request: sanitizeDocument(updatedRequest),
      storage: "mongodb",
    })
  } catch (error) {
    console.error("PATCH kiosk request error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update request" },
      { status: 500 }
    )
  }
}

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

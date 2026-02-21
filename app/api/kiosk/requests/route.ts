import { NextRequest, NextResponse } from "next/server"

// In-memory storage for kiosk requests (in production, use a database)
interface KioskRequest {
  id: string
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

// Mock database with more seed data
const requests: KioskRequest[] = [
  {
    id: "req-001",
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
    id: "req-002",
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
    id: "req-003",
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
    id: "req-004",
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
    id: "req-005",
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
    id: "req-006",
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
    id: "req-007",
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

// GET: Retrieve requests with optional filters
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const employeeId = searchParams.get("employeeId")
  const type = searchParams.get("type")
  const status = searchParams.get("status")

  let filteredRequests = [...requests]

  if (employeeId) {
    filteredRequests = filteredRequests.filter((r) => r.employeeId === employeeId)
  }
  if (type) {
    filteredRequests = filteredRequests.filter((r) => r.type === type)
  }
  if (status) {
    filteredRequests = filteredRequests.filter((r) => r.status === status)
  }

  // Sort by timestamp descending
  filteredRequests.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  // Summary counts
  const summary = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    byType: {
      stock_order: requests.filter((r) => r.type === "stock_order").length,
      salary_advance: requests.filter((r) => r.type === "salary_advance").length,
      issue_report: requests.filter((r) => r.type === "issue_report").length,
    },
  }

  return NextResponse.json({
    success: true,
    requests: filteredRequests,
    summary,
  })
}

// POST: Create a new request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, employeeId, employeeName, data, timestamp } = body

    if (!type || !employeeId || !data) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    const newRequest: KioskRequest = {
      id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      employeeId,
      employeeName: employeeName || employeeId,
      data,
      timestamp: timestamp || new Date().toISOString(),
      status: "pending",
    }

    requests.unshift(newRequest)

    // In production, send notification to manager
    console.log(`[Kiosk] New ${type} request from ${employeeName}:`, data)

    return NextResponse.json({
      success: true,
      request: newRequest,
      message: getSuccessMessage(type),
    })
  } catch (error) {
    console.error("Kiosk request error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create request" },
      { status: 500 }
    )
  }
}

// PATCH: Update request status (approve/reject)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { requestId, status, reviewedBy, notes } = body

    if (!requestId || !status) {
      return NextResponse.json(
        { success: false, error: "Missing requestId or status" },
        { status: 400 }
      )
    }

    const requestIndex = requests.findIndex((r) => r.id === requestId)
    if (requestIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Request not found" },
        { status: 404 }
      )
    }

    requests[requestIndex] = {
      ...requests[requestIndex],
      status,
      reviewedBy,
      reviewedAt: new Date().toISOString(),
      notes,
    }

    return NextResponse.json({
      success: true,
      request: requests[requestIndex],
    })
  } catch (error) {
    console.error("Kiosk request update error:", error)
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

import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"
import {
  eventStore,
  emitTaskEvent,
  emitExpenseEvent,
  emitClockEvent,
  emitNotification,
  emitApprovalRequired,
  emitSystemAlert,
} from "@/lib/realtime/event-store"

// POST - Emit a new event
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, data, userId } = body

    if (!type || !data) {
      return NextResponse.json({ error: "Type and data are required" }, { status: 400 })
    }

    let event

    switch (type) {
      case "task_created":
      case "task_updated":
      case "task_completed":
        event = emitTaskEvent(type, data, userId)
        break
      case "expense_created":
      case "expense_approved":
      case "expense_rejected":
        event = emitExpenseEvent(type, data, userId)
        break
      case "clock_in":
      case "clock_out":
        event = emitClockEvent(type, data, userId)
        break
      case "notification":
        event = emitNotification(data, userId)
        break
      case "approval_required":
        event = emitApprovalRequired(data, userId || "hans")
        break
      case "system_alert":
        event = emitSystemAlert(data)
        break
      default:
        event = eventStore.addEvent({ type, data, userId })
    }

    return NextResponse.json({
      success: true,
      event,
    })
  } catch (error) {
    logger.error("Error emitting event", {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: "Failed to emit event" }, { status: 500 })
  }
}

// GET - Get recent events
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  const count = parseInt(searchParams.get("count") || "20")

  const events = userId
    ? eventStore.getEventsForUser(userId, count)
    : eventStore.getRecentEvents(count)

  return NextResponse.json({
    events,
    count: events.length,
  })
}

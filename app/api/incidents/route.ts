import { NextResponse } from "next/server"
import { withRole } from "@/lib/auth/rbac"
import { routeToInngest } from "@/lib/workflows"
import { logger } from "@/lib/logger"

interface Incident {
  id: number
  date: string
  time: string
  type: string
  location: string
  reporter: string
  severity: "Low" | "Medium" | "High" | "Critical"
  status: string
  description: string
  actions?: string | null
  witnesses?: string | null
  followUpRequired?: boolean
}

let incidents: Incident[] = [
    {
      id: 1,
      date: "2025-01-18",
      time: "14:30",
      type: "Safety",
      location: "Workshop",
      reporter: "Charl",
      severity: "Low",
      status: "Resolved",
      description: "Minor cut on hand while handling metal sheet",
      actions: "First aid administered, reminded about safety gloves",
      witnesses: "Lucky",
      followUpRequired: false,
    },
    {
      id: 2,
      date: "2025-01-15",
      time: "09:15",
      type: "Equipment",
      location: "Garden",
      reporter: "Lucky",
      severity: "Medium",
      status: "In Progress",
      description: "Lawnmower blade damaged, requires replacement",
      actions: "Replacement blade ordered, temporary use of backup mower",
      witnesses: null,
      followUpRequired: true,
    },
    {
      id: 3,
      date: "2025-01-10",
      time: "16:45",
      type: "Vehicle",
      location: "Driveway",
      reporter: "Hans",
      severity: "Low",
      status: "Resolved",
      description: "Vehicle reverse sensor malfunction",
      actions: "Sensor replaced under warranty",
      witnesses: "Charl",
      followUpRequired: false,
    },
    {
      id: 4,
      date: "2025-01-20",
      time: "11:00",
      type: "Household",
      location: "Kitchen",
      reporter: "Irma",
      severity: "Low",
      status: "Pending",
      description: "Refrigerator making unusual noise",
      actions: "Technician appointment scheduled for Jan 25",
      witnesses: null,
      followUpRequired: true,
    },
  ]

export async function GET() {
  const summary = {
    total: incidents.length,
    resolved: incidents.filter((i) => i.status === "Resolved").length,
    inProgress: incidents.filter((i) => i.status === "In Progress").length,
    pending: incidents.filter((i) => i.status === "Pending").length,
    bySeverity: {
      High: 0,
      Medium: incidents.filter((i) => i.severity === "Medium").length,
      Low: incidents.filter((i) => i.severity === "Low").length,
    },
    byType: {
      Safety: incidents.filter((i) => i.type === "Safety").length,
      Equipment: incidents.filter((i) => i.type === "Equipment").length,
      Vehicle: incidents.filter((i) => i.type === "Vehicle").length,
      Household: incidents.filter((i) => i.type === "Household").length,
    },
  }

  return NextResponse.json({ incidents, summary })
}

export const POST = withRole("admin", "operator", "employee", "resident")(
  async (request) => {
    try {
      const body = await request.json()
      const { type, location, severity, description, reporter } = body
      const userId = request.headers.get("x-user-id") || "unknown"

      if (!type || !location || !severity || !description) {
        return NextResponse.json(
          { error: "type, location, severity, and description are required" },
          { status: 400 }
        )
      }

      const validSeverity = ["Low", "Medium", "High", "Critical"]
      if (!validSeverity.includes(severity)) {
        return NextResponse.json(
          { error: `severity must be one of: ${validSeverity.join(", ")}` },
          { status: 400 }
        )
      }

      const now = new Date()
      const id = incidents.length + 1
      const newIncident: Incident = {
        id,
        date: now.toISOString().split("T")[0],
        time: now.toTimeString().slice(0, 5),
        type,
        location,
        reporter: reporter || userId,
        severity,
        status: "Pending",
        description,
        actions: null,
        witnesses: null,
        followUpRequired: severity === "High" || severity === "Critical",
      }
      incidents.push(newIncident)

      await routeToInngest({
        name: "house-of-veritas/incident.created",
        data: {
          id: String(id),
          severity: newIncident.severity,
        },
      })

      return NextResponse.json({ incident: newIncident })
    } catch (error) {
      logger.error("POST incident error", {
        error: error instanceof Error ? error.message : String(error),
      })
      return NextResponse.json(
        { error: "Failed to create incident" },
        { status: 500 }
      )
    }
  }
)

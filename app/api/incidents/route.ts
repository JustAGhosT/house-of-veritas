import { withRole } from "@/lib/auth/rbac"
import { logger } from "@/lib/logger"
import type { Incident } from "@/lib/services/baserow"
import {
  createIncident,
  getBaserowEmployeeIdByAppId,
  getEmployee,
  getIncidents,
  isIncidentsTableConfigured,
} from "@/lib/services/baserow"
import { routeToInngest } from "@/lib/workflows"
import { NextResponse } from "next/server"

const SEED_INCIDENTS: ReadonlyArray<Readonly<Incident & { reporterName?: string }>> = Object.freeze([
  {
    id: 1,
    dateTime: "2025-01-18T14:30:00",
    type: "Safety",
    location: "Workshop",
    reporter: 2,
    severity: "Low",
    status: "Resolved",
    description: "Minor cut on hand while handling metal sheet",
    relatedIncidentIds: undefined,
    victimSupportPath: false,
  },
  {
    id: 2,
    dateTime: "2025-01-15T09:15:00",
    type: "Equipment",
    location: "Garden",
    reporter: 3,
    severity: "Medium",
    status: "In Progress",
    description: "Lawnmower blade damaged, requires replacement",
    relatedIncidentIds: undefined,
    victimSupportPath: false,
  },
  {
    id: 3,
    dateTime: "2025-01-10T16:45:00",
    type: "Vehicle",
    location: "Driveway",
    reporter: 1,
    severity: "Low",
    status: "Resolved",
    description: "Vehicle reverse sensor malfunction",
    relatedIncidentIds: undefined,
    victimSupportPath: false,
  },
  {
    id: 4,
    dateTime: "2025-01-20T11:00:00",
    type: "Household",
    location: "Kitchen",
    reporter: 4,
    severity: "Low",
    status: "Reported",
    description: "Refrigerator making unusual noise",
    relatedIncidentIds: undefined,
    victimSupportPath: false,
  },
].map(obj => Object.freeze(obj)))

// NOTE: This in-memory store is NON-PERSISTENT and not shared across serverless invocations.
// It is intended for local development and demo purposes only. In production, use Baserow.
// The GET/POST handlers will prefer Baserow when isIncidentsTableConfigured() returns true.
const inMemoryIncidents: Incident[] = []

// Module-level ID counter for seed mode to avoid duplicate IDs under concurrent requests.
// Initialized to max existing ID + 1 to avoid collisions with SEED_INCIDENTS.
let incidentsIdCounter = Math.max(...SEED_INCIDENTS.map(i => i.id), 0) + 1

function getIncidentsData(): Incident[] {
  return [...SEED_INCIDENTS, ...inMemoryIncidents]
}

function formatIncidentForApi(incident: Incident & { reporterName?: string }) {
  const [datePart, timePart] = (incident.dateTime || "").split("T")
  const time = timePart ? timePart.slice(0, 5) : ""
  return {
    id: incident.id,
    date: datePart || "",
    time,
    type: incident.type,
    location: incident.location || "",
    reporter: incident.reporterName ?? String(incident.reporter ?? ""),
    severity: incident.severity,
    status: incident.status,
    description: incident.description,
    actions: null as string | null,
    witnesses: null as string | null,
    followUpRequired: ["High", "Critical"].includes(incident.severity),
    victimSupportPath: !!incident.victimSupportPath,
  }
}

async function loadIncidentsWithNames(incidents: Incident[]) {
  const result = []
  for (const i of incidents) {
    const reporterName = i.reporter ? (await getEmployee(i.reporter))?.fullName : undefined
    result.push(formatIncidentForApi({ ...i, reporterName }))
  }
  return result
}

export const GET = withRole("admin", "operator", "employee", "resident")(
  async () => {
    try {
      const useBaserow = isIncidentsTableConfigured()

      let incidents: Awaited<ReturnType<typeof loadIncidentsWithNames>>
      if (useBaserow) {
        const baserowIncidents = await getIncidents()
        incidents = await loadIncidentsWithNames(baserowIncidents)
      } else {
        incidents = await loadIncidentsWithNames(getIncidentsData())
      }

      const summary = {
        total: incidents.length,
        resolved: incidents.filter((i) => i.status === "Resolved").length,
        inProgress: incidents.filter((i) => i.status === "In Progress").length,
        pending: incidents.filter((i) => i.status === "Pending" || i.status === "Reported").length,
        bySeverity: {
          High: incidents.filter((i) => i.severity === "High").length,
          Medium: incidents.filter((i) => i.severity === "Medium").length,
          Low: incidents.filter((i) => i.severity === "Low").length,
          Critical: incidents.filter((i) => i.severity === "Critical").length,
        },
        byType: {} as Record<string, number>,
      }
      for (const i of incidents) {
        summary.byType[i.type] = (summary.byType[i.type] || 0) + 1
      }

      return NextResponse.json({ incidents, summary })
    } catch (error) {
      logger.error("GET incidents error", {
        error: error instanceof Error ? error.message : String(error),
      })
      return NextResponse.json({ error: "Failed to fetch incidents" }, { status: 500 })
    }
  }
)

export const POST = withRole("admin", "operator", "employee", "resident")(
  async (request) => {
    try {
      const body = await request.json()
      const { type, location, severity, description, reporter, victimSupportPath } = body
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

      const severityValue = severity as Incident["severity"]
      const now = new Date()
      const dateTime = now.toISOString().slice(0, 19)
      const reporterId =
        (await getBaserowEmployeeIdByAppId(reporter || userId)) ?? undefined

      const useBaserow = isIncidentsTableConfigured()

      let newIncident: { id: number; severity: Incident["severity"]; victimSupportPath: boolean }
      let apiIncident: ReturnType<typeof formatIncidentForApi>

      if (useBaserow) {
        const created = await createIncident({
          type,
          dateTime,
          location,
          reporter: reporterId,
          description,
          severity: severityValue,
          status: "Reported",
          victimSupportPath: !!victimSupportPath,
        })
        if (!created) {
          return NextResponse.json(
            { error: "Failed to create incident" },
            { status: 500 }
          )
        }
        newIncident = {
          id: created.id,
          severity: created.severity,
          victimSupportPath: !!created.victimSupportPath,
        }
        const reporterName = created.reporter
          ? (await getEmployee(created.reporter))?.fullName
          : undefined
        apiIncident = formatIncidentForApi({ ...created, reporterName })
      } else {
        const id = incidentsIdCounter++
        newIncident = {
          id,
          severity: severityValue,
          victimSupportPath: !!victimSupportPath,
        }
        const inMemory: Incident = {
          id,
          type,
          dateTime,
          location: location || "",
          reporter: reporterId,
          description,
          severity: severityValue,
          status: "Reported",
          victimSupportPath: !!victimSupportPath,
        }
        inMemoryIncidents.push(inMemory)
        apiIncident = formatIncidentForApi(inMemory)
      }

      await routeToInngest({
        name: "house-of-veritas/incident.created",
        data: {
          id: String(newIncident.id),
          severity: newIncident.severity,
          victimSupportPath: newIncident.victimSupportPath,
        },
      })

      return NextResponse.json({ incident: apiIncident })
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

import { NextResponse } from "next/server"
import { getVehicleLogs, getBaserowEmployeeIdByAppId } from "@/lib/services/baserow"
import { withDataSource } from "@/lib/api/response"
import { logger } from "@/lib/logger"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const driverParam = searchParams.get("driver")
  const personaId = searchParams.get("personaId")

  let driver: number | undefined
  if (driverParam) {
    driver = parseInt(driverParam, 10)
    if (Number.isNaN(driver)) driver = undefined
  } else if (personaId) {
    driver = (await getBaserowEmployeeIdByAppId(personaId)) ?? undefined
  }

  try {
    const logs = await getVehicleLogs({
      driver,
    })

    // Calculate summary
    const summary = {
      total: logs.length,
      activeTrips: logs.filter((l) => !l.dateIn).length,
      completedTrips: logs.filter((l) => l.dateIn).length,
      totalDistance: logs.reduce((sum, l) => sum + (l.distance || 0), 0),
      totalFuelCost: logs.reduce((sum, l) => sum + (l.fuelCost || 0), 0),
    }

    return withDataSource({ logs, summary })
  } catch (error) {
    logger.error("Error fetching vehicle logs", {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: "Failed to fetch vehicle logs" }, { status: 500 })
  }
}

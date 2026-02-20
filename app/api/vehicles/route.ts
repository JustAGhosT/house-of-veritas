import { NextResponse } from 'next/server'
import { getVehicleLogs, isBaserowConfigured } from '@/lib/services/baserow'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const driver = searchParams.get('driver')

  try {
    const logs = await getVehicleLogs({
      driver: driver ? parseInt(driver) : undefined,
    })

    // Calculate summary
    const summary = {
      total: logs.length,
      activeTrips: logs.filter((l) => !l.dateIn).length,
      completedTrips: logs.filter((l) => l.dateIn).length,
      totalDistance: logs.reduce((sum, l) => sum + (l.distance || 0), 0),
      totalFuelCost: logs.reduce((sum, l) => sum + (l.fuelCost || 0), 0),
    }

    return NextResponse.json({
      logs,
      summary,
      configured: isBaserowConfigured(),
      message: isBaserowConfigured()
        ? "Connected to Baserow"
        : "Using mock data - Baserow not configured",
    })
  } catch (error) {
    console.error('Error fetching vehicle logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vehicle logs' },
      { status: 500 }
    )
  }
}

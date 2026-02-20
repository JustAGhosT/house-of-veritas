import { NextResponse } from 'next/server'
import { getAssets, isBaserowConfigured } from '@/lib/services/baserow'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const location = searchParams.get('location')

  try {
    const assets = await getAssets({
      type: type || undefined,
      location: location || undefined,
    })

    const summary = {
      total: assets.length,
      byType: {
        tool: assets.filter((a) => a.type === 'Tool').length,
        vehicle: assets.filter((a) => a.type === 'Vehicle').length,
        equipment: assets.filter((a) => a.type === 'Equipment').length,
        household: assets.filter((a) => a.type === 'Household').length,
      },
      checkedOut: assets.filter((a) => a.checkedOutBy).length,
      available: assets.filter((a) => !a.checkedOutBy).length,
      byCondition: {
        excellent: assets.filter((a) => a.condition === 'Excellent').length,
        good: assets.filter((a) => a.condition === 'Good').length,
        fair: assets.filter((a) => a.condition === 'Fair').length,
        poor: assets.filter((a) => a.condition === 'Poor').length,
      },
    }

    return NextResponse.json({
      assets,
      summary,
      configured: isBaserowConfigured(),
      message: isBaserowConfigured()
        ? "Connected to Baserow"
        : "Using mock data - Baserow not configured",
    })
  } catch (error) {
    console.error('Error fetching assets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assets' },
      { status: 500 }
    )
  }
}

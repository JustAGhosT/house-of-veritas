import { NextResponse } from 'next/server'
import { getTimeClockEntries, clockIn, clockOut, isBaserowConfigured } from '@/lib/services/baserow'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const employee = searchParams.get('employee')
  const date = searchParams.get('date')

  try {
    const entries = await getTimeClockEntries({
      employee: employee ? parseInt(employee) : undefined,
      date: date || undefined,
    })

    // Calculate summary
    const today = new Date().toISOString().split('T')[0]
    const todayEntries = entries.filter((e) => e.date === today)
    
    const summary = {
      total: entries.length,
      todayClockedIn: todayEntries.filter((e) => e.clockIn && !e.clockOut).length,
      todayCompleted: todayEntries.filter((e) => e.clockIn && e.clockOut).length,
      totalHoursToday: todayEntries.reduce((sum, e) => sum + (e.totalHours || 0), 0),
      pendingApproval: entries.filter((e) => e.approvalStatus === 'Pending').length,
    }

    return NextResponse.json({
      entries,
      summary,
      configured: isBaserowConfigured(),
      message: isBaserowConfigured()
        ? "Connected to Baserow"
        : "Using mock data - Baserow not configured",
    })
  } catch (error) {
    console.error('Error fetching time clock entries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch time clock entries' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, employeeId, entryId } = body

    if (action === 'clockIn') {
      if (!employeeId) {
        return NextResponse.json(
          { error: 'Employee ID is required for clock in' },
          { status: 400 }
        )
      }

      const entry = await clockIn(employeeId)

      return NextResponse.json({
        entry,
        message: 'Clocked in successfully',
        configured: isBaserowConfigured(),
      })
    } else if (action === 'clockOut') {
      if (!entryId) {
        return NextResponse.json(
          { error: 'Entry ID is required for clock out' },
          { status: 400 }
        )
      }

      const entry = await clockOut(entryId)

      return NextResponse.json({
        entry,
        message: 'Clocked out successfully',
        configured: isBaserowConfigured(),
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "clockIn" or "clockOut"' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error processing time clock action:', error)
    return NextResponse.json(
      { error: 'Failed to process time clock action' },
      { status: 500 }
    )
  }
}

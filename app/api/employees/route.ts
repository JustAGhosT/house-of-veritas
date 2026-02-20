import { NextResponse } from 'next/server'
import { getEmployees, getEmployee, isBaserowConfigured } from '@/lib/services/baserow'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  try {
    if (id) {
      const employee = await getEmployee(parseInt(id))
      if (!employee) {
        return NextResponse.json(
          { error: 'Employee not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({
        employee,
        configured: isBaserowConfigured(),
      })
    }

    const employees = await getEmployees()
    
    return NextResponse.json({
      employees,
      total: employees.length,
      configured: isBaserowConfigured(),
      message: isBaserowConfigured()
        ? "Connected to Baserow"
        : "Using mock data - Baserow not configured",
    })
  } catch (error) {
    console.error('Error fetching employees:', error)
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    )
  }
}

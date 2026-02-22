import { NextResponse } from 'next/server'
import { getEmployees, getEmployee } from '@/lib/services/baserow'
import { withDataSource } from '@/lib/api/response'
import { logger } from '@/lib/logger'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  try {
    if (id) {
      const parsedId = parseInt(id, 10)
      if (isNaN(parsedId)) {
        return NextResponse.json(
          { error: 'Invalid employee ID' },
          { status: 400 }
        )
      }
      const employee = await getEmployee(parsedId)
      if (!employee) {
        return NextResponse.json(
          { error: 'Employee not found' },
          { status: 404 }
        )
      }
      return withDataSource({ employee })
    }

    const employees = await getEmployees()
    return withDataSource({ employees, total: employees.length })
  } catch (error) {
    logger.error('Error fetching employees', { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    )
  }
}

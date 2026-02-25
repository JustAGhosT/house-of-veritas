import { NextResponse } from "next/server"
import {
  getEmployees,
  getEmployee,
  createEmployee,
  isEmployeesTableConfigured,
} from "@/lib/services/baserow"
import { withDataSource } from "@/lib/api/response"
import { withRole } from "@/lib/auth/rbac"
import { routeToInngest } from "@/lib/workflows"
import { logger } from "@/lib/logger"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  try {
    if (id) {
      const parsedId = parseInt(id, 10)
      if (isNaN(parsedId)) {
        return NextResponse.json({ error: "Invalid employee ID" }, { status: 400 })
      }
      const employee = await getEmployee(parsedId)
      if (!employee) {
        return NextResponse.json({ error: "Employee not found" }, { status: 404 })
      }
      return withDataSource({ employee })
    }

    const employees = await getEmployees()
    return withDataSource({ employees, total: employees.length })
  } catch (error) {
    logger.error("Error fetching employees", {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 })
  }
}

export const POST = withRole("admin")(
  async (request) => {
    try {
      if (!isEmployeesTableConfigured()) {
        return NextResponse.json(
          { error: "Employee creation requires Baserow configuration" },
          { status: 503 }
        )
      }
      const body = await request.json()
      const {
        fullName,
        idNumber,
        role = "Employee",
        employmentStartDate,
        email,
        phone,
        leaveBalance = 0,
      } = body

      if (!fullName || !email) {
        return NextResponse.json(
          { error: "fullName and email are required" },
          { status: 400 }
        )
      }

      const employee = await createEmployee({
        fullName,
        idNumber,
        role,
        employmentStartDate: employmentStartDate || undefined,
        email,
        phone: phone || "",
        leaveBalance,
      })

      if (!employee) {
        return NextResponse.json(
          { error: "Failed to create employee" },
          { status: 500 }
        )
      }

      await routeToInngest({
        name: "house-of-veritas/employee.created",
        data: { employeeId: employee.id },
      })

      return withDataSource({ employee })
    } catch (error) {
      logger.error("POST employee error", {
        error: error instanceof Error ? error.message : String(error),
      })
      return NextResponse.json(
        { error: "Failed to create employee" },
        { status: 500 }
      )
    }
  }
)

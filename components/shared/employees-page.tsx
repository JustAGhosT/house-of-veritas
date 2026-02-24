"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, RefreshCw, Loader2 } from "lucide-react"
import { logger } from "@/lib/logger"
import { apiFetch } from "@/lib/api-client"

interface Employee {
  id: number
  fullName: string
  role: string
  email: string
  phone: string
  leaveBalance?: number
}

interface EmployeesPageProps {
  embedded?: boolean
}

export function EmployeesPage({ embedded = false }: EmployeesPageProps = {}) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)

  const fetchEmployees = useCallback(async () => {
    try {
      const data = await apiFetch<{ employees?: Employee[] }>("/api/employees", {
        label: "Employees",
      })
      setEmployees(data?.employees || [])
    } catch (error) {
      logger.error("Failed to fetch employees", {
        error: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  return (
    <div className="space-y-6">
      {!embedded && (
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-white">
            <Users className="h-7 w-7" />
            Employees
          </h1>
          <p className="mt-1 text-white/60">Employee directory and management</p>
        </div>
      )}

      <Card className="border-white/10 bg-[#0d0d12]/80">
        <CardHeader>
          <CardTitle className="text-white">Employee List</CardTitle>
          <CardDescription className="text-white/60">
            {employees.length} employee{employees.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-white/40" />
            </div>
          ) : employees.length === 0 ? (
            <p className="py-8 text-center text-white/50">No employees found.</p>
          ) : (
            <div className="space-y-3">
              {employees.map((emp) => (
                <div
                  key={emp.id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <div>
                    <p className="font-medium text-white">{emp.fullName}</p>
                    <p className="text-sm text-white/50">
                      {emp.role} · {emp.email}
                    </p>
                  </div>
                  {emp.leaveBalance != null && (
                    <span className="text-sm text-white/60">{emp.leaveBalance} days leave</span>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="mt-4">
            <Button variant="outline" className="border-white/10" onClick={fetchEmployees}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

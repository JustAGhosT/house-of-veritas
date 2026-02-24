"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Car, RefreshCw, Loader2 } from "lucide-react"
import { logger } from "@/lib/logger"
import { apiFetch } from "@/lib/api-client"

interface VehicleLog {
  id: number
  dateOut: string
  dateIn?: string
  driverName?: string
  vehicleName?: string
  distance?: number
}

interface VehiclesPageProps {
  personaId: string
  title?: string
  showAll?: boolean
}

export function VehiclesPage({ personaId, title = "Vehicle Log", showAll = false }: VehiclesPageProps) {
  const [logs, setLogs] = useState<VehicleLog[]>([])
  const [summary, setSummary] = useState<{ total: number; totalDistance: number } | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchLogs = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (!showAll) params.set("personaId", personaId)
      const data = await apiFetch<{ logs?: VehicleLog[]; summary?: { total: number; totalDistance: number } }>(
        `/api/vehicles?${params}`,
        { label: "Vehicles" }
      )
      setLogs(data?.logs || [])
      setSummary(data?.summary || null)
    } catch (error) {
      logger.error("Failed to fetch vehicles", { error: error instanceof Error ? error.message : String(error) })
    } finally {
      setLoading(false)
    }
  }, [personaId, showAll])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
          <Car className="h-7 w-7" />
          {title}
        </h1>
        <p className="text-white/60 mt-1">
          {showAll ? "All vehicle logs" : "Your vehicle usage"}
        </p>
      </div>

      {summary && (
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-4">
              <p className="text-white/50 text-sm">Total Trips</p>
              <p className="text-2xl font-semibold text-white">{summary.total}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="pt-4">
              <p className="text-white/50 text-sm">Total Distance</p>
              <p className="text-2xl font-semibold text-white">{summary.totalDistance?.toLocaleString() || 0} km</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="bg-[#0d0d12]/80 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Vehicle Log</CardTitle>
          <CardDescription className="text-white/60">
            {logs.length} log{logs.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-white/40" />
            </div>
          ) : logs.length === 0 ? (
            <p className="text-white/50 text-center py-8">No vehicle logs found.</p>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <div>
                    <p className="text-white font-medium">{log.vehicleName || "Vehicle"}</p>
                    <p className="text-white/50 text-sm">
                      {log.dateOut} → {log.dateIn || "In progress"}
                      {log.driverName && showAll && ` · ${log.driverName}`}
                    </p>
                  </div>
                  {log.distance != null && (
                    <span className="text-white/70">{log.distance} km</span>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="mt-4">
            <Button variant="outline" className="border-white/10" onClick={fetchLogs}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

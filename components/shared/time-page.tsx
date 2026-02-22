"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Play, Square, Loader2, RefreshCw } from "lucide-react"
import { logger } from "@/lib/logger"

interface TimePageProps {
  personaId: string
  title?: string
  showAll?: boolean
}

export function TimePage({ personaId, title = "Time Clock", showAll = false }: TimePageProps) {
  const [entries, setEntries] = useState<{ id: number; date: string; clockIn?: string; clockOut?: string; employeeName?: string }[]>([])
  const [summary, setSummary] = useState<{ todayClockedIn: number; totalHoursToday: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [clockedIn, setClockedIn] = useState(false)

  const fetchTime = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (!showAll) params.set("personaId", personaId)
      const res = await fetch(`/api/time?${params}`)
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`)
      }
      const data = await res.json()
      setEntries(data.entries || [])
      setSummary(data.summary || null)
    } catch (error) {
      logger.error("Failed to fetch time", { error: error instanceof Error ? error.message : String(error) })
    } finally {
      setLoading(false)
    }
  }, [personaId, showAll])

  useEffect(() => {
    fetchTime()
  }, [fetchTime])

  useEffect(() => {
    if (summary) setClockedIn(summary.todayClockedIn > 0)
  }, [summary])

  const handleClock = async () => {
    setProcessing(true)
    try {
      const action = clockedIn ? "clockOut" : "clockIn"
      const body = clockedIn ? { action: "clockOut", personaId } : { action: "clockIn", personaId }
      const res = await fetch("/api/time", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        await fetchTime()
      }
    } catch (error) {
      logger.error("Clock failed", { error: error instanceof Error ? error.message : String(error) })
    } finally {
      setProcessing(false)
    }
  }

  const todayEntries = entries.filter((e) => e.date === new Date().toISOString().slice(0, 10))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
          <Clock className="h-7 w-7" />
          {title}
        </h1>
        <p className="text-white/60 mt-1">
          {showAll ? "All time entries" : "Clock in and out"}
        </p>
      </div>

      {!showAll && (
        <Card className="bg-[#0d0d12]/80 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Today</CardTitle>
            <CardDescription className="text-white/60">
              {summary?.totalHoursToday != null ? `${summary.totalHoursToday.toFixed(1)} hours today` : "Clock in to start"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              size="lg"
              className={clockedIn ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
              onClick={handleClock}
              disabled={processing}
            >
              {processing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : clockedIn ? (
                <>
                  <Square className="h-5 w-5 mr-2" />
                  Clock Out
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  Clock In
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="bg-[#0d0d12]/80 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Recent Entries</CardTitle>
          <CardDescription className="text-white/60">
            {entries.length} entr{entries.length !== 1 ? "ies" : "y"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-white/40" />
            </div>
          ) : entries.length === 0 ? (
            <p className="text-white/50 text-center py-8">No time entries found.</p>
          ) : (
            <div className="space-y-2">
              {entries.slice(0, 10).map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                >
                  <span className="text-white/80">{e.date}</span>
                  <span className="text-white/60">
                    {e.clockIn || "-"} → {e.clockOut || "-"}
                  </span>
                  {e.employeeName && showAll && (
                    <span className="text-white/40 text-sm">{e.employeeName}</span>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="mt-4">
            <Button variant="outline" className="border-white/10" onClick={fetchTime}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

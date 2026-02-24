"use client"

import { useState, useEffect } from 'react'
import { logger } from '@/lib/logger'
import { apiFetch } from '@/lib/api-client'
import {
  Fingerprint,
  ScanFace,
  Clock,
  UserCheck,
  UserX,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  MapPin,
  Smartphone,
} from 'lucide-react'

interface EmployeeStatus {
  employeeId: string
  employeeName: string
  status: 'working' | 'completed' | 'not_clocked_in'
  clockIn: string | null
  clockOut: string | null
  hoursWorked: number
}

interface ClockRecord {
  id: string
  employeeId: string
  employeeName: string
  type: 'clock_in' | 'clock_out'
  method: string
  timestamp: string
  location: string
  verified: boolean
}

interface BiometricData {
  mode: 'mock' | 'live'
  date: string
  records: ClockRecord[]
  employeeStatus: EmployeeStatus[]
  summary: {
    totalRecords: number
    clockIns: number
    clockOuts: number
  }
}

export function BiometricTimeClockPanel() {
  const [data, setData] = useState<BiometricData | null>(null)
  const [loading, setLoading] = useState(true)
  const [clocking, setClocking] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const result = await apiFetch<BiometricData>('/api/biometric', { label: 'Biometric' })
      setData(result)
    } catch (error) {
      logger.error('Failed to fetch biometric data', { error: error instanceof Error ? error.message : String(error) })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // Auto-refresh every minute
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleClockAction = async (employeeId: string, action: 'clock_in' | 'clock_out') => {
    setClocking(employeeId)
    try {
      const result = await apiFetch<{ success?: boolean }>('/api/biometric', {
        method: 'POST',
        body: { action, employeeId, method: 'fingerprint', location: 'Dashboard' },
        label: 'Biometric',
      })
      if (result?.success) fetchData()
    } catch (error) {
      logger.error('Clock action failed', { error: error instanceof Error ? error.message : String(error) })
    } finally {
      setClocking(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/20">
            <Fingerprint className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-white font-semibold">Biometric Time Clock</h2>
            <p className="text-white/50 text-sm">
              {data?.mode === 'live' ? 'Biometric devices connected' : 'Demo Mode - Simulated biometrics'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchData}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          aria-label="Refresh time clock data"
          title="Refresh time clock data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Mode Alert */}
      {data?.mode === 'mock' && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Using simulated biometrics. Configure BIOMETRIC_API_KEY for hardware integration.</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-linear-to-br from-green-600/20 to-green-600/5 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Currently Working</p>
              <p className="text-2xl font-bold text-white mt-1">
                {data?.employeeStatus.filter(e => e.status === 'working').length || 0}
              </p>
            </div>
            <UserCheck className="w-8 h-8 text-green-400 opacity-60" />
          </div>
        </div>
        <div className="p-4 rounded-xl bg-linear-to-br from-blue-600/20 to-blue-600/5 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Completed Today</p>
              <p className="text-2xl font-bold text-white mt-1">
                {data?.employeeStatus.filter(e => e.status === 'completed').length || 0}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-400 opacity-60" />
          </div>
        </div>
        <div className="p-4 rounded-xl bg-linear-to-br from-amber-600/20 to-amber-600/5 border border-amber-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Not Clocked In</p>
              <p className="text-2xl font-bold text-white mt-1">
                {data?.employeeStatus.filter(e => e.status === 'not_clocked_in').length || 0}
              </p>
            </div>
            <UserX className="w-8 h-8 text-amber-400 opacity-60" />
          </div>
        </div>
        <div className="p-4 rounded-xl bg-linear-to-br from-purple-600/20 to-purple-600/5 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Total Records</p>
              <p className="text-2xl font-bold text-white mt-1">{data?.summary.totalRecords || 0}</p>
            </div>
            <Clock className="w-8 h-8 text-purple-400 opacity-60" />
          </div>
        </div>
      </div>

      {/* Employee Status Grid */}
      <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-white font-semibold">Employee Status</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
          {data?.employeeStatus.map((emp) => (
            <div
              key={emp.employeeId}
              className={`p-4 rounded-xl border transition-all ${
                emp.status === 'working'
                  ? 'bg-green-500/10 border-green-500/30'
                  : emp.status === 'completed'
                  ? 'bg-blue-500/10 border-blue-500/30'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-white font-semibold">{emp.employeeName}</h4>
                  <p className={`text-sm mt-1 ${
                    emp.status === 'working'
                      ? 'text-green-400'
                      : emp.status === 'completed'
                      ? 'text-blue-400'
                      : 'text-white/50'
                  }`}>
                    {emp.status === 'working'
                      ? `Working • ${emp.hoursWorked.toFixed(1)}h`
                      : emp.status === 'completed'
                      ? `Done • ${emp.hoursWorked.toFixed(1)}h`
                      : 'Not clocked in'}
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${
                  emp.status === 'working'
                    ? 'bg-green-500/20'
                    : emp.status === 'completed'
                    ? 'bg-blue-500/20'
                    : 'bg-white/10'
                }`}>
                  {emp.status === 'working' ? (
                    <UserCheck className="w-4 h-4 text-green-400" />
                  ) : emp.status === 'completed' ? (
                    <CheckCircle className="w-4 h-4 text-blue-400" />
                  ) : (
                    <UserX className="w-4 h-4 text-white/40" />
                  )}
                </div>
              </div>

              {/* Time info */}
              {emp.clockIn && (
                <div className="mt-3 text-xs text-white/50 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">In:</span>
                    {new Date(emp.clockIn).toLocaleTimeString()}
                  </div>
                  {emp.clockOut && (
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400">Out:</span>
                      {new Date(emp.clockOut).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-4 flex gap-2">
                {emp.status === 'not_clocked_in' && (
                  <button
                    onClick={() => handleClockAction(emp.employeeId, 'clock_in')}
                    disabled={clocking === emp.employeeId}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {clocking === emp.employeeId ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Fingerprint className="w-4 h-4" />
                    )}
                    Clock In
                  </button>
                )}
                {emp.status === 'working' && (
                  <button
                    onClick={() => handleClockAction(emp.employeeId, 'clock_out')}
                    disabled={clocking === emp.employeeId}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-amber-600 text-white text-sm hover:bg-amber-700 disabled:opacity-50 transition-colors"
                  >
                    {clocking === emp.employeeId ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Fingerprint className="w-4 h-4" />
                    )}
                    Clock Out
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Records */}
      <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-white font-semibold">Today&apos;s Records</h3>
        </div>
        <div className="divide-y divide-white/5">
          {data?.records.slice(0, 10).map((record) => (
            <div key={record.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  record.type === 'clock_in' ? 'bg-green-500/20' : 'bg-amber-500/20'
                }`}>
                  {record.method === 'fingerprint' ? (
                    <Fingerprint className={`w-4 h-4 ${record.type === 'clock_in' ? 'text-green-400' : 'text-amber-400'}`} />
                  ) : (
                    <ScanFace className={`w-4 h-4 ${record.type === 'clock_in' ? 'text-green-400' : 'text-amber-400'}`} />
                  )}
                </div>
                <div>
                  <p className="text-white font-medium">{record.employeeName}</p>
                  <div className="flex items-center gap-3 text-xs text-white/50 mt-0.5">
                    <span className={record.type === 'clock_in' ? 'text-green-400' : 'text-amber-400'}>
                      {record.type === 'clock_in' ? 'Clocked In' : 'Clocked Out'}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {record.location}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/70 text-sm">
                  {new Date(record.timestamp).toLocaleTimeString()}
                </p>
                <p className="text-xs text-white/40 mt-0.5 capitalize">{record.method}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BiometricTimeClockPanel

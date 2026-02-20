import { NextResponse } from 'next/server'

export async function GET() {
  const timeLogs = [
    {
      id: 1,
      employee: 'Charl',
      date: '2025-01-22',
      clockIn: '08:00',
      clockOut: '17:00',
      breakMinutes: 60,
      totalHours: 8.0,
      overtimeHours: 0,
      status: 'Approved'
    },
    {
      id: 2,
      employee: 'Lucky',
      date: '2025-01-22',
      clockIn: '07:45',
      clockOut: '17:30',
      breakMinutes: 45,
      totalHours: 9.0,
      overtimeHours: 0,
      status: 'Approved'
    },
    {
      id: 3,
      employee: 'Charl',
      date: '2025-01-23',
      clockIn: '08:00',
      clockOut: '18:30',
      breakMinutes: 60,
      totalHours: 9.5,
      overtimeHours: 0.5,
      status: 'Pending'
    },
    {
      id: 4,
      employee: 'Lucky',
      date: '2025-01-23',
      clockIn: '08:00',
      clockOut: '17:15',
      breakMinutes: 60,
      totalHours: 8.25,
      overtimeHours: 0,
      status: 'Approved'
    }
  ]

  const summary = {
    totalEntries: timeLogs.length,
    totalHours: timeLogs.reduce((sum, log) => sum + log.totalHours, 0),
    totalOvertime: timeLogs.reduce((sum, log) => sum + log.overtimeHours, 0),
    pending: timeLogs.filter(log => log.status === 'Pending').length,
    byEmployee: {
      Charl: timeLogs.filter(log => log.employee === 'Charl').reduce((sum, log) => sum + log.totalHours, 0),
      Lucky: timeLogs.filter(log => log.employee === 'Lucky').reduce((sum, log) => sum + log.totalHours, 0)
    }
  }

  return NextResponse.json({ timeLogs, summary })
}

import { NextResponse } from 'next/server'

// Mock data for reports
const generateExpenseReport = (userId?: string, startDate?: string, endDate?: string) => {
  const expenses = [
    { id: 'exp1', date: '2026-02-15', category: 'Workshop Materials', amount: 850, status: 'approved', submittedBy: 'Charl' },
    { id: 'exp2', date: '2026-02-14', category: 'Garden Supplies', amount: 320, status: 'approved', submittedBy: 'Lucky' },
    { id: 'exp3', date: '2026-02-13', category: 'Vehicle Fuel', amount: 450, status: 'pending', submittedBy: 'Charl' },
    { id: 'exp4', date: '2026-02-12', category: 'Cleaning Supplies', amount: 180, status: 'approved', submittedBy: 'Irma' },
    { id: 'exp5', date: '2026-02-10', category: 'Equipment Rental', amount: 1200, status: 'approved', submittedBy: 'Charl' },
    { id: 'exp6', date: '2026-02-08', category: 'Seeds & Plants', amount: 560, status: 'approved', submittedBy: 'Lucky' },
    { id: 'exp7', date: '2026-02-05', category: 'Safety Equipment', amount: 890, status: 'approved', submittedBy: 'Hans' },
    { id: 'exp8', date: '2026-02-01', category: 'Office Supplies', amount: 240, status: 'approved', submittedBy: 'Irma' },
  ]

  const filtered = userId 
    ? expenses.filter(e => e.submittedBy.toLowerCase() === userId.toLowerCase())
    : expenses

  const total = filtered.reduce((sum, e) => sum + e.amount, 0)
  const approved = filtered.filter(e => e.status === 'approved').reduce((sum, e) => sum + e.amount, 0)
  const pending = filtered.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0)

  return {
    expenses: filtered,
    summary: {
      total,
      approved,
      pending,
      count: filtered.length,
      byCategory: filtered.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount
        return acc
      }, {} as Record<string, number>),
    },
  }
}

const generateTaskReport = (userId?: string) => {
  const tasks = [
    { id: 't1', title: 'Monthly garden maintenance', assignee: 'Lucky', status: 'completed', completedDate: '2026-02-18', priority: 'high' },
    { id: 't2', title: 'Fix workshop electrical', assignee: 'Charl', status: 'completed', completedDate: '2026-02-17', priority: 'high' },
    { id: 't3', title: 'Clean main house windows', assignee: 'Irma', status: 'in_progress', priority: 'medium' },
    { id: 't4', title: 'Vehicle service booking', assignee: 'Charl', status: 'completed', completedDate: '2026-02-15', priority: 'medium' },
    { id: 't5', title: 'Trim hedge perimeter', assignee: 'Lucky', status: 'in_progress', priority: 'low' },
    { id: 't6', title: 'Inventory check - tools', assignee: 'Charl', status: 'pending', priority: 'low' },
    { id: 't7', title: 'Prepare guest room', assignee: 'Irma', status: 'completed', completedDate: '2026-02-14', priority: 'high' },
    { id: 't8', title: 'Pool maintenance', assignee: 'Lucky', status: 'completed', completedDate: '2026-02-12', priority: 'medium' },
  ]

  const filtered = userId
    ? tasks.filter(t => t.assignee.toLowerCase() === userId.toLowerCase())
    : tasks

  return {
    tasks: filtered,
    summary: {
      total: filtered.length,
      completed: filtered.filter(t => t.status === 'completed').length,
      inProgress: filtered.filter(t => t.status === 'in_progress').length,
      pending: filtered.filter(t => t.status === 'pending').length,
      byPriority: {
        high: filtered.filter(t => t.priority === 'high').length,
        medium: filtered.filter(t => t.priority === 'medium').length,
        low: filtered.filter(t => t.priority === 'low').length,
      },
    },
  }
}

const generateTimeReport = (userId?: string) => {
  const entries = [
    { id: 'time1', date: '2026-02-20', user: 'Charl', clockIn: '07:00', clockOut: '16:00', hours: 9, overtime: 1 },
    { id: 'time2', date: '2026-02-20', user: 'Lucky', clockIn: '06:30', clockOut: '14:30', hours: 8, overtime: 0 },
    { id: 'time3', date: '2026-02-19', user: 'Charl', clockIn: '07:15', clockOut: '15:45', hours: 8.5, overtime: 0.5 },
    { id: 'time4', date: '2026-02-19', user: 'Lucky', clockIn: '06:00', clockOut: '14:00', hours: 8, overtime: 0 },
    { id: 'time5', date: '2026-02-18', user: 'Charl', clockIn: '07:00', clockOut: '17:30', hours: 10.5, overtime: 2.5 },
    { id: 'time6', date: '2026-02-18', user: 'Lucky', clockIn: '06:30', clockOut: '15:00', hours: 8.5, overtime: 0.5 },
    { id: 'time7', date: '2026-02-17', user: 'Charl', clockIn: '08:00', clockOut: '16:00', hours: 8, overtime: 0 },
    { id: 'time8', date: '2026-02-17', user: 'Lucky', clockIn: '07:00', clockOut: '15:00', hours: 8, overtime: 0 },
  ]

  const filtered = userId
    ? entries.filter(e => e.user.toLowerCase() === userId.toLowerCase())
    : entries

  const totalHours = filtered.reduce((sum, e) => sum + e.hours, 0)
  const totalOvertime = filtered.reduce((sum, e) => sum + e.overtime, 0)

  return {
    entries: filtered,
    summary: {
      totalHours,
      totalOvertime,
      regularHours: totalHours - totalOvertime,
      averageDaily: totalHours / (filtered.length || 1),
      daysWorked: new Set(filtered.map(e => e.date)).size,
    },
  }
}

// GET - Generate reports
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const reportType = searchParams.get('type') || 'expenses'
  const userId = searchParams.get('userId')
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  const format = searchParams.get('format') || 'json'

  let data: any

  switch (reportType) {
    case 'expenses':
      data = generateExpenseReport(userId || undefined, startDate || undefined, endDate || undefined)
      break
    case 'tasks':
      data = generateTaskReport(userId || undefined)
      break
    case 'time':
      data = generateTimeReport(userId || undefined)
      break
    case 'all':
      data = {
        expenses: generateExpenseReport(userId || undefined),
        tasks: generateTaskReport(userId || undefined),
        time: generateTimeReport(userId || undefined),
      }
      break
    default:
      return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
  }

  if (format === 'csv') {
    let csv = ''
    
    if (reportType === 'expenses') {
      csv = 'Date,Category,Amount,Status,Submitted By\n'
      csv += data.expenses.map((e: any) => 
        `${e.date},${e.category},${e.amount},${e.status},${e.submittedBy}`
      ).join('\n')
    } else if (reportType === 'tasks') {
      csv = 'Title,Assignee,Status,Priority,Completed Date\n'
      csv += data.tasks.map((t: any) => 
        `"${t.title}",${t.assignee},${t.status},${t.priority},${t.completedDate || ''}`
      ).join('\n')
    } else if (reportType === 'time') {
      csv = 'Date,User,Clock In,Clock Out,Hours,Overtime\n'
      csv += data.entries.map((e: any) => 
        `${e.date},${e.user},${e.clockIn},${e.clockOut},${e.hours},${e.overtime}`
      ).join('\n')
    }

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${reportType}-report-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  }

  return NextResponse.json({
    reportType,
    generatedAt: new Date().toISOString(),
    filters: { userId, startDate, endDate },
    data,
  })
}

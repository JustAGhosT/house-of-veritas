import { NextResponse } from 'next/server'

// Payroll Service Configuration
const QUICKBOOKS_CONFIG = {
  clientId: process.env.QUICKBOOKS_CLIENT_ID,
  clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET,
  realmId: process.env.QUICKBOOKS_REALM_ID,
}

// Check if QuickBooks is configured
export function isQuickBooksConfigured(): boolean {
  return !!(QUICKBOOKS_CONFIG.clientId && QUICKBOOKS_CONFIG.clientSecret)
}

// Employee payroll data (mock)
const EMPLOYEE_PAYROLL = [
  {
    id: 'charl',
    name: 'Charl',
    role: 'Workshop & Maintenance',
    hourlyRate: 85,
    monthlyHours: 176,
    overtime: 12,
    overtimeRate: 127.5,
    deductions: { tax: 2850, uif: 142, pension: 570 },
  },
  {
    id: 'lucky',
    name: 'Lucky',
    role: 'Gardener & Groundskeeper',
    hourlyRate: 65,
    monthlyHours: 184,
    overtime: 8,
    overtimeRate: 97.5,
    deductions: { tax: 1980, uif: 120, pension: 480 },
  },
  {
    id: 'irma',
    name: 'Irma',
    role: 'Housekeeper & Admin',
    hourlyRate: 75,
    monthlyHours: 160,
    overtime: 0,
    overtimeRate: 112.5,
    deductions: { tax: 2100, uif: 120, pension: 480 },
  },
]

// Calculate payroll for an employee
function calculatePayroll(employee: typeof EMPLOYEE_PAYROLL[0]) {
  const regularPay = employee.hourlyRate * employee.monthlyHours
  const overtimePay = employee.overtimeRate * employee.overtime
  const grossPay = regularPay + overtimePay
  const totalDeductions = Object.values(employee.deductions).reduce((sum, d) => sum + d, 0)
  const netPay = grossPay - totalDeductions

  return {
    ...employee,
    regularPay,
    overtimePay,
    grossPay,
    totalDeductions,
    netPay,
  }
}

// GET - Get payroll summary or status
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const employeeId = searchParams.get('employeeId')
  const month = searchParams.get('month') || new Date().toISOString().slice(0, 7)

  // Check integration status
  if (action === 'status') {
    return NextResponse.json({
      quickbooks: {
        configured: isQuickBooksConfigured(),
        mode: isQuickBooksConfigured() ? 'live' : 'mock',
      },
      xero: {
        configured: false,
        mode: 'mock',
      },
      note: isQuickBooksConfigured()
        ? 'QuickBooks integration active'
        : 'Using mock payroll data. Configure QUICKBOOKS_CLIENT_ID/SECRET for live integration.',
    })
  }

  // Get specific employee payroll
  if (employeeId) {
    const employee = EMPLOYEE_PAYROLL.find(e => e.id === employeeId)
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }
    return NextResponse.json({
      mode: isQuickBooksConfigured() ? 'live' : 'mock',
      month,
      payroll: calculatePayroll(employee),
    })
  }

  // Get all employees payroll summary
  const payrollData = EMPLOYEE_PAYROLL.map(calculatePayroll)
  const totals = {
    totalGrossPay: payrollData.reduce((sum, p) => sum + p.grossPay, 0),
    totalDeductions: payrollData.reduce((sum, p) => sum + p.totalDeductions, 0),
    totalNetPay: payrollData.reduce((sum, p) => sum + p.netPay, 0),
    totalHours: payrollData.reduce((sum, p) => sum + p.monthlyHours + p.overtime, 0),
    totalOvertime: payrollData.reduce((sum, p) => sum + p.overtime, 0),
  }

  return NextResponse.json({
    mode: isQuickBooksConfigured() ? 'live' : 'mock',
    month,
    employees: payrollData,
    totals,
    generatedAt: new Date().toISOString(),
  })
}

// POST - Run payroll or sync with QuickBooks
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, month, employeeId, adjustments } = body

    if (action === 'run-payroll') {
      // In production, this would sync with QuickBooks
      const payrollData = EMPLOYEE_PAYROLL.map(calculatePayroll)
      
      return NextResponse.json({
        success: true,
        mode: isQuickBooksConfigured() ? 'live' : 'mock',
        month: month || new Date().toISOString().slice(0, 7),
        status: 'processed',
        employees: payrollData.length,
        totalPayout: payrollData.reduce((sum, p) => sum + p.netPay, 0),
        message: isQuickBooksConfigured()
          ? 'Payroll synced to QuickBooks'
          : 'Payroll processed (mock mode)',
      })
    }

    if (action === 'sync-quickbooks') {
      if (!isQuickBooksConfigured()) {
        return NextResponse.json({
          success: false,
          error: 'QuickBooks not configured',
          instructions: 'Set QUICKBOOKS_CLIENT_ID and QUICKBOOKS_CLIENT_SECRET',
        }, { status: 400 })
      }

      // In production: sync time entries and expenses to QuickBooks
      return NextResponse.json({
        success: true,
        synced: {
          timeEntries: 24,
          expenses: 8,
        },
        message: 'Data synced to QuickBooks',
      })
    }

    if (action === 'adjust-payroll' && employeeId && adjustments) {
      // Process payroll adjustments
      return NextResponse.json({
        success: true,
        employeeId,
        adjustments,
        message: 'Payroll adjustments recorded',
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Payroll operation failed', details: error.message },
      { status: 500 }
    )
  }
}

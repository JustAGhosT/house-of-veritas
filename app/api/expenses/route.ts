import { NextResponse } from 'next/server'
import { getExpenses, createExpense, updateExpense, isBaserowConfigured } from '@/lib/services/baserow'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const requester = searchParams.get('requester')
  const status = searchParams.get('status')

  try {
    const expenses = await getExpenses({
      requester: requester ? parseInt(requester) : undefined,
      status: status || undefined,
    })

    const summary = {
      total: expenses.length,
      pending: expenses.filter((e) => e.approvalStatus === 'Pending').length,
      approved: expenses.filter((e) => e.approvalStatus === 'Approved').length,
      rejected: expenses.filter((e) => e.approvalStatus === 'Rejected').length,
      totalAmount: expenses.reduce((sum, e) => sum + e.amount, 0),
      pendingAmount: expenses
        .filter((e) => e.approvalStatus === 'Pending')
        .reduce((sum, e) => sum + e.amount, 0),
      approvedAmount: expenses
        .filter((e) => e.approvalStatus === 'Approved')
        .reduce((sum, e) => sum + e.amount, 0),
    }

    return NextResponse.json({
      expenses,
      summary,
      configured: isBaserowConfigured(),
      message: isBaserowConfigured()
        ? "Connected to Baserow"
        : "Using mock data - Baserow not configured",
    })
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { requester, type, category, amount, vendor, date, project, notes } = body

    if (!requester || !amount || !category) {
      return NextResponse.json(
        { error: 'Requester, amount, and category are required' },
        { status: 400 }
      )
    }

    const expense = await createExpense({
      requester,
      type: type || 'Request',
      category,
      amount,
      vendor,
      date: date || new Date().toISOString().split('T')[0],
      approvalStatus: 'Pending',
      project,
      notes,
    })

    return NextResponse.json({
      expense,
      configured: isBaserowConfigured(),
    })
  } catch (error) {
    console.error('Error creating expense:', error)
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Expense ID is required' },
        { status: 400 }
      )
    }

    const expense = await updateExpense(id, updates)

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      expense,
      configured: isBaserowConfigured(),
    })
  } catch (error) {
    console.error('Error updating expense:', error)
    return NextResponse.json(
      { error: 'Failed to update expense' },
      { status: 500 }
    )
  }
}

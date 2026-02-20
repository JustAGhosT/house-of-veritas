import { NextResponse } from 'next/server'

export async function GET() {
  const expenses = [
    {
      id: 1,
      date: '2025-01-15',
      requester: 'Lucky',
      category: 'Materials',
      description: 'Cement and sand for path repair',
      amount: 2850,
      status: 'Approved',
      approvedBy: 'Hans',
      approvalDate: '2025-01-15',
      receiptUploaded: true,
      project: 'Garden Maintenance'
    },
    {
      id: 2,
      date: '2025-01-18',
      requester: 'Charl',
      category: 'Tools',
      description: 'Replacement drill bits and saw blades',
      amount: 1250,
      status: 'Approved',
      approvedBy: 'Hans',
      approvalDate: '2025-01-18',
      receiptUploaded: true,
      project: 'Workshop Equipment'
    },
    {
      id: 3,
      date: '2025-01-20',
      requester: 'Lucky',
      category: 'Fuel',
      description: 'Petrol for lawnmower and generator',
      amount: 850,
      status: 'Pending',
      approvedBy: null,
      approvalDate: null,
      receiptUploaded: true,
      project: 'Garden Maintenance'
    },
    {
      id: 4,
      date: '2025-01-10',
      requester: 'Hans',
      category: 'Contractors',
      description: 'Renovation milestone 1 - Foundation work',
      amount: 18500,
      status: 'Approved',
      approvedBy: 'Hans',
      approvalDate: '2025-01-10',
      receiptUploaded: true,
      project: 'Renovation Project',
      milestone: 'Foundation Complete (30%)'
    },
    {
      id: 5,
      date: '2025-01-22',
      requester: 'Charl',
      category: 'Materials',
      description: 'Paint and primer for workshop walls',
      amount: 3200,
      status: 'Pending',
      approvedBy: null,
      approvalDate: null,
      receiptUploaded: false,
      project: 'Workshop Upgrade'
    }
  ]

  const summary = {
    total: expenses.reduce((sum, exp) => sum + exp.amount, 0),
    approved: expenses.filter(e => e.status === 'Approved').reduce((sum, exp) => sum + exp.amount, 0),
    pending: expenses.filter(e => e.status === 'Pending').reduce((sum, exp) => sum + exp.amount, 0),
    byCategory: {
      Materials: 6050,
      Tools: 1250,
      Fuel: 850,
      Contractors: 18500,
      Labor: 8600,
      Utilities: 2500,
      Other: 500
    }
  }

  return NextResponse.json({ expenses, summary })
}

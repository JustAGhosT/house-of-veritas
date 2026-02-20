import { NextResponse } from 'next/server'

export async function GET() {
  const contractors = [
    {
      id: 1,
      name: 'BuildRight Construction',
      project: 'Renovation Project',
      contractAmount: 85000,
      milestones: [
        {
          stage: 'Deposit',
          percentage: 20,
          amount: 17000,
          status: 'Paid',
          paidDate: '2024-12-15',
          dueDate: '2024-12-15'
        },
        {
          stage: 'Foundation Complete',
          percentage: 30,
          amount: 25500,
          status: 'Paid',
          paidDate: '2025-01-10',
          dueDate: '2025-01-10'
        },
        {
          stage: 'Framing Complete',
          percentage: 25,
          amount: 21250,
          status: 'In Progress',
          paidDate: null,
          dueDate: '2025-02-15'
        },
        {
          stage: 'Final Completion',
          percentage: 25,
          amount: 21250,
          status: 'Pending',
          paidDate: null,
          dueDate: '2025-03-30'
        }
      ],
      totalPaid: 42500,
      remaining: 42500,
      progress: 50
    },
    {
      id: 2,
      name: 'GreenScape Landscaping',
      project: 'Garden Redesign',
      contractAmount: 28000,
      milestones: [
        {
          stage: 'Deposit',
          percentage: 30,
          amount: 8400,
          status: 'Paid',
          paidDate: '2025-01-05',
          dueDate: '2025-01-05'
        },
        {
          stage: 'Phase 1 - Clearing',
          percentage: 35,
          amount: 9800,
          status: 'In Progress',
          paidDate: null,
          dueDate: '2025-02-01'
        },
        {
          stage: 'Final - Planting',
          percentage: 35,
          amount: 9800,
          status: 'Pending',
          paidDate: null,
          dueDate: '2025-02-28'
        }
      ],
      totalPaid: 8400,
      remaining: 19600,
      progress: 30
    },
    {
      id: 3,
      name: 'SafeGuard Electrical',
      project: 'Workshop Upgrade',
      contractAmount: 15500,
      milestones: [
        {
          stage: 'Deposit',
          percentage: 40,
          amount: 6200,
          status: 'Paid',
          paidDate: '2025-01-12',
          dueDate: '2025-01-12'
        },
        {
          stage: 'Completion',
          percentage: 60,
          amount: 9300,
          status: 'Pending',
          paidDate: null,
          dueDate: '2025-02-10'
        }
      ],
      totalPaid: 6200,
      remaining: 9300,
      progress: 40
    }
  ]

  const summary = {
    totalContracts: contractors.length,
    totalContractValue: contractors.reduce((sum, c) => sum + c.contractAmount, 0),
    totalPaid: contractors.reduce((sum, c) => sum + c.totalPaid, 0),
    totalRemaining: contractors.reduce((sum, c) => sum + c.remaining, 0),
    averageProgress: Math.round(contractors.reduce((sum, c) => sum + c.progress, 0) / contractors.length)
  }

  return NextResponse.json({ contractors, summary })
}

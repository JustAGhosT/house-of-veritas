import { NextResponse } from 'next/server'

export async function GET() {
  const stats = {
    documents: {
      total: 18,
      digitized: 18,
      pending: 0,
      compliance: 100
    },
    users: {
      total: 4,
      active: 4,
      names: ['Hans', 'Charl', 'Lucky', 'Irma']
    },
    uptime: {
      percentage: 99.9,
      lastIncident: '2024-11-15'
    },
    tasks: {
      total: 47,
      completed: 38,
      inProgress: 6,
      overdue: 3
    },
    budget: {
      allocated: 45000,
      spent: 38250,
      remaining: 6750,
      percentage: 85
    }
  }

  return NextResponse.json(stats)
}

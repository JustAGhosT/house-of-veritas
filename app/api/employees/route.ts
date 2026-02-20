import { NextResponse } from 'next/server'

export async function GET() {
  const employees = [
    {
      id: 1,
      name: 'Hans Jurgens Smit',
      role: 'Owner/Administrator',
      email: 'hans@houseofveritas.za',
      phone: '+27 82 123 4567',
      status: 'Active',
      startDate: '2020-01-01',
      contractStatus: 'N/A',
      leaveBalance: 0,
      tasksToday: 8,
      hoursThisWeek: 0
    },
    {
      id: 2,
      name: 'Charl',
      role: 'Workshop Operator',
      email: 'charl@houseofveritas.za',
      phone: '+27 82 234 5678',
      status: 'Active',
      startDate: '2022-03-15',
      contractStatus: 'Active',
      leaveBalance: 12.5,
      tasksToday: 5,
      hoursThisWeek: 42.5
    },
    {
      id: 3,
      name: 'Lucky',
      role: 'Gardener/Handyman',
      email: 'lucky@houseofveritas.za',
      phone: '+27 82 345 6789',
      status: 'Active',
      startDate: '2023-05-01',
      contractStatus: 'Active',
      leaveBalance: 8.0,
      tasksToday: 6,
      hoursThisWeek: 44.0
    },
    {
      id: 4,
      name: 'Irma',
      role: 'Resident/Household',
      email: 'irma@houseofveritas.za',
      phone: '+27 82 456 7890',
      status: 'Active',
      startDate: '2023-04-10',
      contractStatus: 'Active',
      leaveBalance: 0,
      tasksToday: 3,
      hoursThisWeek: 0
    }
  ]

  return NextResponse.json(employees)
}

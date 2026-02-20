import { NextResponse } from 'next/server'

export async function GET() {
  const incidents = [
    {
      id: 1,
      date: '2025-01-18',
      time: '14:30',
      type: 'Safety',
      location: 'Workshop',
      reporter: 'Charl',
      severity: 'Low',
      status: 'Resolved',
      description: 'Minor cut on hand while handling metal sheet',
      actions: 'First aid administered, reminded about safety gloves',
      witnesses: 'Lucky',
      followUpRequired: false
    },
    {
      id: 2,
      date: '2025-01-15',
      time: '09:15',
      type: 'Equipment',
      location: 'Garden',
      reporter: 'Lucky',
      severity: 'Medium',
      status: 'In Progress',
      description: 'Lawnmower blade damaged, requires replacement',
      actions: 'Replacement blade ordered, temporary use of backup mower',
      witnesses: null,
      followUpRequired: true
    },
    {
      id: 3,
      date: '2025-01-10',
      time: '16:45',
      type: 'Vehicle',
      location: 'Driveway',
      reporter: 'Hans',
      severity: 'Low',
      status: 'Resolved',
      description: 'Vehicle reverse sensor malfunction',
      actions: 'Sensor replaced under warranty',
      witnesses: 'Charl',
      followUpRequired: false
    },
    {
      id: 4,
      date: '2025-01-20',
      time: '11:00',
      type: 'Household',
      location: 'Kitchen',
      reporter: 'Irma',
      severity: 'Low',
      status: 'Pending',
      description: 'Refrigerator making unusual noise',
      actions: 'Technician appointment scheduled for Jan 25',
      witnesses: null,
      followUpRequired: true
    }
  ]

  const summary = {
    total: incidents.length,
    resolved: incidents.filter(i => i.status === 'Resolved').length,
    inProgress: incidents.filter(i => i.status === 'In Progress').length,
    pending: incidents.filter(i => i.status === 'Pending').length,
    bySeverity: {
      High: 0,
      Medium: incidents.filter(i => i.severity === 'Medium').length,
      Low: incidents.filter(i => i.severity === 'Low').length
    },
    byType: {
      Safety: incidents.filter(i => i.type === 'Safety').length,
      Equipment: incidents.filter(i => i.type === 'Equipment').length,
      Vehicle: incidents.filter(i => i.type === 'Vehicle').length,
      Household: incidents.filter(i => i.type === 'Household').length
    }
  }

  return NextResponse.json({ incidents, summary })
}

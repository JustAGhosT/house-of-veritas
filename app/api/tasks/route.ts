import { NextResponse } from 'next/server'

export async function GET() {
  const tasks = [
    {
      id: 1,
      title: 'Weekly lawn maintenance',
      assignedTo: 'Lucky',
      priority: 'Medium',
      status: 'In Progress',
      dueDate: '2025-01-24',
      timeSpent: 2.5,
      estimatedTime: 4.0,
      project: 'Garden Maintenance'
    },
    {
      id: 2,
      title: 'Workshop equipment inspection',
      assignedTo: 'Charl',
      priority: 'High',
      status: 'Completed',
      dueDate: '2025-01-23',
      timeSpent: 3.0,
      estimatedTime: 3.0,
      project: 'Workshop Safety'
    },
    {
      id: 3,
      title: 'Vehicle service appointment booking',
      assignedTo: 'Hans',
      priority: 'High',
      status: 'Not Started',
      dueDate: '2025-01-25',
      timeSpent: 0,
      estimatedTime: 1.0,
      project: 'Fleet Management'
    },
    {
      id: 4,
      title: 'Prepare household inventory',
      assignedTo: 'Irma',
      priority: 'Low',
      status: 'In Progress',
      dueDate: '2025-01-30',
      timeSpent: 1.5,
      estimatedTime: 4.0,
      project: 'Household Admin'
    },
    {
      id: 5,
      title: 'Irrigation system check',
      assignedTo: 'Lucky',
      priority: 'Medium',
      status: 'Completed',
      dueDate: '2025-01-22',
      timeSpent: 2.0,
      estimatedTime: 2.0,
      project: 'Garden Maintenance'
    },
    {
      id: 6,
      title: 'Power tool maintenance',
      assignedTo: 'Charl',
      priority: 'Medium',
      status: 'In Progress',
      dueDate: '2025-01-26',
      timeSpent: 1.0,
      estimatedTime: 3.0,
      project: 'Workshop Maintenance'
    }
  ]

  const summary = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'Completed').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    notStarted: tasks.filter(t => t.status === 'Not Started').length,
    overdue: tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'Completed').length
  }

  return NextResponse.json({ tasks, summary })
}

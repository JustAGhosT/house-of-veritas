import { NextResponse } from 'next/server'
import { getTasks, createTask, updateTask, isBaserowConfigured } from '@/lib/services/baserow'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const assignedTo = searchParams.get('assignedTo')
  const status = searchParams.get('status')

  try {
    const tasks = await getTasks({
      assignedTo: assignedTo ? parseInt(assignedTo) : undefined,
      status: status || undefined,
    })

    const summary = {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === 'Completed').length,
      inProgress: tasks.filter((t) => t.status === 'In Progress').length,
      notStarted: tasks.filter((t) => t.status === 'Not Started').length,
      overdue: tasks.filter(
        (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Completed'
      ).length,
    }

    return NextResponse.json({
      tasks,
      summary,
      configured: isBaserowConfigured(),
      message: isBaserowConfigured()
        ? "Connected to Baserow"
        : "Using mock data - Baserow not configured",
    })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, description, assignedTo, dueDate, priority, project } = body

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    const task = await createTask({
      title,
      description,
      assignedTo,
      dueDate,
      priority: priority || 'Medium',
      status: 'Not Started',
      project,
    })

    return NextResponse.json({
      task,
      configured: isBaserowConfigured(),
    })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
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
        { error: 'Task ID is required' },
        { status: 400 }
      )
    }

    const task = await updateTask(id, updates)

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      task,
      configured: isBaserowConfigured(),
    })
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    )
  }
}

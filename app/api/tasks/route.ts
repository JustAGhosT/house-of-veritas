import { NextResponse } from 'next/server'
import { getTasks, createTask, updateTask } from '@/lib/services/baserow'
import { withDataSource } from '@/lib/api/response'
import { logger } from '@/lib/logger'
import { getProjectNamesForMember } from '@/lib/projects'

const PERSONA_TO_ASSIGNED_ID: Record<string, number> = {
  hans: 1,
  charl: 2,
  lucky: 3,
  irma: 4,
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const assignedToParam = searchParams.get('assignedTo')
  const assignee = searchParams.get('assignee')
  const status = searchParams.get('status')
  const userId = request.headers.get('x-user-id')
  const userRole = request.headers.get('x-user-role')

  let assignedTo: number | undefined
  if (assignedToParam) {
    assignedTo = parseInt(assignedToParam, 10)
    if (Number.isNaN(assignedTo)) assignedTo = undefined
  } else if (assignee) {
    assignedTo = PERSONA_TO_ASSIGNED_ID[assignee.toLowerCase()]
  }

  const isAdmin = userRole === 'admin'
  const applyProjectFilter = userId && !isAdmin

  try {
    let tasks: Awaited<ReturnType<typeof getTasks>>
    if (applyProjectFilter) {
      tasks = await getTasks({ status: status || undefined })
      const myAssignedId = PERSONA_TO_ASSIGNED_ID[userId.toLowerCase()]
      const projectNames = await getProjectNamesForMember(userId)
      if (myAssignedId === undefined && projectNames.length === 0) {
        tasks = []
      } else {
        tasks = tasks.filter(
          (t) =>
            (myAssignedId !== undefined && t.assignedTo === myAssignedId) ||
            (t.project && projectNames.includes(t.project))
        )
      }
    } else {
      tasks = await getTasks({
        assignedTo,
        assignedToName: assignee ?? undefined,
        status: status || undefined,
      })
    }

    const summary = {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === 'Completed').length,
      inProgress: tasks.filter((t) => t.status === 'In Progress').length,
      notStarted: tasks.filter((t) => t.status === 'Not Started').length,
      overdue: tasks.filter(
        (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Completed'
      ).length,
    }

    return withDataSource({ tasks, summary })
  } catch (error) {
    logger.error('Error fetching tasks', { error: error instanceof Error ? error.message : String(error) })
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

    return withDataSource({ task })
  } catch (error) {
    logger.error('Error creating task', { error: error instanceof Error ? error.message : String(error) })
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

    return withDataSource({ task })
  } catch (error) {
    logger.error('Error updating task', { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    )
  }
}

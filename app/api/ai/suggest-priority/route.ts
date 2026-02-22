import { NextResponse } from "next/server"
import { withAuth } from "@/lib/auth/rbac"
import { suggestPriority } from "@/lib/ai/azure-foundry"

const PRIORITY_OPTIONS = ["Low", "Medium", "High"]

export const POST = withAuth(async (request: Request) => {
  try {
    const body = await request.json()
    const { taskTitle, taskDescription, dueDate } = body

    if (!taskTitle || typeof taskTitle !== "string") {
      return NextResponse.json({ error: "taskTitle is required" }, { status: 400 })
    }

    const suggested = await suggestPriority({
      taskTitle,
      taskDescription: taskDescription || undefined,
      dueDate: dueDate || undefined,
      options: PRIORITY_OPTIONS,
    })

    return NextResponse.json({
      suggested: suggested || PRIORITY_OPTIONS[1],
      options: PRIORITY_OPTIONS,
      aiPowered: !!suggested,
    })
  } catch (err) {
    return NextResponse.json({ error: "Suggestion failed" }, { status: 500 })
  }
})

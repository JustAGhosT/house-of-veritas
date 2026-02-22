import { NextResponse } from "next/server"
import { withAuth } from "@/lib/auth/rbac"
import { suggestAssignee } from "@/lib/ai/azure-foundry"
import { getAllUsersWithManagement } from "@/lib/user-management"
import { getDefaultResponsibilities } from "@/lib/access-config"

export const POST = withAuth(async (request: Request) => {
  try {
    const body = await request.json()
    const { taskTitle, taskDescription, projectName } = body

    if (!taskTitle || typeof taskTitle !== "string") {
      return NextResponse.json({ error: "taskTitle is required" }, { status: 400 })
    }

    const users = await getAllUsersWithManagement()
    const options = users.map((u) => u.id)
    const userDetails = users.map((u) => ({
      id: u.id,
      name: u.name,
      responsibilities: u.responsibilities?.length ? u.responsibilities : getDefaultResponsibilities(u.role),
      specialty: u.specialty,
    }))

    const suggested = await suggestAssignee({
      taskTitle,
      taskDescription: taskDescription || undefined,
      projectName: projectName || undefined,
      options,
      userDetails,
    })

    return NextResponse.json({
      suggested: suggested || options[0],
      options,
      aiPowered: !!suggested,
    })
  } catch (err) {
    return NextResponse.json({ error: "Suggestion failed" }, { status: 500 })
  }
})

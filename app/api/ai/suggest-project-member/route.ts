import { NextResponse } from "next/server"
import { withRole } from "@/lib/auth/rbac"
import { suggestAssignee } from "@/lib/ai/azure-foundry"
import { getAllUsersWithManagement } from "@/lib/user-management"
import { getDefaultResponsibilities } from "@/lib/access-config"
import { readFile } from "fs/promises"
import { join } from "path"
import type { Project } from "@/lib/projects"

const PROJECTS_PATH = join(process.cwd(), "data", "projects.json")

async function loadProject(projectId: string): Promise<Project | null> {
  try {
    const data = await readFile(PROJECTS_PATH, "utf-8")
    const projects: Project[] = JSON.parse(data)
    return projects.find((p) => p.id === projectId) ?? null
  } catch {
    return null
  }
}

export const POST = withRole("admin")(async (request: Request) => {
  try {
    const body = await request.json()
    const { projectId, projectName } = body

    const project = projectId ? await loadProject(projectId) : null
    const name = projectName || project?.name || "General project"

    const users = await getAllUsersWithManagement()
    const excludeIds = new Set((project?.members ?? []).map((m) => m.userId))
    const options = users.filter((u) => !excludeIds.has(u.id)).map((u) => u.id)
    const userDetails = users
      .filter((u) => !excludeIds.has(u.id))
      .map((u) => ({
        id: u.id,
        name: u.name,
        responsibilities: u.responsibilities?.length ? u.responsibilities : getDefaultResponsibilities(u.role),
        specialty: u.specialty,
      }))

    if (options.length === 0) {
      return NextResponse.json({
        suggested: null,
        options: [],
        aiPowered: false,
        message: "All team members already assigned to this project",
      })
    }

    const suggested = await suggestAssignee({
      taskTitle: `Project work: ${name}`,
      taskDescription: project?.description,
      projectName: name,
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

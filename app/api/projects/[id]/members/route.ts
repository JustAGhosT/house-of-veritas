import { NextResponse } from "next/server"
import { withRole } from "@/lib/auth/rbac"
import { readFile, writeFile, mkdir } from "fs/promises"
import { join } from "path"
import type { Project, ProjectMember } from "@/lib/projects"
import { logger } from "@/lib/logger"

const PROJECTS_PATH = join(process.cwd(), "data", "projects.json")

async function loadProjects(): Promise<Project[]> {
  try {
    const data = await readFile(PROJECTS_PATH, "utf-8")
    const parsed = JSON.parse(data)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

async function saveProjects(projects: Project[]): Promise<void> {
  await mkdir(join(process.cwd(), "data"), { recursive: true })
  await writeFile(PROJECTS_PATH, JSON.stringify(projects, null, 2), "utf-8")
}

export const POST = withRole("admin")(async (request, context) => {
  const params = await context.params
  const id = params?.id
  if (!id) return NextResponse.json({ error: "Project ID required" }, { status: 400 })
  try {
    const body = await request.json()
    const { userId, role, allocationPercent } = body

    if (!userId || !role) {
      return NextResponse.json({ error: "userId and role are required" }, { status: 400 })
    }

    const projects = await loadProjects()
    const idx = projects.findIndex((p) => p.id === id)
    if (idx === -1) return NextResponse.json({ error: "Project not found" }, { status: 404 })

    const members = projects[idx].members || []
    if (members.some((m) => m.userId === userId)) {
      return NextResponse.json({ error: "Member already assigned" }, { status: 400 })
    }

    const member: ProjectMember = {
      userId,
      role: role === "lead" ? "lead" : role === "supervisor" ? "supervisor" : "contributor",
      allocationPercent: allocationPercent ?? undefined,
    }
    members.push(member)
    projects[idx] = {
      ...projects[idx],
      members,
      updatedAt: new Date().toISOString(),
    }
    await saveProjects(projects)
    return NextResponse.json({ member, project: projects[idx] })
  } catch (err) {
    logger.error("Failed to add member", { error: err instanceof Error ? err.message : String(err) })
    return NextResponse.json({ error: "Failed to add member" }, { status: 500 })
  }
})

export const DELETE = withRole("admin")(async (request, context) => {
  const params = await context.params
  const id = params?.id
  if (!id) return NextResponse.json({ error: "Project ID required" }, { status: 400 })
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 })
  }

  try {
    const projects = await loadProjects()
    const idx = projects.findIndex((p) => p.id === id)
    if (idx === -1) return NextResponse.json({ error: "Project not found" }, { status: 404 })

    const members = (projects[idx].members || []).filter((m) => m.userId !== userId)
    projects[idx] = {
      ...projects[idx],
      members,
      updatedAt: new Date().toISOString(),
    }
    await saveProjects(projects)
    return NextResponse.json({ success: true, project: projects[idx] })
  } catch (err) {
    logger.error("Failed to remove member", { error: err instanceof Error ? err.message : String(err) })
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 })
  }
})

import { NextResponse } from "next/server"
import { withRole } from "@/lib/auth/rbac"
import { readFile, writeFile, mkdir } from "fs/promises"
import { join } from "path"
import type { Project } from "@/lib/projects"
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

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  try {
    const projects = await loadProjects()
    const project = projects.find((p) => p.id === id)
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 })
    return NextResponse.json({ project })
  } catch (err) {
    logger.error("Failed to load project", { error: err instanceof Error ? err.message : String(err) })
    return NextResponse.json({ error: "Failed to load project" }, { status: 500 })
  }
}

export const PATCH = withRole("admin")(async (request, context) => {
  const params = await context.params
  const id = params?.id
  if (!id) return NextResponse.json({ error: "Project ID required" }, { status: 400 })
  try {
    const body = await request.json()
    const projects = await loadProjects()
    const idx = projects.findIndex((p) => p.id === id)
    if (idx === -1) return NextResponse.json({ error: "Project not found" }, { status: 404 })

    const p = projects[idx]
    projects[idx] = {
      ...p,
      ...body,
      id: p.id,
      members: body.members ?? p.members,
      updatedAt: new Date().toISOString(),
    }
    await saveProjects(projects)
    return NextResponse.json({ project: projects[idx] })
  } catch (err) {
    logger.error("Failed to update project", { error: err instanceof Error ? err.message : String(err) })
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 })
  }
})

export const DELETE = withRole("admin")(async (_request, context) => {
  const params = await context.params
  const id = params?.id
  if (!id) return NextResponse.json({ error: "Project ID required" }, { status: 400 })
  try {
    const projects = await loadProjects()
    const filtered = projects.filter((p) => p.id !== id)
    if (filtered.length === projects.length) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }
    await saveProjects(filtered)
    return NextResponse.json({ success: true })
  } catch (err) {
    logger.error("Failed to delete project", { error: err instanceof Error ? err.message : String(err) })
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 })
  }
})

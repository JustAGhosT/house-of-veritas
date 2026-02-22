import { NextResponse } from "next/server"
import { withAuth } from "@/lib/auth/rbac"
import { suggestProject } from "@/lib/ai/azure-foundry"
import { readFile } from "fs/promises"
import { join } from "path"
import type { Project } from "@/lib/projects"

const PROJECTS_PATH = join(process.cwd(), "data", "projects.json")

async function loadProjectNames(): Promise<string[]> {
  try {
    const data = await readFile(PROJECTS_PATH, "utf-8")
    const projects: Project[] = JSON.parse(data)
    return (Array.isArray(projects) ? projects : []).map((p) => p.name)
  } catch {
    return ["House Revamp", "Zeerust Arming", "Garage", "Garden Revamp", "Kitchen Cupboards"]
  }
}

export const POST = withAuth(async (request: Request) => {
  try {
    const body = await request.json()
    const { taskTitle, taskDescription, expenseCategory } = body

    const options = await loadProjectNames()
    const suggested = await suggestProject({
      taskTitle: taskTitle || undefined,
      taskDescription: taskDescription || undefined,
      expenseCategory: expenseCategory || undefined,
      options,
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

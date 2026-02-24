import { NextResponse } from "next/server"
import { withAuth } from "@/lib/auth/rbac"
import { suggestProjectFromPhoto } from "@/lib/ai/azure-foundry"
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
    return [
      "House Revamp",
      "Zeerust Arming",
      "Garage",
      "Garden Revamp",
      "Kitchen Cupboards",
      "Lay Paving",
    ]
  }
}

export const POST = withAuth(async (request: Request) => {
  try {
    const body = await request.json()
    const { imageBase64, imageMimeType } = body

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return NextResponse.json({ error: "imageBase64 is required" }, { status: 400 })
    }

    const options = await loadProjectNames()
    const suggested = await suggestProjectFromPhoto({
      imageBase64,
      imageMimeType: imageMimeType || "image/jpeg",
      existingProjectNames: options,
      allowNew: true,
    })

    if (!suggested) {
      return NextResponse.json({
        suggested: null,
        options,
        aiPowered: false,
        message: "AI not configured or failed",
      })
    }

    return NextResponse.json({
      suggested,
      options,
      aiPowered: true,
    })
  } catch (err) {
    return NextResponse.json({ error: "Suggestion failed" }, { status: 500 })
  }
})

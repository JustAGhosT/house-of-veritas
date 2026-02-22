import { NextResponse } from "next/server"
import { withAuth } from "@/lib/auth/rbac"
import { refineDescription } from "@/lib/ai/azure-foundry"

export const POST = withAuth(async (request: Request) => {
  try {
    const body = await request.json()
    const { title, description, context } = body

    if (!title || typeof title !== "string") {
      return NextResponse.json({ error: "title is required" }, { status: 400 })
    }

    const refined = await refineDescription({
      title,
      description: description || undefined,
      context: context || undefined,
    })

    if (!refined) {
      return NextResponse.json({
        refined: description || "",
        aiPowered: false,
        message: "AI not configured or failed",
      })
    }

    return NextResponse.json({
      refined: refined.trim(),
      aiPowered: true,
    })
  } catch (err) {
    return NextResponse.json({ error: "Refine failed" }, { status: 500 })
  }
})

import { NextResponse } from "next/server"
import { withAuth } from "@/lib/auth/rbac"
import { suggestStorageLocation } from "@/lib/ai/azure-foundry"
import { loadStorageOptions } from "@/lib/storage-options"

export const POST = withAuth(async (request: Request) => {
  try {
    const body = await request.json()
    const { name, description, category } = body

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "name is required" }, { status: 400 })
    }

    const options = await loadStorageOptions()
    const suggested = await suggestStorageLocation({
      name,
      description: description || undefined,
      category: category || undefined,
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

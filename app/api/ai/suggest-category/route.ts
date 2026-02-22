import { NextResponse } from "next/server"
import { withAuth } from "@/lib/auth/rbac"
import { suggestAssetCategory } from "@/lib/ai/azure-foundry"
import { ASSET_CATEGORIES } from "@/app/api/assets/enhanced/route"

const CATEGORY_OPTIONS = Object.keys(ASSET_CATEGORIES)

export const POST = withAuth(async (request: Request) => {
  try {
    const body = await request.json()
    const { name, description } = body

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "name is required" }, { status: 400 })
    }

    const suggested = await suggestAssetCategory({
      name,
      description: description || undefined,
      options: CATEGORY_OPTIONS,
    })

    return NextResponse.json({
      suggested: suggested || CATEGORY_OPTIONS[0],
      options: CATEGORY_OPTIONS,
      aiPowered: !!suggested,
    })
  } catch (err) {
    return NextResponse.json({ error: "Suggestion failed" }, { status: 500 })
  }
})

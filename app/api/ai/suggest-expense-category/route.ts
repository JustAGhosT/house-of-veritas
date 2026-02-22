import { NextResponse } from "next/server"
import { withAuth } from "@/lib/auth/rbac"
import { suggestExpenseCategory } from "@/lib/ai/azure-foundry"

const EXPENSE_CATEGORIES = ["Materials", "Supplies", "Fuel", "Tools", "Services", "Maintenance", "Other"]

export const POST = withAuth(async (request: Request) => {
  try {
    const body = await request.json()
    const { vendor, description } = body

    const suggested = await suggestExpenseCategory({
      vendor: vendor || undefined,
      description: description || undefined,
      options: EXPENSE_CATEGORIES,
    })

    return NextResponse.json({
      suggested: suggested || EXPENSE_CATEGORIES[0],
      options: EXPENSE_CATEGORIES,
      aiPowered: !!suggested,
    })
  } catch (err) {
    return NextResponse.json({ error: "Suggestion failed" }, { status: 500 })
  }
})

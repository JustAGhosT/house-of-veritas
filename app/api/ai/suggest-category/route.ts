import { NextResponse } from "next/server"
import { withAuth } from "@/lib/auth/rbac"
import { withErrorHandling } from "@/lib/api/error-handler"
import { createSuggestionHandler } from "@/lib/api/ai-suggestion-handler"
import { suggestAssetCategory } from "@/lib/ai/azure-foundry"
import { ASSET_CATEGORIES } from "@/lib/constants/asset-categories"

const CATEGORY_OPTIONS = Object.keys(ASSET_CATEGORIES)

export const POST = withAuth(
  withErrorHandling(
    createSuggestionHandler<{ name: string; description?: string }>({
      validate: (body) => {
        const name = body.name
        if (!name || typeof name !== "string") {
          return { error: NextResponse.json({ error: "name is required" }, { status: 400 }) }
        }
        return {
          input: {
            name,
            description: body.description as string | undefined,
          },
        }
      },
      suggest: (input) =>
        suggestAssetCategory({
          name: input.name,
          description: input.description,
          options: CATEGORY_OPTIONS,
        }),
      options: CATEGORY_OPTIONS,
    }),
    { operation: "Suggest category failed", fallbackMessage: "Suggestion failed" }
  )
)

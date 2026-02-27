import { withAuth } from "@/lib/auth/rbac"
import { withErrorHandling } from "@/lib/api/error-handler"
import { createSuggestionHandler } from "@/lib/api/ai-suggestion-handler"
import { suggestExpenseCategory } from "@/lib/ai/azure-foundry"

const EXPENSE_CATEGORIES = [
  "Materials",
  "Supplies",
  "Fuel",
  "Tools",
  "Services",
  "Maintenance",
  "Other",
]

export const POST = withAuth(
  withErrorHandling(
    createSuggestionHandler<{ vendor?: string; description?: string }>({
      validate: (body) => ({
        input: {
          vendor: body.vendor as string | undefined,
          description: body.description as string | undefined,
        },
      }),
      suggest: (input) =>
        suggestExpenseCategory({
          vendor: input.vendor,
          description: input.description,
          options: EXPENSE_CATEGORIES,
        }),
      options: EXPENSE_CATEGORIES,
    }),
    { operation: "Suggest expense category failed", fallbackMessage: "Suggestion failed" }
  )
)

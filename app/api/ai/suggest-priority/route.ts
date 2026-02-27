import { NextResponse } from "next/server"
import { withAuth } from "@/lib/auth/rbac"
import { withErrorHandling } from "@/lib/api/error-handler"
import { createSuggestionHandler } from "@/lib/api/ai-suggestion-handler"
import { suggestPriority } from "@/lib/ai/azure-foundry"

const PRIORITY_OPTIONS = ["Low", "Medium", "High"]

export const POST = withAuth(
  withErrorHandling(
    createSuggestionHandler<{ taskTitle: string; taskDescription?: string; dueDate?: string }>({
      validate: (body) => {
        const taskTitle = body.taskTitle
        if (!taskTitle || typeof taskTitle !== "string") {
          return { error: NextResponse.json({ error: "taskTitle is required" }, { status: 400 }) }
        }
        return {
          input: {
            taskTitle,
            taskDescription: body.taskDescription as string | undefined,
            dueDate: body.dueDate as string | undefined,
          },
        }
      },
      suggest: (input) =>
        suggestPriority({
          taskTitle: input.taskTitle,
          taskDescription: input.taskDescription,
          dueDate: input.dueDate,
          options: PRIORITY_OPTIONS,
        }),
      options: PRIORITY_OPTIONS,
      defaultOption: PRIORITY_OPTIONS[1],
    }),
    { operation: "Suggest priority failed", fallbackMessage: "Suggestion failed" }
  )
)

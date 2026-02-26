import { inngest } from "@/lib/inngest/client"
import { sendNotification } from "@/lib/services/notification-service"
import { getAdminNotificationRecipient } from "@/lib/workflows/notification-recipients"
import { formatCurrency, runNotificationStep } from "@/lib/workflows/utils"
import { HIGH_VALUE_THRESHOLD } from "./constants"
import type { ExpensePayload } from "./schema"

export const expenseCreated = inngest.createFunction(
  { id: "expense-created", retries: 2 },
  { event: "house-of-veritas/expense.created" },
  async ({ event, step }) => {
    const expense = event.data as ExpensePayload
    const amount = expense.amount ?? 0
    const isHighValue = amount > HIGH_VALUE_THRESHOLD

    await runNotificationStep(step, async () => {
      await sendNotification({
        type: "approval_required",
        userId: getAdminNotificationRecipient(),
        title: isHighValue
          ? `High-Value Expense (${formatCurrency(amount)}) - Approval Required`
          : "New Expense Pending Approval",
        message: `${expense.submittedBy || "Unknown"} submitted ${formatCurrency(amount)} - ${expense.category ?? ""}${isHighValue ? " (requires additional approval)" : ""}`,
      channels: isHighValue ? ["in_app", "sms"] : ["in_app"],
      data: {
        expenseId: expense.id,
        amount: expense.amount,
        category: expense.category,
        submittedBy: expense.submittedBy,
        highValue: isHighValue,
      },
      priority: isHighValue ? "urgent" : "medium",
      })
    })

    return { notified: true, expenseId: expense.id, highValue: isHighValue }
  }
)

import { inngest } from "@/lib/inngest/client"
import { sendNotification } from "@/lib/services/notification-service"
import type { ExpensePayload } from "./schema"

const HIGH_VALUE_THRESHOLD = 5000

export const expenseCreated = inngest.createFunction(
  { id: "expense-created", retries: 2 },
  { event: "house-of-veritas/expense.created" },
  async ({ event }) => {
    const expense = event.data as ExpensePayload
    const amount = expense.amount ?? 0
    const isHighValue = amount > HIGH_VALUE_THRESHOLD

    await sendNotification({
      type: "approval_required",
      userId: "hans",
      title: isHighValue
        ? `High-Value Expense (R${amount.toLocaleString()}) - Approval Required`
        : "New Expense Pending Approval",
      message: `${expense.submittedBy || "Unknown"} submitted R${amount.toLocaleString()} - ${expense.category ?? ""}${isHighValue ? " (requires additional approval)" : ""}`,
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

    return { notified: true, expenseId: expense.id, highValue: isHighValue }
  }
)

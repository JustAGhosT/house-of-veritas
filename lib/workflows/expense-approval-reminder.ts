import { inngest } from "@/lib/inngest/client"
import { getExpenses } from "@/lib/services/baserow"
import { sendNotification } from "@/lib/services/notification-service"

const REMINDER_HOURS = 48

function hoursSince(dateStr: string): number {
  const start = new Date(dateStr)
  const now = new Date()
  return (now.getTime() - start.getTime()) / (1000 * 60 * 60)
}

export const expenseApprovalReminder = inngest.createFunction(
  { id: "expense-approval-reminder", retries: 2 },
  { cron: "0 9 * * *" },
  async () => {
    const expenses = await getExpenses({ status: "Pending" })
    const pending = expenses.filter((e) => {
      const hours = hoursSince(e.date)
      return hours >= REMINDER_HOURS
    })

    if (pending.length > 0) {
      await sendNotification({
        type: "system_alert",
        userId: "hans",
        title: `Expense Approval Reminder: ${pending.length} pending > 48h`,
        message: pending
          .slice(0, 5)
          .map((e) => `${e.requesterName || "Unknown"}: R${e.amount} (${e.category})`)
          .join("; ") + (pending.length > 5 ? ` +${pending.length - 5} more` : ""),
        channels: ["in_app"],
        data: {
          count: pending.length,
          expenseIds: pending.map((e) => e.id),
        },
        priority: "high",
      })
    }

    return { pendingChecked: expenses.length, remindersSent: pending.length > 0 ? 1 : 0 }
  }
)

import { inngest } from "@/lib/inngest/client"
import { getLoans } from "@/lib/services/baserow"
import { sendNotification } from "@/lib/services/notification-service"

const BASEROW_ID_TO_APP_ID: Record<number, string> = {
  1: "hans",
  2: "charl",
  3: "lucky",
  4: "irma",
}

const REMINDER_DAYS_AHEAD = 7

export const loanRepaymentReminder = inngest.createFunction(
  { id: "loan-repayment-reminder", retries: 2 },
  { cron: "0 9 * * *" },
  async () => {
    const loans = await getLoans({ status: "Active" })
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const reminders: { loanId: number; employeeId: number; amount: number; dueDate: string }[] = []

    for (const loan of loans) {
      if (loan.outstandingBalance <= 0 || !loan.nextRepaymentDate) continue

      const dueDate = new Date(loan.nextRepaymentDate)
      dueDate.setHours(0, 0, 0, 0)
      const daysUntil = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntil >= 0 && daysUntil <= REMINDER_DAYS_AHEAD) {
        reminders.push({
          loanId: loan.id,
          employeeId: loan.employee,
          amount: loan.outstandingBalance,
          dueDate: loan.nextRepaymentDate,
        })
      }
    }

    for (const r of reminders) {
      const appId = BASEROW_ID_TO_APP_ID[r.employeeId] ?? "hans"
      await sendNotification({
        type: "system_alert",
        userId: appId,
        title: "Loan Repayment Due Soon",
        message: `Repayment of R${r.amount.toLocaleString()} due on ${r.dueDate}.`,
        channels: ["in_app"],
        data: { loanId: r.loanId, amount: r.amount, dueDate: r.dueDate },
        priority: "medium",
      })

      await sendNotification({
        type: "system_alert",
        userId: "hans",
        title: "Loan Repayment Reminder",
        message: `Loan #${r.loanId}: R${r.amount.toLocaleString()} due ${r.dueDate}`,
        channels: ["in_app"],
        data: { loanId: r.loanId, employeeId: r.employeeId },
        priority: "low",
      })
    }

    return { loansChecked: loans.length, remindersSent: reminders.length }
  }
)

import { inngest } from "@/lib/inngest/client"
import { getLoans } from "@/lib/services/baserow"
import { sendNotification } from "@/lib/services/notification-service"

const BASEROW_ID_TO_APP_ID: Record<number, string> = {
  1: "hans",
  2: "charl",
  3: "lucky",
  4: "irma",
}

export const loanOverdueEscalation = inngest.createFunction(
  { id: "loan-overdue-escalation", retries: 2 },
  { cron: "0 10 * * *" },
  async () => {
    const loans = await getLoans({ status: "Active" })
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const overdue: { loanId: number; employeeId: number; amount: number; dueDate: string }[] = []

    for (const loan of loans) {
      if (loan.outstandingBalance <= 0 || !loan.nextRepaymentDate) continue

      const dueDate = new Date(loan.nextRepaymentDate)
      dueDate.setHours(0, 0, 0, 0)
      if (dueDate < today) {
        overdue.push({
          loanId: loan.id,
          employeeId: loan.employee,
          amount: loan.outstandingBalance,
          dueDate: loan.nextRepaymentDate,
        })
      }
    }

    for (const o of overdue) {
      const appId = BASEROW_ID_TO_APP_ID[o.employeeId] ?? "hans"
      await sendNotification({
        type: "system_alert",
        userId: appId,
        title: "Overdue Loan Repayment",
        message: `Your repayment of R${o.amount.toLocaleString()} was due on ${o.dueDate}. Please resolve immediately.`,
        channels: ["in_app", "sms"],
        data: { loanId: o.loanId, amount: o.amount, dueDate: o.dueDate },
        priority: "urgent",
      })

      await sendNotification({
        type: "system_alert",
        userId: "hans",
        title: "Overdue Loan - Admin Action Required",
        message: `Loan #${o.loanId}: R${o.amount.toLocaleString()} overdue since ${o.dueDate}`,
        channels: ["in_app", "sms"],
        data: { loanId: o.loanId, employeeId: o.employeeId, amount: o.amount },
        priority: "urgent",
      })
    }

    return { loansChecked: loans.length, overdueCount: overdue.length }
  }
)

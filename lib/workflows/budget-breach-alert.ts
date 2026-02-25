import { inngest } from "@/lib/inngest/client"
import { getBudgets, getExpenses } from "@/lib/services/baserow"
import { sendNotification } from "@/lib/services/notification-service"

export const budgetBreachAlert = inngest.createFunction(
  { id: "budget-breach-alert", retries: 2 },
  { cron: "0 10 1 * *" },
  async () => {
    const budgets = await getBudgets({ status: "Active" })
    const expenses = await getExpenses({ status: "Approved" })

    const now = new Date()
    const currentPeriod = String(now.getFullYear())

    const breaches: { category: string; budget: number; spent: number }[] = []

    for (const b of budgets) {
      if (b.status !== "Active" || b.period !== currentPeriod) continue

      const categorySpent = expenses
        .filter((e) => e.category === b.category)
        .reduce((s, e) => s + e.amount, 0)

      if (categorySpent > b.amount) {
        breaches.push({
          category: b.category,
          budget: b.amount,
          spent: categorySpent,
        })
      }
    }

    if (breaches.length > 0) {
      await sendNotification({
        type: "system_alert",
        userId: "hans",
        title: "Budget Breach Alert",
        message: breaches
          .map(
            (x) =>
              `${x.category}: R${x.spent.toLocaleString()} spent (budget R${x.budget.toLocaleString()})`
          )
          .join("\n"),
        channels: ["in_app"],
        data: { breaches },
        priority: "high",
      })
    }

    return { budgetsChecked: budgets.length, breachesCount: breaches.length }
  }
)

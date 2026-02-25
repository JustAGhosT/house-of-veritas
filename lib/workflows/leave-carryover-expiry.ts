import { inngest } from "@/lib/inngest/client"
import { getEmployees } from "@/lib/services/baserow"
import { sendNotification } from "@/lib/services/notification-service"

const BASEROW_ID_TO_APP_ID: Record<number, string> = {
  1: "hans",
  2: "charl",
  3: "lucky",
  4: "irma",
}

export const leaveCarryoverExpiry = inngest.createFunction(
  { id: "leave-carryover-expiry", retries: 2 },
  { cron: "0 8 1 11,12 *" },
  async () => {
    const employees = await getEmployees()
    const employeeRole = ["Employee"]
    const toCheck = employees.filter((e) => employeeRole.includes(e.role))

    const alerts: { name: string; balance: number; appId: string }[] = []

    for (const emp of toCheck) {
      const balance = emp.leaveBalance ?? 0
      if (balance > 0) {
        const appId = BASEROW_ID_TO_APP_ID[emp.id] ?? "hans"
        alerts.push({ name: emp.fullName, balance, appId })
      }
    }

    for (const a of alerts) {
      await sendNotification({
        type: "system_alert",
        userId: a.appId,
        title: "Leave Balance Expiring Soon",
        message: `You have ${a.balance.toFixed(1)} days of annual leave. Use it before year-end or lose it.`,
        channels: ["in_app"],
        data: { balance: a.balance },
        priority: "medium",
      })
    }

    if (alerts.length > 0) {
      await sendNotification({
        type: "system_alert",
        userId: "hans",
        title: `Leave Carry-over: ${alerts.length} employees with expiring balance`,
        message: alerts.map((a) => `${a.name}: ${a.balance.toFixed(1)} days`).join("; "),
        channels: ["in_app"],
        data: { count: alerts.length },
        priority: "medium",
      })
    }

    return { employeesChecked: toCheck.length, alertsSent: alerts.length }
  }
)

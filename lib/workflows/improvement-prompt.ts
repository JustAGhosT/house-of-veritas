import { inngest } from "@/lib/inngest/client"
import { getEmployees } from "@/lib/services/baserow"
import { sendNotification } from "@/lib/services/notification-service"

const BASEROW_ID_TO_APP_ID: Record<number, string> = {
  1: "hans",
  2: "charl",
  3: "lucky",
  4: "irma",
}

export const improvementPrompt = inngest.createFunction(
  { id: "improvement-prompt", retries: 2 },
  { cron: "0 9 1 * *" },
  async () => {
    const employees = await getEmployees()
    const toPrompt = employees.filter(
      (e) => e.role === "Employee" || e.role === "Resident"
    )

    for (const emp of toPrompt) {
      const appId = BASEROW_ID_TO_APP_ID[emp.id] ?? "hans"
      await sendNotification({
        type: "system_alert",
        userId: appId,
        title: "Workflow Feedback",
        message: "Which workflow slowed you down this month? Share feedback for improvement.",
        channels: ["in_app"],
        data: { type: "improvement_prompt" },
        priority: "low",
      })
    }

    return { prompted: toPrompt.length }
  }
)

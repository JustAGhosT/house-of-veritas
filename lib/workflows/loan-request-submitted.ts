import { inngest } from "@/lib/inngest/client"
import { getAdminNotificationRecipient } from "@/lib/workflows/notification-recipients"
import { sendNotification } from "@/lib/services/notification-service"
import { formatCurrency, runNotificationStep } from "@/lib/workflows/utils"
import type { LoanPayload } from "./schema"

export const loanRequestSubmitted = inngest.createFunction(
  { id: "loan-request-submitted", retries: 2 },
  { event: "house-of-veritas/loan.request.submitted" },
  async ({ event, step }) => {
    const data = event.data as LoanPayload

    await runNotificationStep(step, async () => {
      await sendNotification({
        type: "approval_required",
        userId: getAdminNotificationRecipient(),
        title: "Loan/Advance Request Pending Approval",
        message: `Employee ${data.employeeId} requested ${formatCurrency(data.amount ?? 0)} - ${data.purpose || "No purpose"}`,
        channels: ["in_app"],
        data: {
          loanId: data.id,
          employeeId: data.employeeId,
          amount: data.amount,
          purpose: data.purpose,
        },
        priority: "medium",
      })
    })

    return { notified: true, loanId: data.id }
  }
)

import { inngest } from "@/lib/inngest/client"
import { sendNotification } from "@/lib/services/notification-service"
import type { LoanPayload } from "./schema"

export const loanRequestSubmitted = inngest.createFunction(
  { id: "loan-request-submitted", retries: 2 },
  { event: "house-of-veritas/loan.request.submitted" },
  async ({ event }) => {
    const data = event.data as LoanPayload

    await sendNotification({
      type: "approval_required",
      userId: "hans",
      title: "Loan/Advance Request Pending Approval",
      message: `Employee ${data.employeeId} requested R${data.amount?.toLocaleString()} - ${data.purpose || "No purpose"}`,
      channels: ["in_app"],
      data: {
        loanId: data.id,
        employeeId: data.employeeId,
        amount: data.amount,
        purpose: data.purpose,
      },
      priority: "medium",
    })

    return { notified: true, loanId: data.id }
  }
)

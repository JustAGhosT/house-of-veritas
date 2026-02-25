import { inngest } from "@/lib/inngest/client"
import { sendNotification } from "@/lib/services/notification-service"
import type { LeaveRequestPayload } from "./schema"

export const leaveRequestSubmitted = inngest.createFunction(
  { id: "leave-request-submitted", retries: 2 },
  { event: "house-of-veritas/leave.request.submitted" },
  async ({ event }) => {
    const data = event.data as LeaveRequestPayload

    await sendNotification({
      type: "approval_required",
      userId: "hans",
      title: "Leave Request Pending Approval",
      message: `Employee ${data.employeeId} requested ${data.days} days (${data.startDate} to ${data.endDate}) - ${data.type}`,
      channels: ["in_app"],
      data: {
        leaveRequestId: data.id,
        employeeId: data.employeeId,
        startDate: data.startDate,
        endDate: data.endDate,
        type: data.type,
        days: data.days,
      },
      priority: "medium",
    })

    return { notified: true, leaveRequestId: data.id }
  }
)

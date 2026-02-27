import { inngest } from "@/lib/inngest/client"
import { getAdminNotificationRecipient } from "@/lib/workflows/notification-recipients"
import { sendNotification } from "@/lib/services/notification-service"
import type { ProjectSuggestionApprovedPayload } from "./schema"

export const projectSuggestionApproved = inngest.createFunction(
  { id: "project-suggestion-approved", retries: 2 },
  { event: "house-of-veritas/project.suggestion.approved" },
  async ({ event, step }) => {
    const { projectId, name, type, suggestedBy, reviewedBy } =
      event.data as ProjectSuggestionApprovedPayload

    await step.run("send-notification", async () => {
      await sendNotification({
      type: "system_alert",
      userId: getAdminNotificationRecipient(),
      title: `New project approved: ${name}`,
      message: `${suggestedBy} suggested → ${reviewedBy} approved. Type: ${type}. Project ID: ${projectId}`,
      channels: ["in_app"],
      data: { projectId, name, type, suggestedBy, reviewedBy },
      priority: "medium",
      })
    })

    return { notified: true, projectId }
  }
)

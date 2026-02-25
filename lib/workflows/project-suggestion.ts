import { inngest } from "@/lib/inngest/client"
import { sendNotification } from "@/lib/services/notification-service"
import type { ProjectSuggestionApprovedPayload } from "./schema"

export const projectSuggestionApproved = inngest.createFunction(
  { id: "project-suggestion-approved", retries: 2 },
  { event: "house-of-veritas/project.suggestion.approved" },
  async ({ event }) => {
    const { projectId, name, type, suggestedBy, reviewedBy } =
      event.data as ProjectSuggestionApprovedPayload

    await sendNotification({
      type: "system_alert",
      userId: "hans",
      title: `New project approved: ${name}`,
      message: `${suggestedBy} suggested → ${reviewedBy} approved. Type: ${type}. Project ID: ${projectId}`,
      channels: ["in_app"],
      data: { projectId, name, type, suggestedBy, reviewedBy },
      priority: "medium",
    })

    return { notified: true, projectId }
  }
)

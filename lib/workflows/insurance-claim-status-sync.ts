import { inngest } from "@/lib/inngest/client"
import { getInsuranceClaims, updateInsuranceClaim } from "@/lib/services/baserow"
import { getClaimStatus } from "@/lib/integrations/insurance"
import { sendNotification } from "@/lib/services/notification-service"

export const insuranceClaimStatusSync = inngest.createFunction(
  { id: "insurance-claim-status-sync", retries: 2 },
  { cron: "0 11 * * 1" },
  async () => {
    const claims = await getInsuranceClaims({ status: "Submitted" })
    const claimsUnderReview = await getInsuranceClaims({ status: "Under Review" })
    const toSync = [...claims, ...claimsUnderReview]

    let updated = 0
    for (const c of toSync) {
      if (!c.claimId) continue

      const status = await getClaimStatus(c.claimId)
      if (!status) continue

      const newStatus =
        status.status === "Approved"
          ? "Approved"
          : status.status === "Denied"
            ? "Denied"
            : status.status === "Under Review"
              ? "Under Review"
              : c.status

      if (newStatus !== c.status) {
        await updateInsuranceClaim(c.id, { status: newStatus })
        updated++

        if (newStatus === "Approved" || newStatus === "Denied") {
          await sendNotification({
            type: "system_alert",
            userId: "hans",
            title: `Insurance Claim ${newStatus}`,
            message: `Claim ${c.claimId}: ${newStatus}`,
            channels: ["in_app"],
            data: { claimId: c.claimId, status: newStatus },
            priority: "medium",
          })
        }
      }
    }

    return { claimsSynced: toSync.length, updated }
  }
)

import { inngest } from "@/lib/inngest/client"
import { getContractorContracts } from "@/lib/services/baserow"
import { sendNotification } from "@/lib/services/notification-service"

export const contractorPaymentDue = inngest.createFunction(
  { id: "contractor-payment-due", retries: 2 },
  { cron: "0 8 * * *" },
  async () => {
    const contracts = await getContractorContracts({ status: "Active" })
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const duePayments: { contractId: number; project: string; milestone: string; amount: number }[] =
      []

    for (const c of contracts) {
      let milestones: string[] = []
      let amounts: number[] = []
      try {
        milestones = JSON.parse(c.milestones || "[]") as string[]
        amounts = JSON.parse(c.amounts || "[]") as number[]
      } catch {
        continue
      }

      for (let i = 0; i < milestones.length; i++) {
        const dueDate = new Date(milestones[i])
        dueDate.setHours(0, 0, 0, 0)
        const amount = amounts[i] ?? 0
        if (dueDate.getTime() === today.getTime() && amount > 0) {
          duePayments.push({
            contractId: c.id,
            project: c.project,
            milestone: milestones[i],
            amount,
          })
        }
      }
    }

    for (const p of duePayments) {
      await sendNotification({
        type: "approval_required",
        userId: "hans",
        title: "Contractor Payment Due",
        message: `Contract ${p.contractId} (${p.project}): R${p.amount.toLocaleString()} due today`,
        channels: ["in_app"],
        data: { contractId: p.contractId, project: p.project, amount: p.amount },
        priority: "medium",
      })
    }

    return { contractsChecked: contracts.length, paymentsDue: duePayments.length }
  }
)

import { inngest } from "./client"

export const healthCheck = inngest.createFunction(
  { id: "health-check" },
  { event: "house-of-veritas/health.check" },
  async () => ({ ok: true })
)

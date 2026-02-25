import { inngest } from "@/lib/inngest/client"
import { logger } from "@/lib/logger"
import type { WorkflowEvent } from "./schema"

export * from "./schema"

export async function routeToInngest(event: WorkflowEvent): Promise<void> {
  try {
    await inngest.send({
      name: event.name,
      data: event.data ?? {},
    })
  } catch (error) {
    logger.error("routeToInngest failed", {
      event: event.name,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

/**
 * Shared notification step utilities for Inngest workflows.
 * Wraps step.run for consistent notification sending with retries.
 */

export interface InngestStepLike {
  run: (id: string, fn: () => Promise<unknown>) => Promise<unknown>
}

/**
 * Run a notification send inside an Inngest step for proper retry/memoization.
 * @param step - Inngest step object from createFunction handler
 * @param fn - Async function that sends notification(s)
 * @param stepId - Optional step ID (default: "send-notification")
 */
export async function runNotificationStep(
  step: InngestStepLike,
  fn: () => Promise<void>,
  stepId = "send-notification"
): Promise<void> {
  await step.run(stepId, async () => {
    await fn()
  })
}

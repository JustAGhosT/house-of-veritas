export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { logger } = await import("@/lib/logger")
    logger.info("Next.js server starting", {
      nodeEnv: process.env.NODE_ENV,
      runtime: process.env.NEXT_RUNTIME,
    })
  }
}

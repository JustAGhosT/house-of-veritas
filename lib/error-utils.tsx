"use client"

import { ErrorDisplay, flattenErrors } from "@/components/error-display"
import { logger } from "@/lib/logger"
import { useEffect } from "react"

// Sanitize error object to remove sensitive data before logging
function sanitizeError(error: Error & { digest?: string }): Record<string, unknown> {
  return {
    name: error?.name,
    message: error?.message,
    digest: error?.digest,
    // Truncate stack to first 5 lines to avoid leaking internal paths
    stack: error?.stack?.split("\n").slice(0, 5).join("\n"),
  }
}

export function createErrorComponent(context: string) {
  return function Error({
    error,
    reset,
  }: {
    error: Error & { digest?: string }
    reset: () => void
  }) {
    useEffect(() => {
      logger.error(`${context} error`, sanitizeError(error))
    }, [error])

    return <ErrorDisplay errors={flattenErrors(error)} onRetry={reset} variant="page" />
  }
}

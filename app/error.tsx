"use client"

import { useEffect } from "react"
import { ErrorDisplay, flattenErrors } from "@/components/error-display"
import { logger } from "@/lib/logger"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logger.error("Application error", { error: error?.message, digest: error?.digest })
  }, [error])

  return (
    <ErrorDisplay
      errors={flattenErrors(error)}
      onRetry={reset}
      variant="page"
    />
  )
}

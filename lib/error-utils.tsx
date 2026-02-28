"use client"

import { ErrorDisplay, flattenErrors } from "@/components/error-display"
import { logger } from "@/lib/logger"
import { useEffect } from "react"

export function createErrorComponent(context: string) {
    return function Error({
        error,
        reset,
    }: {
        error: Error & { digest?: string }
        reset: () => void
    }) {
        useEffect(() => {
            logger.error(`${context} error`, {
                error: error?.message,
                stack: error?.stack,
                digest: error?.digest,
                fullError: error
            })
        }, [error])

        return <ErrorDisplay errors={flattenErrors(error)} onRetry={reset} variant="page" />
    }
}

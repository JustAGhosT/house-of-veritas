import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"

type RouteHandler = (
  request: Request,
  context?: unknown
) => Promise<NextResponse> | NextResponse

export function withErrorHandling(
  handler: RouteHandler,
  options: { operation: string; fallbackMessage?: string; status?: number }
): RouteHandler {
  const { operation, fallbackMessage = "Operation failed", status = 500 } = options
  return async (request, context) => {
    try {
      return await handler(request, context)
    } catch (error) {
      logger.error(operation, {
        error: error instanceof Error ? error.message : String(error),
      })
      return NextResponse.json({ error: fallbackMessage }, { status })
    }
  }
}

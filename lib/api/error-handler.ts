import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

type RouteHandler<TContext = unknown> = (
  request: Request,
  context?: TContext
) => Promise<NextResponse> | NextResponse

export function withErrorHandling<TContext>(
  handler: RouteHandler<TContext>,
  options: { operation: string; fallbackMessage?: string; status?: number }
): RouteHandler<TContext> {
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

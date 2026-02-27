import { NextResponse } from "next/server"

type RouteHandler = (
  request: Request,
  context?: unknown
) => Promise<NextResponse> | NextResponse

export function createSuggestionHandler<T>(config: {
  validate: (body: Record<string, unknown>) => { error?: NextResponse; input?: T }
  suggest: (input: T) => Promise<string | null>
  options: string[]
  defaultOption?: string
}): RouteHandler {
  const { validate, suggest, options, defaultOption } = config
  const fallback = defaultOption ?? options[0] ?? ""

  return async (request) => {
    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    const { error, input } = validate(body)
    if (error) return error
    if (input == null) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 })
    }

    const suggested = await suggest(input)
    return NextResponse.json({
      suggested: suggested ?? fallback,
      options,
      aiPowered: !!suggested,
    })
  }
}

import { NextResponse } from "next/server"

export function requireId(
  body: Record<string, unknown>,
  field: string,
  label: string
): { id: number; error?: NextResponse } {
  const value = body[field]
  if (value == null) {
    return {
      id: 0,
      error: NextResponse.json({ error: `${label} is required` }, { status: 400 }),
    }
  }
  const id = typeof value === "number" ? value : parseInt(String(value), 10)
  if (Number.isNaN(id)) {
    return {
      id: 0,
      error: NextResponse.json({ error: `Invalid ${label} ID` }, { status: 400 }),
    }
  }
  return { id }
}

export function parseOptionalInt(value: string | null): number | undefined {
  if (value == null) return undefined
  const parsed = parseInt(value, 10)
  return Number.isNaN(parsed) ? undefined : parsed
}

export function requireFields(
  body: Record<string, unknown>,
  fields: string[],
  label: string
): { error?: NextResponse } {
  const missing = fields.filter((f) => {
    const v = body[f]
    return v == null || (typeof v === "string" && !v.trim())
  })
  if (missing.length > 0) {
    return {
      error: NextResponse.json(
        { error: `${label}: ${missing.join(", ")} are required` },
        { status: 400 }
      ),
    }
  }
  return {}
}

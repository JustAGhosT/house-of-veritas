import { NextResponse } from "next/server"
import { withRole } from "@/lib/auth/rbac"
import {
  loadStorageOptions,
  saveStorageOptions,
  DEFAULT_STORAGE_OPTIONS,
} from "@/lib/storage-options"
import { logger } from "@/lib/logger"

export async function GET() {
  try {
    const options = await loadStorageOptions()
    return NextResponse.json({ options })
  } catch (err) {
    logger.error("Failed to load storage options", {
      error: err instanceof Error ? err.message : String(err),
    })
    return NextResponse.json({ options: DEFAULT_STORAGE_OPTIONS })
  }
}

export const POST = withRole("admin")(async (request: Request) => {
  try {
    const body = await request.json()
    const { options } = body

    if (!Array.isArray(options) || options.some((o) => typeof o !== "string")) {
      return NextResponse.json({ error: "options must be an array of strings" }, { status: 400 })
    }

    const trimmed = options.map((o: string) => String(o).trim()).filter(Boolean)
    if (trimmed.length === 0) {
      return NextResponse.json({ error: "At least one option required" }, { status: 400 })
    }

    await saveStorageOptions(trimmed)
    return NextResponse.json({ success: true, options: trimmed })
  } catch (err) {
    logger.error("Failed to save storage options", {
      error: err instanceof Error ? err.message : String(err),
    })
    return NextResponse.json({ error: "Failed to save" }, { status: 500 })
  }
})

import { NextRequest, NextResponse } from "next/server"
import { readFile, readdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import {
  isPostgresConfigured,
  query,
  ensureSchema,
} from "@/lib/db/postgres"

const UPLOAD_DIR = "/tmp/hov-uploads"

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
}

let schemaEnsured = false

async function ensureSchemaOnce() {
  if (!schemaEnsured && isPostgresConfigured()) {
    await ensureSchema()
    schemaEnsured = true
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: "File ID required" }, { status: 400 })
  }

  try {
    let storedName: string | null = null
    let mimeType = "application/octet-stream"

    if (isPostgresConfigured()) {
      await ensureSchemaOnce()
      const { rows } = await query<{ stored_name: string; mime_type: string }>(
        `SELECT stored_name, mime_type FROM file_uploads WHERE id = $1`,
        [id]
      )
      if (rows[0]) {
        storedName = rows[0].stored_name
        mimeType = rows[0].mime_type
      }
    }

    if (!storedName && existsSync(UPLOAD_DIR)) {
      const files = await readdir(UPLOAD_DIR)
      const match = files.find((f) => f.startsWith(id) || f === `${id}`)
      if (match) {
        storedName = match
        mimeType = MIME_BY_EXT[path.extname(match).toLowerCase()] || mimeType
      }
    }

    if (!storedName) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    const filePath = path.join(UPLOAD_DIR, storedName)
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    const buffer = await readFile(filePath)
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "private, max-age=3600",
      },
    })
  } catch {
    return NextResponse.json(
      { error: "Failed to retrieve file" },
      { status: 500 }
    )
  }
}

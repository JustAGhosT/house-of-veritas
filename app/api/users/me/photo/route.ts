import { NextResponse } from "next/server"
import { withAuth } from "@/lib/auth/rbac"
import { updateUserProfileAsync } from "@/lib/users"
import { readFile, mkdir, writeFile } from "fs/promises"
import path from "path"
import crypto from "crypto"
import { existsSync } from "fs"

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "profiles")
const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"]

function generateFilename(ext: string): string {
  return `profile-${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`
}

export const POST = withAuth(async (request, context) => {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Use JPEG, PNG, WebP, or GIF." }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large. Max 5MB." }, { status: 400 })
    }

    const ext = path.extname(file.name) || ".jpg"
    const filename = generateFilename(ext)

    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const filePath = path.join(UPLOAD_DIR, filename)
    await writeFile(filePath, buffer)

    const photoUrl = `/uploads/profiles/${filename}`

    const updated = await updateUserProfileAsync(context.userId, { photoUrl })
    if (!updated) return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })

    return NextResponse.json({ success: true, photoUrl })
  } catch (err) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
})

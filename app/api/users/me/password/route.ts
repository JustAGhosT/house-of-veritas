import { NextResponse } from "next/server"
import { withAuth } from "@/lib/auth/rbac"
import { setPasswordAsync } from "@/lib/users"

export const POST = withAuth(async (request, context) => {
  try {
    const body = await request.json()
    const { password } = body

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    const ok = await setPasswordAsync(context.userId, password)
    if (!ok) return NextResponse.json({ error: "Failed to update password" }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 })
  }
})

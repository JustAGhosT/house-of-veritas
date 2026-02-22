import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyToken, COOKIE_NAME } from "@/lib/auth/jwt"
import { findUserByIdAsync, safeUser } from "@/lib/users"
import { getUserWithManagement } from "@/lib/user-management"

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  const payload = await verifyToken(token)
  if (!payload) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  const withMgmt = await getUserWithManagement(payload.userId)
  if (withMgmt) {
    return NextResponse.json({ user: withMgmt })
  }

  const user = await findUserByIdAsync(payload.userId)
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  return NextResponse.json({
    user: {
      ...safeUser(user),
      onboardingStatus: user.id === "hans" ? "completed" : "pending",
      responsibilities: user.specialty || [],
      status: "active",
      offboardingStatus: "none",
      onboardingCompletedAt: null,
      offboardingInitiatedAt: null,
    },
  })
}

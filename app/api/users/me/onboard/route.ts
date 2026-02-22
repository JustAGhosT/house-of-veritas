import { NextResponse } from "next/server"
import { withAuth } from "@/lib/auth/rbac"
import { completeOnboardingStep, getUserWithManagement } from "@/lib/user-management"

export const POST = withAuth(async (request, context) => {
  const userId = context.userId
  const user = await getUserWithManagement(userId)
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
  if (user.onboardingStatus === "completed") {
    return NextResponse.json({ user })
  }
  const updated = await completeOnboardingStep(userId)
  if (!updated) return NextResponse.json({ error: "Update failed" }, { status: 500 })
  return NextResponse.json({ user: updated })
})

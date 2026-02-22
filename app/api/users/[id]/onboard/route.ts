import { NextResponse } from "next/server"
import { withRole } from "@/lib/auth/rbac"
import { completeOnboardingStep } from "@/lib/user-management"

export const POST = withRole("admin")(async (_request, context) => {
  const params = await context.params
  const id = params?.id
  if (!id) return NextResponse.json({ error: "User ID required" }, { status: 400 })
  const user = await completeOnboardingStep(id)
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
  return NextResponse.json({ user })
})

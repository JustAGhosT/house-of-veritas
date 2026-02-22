import { NextResponse } from "next/server"
import { withRole } from "@/lib/auth/rbac"
import { initiateOffboarding, completeOffboarding } from "@/lib/user-management"

export const POST = withRole("admin")(async (request, context) => {
  const params = await context.params
  const id = params?.id
  if (!id) return NextResponse.json({ error: "User ID required" }, { status: 400 })

  const body = await request.json().catch(() => ({}))
  const complete = body.complete === true

  const user = complete ? await completeOffboarding(id) : await initiateOffboarding(id)
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
  return NextResponse.json({ user })
})

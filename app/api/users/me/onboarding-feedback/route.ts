import { NextResponse } from "next/server"
import { withAuth } from "@/lib/auth/rbac"
import { getUserWithManagement, updateUserManagement } from "@/lib/user-management"
import { logger } from "@/lib/logger"

export const POST = withAuth(async (request, context) => {
  try {
    const body = await request.json().catch(() => ({}))
    const { roleChangeRequest, responsibilities } = body

    const user = await getUserWithManagement(context.userId)
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    if (typeof roleChangeRequest === "string" && roleChangeRequest.trim()) {
      logger.info("Onboarding role change request", {
        userId: context.userId,
        requestedRole: roleChangeRequest,
      })
    }

    if (Array.isArray(responsibilities)) {
      const valid = responsibilities.filter((r: unknown) => typeof r === "string")
      await updateUserManagement(context.userId, { responsibilities: valid })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 })
  }
})

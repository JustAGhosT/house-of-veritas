import { NextResponse } from "next/server"
import { withRole } from "@/lib/auth/rbac"
import { getAllUsersWithManagement } from "@/lib/user-management"

export const GET = withRole("admin")(async () => {
  const users = await getAllUsersWithManagement()
  return NextResponse.json({ users, total: users.length })
})

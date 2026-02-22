import { NextResponse } from "next/server"
import { withRole } from "@/lib/auth/rbac"
import { getAllUsersAsync, safeUser } from "@/lib/users"

export const GET = withRole("admin")(async () => {
  const users = await getAllUsersAsync()
  const safeUsers = users.map(safeUser)
  return NextResponse.json({
    users: safeUsers,
    total: safeUsers.length,
  })
})

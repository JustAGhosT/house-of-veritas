import { NextResponse } from "next/server"
import { withRole } from "@/lib/auth/rbac"
import {
  ALL_PAGES,
  getRolePageAssignments,
  setRolePageAssignments,
} from "@/lib/dashboard-config"
import { UserRole } from "@/lib/users"

export const GET = withRole("admin")(async (request) => {
  const { searchParams } = new URL(request.url)
  const role = searchParams.get("role") as UserRole | null
  if (!role) {
    return NextResponse.json({ pages: ALL_PAGES })
  }
  const assignments = await getRolePageAssignments(role)
  return NextResponse.json({ pages: ALL_PAGES, assignments })
})

export const PATCH = withRole("admin")(async (request) => {
  const body = await request.json()
  const { role, pageIds, assignments } = body
  if (!role) return NextResponse.json({ error: "Role required" }, { status: 400 })
  await setRolePageAssignments(role as UserRole, pageIds || [], assignments)
  return NextResponse.json({ success: true })
})

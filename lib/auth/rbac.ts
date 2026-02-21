import { NextResponse, type NextRequest } from "next/server"
import type { UserRole } from "@/lib/users"

export interface AuthenticatedRequest extends NextRequest {
  userId: string
  userRole: UserRole
  userEmail: string
}

export function getAuthContext(request: Request): {
  userId: string
  role: UserRole
  email: string
} | null {
  const userId = request.headers.get("x-user-id")
  const role = request.headers.get("x-user-role") as UserRole | null
  const email = request.headers.get("x-user-email")

  if (!userId || !role || !email) return null
  return { userId, role, email }
}

type RouteHandler = (
  request: Request,
  context: { userId: string; role: UserRole; email: string }
) => Promise<NextResponse> | NextResponse

export function withRole(...allowedRoles: UserRole[]) {
  return function (handler: RouteHandler) {
    return async function (request: Request, routeContext?: unknown) {
      const auth = getAuthContext(request)
      if (!auth) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 })
      }

      if (auth.role !== "admin" && !allowedRoles.includes(auth.role)) {
        return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
      }

      return handler(request, auth)
    }
  }
}

export function withAuth(handler: RouteHandler) {
  return async function (request: Request, routeContext?: unknown) {
    const auth = getAuthContext(request)
    if (!auth) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }
    return handler(request, auth)
  }
}

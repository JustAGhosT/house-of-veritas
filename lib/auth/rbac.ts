import { NextResponse, type NextRequest } from "next/server"
import type { UserRole } from "@/lib/users"
import { hasResponsibility, getDefaultResponsibilities, type Responsibility } from "@/lib/access-config"

export interface AuthenticatedRequest extends NextRequest {
  userId: string
  userRole: UserRole
  userEmail: string
}

export function getAuthContext(request: Request): {
  userId: string
  role: UserRole
  email: string
  responsibilities?: string[]
} | null {
  const userId = request.headers.get("x-user-id")
  const role = request.headers.get("x-user-role") as UserRole | null
  const email = request.headers.get("x-user-email")
  const responsibilitiesHeader = request.headers.get("x-user-responsibilities")

  if (!userId || !role || !email) return null

  let responsibilities: string[]
  if (responsibilitiesHeader) {
    try {
      const parsed = JSON.parse(responsibilitiesHeader)
      responsibilities = Array.isArray(parsed) ? (parsed as string[]) : getDefaultResponsibilities(role)
    } catch {
      responsibilities = getDefaultResponsibilities(role)
    }
  } else {
    responsibilities = getDefaultResponsibilities(role)
  }

  return { userId, role, email, responsibilities }
}

export type RouteContext = {
  userId: string
  role: UserRole
  email: string
  responsibilities?: string[]
  params?: Promise<Record<string, string>>
}

type RouteHandler = (
  request: Request,
  context: RouteContext
) => Promise<NextResponse> | NextResponse

export function withRole(...allowedRoles: UserRole[]) {
  return function (handler: RouteHandler) {
    return async function (request: Request, routeContext?: { params?: Promise<Record<string, string>> }) {
      const auth = getAuthContext(request)
      if (!auth) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 })
      }

      if (auth.role !== "admin" && !allowedRoles.includes(auth.role)) {
        return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
      }

      const context: RouteContext = { ...auth, params: routeContext?.params }
      return handler(request, context)
    }
  }
}

/**
 * Optional: require a specific responsibility for access.
 * Admin bypasses. Use when role alone is too coarse.
 */
export function withResponsibility(required: Responsibility) {
  return function (handler: RouteHandler) {
    return async function (request: Request, routeContext?: { params?: Promise<Record<string, string>> }) {
      const auth = getAuthContext(request)
      if (!auth) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 })
      }

      if (auth.role !== "admin" && !hasResponsibility(auth.responsibilities ?? [], required)) {
        return NextResponse.json(
          { error: `Requires responsibility: ${required}` },
          { status: 403 }
        )
      }

      const context: RouteContext = { ...auth, params: routeContext?.params }
      return handler(request, context)
    }
  }
}

export function withAuth(handler: RouteHandler) {
  return async function (request: Request, routeContext?: { params?: Promise<Record<string, string>> }) {
    const auth = getAuthContext(request)
    if (!auth) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }
    const context: RouteContext = { ...auth, params: routeContext?.params }
    return handler(request, context)
  }
}

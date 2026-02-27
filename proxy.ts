import { NextResponse, type NextRequest } from "next/server"
import { verifyToken, COOKIE_NAME } from "@/lib/auth/jwt"
import { rateLimitAsync } from "@/lib/auth/rate-limit-edge"

const PUBLIC_PATHS = [
  "/api/auth/login",
  "/api/auth/reset-password",
  "/api/auth/logout",
  "/api/health",
  "/api/kiosk",
  "/kiosk",
  "/offline",
  "/",
]

const LOGIN_RATE_LIMIT = process.env.E2E_TEST || process.env.CI ? 50 : 5
const LOGIN_WINDOW_MS = 60_000
const API_RATE_LIMIT = 100
const API_WINDOW_MS = 60_000

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true
  return PUBLIC_PATHS.some((p) => p.endsWith("/") === false && pathname.startsWith(p + "/"))
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  )
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff2?|ttf|eot|map|webmanifest)$/)
  ) {
    return NextResponse.next()
  }

  const ip = getClientIp(request)

  if (pathname === "/api/auth/login" && request.method === "POST") {
    const rl = await rateLimitAsync(`login:${ip}`, LOGIN_RATE_LIMIT, LOGIN_WINDOW_MS)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
            "X-RateLimit-Remaining": "0",
          },
        }
      )
    }
  }

  const kioskPatchRequiresAuth = pathname === "/api/kiosk/requests" && request.method === "PATCH"
  if (isPublicPath(pathname) && !kioskPatchRequiresAuth) {
    return NextResponse.next()
  }

  const isApiRoute = pathname.startsWith("/api/")
  const isDashboardRoute = pathname.startsWith("/dashboard")
  const isOnboardingRoute = pathname === "/onboarding" || pathname.startsWith("/onboarding/")

  if (!isApiRoute && !isDashboardRoute && !isOnboardingRoute) {
    return NextResponse.next()
  }

  const token = request.cookies.get(COOKIE_NAME)?.value

  if (!token) {
    if (isApiRoute) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }
    const homeUrl = new URL("/", request.url)
    homeUrl.searchParams.set("redirect", pathname)
    homeUrl.searchParams.set("login", "true")
    return NextResponse.redirect(homeUrl)
  }

  const payload = await verifyToken(token)
  if (!payload) {
    if (isApiRoute) {
      return NextResponse.json({ error: "Invalid or expired session" }, { status: 401 })
    }
    const homeUrl = new URL("/", request.url)
    homeUrl.searchParams.set("login", "true")
    return NextResponse.redirect(homeUrl)
  }

  if (isApiRoute) {
    const rl = await rateLimitAsync(`api:${payload.userId}`, API_RATE_LIMIT, API_WINDOW_MS)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
            "X-RateLimit-Remaining": "0",
          },
        }
      )
    }
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-user-id", payload.userId)
  requestHeaders.set("x-user-role", payload.role)
  requestHeaders.set("x-user-email", payload.email)

  if (isDashboardRoute) {
    const dashboardUser = pathname.split("/")[2]
    if (dashboardUser && dashboardUser !== payload.userId && payload.role !== "admin") {
      return NextResponse.redirect(new URL(`/dashboard/${payload.userId}`, request.url))
    }
  }

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  matcher: ["/api/:path*", "/dashboard/:path*", "/onboarding", "/onboarding/:path*"],
}

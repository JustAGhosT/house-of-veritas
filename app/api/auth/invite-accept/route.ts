import { getSessionCookieConfig, signToken } from "@/lib/auth/jwt"
import { invalidateInviteToken, validateInviteToken } from "@/lib/invite"
import { findUserByIdAsync } from "@/lib/users"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")
  if (!token) {
    return NextResponse.redirect(new URL("/?error=missing_token", request.url))
  }

  const parsed = await validateInviteToken(token)
  if (!parsed) {
    return NextResponse.redirect(new URL("/?error=invalid_token", request.url))
  }

  const user = await findUserByIdAsync(parsed.userId)
  if (!user) {
    return NextResponse.redirect(new URL("/?error=invalid_token", request.url))
  }

  try {
    const jwt = await signToken({
      userId: user.id,
      role: user.role,
      email: user.email,
    })

    const cookie = getSessionCookieConfig(jwt)
    const base = new URL(request.url).origin
    const redirect = NextResponse.redirect(new URL("/onboarding", base))
    redirect.cookies.set(cookie.name, cookie.value, {
      httpOnly: cookie.httpOnly,
      secure: cookie.secure,
      sameSite: cookie.sameSite,
      path: cookie.path,
      maxAge: cookie.maxAge,
    })

    // Invalidate token with retry logic after successful session creation
    try {
      let retries = 3
      let lastError: unknown = null
      
      while (retries > 0) {
        try {
          await invalidateInviteToken(token)
          lastError = null
          break
        } catch (error) {
          lastError = error
          retries--
          if (retries > 0) {
            // Short backoff: 100ms, 200ms, 300ms
            await new Promise(resolve => setTimeout(resolve, (4 - retries) * 100))
          }
        }
      }
      
      if (lastError) {
        // All retries failed - emit monitored alert
        console.error("Failed to invalidate invite token after retries", {
          tokenId: token.slice(0, 8) + "...",
          error: lastError instanceof Error ? lastError.message : String(lastError),
          timestamp: new Date().toISOString(),
        })
        // Note: In production, integrate with monitoring service like App Insights
        // Example: telemetryClient.trackException({ exception: lastError as Error })
      }
    } catch (invalidationError) {
      // Fallback error handling
      console.error("Failed to invalidate invite token:", invalidationError)
    }

    return redirect
  } catch (error) {
    // If session creation fails, token remains valid for retry
    console.error("Failed to create session:", error)
    return NextResponse.redirect(new URL("/?error=session_failed", request.url))
  }
}

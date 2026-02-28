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

    // Invalidate token only after successful session creation
    try {
      await invalidateInviteToken(token)
    } catch (invalidationError) {
      // Log the invalidation error but don't fail the session creation
      console.error("Failed to invalidate invite token:", invalidationError)
      return NextResponse.redirect(new URL("/?error=token_invalidation_failed", request.url))
    }

    return redirect
  } catch (error) {
    // If session creation fails, token remains valid for retry
    console.error("Failed to create session:", error)
    return NextResponse.redirect(new URL("/?error=session_failed", request.url))
  }
}

import { NextResponse } from "next/server"
import { validateInviteToken } from "@/lib/invite"
import { findUserByIdAsync, safeUser } from "@/lib/users"
import { signToken, getSessionCookieConfig } from "@/lib/auth/jwt"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")
  if (!token) {
    return NextResponse.redirect(new URL("/login?error=missing_token", request.url))
  }

  const parsed = await validateInviteToken(token)
  if (!parsed) {
    return NextResponse.redirect(new URL("/login?error=invalid_token", request.url))
  }

  const user = await findUserByIdAsync(parsed.userId)
  if (!user) {
    return NextResponse.redirect(new URL("/login?error=user_not_found", request.url))
  }

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
  return redirect
}

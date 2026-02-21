import { NextResponse } from "next/server"
import { getClearSessionCookieConfig } from "@/lib/auth/jwt"

export async function POST() {
  const cookie = getClearSessionCookieConfig()
  const response = NextResponse.json({ success: true })

  response.cookies.set(cookie.name, cookie.value, {
    httpOnly: cookie.httpOnly,
    secure: cookie.secure,
    sameSite: cookie.sameSite,
    path: cookie.path,
    maxAge: cookie.maxAge,
  })

  return response
}

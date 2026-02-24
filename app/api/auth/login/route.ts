import { NextResponse } from "next/server"
import {
  findUserByEmailAsync,
  findUserByIdAsync,
  getPasswordHashAsync,
  verifyPassword,
  safeUser,
} from "@/lib/users"
import { signToken, getSessionCookieConfig } from "@/lib/auth/jwt"
import { logger } from "@/lib/logger"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, userId } = body

    const user = email ? await findUserByEmailAsync(email) : await findUserByIdAsync(userId)

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const hash = await getPasswordHashAsync(user.id)
    if (!verifyPassword(password, hash)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const token = await signToken({
      userId: user.id,
      role: user.role,
      email: user.email,
    })

    const cookie = getSessionCookieConfig(token)
    const response = NextResponse.json({
      success: true,
      user: safeUser(user),
      redirectTo: `/dashboard/${user.id}`,
    })

    response.cookies.set(cookie.name, cookie.value, {
      httpOnly: cookie.httpOnly,
      secure: cookie.secure,
      sameSite: cookie.sameSite,
      path: cookie.path,
      maxAge: cookie.maxAge,
    })

    return response
  } catch (error) {
    logger.error("Login error", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}

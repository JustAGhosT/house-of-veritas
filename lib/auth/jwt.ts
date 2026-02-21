import { SignJWT, jwtVerify, type JWTPayload } from "jose"
import type { UserRole } from "@/lib/users"

export interface TokenPayload extends JWTPayload {
  userId: string
  role: UserRole
  email: string
}

let _jwtSecret: Uint8Array | null = null

function getJwtSecret(): Uint8Array {
  if (!_jwtSecret) {
    const secret = process.env.JWT_SECRET
    if (!secret && process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET environment variable is required in production")
    }
    _jwtSecret = new TextEncoder().encode(secret || "hov-dev-secret-change-in-production")
  }
  return _jwtSecret
}

const TOKEN_EXPIRY = "8h"
const COOKIE_NAME = "hov_session"

export async function signToken(payload: Omit<TokenPayload, keyof JWTPayload>): Promise<string> {
  return new SignJWT(payload as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(getJwtSecret())
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    return payload as TokenPayload
  } catch {
    return null
  }
}

export function getSessionCookieConfig(token: string) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 8 * 60 * 60,
  }
}

export function getClearSessionCookieConfig() {
  return {
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  }
}

export { COOKIE_NAME }

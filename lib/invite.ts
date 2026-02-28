import { SignJWT, jwtVerify } from "jose"
import { findUserByIdAsync } from "@/lib/users"
import { sendNotification } from "@/lib/services/notification-service"
import { logger } from "@/lib/logger"

const INVITE_EXPIRY_HOURS = 72
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000 // 1 hour

function getSecret() {
  const secret = process.env.INVITE_JWT_SECRET || process.env.JWT_SECRET

  if (!secret || !secret.trim()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Invite JWT secret is not configured. Set INVITE_JWT_SECRET or JWT_SECRET.")
    }
    // Development/test fallback
    return new TextEncoder().encode("hov-dev-secret")
  }

  return new TextEncoder().encode(secret)
}

export async function createInviteToken(userId: string): Promise<string> {
  const user = await findUserByIdAsync(userId)
  if (!user) throw new Error("User not found")

  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${INVITE_EXPIRY_HOURS}h`)
    .sign(getSecret())
}

// In-memory store for invalidated tokens with expiry timestamps (token -> expiryTimestamp)
// In production, use Redis or database
const invalidatedTokens = new Map<string, number>()

// Cleanup expired tokens periodically
const cleanupInterval = setInterval(() => {
  const now = Date.now()
  let cleaned = 0
  for (const [token, expiry] of invalidatedTokens.entries()) {
    if (expiry <= now) {
      invalidatedTokens.delete(token)
      cleaned++
    }
  }
  if (cleaned > 0) {
    logger.debug("Cleaned up expired invalidated tokens", { count: cleaned })
  }
}, CLEANUP_INTERVAL_MS)

// Export cleanup function for tests or graceful shutdown
export function stopInviteTokenCleanup(): void {
  clearInterval(cleanupInterval)
}

export async function validateInviteToken(token: string): Promise<{ userId: string } | null> {
  try {
    // Check if token has been invalidated and cleanup expired entries
    const expiry = invalidatedTokens.get(token)
    if (expiry) {
      if (expiry > Date.now()) {
        return null
      }
      // Token expired, remove it
      invalidatedTokens.delete(token)
    }
    const { payload } = await jwtVerify(token, getSecret())
    const userId = payload.userId as string
    return userId ? { userId } : null
  } catch {
    return null
  }
}

export async function invalidateInviteToken(token: string): Promise<void> {
  // Store token with expiry (72 hours from now, matching token expiry)
  const expiryMs = Date.now() + INVITE_EXPIRY_HOURS * 60 * 60 * 1000
  invalidatedTokens.set(token, expiryMs)
  logger.info("Invite token invalidated", { tokenPrefix: token.slice(0, 8) + "..." })
}

export async function sendInvite(
  userId: string,
  baseUrl: string
): Promise<{ sent: boolean; error?: string }> {
  try {
    const token = await createInviteToken(userId)
    const user = await findUserByIdAsync(userId)
    if (!user) return { sent: false, error: "User not found" }

    const link = `${baseUrl}/onboarding/invite?token=${encodeURIComponent(token)}`
    const title = "House of Veritas – Complete Your Onboarding"
    const message = `Welcome! Click to complete your onboarding: ${link}`

    const channels: ("email" | "sms" | "in_app")[] = ["in_app"]
    if (user.email) channels.unshift("email")
    if (user.phone) channels.push("sms")

    await sendNotification({
      type: "system_alert",
      userId,
      title,
      message,
      channels,
      data: { inviteLink: link },
      priority: "high",
    })

    logger.info("Invite sent", { userId, channels })
    return { sent: true }
  } catch (err) {
    logger.error("Invite send failed", { error: err instanceof Error ? err.message : String(err) })
    return { sent: false, error: err instanceof Error ? err.message : String(err) }
  }
}

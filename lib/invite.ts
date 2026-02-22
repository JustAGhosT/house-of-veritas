import { SignJWT, jwtVerify } from "jose"
import { findUserByIdAsync } from "@/lib/users"
import { sendNotification } from "@/lib/services/notification-service"
import { logger } from "@/lib/logger"

const INVITE_EXPIRY_HOURS = 72

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

export async function validateInviteToken(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    const userId = payload.userId as string
    return userId ? { userId } : null
  } catch {
    return null
  }
}

export async function sendInvite(userId: string, baseUrl: string): Promise<{ sent: boolean; error?: string }> {
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

import { NextResponse } from "next/server"
import { getCollection, sanitizeDocument } from "@/lib/db/mongodb"
import { ObjectId } from "mongodb"
import { logger } from "@/lib/logger"
import { withRole, getAuthContext } from "@/lib/auth/rbac"

// User notification preferences
interface NotificationPreference {
  _id?: ObjectId
  userId: string
  preferredChannel: "sms" | "whatsapp" | "email"
  phoneNumber?: string
  email?: string
  whatsappNumber?: string
  fallbackOrder: ("sms" | "whatsapp" | "email")[]
  updatedAt: string
}

// Default fallback order
const DEFAULT_FALLBACK_ORDER: ("sms" | "whatsapp" | "email")[] = ["sms", "whatsapp", "email"]

// GET: Get user's notification preferences
export const GET = withRole(
  "admin",
  "operator",
  "employee",
  "resident"
)(async (request, context) => {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ success: false, error: "userId is required" }, { status: 400 })
    }

    // Non-admin users can only access their own preferences
    if (context.role !== "admin" && userId !== context.userId) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    const collection = await getCollection<NotificationPreference>("notification_preferences")
    const preference = await collection.findOne({ userId })

    if (!preference) {
      // Return defaults if no preference set
      return NextResponse.json({
        success: true,
        preference: {
          userId,
          preferredChannel: "sms",
          fallbackOrder: DEFAULT_FALLBACK_ORDER,
          isDefault: true,
        },
      })
    }

    return NextResponse.json({
      success: true,
      preference: sanitizeDocument(preference),
    })
  } catch (error) {
    logger.error("GET notification preferences error", {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json(
      { success: false, error: "Failed to fetch preferences" },
      { status: 500 }
    )
  }
})

// POST: Create or update notification preferences
export const POST = withRole(
  "admin",
  "operator",
  "employee",
  "resident"
)(async (request, context) => {
  try {
    const body = await request.json()
    const { userId, preferredChannel, phoneNumber, email, whatsappNumber, fallbackOrder } = body

    if (!userId || !preferredChannel) {
      return NextResponse.json(
        { success: false, error: "userId and preferredChannel are required" },
        { status: 400 }
      )
    }

    // Non-admin users can only update their own preferences
    if (context.role !== "admin" && userId !== context.userId) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    // Validate channel
    if (!["sms", "whatsapp", "email"].includes(preferredChannel)) {
      return NextResponse.json(
        { success: false, error: "Invalid preferredChannel. Must be sms, whatsapp, or email" },
        { status: 400 }
      )
    }

    const collection = await getCollection<NotificationPreference>("notification_preferences")

    const preferenceData: Omit<NotificationPreference, "_id"> = {
      userId,
      preferredChannel,
      phoneNumber: phoneNumber || undefined,
      email: email || `${userId}@houseofv.com`,
      whatsappNumber: whatsappNumber || phoneNumber || undefined,
      fallbackOrder: fallbackOrder || DEFAULT_FALLBACK_ORDER,
      updatedAt: new Date().toISOString(),
    }

    // Upsert: update if exists, insert if not
    const result = await collection.updateOne(
      { userId },
      { $set: preferenceData },
      { upsert: true }
    )

    const savedPreference = await collection.findOne({ userId })

    logger.info("Notification preference updated", { userId, preferredChannel })

    return NextResponse.json({
      success: true,
      preference: savedPreference ? sanitizeDocument(savedPreference) : preferenceData,
      message: `Notification preference set to ${preferredChannel}`,
    })
  } catch (error) {
    logger.error("POST notification preferences error", {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json(
      { success: false, error: "Failed to save preferences" },
      { status: 500 }
    )
  }
})

// PATCH: Update specific fields
export const PATCH = withRole(
  "admin",
  "operator",
  "employee",
  "resident"
)(async (request, context) => {
  try {
    const body = await request.json()
    const { userId, ...updates } = body

    if (!userId) {
      return NextResponse.json({ success: false, error: "userId is required" }, { status: 400 })
    }

    // Non-admin users can only update their own preferences
    if (context.role !== "admin" && userId !== context.userId) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
    }

    const collection = await getCollection<NotificationPreference>("notification_preferences")

    // Add updatedAt timestamp
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    await collection.updateOne({ userId }, { $set: updateData }, { upsert: true })

    const updatedPreference = await collection.findOne({ userId })

    return NextResponse.json({
      success: true,
      preference: updatedPreference ? sanitizeDocument(updatedPreference) : null,
    })
  } catch (error) {
    logger.error("PATCH notification preferences error", {
      error: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json(
      { success: false, error: "Failed to update preferences" },
      { status: 500 }
    )
  }
})

import { NextResponse } from "next/server"
import { findUserByEmail, findUserByPhone, generateRandomPassword, setPassword } from "@/lib/users"
import { logger } from "@/lib/logger"

// Twilio credentials from environment
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER

// Send SMS using Twilio REST API
async function sendSMS(to: string, message: string): Promise<{ success: boolean; error?: string }> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    logger.info("SMS simulation (service not configured)", { to, messageLength: message.length })
    return { 
      success: true, 
      error: 'SMS service not configured - password reset simulated' 
    }
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: to,
        From: TWILIO_PHONE_NUMBER,
        Body: message,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to send SMS')
    }

    return { success: true }
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error"
    logger.error("SMS sending error", { error: msg })
    return { success: false, error: msg }
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, phone, method = 'sms' } = body

    // Find user by email or phone
    let user = email ? findUserByEmail(email) : findUserByPhone(phone)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please check your email or phone number.' },
        { status: 404 }
      )
    }

    if (method !== 'sms') {
      return NextResponse.json(
        { error: method === 'email' 
          ? 'Password reset via email is not yet configured. Use SMS or contact your administrator.' 
          : 'Invalid reset method. Use sms.' },
        { status: method === 'email' ? 503 : 400 }
      )
    }

    const isSmsConfigured = !!(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER)
    if (!isSmsConfigured) {
      return NextResponse.json(
        { error: 'Password reset is not available. SMS service is not configured. Contact your administrator.' },
        { status: 503 }
      )
    }

    const newPassword = generateRandomPassword()
    setPassword(user.id, newPassword)

    const message = `House of Veritas: Your new password is: ${newPassword}. Please login and change it as soon as possible.`

    const result = await sendSMS(user.phone, message)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send SMS' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `New password sent to ${user.phone.substring(0, 6)}****${user.phone.slice(-2)}`,
    })
  } catch (error) {
    logger.error("Password reset error", { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: 'Password reset failed' },
      { status: 500 }
    )
  }
}

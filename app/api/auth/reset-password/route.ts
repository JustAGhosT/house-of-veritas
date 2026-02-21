import { NextResponse } from "next/server"
import { findUserByEmail, findUserByPhone, generateRandomPassword, setPassword } from "@/lib/users"

// Twilio credentials from environment
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER

// Send SMS using Twilio REST API
async function sendSMS(to: string, message: string): Promise<{ success: boolean; error?: string }> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    // For development/demo: log the message instead of sending
    console.log(`[SMS SIMULATION] To: ${to}`)
    console.log(`[SMS SIMULATION] Message: ${message}`)
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
  } catch (error: any) {
    console.error('SMS sending error:', error)
    return { success: false, error: error.message }
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

    // Generate new password
    const newPassword = generateRandomPassword()
    
    // Update password in memory
    setPassword(user.id, newPassword)

    // Prepare message
    const message = `House of Veritas: Your new password is: ${newPassword}. Please login and change it as soon as possible.`

    if (method === 'sms') {
      // Send SMS
      const result = await sendSMS(user.phone, message)
      
      if (!result.success && !result.error?.includes('not configured')) {
        return NextResponse.json(
          { error: result.error || 'Failed to send SMS' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: `New password sent to ${user.phone.substring(0, 6)}****${user.phone.slice(-2)}`,
        // Include password in response for demo purposes when SMS is not configured
        ...(result.error?.includes('not configured') && { 
          demoPassword: newPassword,
          note: 'SMS service not configured. In production, password would be sent via SMS.'
        })
      })
    } else if (method === 'email') {
      // Email sending would go here
      // For now, return the password for demo purposes
      return NextResponse.json({
        success: true,
        message: `New password sent to ${user.email}`,
        demoPassword: newPassword,
        note: 'Email service not configured. In production, password would be sent via email.'
      })
    }

    return NextResponse.json(
      { error: 'Invalid reset method' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'Password reset failed' },
      { status: 500 }
    )
  }
}

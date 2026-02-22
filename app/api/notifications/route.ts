import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { withRole } from '@/lib/auth/rbac'
import { 
  sendNotification, 
  sendTemplatedNotification,
  isTwilioConfigured,
  NotificationChannel,
  NotificationType,
} from '@/lib/services/notification-service'

// GET - Check notification service status
export async function GET() {
  return NextResponse.json({
    services: {
      sms: {
        provider: 'Twilio',
        configured: isTwilioConfigured(),
        status: isTwilioConfigured() ? 'ready' : 'simulated',
      },
      email: {
        provider: 'Not configured',
        configured: false,
        status: 'simulated',
      },
      push: {
        provider: 'Web Push',
        configured: true,
        status: 'ready',
      },
      in_app: {
        provider: 'SSE Real-time',
        configured: true,
        status: 'ready',
      },
    },
    note: 'SMS and Email are currently simulated. Configure Twilio/SendGrid environment variables for production.',
  })
}

// POST - Send notification
export const POST = withRole("admin", "operator", "employee", "resident")(async (request) => {
  try {
    const body = await request.json()
    const { 
      type, 
      userId, 
      title, 
      message, 
      channels = ['in_app'],
      data,
      useTemplate = false,
    } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    let results

    if (useTemplate && type) {
      // Use templated notification
      results = await sendTemplatedNotification(
        type as NotificationType,
        userId,
        data || {},
        channels as NotificationChannel[]
      )
    } else {
      // Custom notification
      if (!title || !message) {
        return NextResponse.json(
          { error: 'title and message are required for custom notifications' },
          { status: 400 }
        )
      }

      results = await sendNotification({
        type: type || 'system_alert',
        userId,
        title,
        message,
        channels: channels as NotificationChannel[],
        data,
      })
    }

    return NextResponse.json({
      success: true,
      results,
      summary: {
        sent: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
      },
    })
  } catch (error) {
    logger.error('Notification error', { error: error instanceof Error ? error.message : String(error) })
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
})
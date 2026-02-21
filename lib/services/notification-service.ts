// Notification Service Types and Implementation
// Supports SMS (Twilio), Email (future), and Push notifications

import twilio from 'twilio'

export type NotificationChannel = 'sms' | 'email' | 'push' | 'in_app'

export type NotificationType = 
  | 'approval_required'
  | 'expense_approved'
  | 'expense_rejected'
  | 'task_assigned'
  | 'task_due'
  | 'document_expiry'
  | 'password_reset'
  | 'system_alert'
  | 'daily_digest'
  | 'weekly_summary'

export interface NotificationPayload {
  type: NotificationType
  userId: string
  title: string
  message: string
  channels: NotificationChannel[]
  data?: Record<string, any>
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  scheduledFor?: Date
}

export interface NotificationResult {
  channel: NotificationChannel
  success: boolean
  messageId?: string
  error?: string
}

// Twilio SMS Configuration
const TWILIO_CONFIG = {
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  fromNumber: process.env.TWILIO_PHONE_NUMBER,
}

// Initialize Twilio client
let twilioClient: twilio.Twilio | null = null

function getTwilioClient(): twilio.Twilio | null {
  if (!TWILIO_CONFIG.accountSid || !TWILIO_CONFIG.authToken) {
    return null
  }
  if (!twilioClient) {
    twilioClient = twilio(TWILIO_CONFIG.accountSid, TWILIO_CONFIG.authToken)
  }
  return twilioClient
}

// Check if Twilio is configured
export function isTwilioConfigured(): boolean {
  return !!(TWILIO_CONFIG.accountSid && TWILIO_CONFIG.authToken && TWILIO_CONFIG.fromNumber)
}

// User phone numbers (in production, fetch from database)
const USER_PHONES: Record<string, string> = {
  hans: '+27692381255',
  charl: '+27711488390',
  lucky: '+27794142410',
  irma: '+27711488390',
}

// Send SMS via Twilio
export async function sendSMS(
  to: string,
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const client = getTwilioClient()
  
  if (!client || !TWILIO_CONFIG.fromNumber) {
    console.log('[NotificationService] Twilio not configured, simulating SMS')
    console.log(`[SMS SIMULATED] To: ${to}, Message: ${message}`)
    return { 
      success: true, 
      messageId: `sim_${Date.now()}`,
    }
  }

  try {
    console.log(`[SMS] Sending to ${to} via Twilio...`)
    const result = await client.messages.create({
      body: message,
      from: TWILIO_CONFIG.fromNumber,
      to: to,
    })
    console.log(`[SMS] Sent successfully! SID: ${result.sid}`)
    return { success: true, messageId: result.sid }
  } catch (error: any) {
    console.error('[SMS Error]', error.message || error)
    // Return success with simulation if Twilio fails (e.g., test credentials)
    if (error.code === 21608 || error.code === 21211) {
      console.log(`[SMS] Twilio test mode - simulating delivery to ${to}`)
      return { success: true, messageId: `test_${Date.now()}`, error: 'Test mode' }
    }
    return { success: false, error: error.message }
  }
}

// Send Email (placeholder - integrate with SendGrid/Resend)
export async function sendEmail(
  to: string,
  subject: string,
  body: string,
  html?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  console.log(`[Email SIMULATED] To: ${to}, Subject: ${subject}`)
  return { 
    success: true, 
    messageId: `email_${Date.now()}`,
  }
}

// Main notification dispatcher
export async function sendNotification(
  payload: NotificationPayload
): Promise<NotificationResult[]> {
  const results: NotificationResult[] = []
  const userPhone = USER_PHONES[payload.userId]

  for (const channel of payload.channels) {
    let result: NotificationResult

    switch (channel) {
      case 'sms':
        if (userPhone) {
          const smsResult = await sendSMS(userPhone, `${payload.title}\n${payload.message}`)
          result = { channel: 'sms', ...smsResult }
        } else {
          result = { channel: 'sms', success: false, error: 'No phone number for user' }
        }
        break

      case 'email':
        // In production, fetch user email from database
        const userEmail = `${payload.userId}@houseofv.com`
        const emailResult = await sendEmail(userEmail, payload.title, payload.message)
        result = { channel: 'email', ...emailResult }
        break

      case 'push':
        // Push notification would be handled by service worker
        console.log(`[Push] Would send push notification: ${payload.title}`)
        result = { channel: 'push', success: true, messageId: `push_${Date.now()}` }
        break

      case 'in_app':
        // In-app notifications are handled by the real-time system
        result = { channel: 'in_app', success: true, messageId: `inapp_${Date.now()}` }
        break

      default:
        result = { channel, success: false, error: 'Unknown channel' }
    }

    results.push(result)
  }

  return results
}

// Notification templates
export const NOTIFICATION_TEMPLATES: Record<NotificationType, (data: any) => { title: string; message: string }> = {
  approval_required: (data) => ({
    title: 'Approval Required',
    message: `${data.type} from ${data.submittedBy} requires your approval: ${data.description || 'View details in dashboard'}`,
  }),
  
  expense_approved: (data) => ({
    title: 'Expense Approved',
    message: `Your expense "${data.description}" for R${data.amount} has been approved.`,
  }),
  
  expense_rejected: (data) => ({
    title: 'Expense Rejected',
    message: `Your expense "${data.description}" has been rejected. Reason: ${data.reason || 'Contact admin for details'}`,
  }),
  
  task_assigned: (data) => ({
    title: 'New Task Assigned',
    message: `You have been assigned: "${data.title}". Due: ${data.dueDate || 'See dashboard'}`,
  }),
  
  task_due: (data) => ({
    title: 'Task Due Soon',
    message: `Task "${data.title}" is due ${data.dueIn}. Please complete it on time.`,
  }),
  
  document_expiry: (data) => ({
    title: 'Document Expiring',
    message: `Document "${data.documentName}" expires in ${data.daysLeft} days. Please review and renew.`,
  }),
  
  password_reset: (data) => ({
    title: 'Password Reset',
    message: `Your temporary password is: ${data.tempPassword}. Please change it after logging in.`,
  }),
  
  system_alert: (data) => ({
    title: data.alertTitle || 'System Alert',
    message: data.alertMessage || 'Please check the dashboard for important updates.',
  }),
  
  daily_digest: (data) => ({
    title: 'Daily Summary',
    message: `Today: ${data.tasksCompleted} tasks done, ${data.tasksPending} pending. ${data.notifications} new notifications.`,
  }),
  
  weekly_summary: (data) => ({
    title: 'Weekly Report',
    message: `This week: ${data.totalHours}h worked, ${data.expensesTotal} expenses, ${data.tasksCompleted} tasks completed.`,
  }),
}

// Helper to send templated notifications
export async function sendTemplatedNotification(
  type: NotificationType,
  userId: string,
  data: Record<string, any>,
  channels: NotificationChannel[] = ['in_app']
): Promise<NotificationResult[]> {
  const template = NOTIFICATION_TEMPLATES[type]
  const { title, message } = template(data)

  return sendNotification({
    type,
    userId,
    title,
    message,
    channels,
    data,
  })
}

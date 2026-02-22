import { NextResponse } from "next/server"
import { z } from "zod"
import { auditLog, logActivity, AuditAction } from "@/lib/audit-log"
import { withRole, withAuth } from "@/lib/auth/rbac"
import { toISODateString } from "@/lib/utils"

const auditActions = [
  "login", "logout", "task_created", "task_updated", "task_completed", "task_deleted",
  "expense_submitted", "expense_approved", "expense_rejected", "document_signed", "document_viewed",
  "clock_in", "clock_out", "profile_updated", "password_reset", "file_uploaded", "file_deleted",
  "settings_changed", "user_created", "permission_changed",
] as const

const auditPostSchema = z.object({
  userId: z.string().min(1),
  userName: z.string().min(1),
  action: z.enum(auditActions),
  resourceType: z.string().min(1),
  resourceId: z.string().optional(),
  resourceName: z.string().optional(),
  details: z.record(z.unknown()).optional(),
  success: z.boolean().optional(),
})

export const GET = withRole("admin")(async (request) => {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const action = searchParams.get('action') as AuditAction | null
  const resourceType = searchParams.get('resourceType')
  const limit = parseInt(searchParams.get('limit') || '100')
  const format = searchParams.get('format')

  const opts = {
    userId: userId || undefined,
    action: action || undefined,
    resourceType: resourceType || undefined,
    limit,
  }

  if (format === 'csv') {
    const csv = await auditLog.exportToCSVAsync(opts)
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="audit-log-${toISODateString()}.csv"`,
      },
    })
  }

  const logs = await auditLog.getLogsAsync(opts)
  const summary = await auditLog.getActivitySummaryAsync(userId || undefined)

  return NextResponse.json({
    logs,
    total: logs.length,
    summary,
  })
})

export const POST = withAuth(async (request) => {
  try {
    const body = await request.json()
    const parsed = auditPostSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    const { userId, userName, action, resourceType, resourceId, resourceName, details, success } = parsed.data

    const entry = logActivity(userId, userName, action, resourceType, {
      resourceId,
      resourceName,
      details,
      success,
    })

    return NextResponse.json({ success: true, entry })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create audit log entry' }, { status: 500 })
  }
})

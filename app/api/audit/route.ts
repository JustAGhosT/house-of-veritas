import { NextResponse } from 'next/server'
import { auditLog, logActivity, AuditAction } from '@/lib/audit-log'

// GET - Fetch audit logs
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const action = searchParams.get('action') as AuditAction | null
  const resourceType = searchParams.get('resourceType')
  const limit = parseInt(searchParams.get('limit') || '100')
  const format = searchParams.get('format') // 'json' or 'csv'

  const logs = auditLog.getLogs({
    userId: userId || undefined,
    action: action || undefined,
    resourceType: resourceType || undefined,
    limit,
  })

  if (format === 'csv') {
    const csv = auditLog.exportToCSV()
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="audit-log-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  }

  return NextResponse.json({
    logs,
    total: logs.length,
    summary: auditLog.getActivitySummary(userId || undefined),
  })
}

// POST - Create a new audit log entry
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, userName, action, resourceType, resourceId, resourceName, details, success } = body

    if (!userId || !userName || !action || !resourceType) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, userName, action, resourceType' },
        { status: 400 }
      )
    }

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
}

// Audit Log Types and Store
export type AuditAction = 
  | 'login'
  | 'logout'
  | 'task_created'
  | 'task_updated'
  | 'task_completed'
  | 'task_deleted'
  | 'expense_submitted'
  | 'expense_approved'
  | 'expense_rejected'
  | 'document_signed'
  | 'document_viewed'
  | 'clock_in'
  | 'clock_out'
  | 'profile_updated'
  | 'password_reset'
  | 'file_uploaded'
  | 'file_deleted'
  | 'settings_changed'
  | 'user_created'
  | 'permission_changed'

export interface AuditLogEntry {
  id: string
  timestamp: Date
  userId: string
  userName: string
  action: AuditAction
  resourceType: string
  resourceId?: string
  resourceName?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  success: boolean
  errorMessage?: string
}

// In-memory audit log store (in production, use database)
class AuditLogStore {
  private logs: AuditLogEntry[] = []
  private maxLogs = 1000

  addLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
    const fullEntry: AuditLogEntry = {
      ...entry,
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    }

    this.logs.unshift(fullEntry)

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs)
    }

    return fullEntry
  }

  getLogs(options?: {
    userId?: string
    action?: AuditAction
    resourceType?: string
    startDate?: Date
    endDate?: Date
    limit?: number
  }): AuditLogEntry[] {
    let filtered = [...this.logs]

    if (options?.userId) {
      filtered = filtered.filter(log => log.userId === options.userId)
    }
    if (options?.action) {
      filtered = filtered.filter(log => log.action === options.action)
    }
    if (options?.resourceType) {
      filtered = filtered.filter(log => log.resourceType === options.resourceType)
    }
    if (options?.startDate) {
      filtered = filtered.filter(log => log.timestamp >= options.startDate!)
    }
    if (options?.endDate) {
      filtered = filtered.filter(log => log.timestamp <= options.endDate!)
    }

    const limit = options?.limit || 100
    return filtered.slice(0, limit)
  }

  getLogsByResource(resourceType: string, resourceId: string): AuditLogEntry[] {
    return this.logs.filter(
      log => log.resourceType === resourceType && log.resourceId === resourceId
    )
  }

  getUserActivity(userId: string, days: number = 30): AuditLogEntry[] {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    return this.logs.filter(
      log => log.userId === userId && log.timestamp >= startDate
    )
  }

  getActivitySummary(userId?: string): Record<AuditAction, number> {
    const logs = userId 
      ? this.logs.filter(log => log.userId === userId)
      : this.logs

    const summary: Partial<Record<AuditAction, number>> = {}
    
    for (const log of logs) {
      summary[log.action] = (summary[log.action] || 0) + 1
    }

    return summary as Record<AuditAction, number>
  }

  exportToCSV(): string {
    const headers = [
      'Timestamp',
      'User ID',
      'User Name',
      'Action',
      'Resource Type',
      'Resource ID',
      'Resource Name',
      'Success',
      'Error Message',
      'Details'
    ]

    const rows = this.logs.map(log => [
      log.timestamp.toISOString(),
      log.userId,
      log.userName,
      log.action,
      log.resourceType,
      log.resourceId || '',
      log.resourceName || '',
      log.success ? 'Yes' : 'No',
      log.errorMessage || '',
      JSON.stringify(log.details || {})
    ])

    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')
  }
}

// Singleton instance
export const auditLog = new AuditLogStore()

// Helper functions
export function logActivity(
  userId: string,
  userName: string,
  action: AuditAction,
  resourceType: string,
  options?: {
    resourceId?: string
    resourceName?: string
    details?: Record<string, any>
    success?: boolean
    errorMessage?: string
  }
): AuditLogEntry {
  return auditLog.addLog({
    userId,
    userName,
    action,
    resourceType,
    resourceId: options?.resourceId,
    resourceName: options?.resourceName,
    details: options?.details,
    success: options?.success ?? true,
    errorMessage: options?.errorMessage,
  })
}

// Seed some demo audit logs
export function seedAuditLogs() {
  const users = [
    { id: 'hans', name: 'Hans' },
    { id: 'charl', name: 'Charl' },
    { id: 'lucky', name: 'Lucky' },
    { id: 'irma', name: 'Irma' },
  ]

  const activities: Array<{
    action: AuditAction
    resourceType: string
    resourceName?: string
  }> = [
    { action: 'login', resourceType: 'auth' },
    { action: 'task_completed', resourceType: 'task', resourceName: 'Fix garden irrigation' },
    { action: 'expense_submitted', resourceType: 'expense', resourceName: 'Garden supplies' },
    { action: 'clock_in', resourceType: 'time' },
    { action: 'document_viewed', resourceType: 'document', resourceName: 'Employment contract' },
    { action: 'task_created', resourceType: 'task', resourceName: 'Monthly maintenance check' },
    { action: 'expense_approved', resourceType: 'expense', resourceName: 'Workshop materials' },
    { action: 'clock_out', resourceType: 'time' },
    { action: 'file_uploaded', resourceType: 'file', resourceName: 'receipt_001.pdf' },
    { action: 'settings_changed', resourceType: 'settings' },
  ]

  // Create 50 random audit entries
  for (let i = 0; i < 50; i++) {
    const user = users[Math.floor(Math.random() * users.length)]
    const activity = activities[Math.floor(Math.random() * activities.length)]
    
    auditLog.addLog({
      userId: user.id,
      userName: user.name,
      action: activity.action,
      resourceType: activity.resourceType,
      resourceId: `res_${Math.random().toString(36).substr(2, 6)}`,
      resourceName: activity.resourceName,
      success: Math.random() > 0.05, // 95% success rate
    })
  }
}

// Initialize with seed data
seedAuditLogs()

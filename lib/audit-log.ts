// Audit Log Types and Store
import { getCollection } from "@/lib/db/mongodb"
import {
  isPostgresConfigured,
  query,
  withClient,
  ensureSchema,
} from "@/lib/db/postgres"
import { logger } from "@/lib/logger"

export type AuditAction =
  | "login"
  | "logout"
  | "task_created"
  | "task_updated"
  | "task_completed"
  | "task_deleted"
  | "expense_submitted"
  | "expense_approved"
  | "expense_rejected"
  | "document_signed"
  | "document_viewed"
  | "clock_in"
  | "clock_out"
  | "profile_updated"
  | "password_reset"
  | "file_uploaded"
  | "file_deleted"
  | "settings_changed"
  | "user_created"
  | "permission_changed"

export interface AuditLogEntry {
  id: string
  timestamp: Date
  userId: string
  userName: string
  action: AuditAction
  resourceType: string
  resourceId?: string
  resourceName?: string
  details?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  success: boolean
  errorMessage?: string
}

let schemaEnsured = false

async function ensureSchemaOnce(): Promise<void> {
  if (!schemaEnsured && isPostgresConfigured()) {
    await ensureSchema()
    schemaEnsured = true
  }
}

async function insertAuditLogPG(entry: AuditLogEntry): Promise<void> {
  await ensureSchemaOnce()
  await withClient(async (client) => {
    await client.query(
      `INSERT INTO audit_logs (id, timestamp, user_id, user_name, action, resource_type, resource_id, resource_name, details, ip_address, user_agent, success, error_message)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        entry.id,
        entry.timestamp,
        entry.userId,
        entry.userName,
        entry.action,
        entry.resourceType,
        entry.resourceId ?? null,
        entry.resourceName ?? null,
        entry.details ? JSON.stringify(entry.details) : null,
        entry.ipAddress ?? null,
        entry.userAgent ?? null,
        entry.success,
        entry.errorMessage ?? null,
      ]
    )
  })
}

async function getLogsFromMongo(options?: {
  userId?: string
  action?: AuditAction
  resourceType?: string
  startDate?: Date
  endDate?: Date
  limit?: number
}): Promise<AuditLogEntry[]> {
  const coll = await getCollection<AuditLogEntry & { _id?: import("mongodb").ObjectId }>("audit_logs")
  const filter: Record<string, unknown> = {}
  if (options?.userId) filter.userId = options.userId
  if (options?.action) filter.action = options.action
  if (options?.resourceType) filter.resourceType = options.resourceType
  if (options?.startDate || options?.endDate) {
    const ts: Record<string, Date> = {}
    if (options?.startDate) ts.$gte = options.startDate
    if (options?.endDate) ts.$lte = options.endDate
    filter.timestamp = ts
  }
  const docs = await coll
    .find(filter)
    .sort({ timestamp: -1 })
    .limit(options?.limit ?? 100)
    .toArray()
  return docs.map((d) => {
    const { _id, ...rest } = d
    return { ...rest, timestamp: rest.timestamp instanceof Date ? rest.timestamp : new Date(rest.timestamp) } as AuditLogEntry
  })
}

async function getLogsFromPG(options?: {
  userId?: string
  action?: AuditAction
  resourceType?: string
  startDate?: Date
  endDate?: Date
  limit?: number
}): Promise<AuditLogEntry[]> {
  await ensureSchemaOnce()

  let sql = `SELECT id, timestamp, user_id as "userId", user_name as "userName", action, resource_type as "resourceType", resource_id as "resourceId", resource_name as "resourceName", details, ip_address as "ipAddress", user_agent as "userAgent", success, error_message as "errorMessage" FROM audit_logs WHERE 1=1`
  const params: unknown[] = []
  let paramIndex = 1

  if (options?.userId) {
    sql += ` AND user_id = $${paramIndex++}`
    params.push(options.userId)
  }
  if (options?.action) {
    sql += ` AND action = $${paramIndex++}`
    params.push(options.action)
  }
  if (options?.resourceType) {
    sql += ` AND resource_type = $${paramIndex++}`
    params.push(options.resourceType)
  }
  if (options?.startDate) {
    sql += ` AND timestamp >= $${paramIndex++}`
    params.push(options.startDate)
  }
  if (options?.endDate) {
    sql += ` AND timestamp <= $${paramIndex++}`
    params.push(options.endDate)
  }

  sql += ` ORDER BY timestamp DESC LIMIT $${paramIndex}`
  params.push(options?.limit ?? 100)

  const { rows } = await query<{
    id: string
    timestamp: Date
    userId: string
    userName: string
    action: string
    resourceType: string
    resourceId: string | null
    resourceName: string | null
    details: unknown
    ipAddress: string | null
    userAgent: string | null
    success: boolean
    errorMessage: string | null
  }>(sql, params)

  return rows.map((r) => ({
    id: r.id,
    timestamp: r.timestamp,
    userId: r.userId,
    userName: r.userName,
    action: r.action as AuditAction,
    resourceType: r.resourceType,
    resourceId: r.resourceId ?? undefined,
    resourceName: r.resourceName ?? undefined,
    details: (r.details as Record<string, unknown>) ?? undefined,
    ipAddress: r.ipAddress ?? undefined,
    userAgent: r.userAgent ?? undefined,
    success: r.success,
    errorMessage: r.errorMessage ?? undefined,
  }))
}

class AuditLogStore {
  private logs: AuditLogEntry[] = []
  private maxLogs = 1000

  addLog(entry: Omit<AuditLogEntry, "id" | "timestamp">): AuditLogEntry {
    const fullEntry: AuditLogEntry = {
      ...entry,
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    }

    this.logs.unshift(fullEntry)

    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs)
    }

    if (isPostgresConfigured()) {
      insertAuditLogPG(fullEntry).catch((err) =>
        logger.warn("Audit log PostgreSQL persist failed", {
          error: err instanceof Error ? err.message : String(err),
        })
      )
    }

    if (process.env.MONGODB_URI || process.env.MONGO_URL) {
      getCollection("audit_logs")
        .then((coll) =>
          coll.insertOne(fullEntry as unknown as Record<string, unknown>)
        )
        .catch((err) =>
          logger.warn("Audit log MongoDB persist failed", {
            error: err instanceof Error ? err.message : String(err),
          })
        )
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
      filtered = filtered.filter((log) => log.userId === options.userId)
    }
    if (options?.action) {
      filtered = filtered.filter((log) => log.action === options.action)
    }
    if (options?.resourceType) {
      filtered = filtered.filter(
        (log) => log.resourceType === options.resourceType
      )
    }
    if (options?.startDate) {
      filtered = filtered.filter(
        (log) => log.timestamp >= options.startDate!
      )
    }
    if (options?.endDate) {
      filtered = filtered.filter((log) => log.timestamp <= options.endDate!)
    }

    const limit = options?.limit || 100
    return filtered.slice(0, limit)
  }

  async getLogsAsync(options?: {
    userId?: string
    action?: AuditAction
    resourceType?: string
    startDate?: Date
    endDate?: Date
    limit?: number
  }): Promise<AuditLogEntry[]> {
    if (isPostgresConfigured()) {
      return getLogsFromPG(options)
    }
    if (process.env.MONGODB_URI || process.env.MONGO_URL) {
      try {
        return getLogsFromMongo(options)
      } catch (err) {
        logger.warn("Audit log MongoDB read failed, using in-memory", {
          error: err instanceof Error ? err.message : String(err),
        })
      }
    }
    return Promise.resolve(this.getLogs(options))
  }

  getLogsByResource(resourceType: string, resourceId: string): AuditLogEntry[] {
    return this.logs.filter(
      (log) =>
        log.resourceType === resourceType && log.resourceId === resourceId
    )
  }

  getUserActivity(userId: string, days: number = 30): AuditLogEntry[] {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    return this.logs.filter(
      (log) => log.userId === userId && log.timestamp >= startDate
    )
  }

  getActivitySummary(userId?: string): Record<AuditAction, number> {
    const logs = userId
      ? this.logs.filter((log) => log.userId === userId)
      : this.logs

    const summary: Partial<Record<AuditAction, number>> = {}

    for (const log of logs) {
      summary[log.action] = (summary[log.action] || 0) + 1
    }

    return summary as Record<AuditAction, number>
  }

  async getActivitySummaryAsync(
    userId?: string
  ): Promise<Record<AuditAction, number>> {
    if (isPostgresConfigured()) {
      const logs = await getLogsFromPG({ userId, limit: 10000 })
      const summary: Partial<Record<AuditAction, number>> = {}
      for (const log of logs) {
        summary[log.action] = (summary[log.action] || 0) + 1
      }
      return summary as Record<AuditAction, number>
    }
    if (process.env.MONGODB_URI || process.env.MONGO_URL) {
      try {
        const logs = await getLogsFromMongo({ userId, limit: 10000 })
        const summary: Partial<Record<AuditAction, number>> = {}
        for (const log of logs) {
          summary[log.action] = (summary[log.action] || 0) + 1
        }
        return summary as Record<AuditAction, number>
      } catch {
        /* fall through to in-memory */
      }
    }
    return this.getActivitySummary(userId)
  }

  exportToCSV(): string {
    return this.exportToCSVFromLogs(this.logs)
  }

  exportToCSVFromLogs(logs: AuditLogEntry[]): string {
    const headers = [
      "Timestamp",
      "User ID",
      "User Name",
      "Action",
      "Resource Type",
      "Resource ID",
      "Resource Name",
      "Success",
      "Error Message",
      "Details",
    ]

    const rows = logs.map((log) => [
      log.timestamp.toISOString(),
      log.userId,
      log.userName,
      log.action,
      log.resourceType,
      log.resourceId || "",
      log.resourceName || "",
      log.success ? "Yes" : "No",
      log.errorMessage || "",
      JSON.stringify(log.details || {}),
    ])

    return [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${cell}"`).join(",")
      ),
    ].join("\n")
  }

  async exportToCSVAsync(options?: {
    userId?: string
    action?: AuditAction
    resourceType?: string
    limit?: number
  }): Promise<string> {
    if (isPostgresConfigured()) {
      const logs = await getLogsFromPG({
        ...options,
        limit: options?.limit ?? 10000,
      })
      return this.exportToCSVFromLogs(logs)
    }
    return this.exportToCSV()
  }
}

export const auditLog = new AuditLogStore()

export function logActivity(
  userId: string,
  userName: string,
  action: AuditAction,
  resourceType: string,
  options?: {
    resourceId?: string
    resourceName?: string
    details?: Record<string, unknown>
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

export function seedAuditLogs() {
  const users = [
    { id: "hans", name: "Hans" },
    { id: "charl", name: "Charl" },
    { id: "lucky", name: "Lucky" },
    { id: "irma", name: "Irma" },
  ]

  const activities: Array<{
    action: AuditAction
    resourceType: string
    resourceName?: string
  }> = [
    { action: "login", resourceType: "auth" },
    { action: "task_completed", resourceType: "task", resourceName: "Fix garden irrigation" },
    { action: "expense_submitted", resourceType: "expense", resourceName: "Garden supplies" },
    { action: "clock_in", resourceType: "time" },
    { action: "document_viewed", resourceType: "document", resourceName: "Employment contract" },
    { action: "task_created", resourceType: "task", resourceName: "Monthly maintenance check" },
    { action: "expense_approved", resourceType: "expense", resourceName: "Workshop materials" },
    { action: "clock_out", resourceType: "time" },
    { action: "file_uploaded", resourceType: "file", resourceName: "receipt_001.pdf" },
    { action: "settings_changed", resourceType: "settings" },
  ]

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
      success: Math.random() > 0.05,
    })
  }
}

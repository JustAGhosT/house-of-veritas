/**
 * Shared alert/threshold utilities for expiry and escalation workflows.
 */

export type AlertLevel = "URGENT" | "WARNING" | "NOTICE" | "OK"

export interface ThresholdConfig {
  URGENT: number
  WARNING: number
  NOTICE: number
}

export const DEFAULT_EXPIRY_THRESHOLDS: ThresholdConfig = {
  URGENT: 7,
  WARNING: 30,
  NOTICE: 60,
}

/**
 * Determine alert level from days until expiry.
 * @param days - Days until expiry (negative = already expired)
 * @param thresholds - Optional custom thresholds (default: DEFAULT_EXPIRY_THRESHOLDS)
 */
export function getAlertLevel(
  days: number,
  thresholds: ThresholdConfig = DEFAULT_EXPIRY_THRESHOLDS
): AlertLevel {
  if (days <= 0) return "URGENT"
  if (days <= thresholds.URGENT) return "URGENT"
  if (days <= thresholds.WARNING) return "WARNING"
  if (days <= thresholds.NOTICE) return "NOTICE"
  return "OK"
}

/**
 * Build summary message for expiry alerts grouped by level.
 * @param alerts - Array of alerts with level property
 * @param prefix - Optional prefix (e.g. "Document Expiry Summary:")
 */
export function buildSummaryMessage(alerts: { level: string }[], prefix = ""): string {
  const urgent = alerts.filter((a) => a.level === "URGENT").length
  const warning = alerts.filter((a) => a.level === "WARNING").length
  const notice = alerts.filter((a) => a.level === "NOTICE").length
  const parts = [`URGENT: ${urgent}`, `WARNING: ${warning}`, `NOTICE: ${notice}`]
  return prefix ? `${prefix} ${parts.join(", ")}` : parts.join(", ")
}

/**
 * Shared date utilities for workflows.
 * Reduces duplication of date normalization and days-until calculations.
 */

/** Normalize a date to midnight (00:00:00.000) for consistent day-based comparisons. */
export function normalizeDate(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

/** Get today's date normalized to midnight. */
export function todayNormalized(): Date {
  return normalizeDate(new Date())
}

/**
 * Calculate days until a given date from today.
 * @param date - Date string or Date object
 * @param fallback - Value to return for invalid/missing dates (default: null)
 * @returns Days until date (negative if past), or fallback for invalid input
 */
export function daysUntil(
  date: string | Date | undefined,
  fallback: number | null = null
): number | null {
  if (date === undefined || date === null || date === "") return fallback
  try {
    const target = normalizeDate(typeof date === "string" ? new Date(date) : date)
    if (Number.isNaN(target.getTime())) return fallback
    const today = todayNormalized()
    return Math.ceil((target.getTime() - today.getTime()) / 86400000)
  } catch {
    return fallback
  }
}

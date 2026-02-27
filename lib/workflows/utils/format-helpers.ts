/**
 * Shared formatting utilities for workflows.
 */

/** Format amount as South African Rand (R prefix, locale string). */
export function formatCurrency(amount: number): string {
  return `R${amount.toLocaleString()}`
}

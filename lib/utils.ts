import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format date as ISO date string (YYYY-MM-DD). Use instead of .toISOString().split("T")[0] */
export function toISODateString(date: Date = new Date()): string {
  return date.toISOString().split("T")[0]
}

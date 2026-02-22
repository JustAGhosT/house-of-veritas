/**
 * Access control configuration per ADR-006.
 * Role = primary permission level; responsibilities = feature-level access.
 */

import type { UserRole } from "@/lib/users"

export const RESPONSIBILITIES = [
  "Projects",
  "Expenses",
  "Inventory",
  "Household",
  "Assets",
  "Vehicles",
  "Time",
  "Documents",
] as const

export type Responsibility = (typeof RESPONSIBILITIES)[number]

export const DEFAULT_RESPONSIBILITIES_BY_ROLE: Record<UserRole, readonly Responsibility[]> = {
  admin: RESPONSIBILITIES,
  operator: ["Projects", "Assets", "Vehicles", "Time", "Documents"],
  employee: ["Projects", "Inventory", "Expenses", "Vehicles", "Time", "Documents"],
  resident: ["Household", "Documents", "Projects"],
}

export function getDefaultResponsibilities(role: UserRole): Responsibility[] {
  return [...DEFAULT_RESPONSIBILITIES_BY_ROLE[role]]
}

export function hasResponsibility(
  userResponsibilities: string[],
  required: Responsibility
): boolean {
  return userResponsibilities.includes(required)
}

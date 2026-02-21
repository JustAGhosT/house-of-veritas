import { hashSync, compareSync } from "bcryptjs"

export interface User {
  id: string
  name: string
  email: string
  phone: string
  passwordHash: string
  role: UserRole
  description: string
  color: string
  icon: string
  specialty: string[]
}

export type UserRole = "admin" | "resident" | "operator" | "employee"

const BCRYPT_ROUNDS = 10

export const USERS: Record<string, User> = {
  hans: {
    id: "hans",
    name: "Hans",
    email: "hans@houseofv.com",
    phone: "+27692381255",
    passwordHash: hashSync("hans123", BCRYPT_ROUNDS),
    role: "admin",
    description: "Full platform access, approvals, and oversight",
    color: "blue",
    icon: "👔",
    specialty: ["Tech", "Leadership", "Electronics"],
  },
  irma: {
    id: "irma",
    name: "Irma",
    email: "irma@houseofv.com",
    phone: "+27711488390",
    passwordHash: hashSync("irma123", BCRYPT_ROUNDS),
    role: "resident",
    description: "Household tasks, documents, limited access",
    color: "purple",
    icon: "🏠",
    specialty: ["Babysitting", "Cleaning", "Food"],
  },
  charl: {
    id: "charl",
    name: "Charl",
    email: "charl@houseofv.com",
    phone: "+27711488390",
    passwordHash: hashSync("charl123", BCRYPT_ROUNDS),
    role: "operator",
    description: "Tasks, assets, time tracking, vehicle logs",
    color: "amber",
    icon: "🔧",
    specialty: ["Tinkerer", "Electrician", "Plumber", "Magicman"],
  },
  lucky: {
    id: "lucky",
    name: "Lucky",
    email: "lucky@houseofv.com",
    phone: "+27794142410",
    passwordHash: hashSync("lucky123", BCRYPT_ROUNDS),
    role: "employee",
    description: "Tasks, expenses, vehicle logs, time tracking",
    color: "green",
    icon: "🌿",
    specialty: ["Gardening", "Painting", "Manual Labour"],
  },
}

export function findUserByEmail(email: string): User | undefined {
  return Object.values(USERS).find(
    (user) => user.email.toLowerCase() === email.toLowerCase()
  )
}

export function findUserById(id: string): User | undefined {
  return USERS[id.toLowerCase()]
}

export function findUserByPhone(phone: string): User | undefined {
  const normalizedPhone = phone.replace(/\s/g, "")
  return Object.values(USERS).find((user) => user.phone === normalizedPhone)
}

export function verifyPassword(plaintext: string, hash: string): boolean {
  return compareSync(plaintext, hash)
}

export function generateRandomPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"
  let password = ""
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

const passwordOverrides: Record<string, string> = {}

export function getPasswordHash(userId: string): string {
  return passwordOverrides[userId] || USERS[userId]?.passwordHash || ""
}

export function setPassword(userId: string, newPassword: string): void {
  passwordOverrides[userId] = hashSync(newPassword, BCRYPT_ROUNDS)
}

export function safeUser(user: User): Omit<User, "passwordHash"> {
  const { passwordHash: _, ...safe } = user
  return safe
}

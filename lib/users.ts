// Seeded users for House of Veritas
// In production, this would be stored in a database

export interface User {
  id: string
  name: string
  email: string
  phone: string
  password: string
  role: string
  description: string
  color: string
  icon: string
  specialty: string[]
}

// Hardcoded users with passwords
export const USERS: Record<string, User> = {
  hans: {
    id: "hans",
    name: "Hans",
    email: "hans@houseofv.com",
    phone: "+27692381255",
    password: "hans123",
    role: "Owner & Administrator",
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
    password: "irma123",
    role: "Resident",
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
    password: "charl123",
    role: "Workshop Operator",
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
    password: "lucky123",
    role: "Gardener & Handyman",
    description: "Tasks, expenses, vehicle logs, time tracking",
    color: "green",
    icon: "🌿",
    specialty: ["Gardening", "Painting", "Manual Labour"],
  },
}

// Helper function to find user by email
export function findUserByEmail(email: string): User | undefined {
  return Object.values(USERS).find(
    (user) => user.email.toLowerCase() === email.toLowerCase()
  )
}

// Helper function to find user by ID
export function findUserById(id: string): User | undefined {
  return USERS[id.toLowerCase()]
}

// Helper function to find user by phone
export function findUserByPhone(phone: string): User | undefined {
  // Normalize phone number for comparison
  const normalizedPhone = phone.replace(/\s/g, "")
  return Object.values(USERS).find((user) => user.phone === normalizedPhone)
}

// Generate a random password
export function generateRandomPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"
  let password = ""
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// In-memory password store (in production, use a database)
// This allows password updates during runtime
const passwordOverrides: Record<string, string> = {}

export function getPassword(userId: string): string {
  return passwordOverrides[userId] || USERS[userId]?.password || ""
}

export function setPassword(userId: string, newPassword: string): void {
  passwordOverrides[userId] = newPassword
}

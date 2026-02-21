import { NextResponse } from "next/server"
import { USERS, safeUser } from "@/lib/users"

export async function GET() {
  const safeUsers = Object.values(USERS).map(safeUser)

  return NextResponse.json({
    users: safeUsers,
    total: safeUsers.length,
  })
}

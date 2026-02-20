import { NextResponse } from 'next/server'
import { USERS } from '@/lib/users'

export async function GET() {
  // Return users without passwords
  const safeUsers = Object.values(USERS).map(({ password, ...user }) => user)
  
  return NextResponse.json({
    users: safeUsers,
    total: safeUsers.length
  })
}

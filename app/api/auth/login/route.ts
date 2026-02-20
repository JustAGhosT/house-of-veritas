import { NextResponse } from 'next/server'
import { findUserByEmail, findUserById, getPassword } from '@/lib/users'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, userId } = body

    // Support login by email or userId
    let user = email ? findUserByEmail(email) : findUserById(userId)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      )
    }

    // Check password
    const currentPassword = getPassword(user.id)
    if (password !== currentPassword) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user
    
    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      redirectTo: `/dashboard/${user.id}`
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}

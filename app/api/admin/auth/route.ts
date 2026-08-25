import { NextRequest, NextResponse } from 'next/server'

const ADMIN_KEY = process.env.ADMIN_SECRET_KEY

export async function POST(request: NextRequest) {
  const { key } = await request.json() as { key?: string }

  if (!ADMIN_KEY || key !== ADMIN_KEY) {
    return NextResponse.json({ error: 'Invalid key' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set('admin_key', ADMIN_KEY, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/admin',
    maxAge: 60 * 60 * 24, // 24 hours
  })

  return response
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.delete('admin_key')
  return response
}

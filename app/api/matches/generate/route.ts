/**
 * POST /api/matches/generate
 *
 * Runs AI matching for the authenticated user and persists results.
 * Delegates to the shared generateAndPersistMatches function.
 */

import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/server'
import { generateAndPersistMatches } from '@/lib/matching/generate-matches'

export async function POST() {
  const cookieStore = await cookies()
  const userClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  )

  const { data: { user } } = await userClient.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const serviceClient = createServiceClient()
  const result = await generateAndPersistMatches(user.id, serviceClient)

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: result.error === 'Profile not found.' ? 404 : 500 })
  }

  return NextResponse.json({ matchCount: result.matchCount })
}

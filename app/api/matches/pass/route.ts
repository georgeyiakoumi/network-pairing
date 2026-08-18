/**
 * POST /api/matches/pass
 *
 * Called when a user passes on a match (optionally with a reason).
 * - Updates matches.status to 'rejected'
 * - Writes a match_rating row (rating=0, reason optional)
 *
 * Body: { matchId: string; reason?: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/server'

const VALID_REASONS = ['not_relevant', 'wrong_level', 'wrong_profession', 'not_a_fit'] as const
type PassReason = typeof VALID_REASONS[number]

export async function POST(request: NextRequest) {
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
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { matchId, reason } = await request.json() as { matchId: string; reason?: PassReason }
  if (!matchId) return NextResponse.json({ error: 'matchId required' }, { status: 400 })

  const validReason = reason && VALID_REASONS.includes(reason) ? reason : null

  const serviceClient = createServiceClient()

  // Verify match belongs to this user
  const { data: requestingProfile } = await serviceClient
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!requestingProfile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const { data: match } = await serviceClient
    .from('matches')
    .select('id, profile_a_id')
    .eq('id', matchId)
    .single()

  if (!match || match.profile_a_id !== requestingProfile.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Update status + write rating in parallel
  const [updateResult, insertResult] = await Promise.all([
    serviceClient
      .from('matches')
      .update({ status: 'rejected' })
      .eq('id', matchId),
    serviceClient
      .from('match_ratings')
      .insert({
        match_id: matchId,
        rated_by_profile_id: requestingProfile.id,
        rating: 0,
        ...(validReason ? { reason: validReason } : {}),
      }),
  ])

  if (updateResult.error || insertResult.error) {
    console.error('[matches/pass] DB error:', updateResult.error ?? insertResult.error)
    return NextResponse.json({ error: 'Failed to record pass' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

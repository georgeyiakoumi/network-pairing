/**
 * POST /api/matches/connect
 *
 * Called when a user taps "Connect" on a match card.
 * - Updates matches.status to 'accepted'
 * - Writes a match_rating row (rating=1)
 * - Returns the candidate's name + email for the connections page
 *
 * Body: { matchId: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/server'

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

  const { matchId } = await request.json() as { matchId: string }
  if (!matchId) return NextResponse.json({ error: 'matchId required' }, { status: 400 })

  const serviceClient = createServiceClient()

  // Verify match belongs to this user
  const { data: match, error: matchError } = await serviceClient
    .from('matches')
    .select('id, profile_a_id, profile_b_id')
    .eq('id', matchId)
    .single()

  if (matchError || !match) {
    return NextResponse.json({ error: 'Match not found' }, { status: 404 })
  }

  const { data: requestingProfile } = await serviceClient
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!requestingProfile || requestingProfile.id !== match.profile_a_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Update status + write rating in parallel
  const [updateResult, insertResult] = await Promise.all([
    serviceClient
      .from('matches')
      .update({ status: 'accepted' })
      .eq('id', matchId),
    serviceClient
      .from('match_ratings')
      .insert({
        match_id: matchId,
        rated_by_profile_id: requestingProfile.id,
        rating: 1,
      }),
  ])

  if (updateResult.error || insertResult.error) {
    console.error('[matches/connect] DB error:', updateResult.error ?? insertResult.error)
    return NextResponse.json({ error: 'Failed to record connection' }, { status: 500 })
  }

  // Get candidate details + email
  const { data: candidateProfile } = await serviceClient
    .from('profiles')
    .select('user_id, first_name, last_name')
    .eq('id', match.profile_b_id)
    .single()

  if (!candidateProfile) {
    return NextResponse.json({ error: 'Candidate profile not found' }, { status: 404 })
  }

  const { data: { user: candidateUser }, error: userError } = await serviceClient.auth.admin.getUserById(
    candidateProfile.user_id
  )

  if (userError || !candidateUser) {
    return NextResponse.json({ error: 'Could not retrieve contact details' }, { status: 500 })
  }

  return NextResponse.json({
    email: candidateUser.email,
    firstName: candidateProfile.first_name,
    lastName: candidateProfile.last_name,
  })
}

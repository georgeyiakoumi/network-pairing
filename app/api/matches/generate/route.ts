/**
 * POST /api/matches/generate
 *
 * Runs AI matching for the authenticated user and persists results.
 * Returns ranked matches with score + reason.
 *
 * Uses runMatching() from lib/matching/run-matching.ts — same engine
 * as the admin test page (GEO-841). Never duplicated.
 */

import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { runMatching } from '@/lib/matching/run-matching'
import { DbProfile, PROFILE_SELECT, toRequestingProfile, toCandidateProfile } from '@/lib/matching/db'
import { createServiceClient } from '@/lib/supabase/server'

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST() {
  // Auth via user-scoped anon client
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

  // Service-role client for reading all profiles and writing matches
  // (matches table only allows service_role inserts per RLS)
  const serviceClient = createServiceClient()

  // ── Fetch requesting user's profile ──────────────────────────────────────────
  const { data: requestingRow, error: requestingError } = await serviceClient
    .from('profiles')
    .select(PROFILE_SELECT)
    .eq('user_id', user.id)
    .single()

  if (requestingError || !requestingRow) {
    return NextResponse.json(
      { error: 'Profile not found. Complete onboarding first.' },
      { status: 404 }
    )
  }

  const requesting = requestingRow as unknown as DbProfile
  const requestingProfile = toRequestingProfile(requesting)

  // ── Fetch all candidate profiles (excluding self, open_to_connect only) ──────
  const { data: candidateRows, error: candidatesError } = await serviceClient
    .from('profiles')
    .select(PROFILE_SELECT)
    .neq('user_id', user.id)
    .eq('open_to_connect', true)

  if (candidatesError) {
    return NextResponse.json({ error: 'Failed to load candidate profiles.' }, { status: 500 })
  }

  const candidates = (candidateRows as unknown as DbProfile[]).map(toCandidateProfile)

  if (candidates.length === 0) {
    return NextResponse.json({ matches: [] })
  }

  // ── Run AI matching ───────────────────────────────────────────────────────────
  const result = await runMatching(requestingProfile, candidates)

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  // ── Persist matches to DB ─────────────────────────────────────────────────────
  // Only persist score >= 30 — weak matches aren't worth storing.
  // Upsert on (profile_a_id, profile_b_id) so re-runs update existing rows.
  const scoringRows = result.matches.filter(m => m.score >= 30)

  if (scoringRows.length > 0) {
    // Two-step persist: update existing rows (score/reason/breakdown only, preserve status),
    // then insert genuinely new rows with status 'pending'.
    const profileBIds = scoringRows.map(m => m.profileId)

    const { data: existingRows } = await serviceClient
      .from('matches')
      .select('id, profile_b_id')
      .eq('profile_a_id', requestingProfile.profileId)
      .in('profile_b_id', profileBIds)

    const existingIds = new Set((existingRows ?? []).map(r => r.profile_b_id))

    // Update existing rows — never touch status
    const toUpdate = scoringRows.filter(m => existingIds.has(m.profileId))
    await Promise.all(
      toUpdate.map(m =>
        serviceClient
          .from('matches')
          .update({
            match_score: m.score,
            match_reason: m.reason,
            match_breakdown: m.breakdown ?? null,
          })
          .eq('profile_a_id', requestingProfile.profileId)
          .eq('profile_b_id', m.profileId)
      )
    )

    // Insert new rows with status 'pending'
    const toInsert = scoringRows
      .filter(m => !existingIds.has(m.profileId))
      .map(m => ({
        profile_a_id: requestingProfile.profileId,
        profile_b_id: m.profileId,
        match_score: m.score,
        match_reason: m.reason,
        match_breakdown: m.breakdown ?? null,
        status: 'pending',
      }))

    if (toInsert.length > 0) {
      const { error: insertError } = await serviceClient.from('matches').insert(toInsert)
      if (insertError) {
        console.error('[matches/generate] Failed to insert new matches:', insertError.message)
      }
    }
  }

  // ── Return ranked list ────────────────────────────────────────────────────────
  return NextResponse.json({ matches: result.matches })
}

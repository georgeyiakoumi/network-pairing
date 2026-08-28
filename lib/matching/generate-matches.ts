/**
 * generate-matches.ts
 *
 * Shared logic for generating and persisting AI matches for a user.
 * Called by:
 *   - app/api/matches/generate/route.ts  (API route)
 *   - app/(user)/match/page.tsx          (direct call, avoids self-fetch)
 *
 * Never duplicate this logic. Both consumers import from here.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { runMatching } from './run-matching'
import { DbProfile, PROFILE_SELECT, toRequestingProfile, toCandidateProfile } from './db'

type GenerateResult =
  | { success: true; matchCount: number }
  | { success: false; error: string }

export async function generateAndPersistMatches(
  userId: string,
  serviceClient: SupabaseClient
): Promise<GenerateResult> {
  // Fetch requesting user's profile
  const { data: requestingRow, error: requestingError } = await serviceClient
    .from('profiles')
    .select(PROFILE_SELECT)
    .eq('user_id', userId)
    .single()

  if (requestingError || !requestingRow) {
    return { success: false, error: 'Profile not found.' }
  }

  const requesting = requestingRow as unknown as DbProfile
  const requestingProfile = toRequestingProfile(requesting)

  // Fetch all candidate profiles (excluding self, open_to_connect only)
  const { data: candidateRows, error: candidatesError } = await serviceClient
    .from('profiles')
    .select(PROFILE_SELECT)
    .neq('user_id', userId)
    .eq('open_to_connect', true)

  if (candidatesError) {
    return { success: false, error: 'Failed to load candidate profiles.' }
  }

  const candidates = (candidateRows as unknown as DbProfile[]).map(toCandidateProfile)

  if (candidates.length === 0) {
    return { success: true, matchCount: 0 }
  }

  // Run AI matching
  const result = await runMatching(requestingProfile, candidates)

  if (!result.success) {
    return { success: false, error: result.error }
  }

  // Persist matches to DB — only score >= 30
  const scoringRows = result.matches.filter(m => m.score >= 30)

  if (scoringRows.length > 0) {
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
        console.error('[generate-matches] Failed to insert:', insertError.message)
      }
    }
  }

  return { success: true, matchCount: scoringRows.length }
}

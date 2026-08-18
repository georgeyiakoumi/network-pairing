/**
 * db.ts — Shared DB types and mappers for the matching engine.
 *
 * Used by:
 *   - app/api/matches/generate/route.ts  (user-facing)
 *   - app/api/admin/test-match/route.ts  (admin testing page, GEO-841)
 *   - scripts/test-matching.ts           (CLI test harness)
 *
 * Never duplicate these. All routes import from here.
 */

import type { CandidateProfile, RequestingProfile } from './matching-prompt'

export type DbProfile = {
  id: string
  first_name: string
  last_name: string
  primary_experience: number
  secondary_experience: number | null
  seeking_relationship_primary: string
  seeking_relationship_secondary: string[] | null
  seeking_goal: string | null
  professions: { category: string; role: string } | null
  secondary_professions: { role: string } | null
  seeking_professions: { role: string } | null
  profile_offers: { offers: { label: string } | null }[]
  profile_seeking_needs: { label: string }[]
}

export const PROFILE_SELECT = `
  id,
  first_name,
  last_name,
  primary_experience,
  secondary_experience,
  seeking_relationship_primary,
  seeking_relationship_secondary,
  seeking_goal,
  professions:primary_profession_id(category, role),
  secondary_professions:secondary_profession_id(role),
  seeking_professions:seeking_profession_id(role),
  profile_offers(offers:offer_id(label)),
  profile_seeking_needs(label)
`.trim()

export function toRequestingProfile(p: DbProfile): RequestingProfile {
  return {
    profileId: p.id,
    firstName: p.first_name,
    lastName: p.last_name,
    professionCategory: p.professions?.category ?? 'Unknown',
    professionRole: p.professions?.role ?? 'Unknown',
    experienceBand: p.primary_experience,
    secondaryProfessionRole: p.secondary_professions?.role,
    secondaryExperienceBand: p.secondary_experience ?? undefined,
    offerLabels: p.profile_offers.map(o => o.offers?.label ?? '').filter(Boolean),
    seekingNeedLabels: p.profile_seeking_needs.map(n => n.label),
    seekingRelationshipPrimary: p.seeking_relationship_primary,
    seekingRelationshipSecondary: p.seeking_relationship_secondary ?? [],
    seekingGoal: p.seeking_goal ?? undefined,
    seekingProfessionRole: p.seeking_professions?.role,
  }
}

export function toCandidateProfile(p: DbProfile): CandidateProfile {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { seekingProfessionRole: _seek, ...candidate } = toRequestingProfile(p)
  return candidate
}

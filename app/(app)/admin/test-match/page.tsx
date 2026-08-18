import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { TestMatchClient, type ProfileDetail } from './test-match-client'

const ADMIN_KEY = process.env.ADMIN_SECRET_KEY

const EXPERIENCE_BAND: Record<number, string> = {
  1: 'Student / Graduate (0–1 yr)',
  2: 'Early career (1–3 yrs)',
  3: 'Mid-level (3–5 yrs)',
  4: 'Senior (5–10 yrs)',
  5: 'Expert / Executive (10+ yrs)',
}

type DbRow = {
  id: string
  first_name: string
  last_name: string
  primary_experience: number
  secondary_experience: number | null
  seeking_relationship_primary: string
  seeking_relationship_secondary: string[] | null
  seeking_goal: string | null
  professions: { category: string; role: string } | { category: string; role: string }[] | null
  secondary_professions: { role: string } | { role: string }[] | null
  seeking_professions: { role: string } | { role: string }[] | null
  profile_offers: { offers: { label: string } | { label: string }[] | null }[]
  profile_seeking_needs: { label: string }[]
}

export default async function TestMatchPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>
}) {
  const { key } = await searchParams
  if (!ADMIN_KEY || key !== ADMIN_KEY) notFound()

  const db = createServiceClient()
  const { data } = await db
    .from('profiles')
    .select(`
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
    `)
    .eq('open_to_connect', true)
    .order('first_name')

  const profiles: ProfileDetail[] = (data ?? []).map((p: DbRow) => {
    const prof = Array.isArray(p.professions) ? p.professions[0] : p.professions
    const secProf = Array.isArray(p.secondary_professions) ? p.secondary_professions[0] : p.secondary_professions
    const seekProf = Array.isArray(p.seeking_professions) ? p.seeking_professions[0] : p.seeking_professions

    return {
      id: p.id,
      firstName: p.first_name,
      lastName: p.last_name,
      professionCategory: prof?.category ?? null,
      professionRole: prof?.role ?? null,
      experienceBand: p.primary_experience,
      experienceLabel: EXPERIENCE_BAND[p.primary_experience] ?? String(p.primary_experience),
      secondaryProfessionRole: secProf?.role ?? null,
      secondaryExperienceBand: p.secondary_experience,
      secondaryExperienceLabel: p.secondary_experience ? (EXPERIENCE_BAND[p.secondary_experience] ?? null) : null,
      offerLabels: p.profile_offers.map(o => {
        const offer = o.offers
        if (!offer) return ''
        return Array.isArray(offer) ? (offer[0]?.label ?? '') : offer.label
      }).filter(Boolean),
      seekingNeedLabels: p.profile_seeking_needs.map(n => n.label),
      seekingRelationshipPrimary: p.seeking_relationship_primary,
      seekingRelationshipSecondary: p.seeking_relationship_secondary ?? [],
      seekingGoal: p.seeking_goal,
      seekingProfessionRole: seekProf?.role ?? null,
    }
  })

  return <TestMatchClient profiles={profiles} adminKey={key} />
}

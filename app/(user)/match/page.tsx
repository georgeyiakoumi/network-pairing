import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { MatchStack, type MatchCard } from '@/components/match/match-stack'
import { createServiceClient } from '@/lib/supabase/server'
import { generateAndPersistMatches } from '@/lib/matching/generate-matches'

type DbMatch = {
  id: string
  profile_b_id: string
  match_score: number
  match_reason: string
  profiles_b: {
    first_name: string
    last_name: string
    primary_experience: number
    professions: { category: string; role: string } | null
    profile_offers: { offers: { label: string } | null }[]
  } | null
}

const PENDING_MATCH_SELECT = `
  id,
  profile_b_id,
  match_score,
  match_reason,
  profiles_b:profile_b_id(
    first_name,
    last_name,
    primary_experience,
    professions:primary_profession_id(category, role),
    profile_offers(offers:offer_id(label))
  )
` as const

export default async function MatchPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/onboarding')

  // ── Service-role client for reading matches ──────────────────────────────
  const serviceClient = createServiceClient()

  // ── Load existing pending matches from DB ──────────────────────────────────
  let { data: matchRows } = await serviceClient
    .from('matches')
    .select(PENDING_MATCH_SELECT)
    .eq('profile_a_id', profile.id)
    .eq('status', 'pending')
    .order('match_score', { ascending: false })
    .limit(10) as { data: DbMatch[] | null }

  // If no pending matches, generate them directly (no self-fetch) then re-query
  if (!matchRows?.length) {
    try {
      await generateAndPersistMatches(user.id, serviceClient)

      // Re-query after generation
      const { data: freshRows } = await serviceClient
        .from('matches')
        .select(PENDING_MATCH_SELECT)
        .eq('profile_a_id', profile.id)
        .eq('status', 'pending')
        .order('match_score', { ascending: false })
        .limit(10) as { data: DbMatch[] | null }

      matchRows = freshRows
    } catch {
      // Generation failed — show empty state
    }
  }

  if (!matchRows?.length) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center p-4 overflow-y-auto">
        <MatchStack initialCards={[]} />
      </main>
    )
  }

  // ── Map to MatchCard shape ─────────────────────────────────────────────────
  // Merge AI reason from generate response (not stored on the row we join here)
  // since match_reason on the row is already the AI reason — use it directly.
  const cards: MatchCard[] = matchRows.map(row => {
    const p = row.profiles_b
    return {
      matchId: row.id,
      profileId: row.profile_b_id,
      firstName: p?.first_name ?? 'Unknown',
      lastName: p?.last_name ?? '',
      professionRole: p?.professions?.role ?? 'Unknown',
      professionCategory: p?.professions?.category ?? '',
      experienceBand: p?.primary_experience ?? 1,
      offerLabels: (p?.profile_offers ?? []).map(o => o.offers?.label ?? '').filter(Boolean),
      reason: row.match_reason ?? '',
      score: row.match_score ?? 0,
    }
  })

  return (
    <main className="flex flex-1 flex-col items-center p-4 overflow-y-auto">
      <MatchStack initialCards={cards} />
    </main>
  )
}

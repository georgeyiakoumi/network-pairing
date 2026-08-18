import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { MatchStack, type MatchCard } from '@/components/match/match-stack'

import type { MatchBreakdown } from '@/lib/matching/matching-prompt'

type GenerateResponse = {
  matches: {
    profileId: string
    score: number
    reason: string
    breakdown?: MatchBreakdown | null
  }[]
  error?: string
}

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

  // ── Run matching (calls Claude, persists to matches table) ────────────────
  // We hit our own API route server-side by constructing an absolute URL.
  // NEXT_PUBLIC_SITE_URL is set automatically by Netlify in production.
  // NEXT_PUBLIC_APP_URL can be set manually to override.
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    'http://localhost:3000'
  const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ')

  const generateRes = await fetch(`${baseUrl}/api/matches/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieHeader,
    },
    cache: 'no-store',
  })

  const generateData: GenerateResponse = await generateRes.json()

  // ── If matching failed or returned no matches, show empty state ───────────
  if (!generateRes.ok || !generateData.matches?.length) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center min-h-screen p-4">
        <MatchStack initialCards={[]} />
      </main>
    )
  }

  // ── Fetch persisted match rows to get match IDs ───────────────────────────
  // We need the match table IDs for the connect API call.
  const serviceSupabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )

  const { data: matchRows } = await serviceSupabase
    .from('matches')
    .select(`
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
    `)
    .eq('profile_a_id', profile.id)
    .eq('status', 'pending')
    .order('match_score', { ascending: false })
    .limit(10) as { data: DbMatch[] | null }

  if (!matchRows?.length) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center min-h-screen p-4">
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
    <main className="flex flex-1 flex-col items-center justify-center min-h-screen p-4">
      <MatchStack initialCards={cards} />
    </main>
  )
}

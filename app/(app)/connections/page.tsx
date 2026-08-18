import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { ConnectionCard } from '@/components/connections/connection-card'
import { Users } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/server'
import type { MatchBreakdown } from '@/lib/matching/matching-prompt'

type AcceptedMatch = {
  id: string
  profile_b_id: string
  match_score: number
  match_reason: string
  match_breakdown: MatchBreakdown | null
  profiles_b: {
    user_id: string
    first_name: string
    last_name: string
    primary_experience: number
    professions: { role: string } | null
    profile_offers: { offers: { label: string } | null }[]
  } | null
}

export default async function ConnectionsPage() {
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

  const serviceClient = createServiceClient()

  const { data: matches } = await serviceClient
    .from('matches')
    .select(`
      id,
      profile_b_id,
      match_score,
      match_reason,
      match_breakdown,
      profiles_b:profile_b_id(
        user_id,
        first_name,
        last_name,
        primary_experience,
        professions:primary_profession_id(role),
        profile_offers(offers:offer_id(label))
      )
    `)
    .eq('profile_a_id', profile.id)
    .eq('status', 'accepted')
    .order('match_score', { ascending: false }) as { data: AcceptedMatch[] | null }

  const rows = matches ?? []
  const emailMap = new Map<string, string>()

  await Promise.all(
    rows.map(async (m) => {
      const userId = m.profiles_b?.user_id
      if (!userId) return
      const { data } = await serviceClient.auth.admin.getUserById(userId)
      if (data?.user?.email) emailMap.set(m.profile_b_id, data.user.email)
    })
  )

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 max-w-lg mx-auto w-full py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Connections</h1>
        <p className="text-sm text-muted-foreground">
          People you&apos;ve connected with. Reach out and introduce yourself.
        </p>
      </div>

      {rows.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users />
            </EmptyMedia>
            <EmptyTitle>No connections yet</EmptyTitle>
            <EmptyDescription>
              Head to <a href="/match">Matches</a> and connect with someone.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map(m => (
            <ConnectionCard
              key={m.id}
              firstName={m.profiles_b?.first_name ?? ''}
              lastName={m.profiles_b?.last_name ?? ''}
              professionRole={m.profiles_b?.professions?.role ?? 'Unknown role'}
              experienceBand={m.profiles_b?.primary_experience ?? 1}
              offerLabels={(m.profiles_b?.profile_offers ?? []).map(o => o.offers?.label ?? '').filter(Boolean)}
              matchScore={m.match_score}
              matchReason={m.match_reason}
              matchBreakdown={m.match_breakdown}
              email={emailMap.get(m.profile_b_id) ?? null}
            />
          ))}
        </div>
      )}
    </main>
  )
}

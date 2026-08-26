import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Settings } from 'lucide-react'
import { HeaderNavIcon } from '@/components/header-nav-icon'

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Get connection count for the badge
  const serviceSupabase = createServiceClient()
  const { data: profile } = await serviceSupabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  let connectionCount = 0
  if (profile) {
    const { count } = await serviceSupabase
      .from('matches')
      .select('id', { count: 'exact', head: true })
      .eq('profile_a_id', profile.id)
      .eq('status', 'accepted')

    connectionCount = count ?? 0
  }

  return (
    <div className="flex h-svh flex-col overflow-hidden bg-background">
      <header className="grid h-12 shrink-0 grid-cols-3 items-center px-4">
        {profile ? (
          <HeaderNavIcon connectionCount={connectionCount} />
        ) : (
          <div />
        )}
        <Link href="/match" className="text-sm font-semibold text-center">AlumniConnect</Link>
        {profile ? (
          <Link href="/profile" className="justify-self-end" aria-label="Settings">
            <Settings className="size-5 text-muted-foreground" />
          </Link>
        ) : (
          <div />
        )}
      </header>
      <main className="flex flex-1 flex-col min-h-0">
        {children}
      </main>
    </div>
  )
}

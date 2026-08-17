import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Card, CardContent } from '@/components/ui/card'
import { Users } from 'lucide-react'

export default async function MatchPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check if profile exists — if not, redirect to onboarding
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/onboarding')

  return (
    <main className="flex flex-1 flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-sm">
        <CardContent className="flex flex-col items-center gap-4 py-10">
          <div className="flex items-center justify-center size-16 rounded-full bg-muted">
            <Users className="size-8 text-muted-foreground" />
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-xl font-semibold">You&apos;re in</h1>
            <p className="text-sm text-muted-foreground">
              AI matching is coming in the next milestone. Your profile is saved and ready.
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}

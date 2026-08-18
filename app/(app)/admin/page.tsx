import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { MatchScoreChart } from '@/components/admin/match-score-chart'
import { PassReasonsChart } from '@/components/admin/pass-reasons-chart'
import { Users, Handshake, Star, TrendingUp, BarChart2 } from 'lucide-react'

// ─── Admin gate ───────────────────────────────────────────────────────────────
// Env-var guard — sufficient for a private demo dashboard.
// Access via /admin?key=YOUR_ADMIN_SECRET_KEY
const ADMIN_KEY = process.env.ADMIN_SECRET_KEY

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>
}) {
  const { key } = await searchParams
  if (!ADMIN_KEY || key !== ADMIN_KEY) notFound()

  const db = createServiceClient()

  // ── Fetch all data in parallel ────────────────────────────────────────────
  const [
    { count: totalProfiles },
    { data: allMatches },
    { data: allRatings },
    { data: professionRows },
    { data: needRows },
  ] = await Promise.all([
    db.from('profiles').select('*', { count: 'exact', head: true }),
    db.from('matches').select('match_score, status'),
    db.from('match_ratings').select('rating, reason'),
    db.from('profiles').select('professions:primary_profession_id(role)').limit(500),
    db.from('profile_seeking_needs').select('label').limit(500),
  ])

  // ── Derive match stats ────────────────────────────────────────────────────
  const matches = allMatches ?? []
  const totalMatches = matches.length
  const connections = matches.filter(m => m.status === 'accepted').length
  const pending = matches.filter(m => m.status === 'pending').length
  const rejected = matches.filter(m => m.status === 'rejected').length
  const scores = matches.map(m => Number(m.match_score)).filter(s => !isNaN(s) && s > 0)
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0

  // ── Score distribution buckets ────────────────────────────────────────────
  const buckets = [
    { label: '0–19', min: 0, max: 19, count: 0 },
    { label: '20–39', min: 20, max: 39, count: 0 },
    { label: '40–59', min: 40, max: 59, count: 0 },
    { label: '60–79', min: 60, max: 79, count: 0 },
    { label: '80–100', min: 80, max: 100, count: 0 },
  ]
  for (const s of scores) {
    for (const b of buckets) {
      if (s >= b.min && s <= b.max) { b.count++; break }
    }
  }

  // ── Ratings ───────────────────────────────────────────────────────────────
  const ratings = allRatings ?? []
  const reasonLabels: Record<string, string> = {
    not_relevant: 'Not relevant to my goals',
    wrong_level: 'Wrong experience level',
    wrong_profession: 'Wrong profession',
    not_a_fit: 'Just not a fit',
  }
  const reasonCounts: Record<string, number> = {}
  for (const r of ratings) {
    if (r.reason) reasonCounts[r.reason] = (reasonCounts[r.reason] ?? 0) + 1
  }
  const totalRated = ratings.length
  const reasonBuckets = Object.entries(reasonCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([reason, count]) => ({ label: reasonLabels[reason] ?? reason, count }))

  // ── Top professions ───────────────────────────────────────────────────────
  const profCounts: Record<string, number> = {}
  for (const row of (professionRows ?? [])) {
    const prof = row.professions as { role: string } | { role: string }[] | null
    const role = Array.isArray(prof) ? prof[0]?.role : prof?.role
    if (role) profCounts[role] = (profCounts[role] ?? 0) + 1
  }
  const topProfs = Object.entries(profCounts).sort((a, b) => b[1] - a[1]).slice(0, 8)

  // ── Top needs ─────────────────────────────────────────────────────────────
  const needCounts: Record<string, number> = {}
  for (const row of (needRows ?? [])) {
    if (row.label) needCounts[row.label] = (needCounts[row.label] ?? 0) + 1
  }
  const topNeeds = Object.entries(needCounts).sort((a, b) => b[1] - a[1]).slice(0, 8)

  return (
    <div className="flex flex-col gap-8 p-6 max-w-5xl mx-auto w-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Admin dashboard</h1>
        <p className="text-sm text-muted-foreground">Platform-level match quality and engagement stats.</p>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard icon={Users} label="Profiles" value={totalProfiles ?? 0} />
        <StatCard icon={BarChart2} label="Matches made" value={totalMatches} />
        <StatCard icon={Handshake} label="Connections" value={connections} />
        <StatCard icon={TrendingUp} label="Avg match score" value={`${avgScore}%`} />
        <StatCard icon={Star} label="Pass feedback" value={totalRated} />
      </div>

      {/* ── Match status ── */}
      <Card>
        <CardHeader>
          <CardTitle>Match status</CardTitle>
          <CardDescription>Current status of all AI-generated matches.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <StatusPill label="Pending" count={pending} variant="muted" />
          <StatusPill label="Connected" count={connections} variant="success" />
          <StatusPill label="Rejected" count={rejected} variant="destructive" />
        </CardContent>
      </Card>

      {/* ── Score distribution ── */}
      <Card>
        <CardHeader>
          <CardTitle>Match score distribution</CardTitle>
          <CardDescription>How AI match scores are distributed across all matches.</CardDescription>
        </CardHeader>
        <CardContent>
          <MatchScoreChart data={buckets} />
        </CardContent>
      </Card>

      {/* ── Pass reasons chart ── */}
      <Card>
        <CardHeader>
          <CardTitle>Pass reasons</CardTitle>
          <CardDescription>Why users are passing on their matches.</CardDescription>
        </CardHeader>
        <CardContent>
          <PassReasonsChart data={reasonBuckets} />
        </CardContent>
      </Card>

      {/* ── Top professions + needs ── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top professions</CardTitle>
            <CardDescription>Most common primary professions in the network.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {topProfs.map(([role, count]) => (
              <RankRow key={role} label={role} count={count} total={totalProfiles ?? 1} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top needs</CardTitle>
            <CardDescription>What alumni most want from connections.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {topNeeds.map(([label, count]) => (
              <RankRow key={label} label={label} count={count} total={totalProfiles ?? 1} />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 pt-5 pb-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className="size-4" aria-hidden="true" />
          <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
        </div>
        <p className="text-3xl font-semibold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  )
}

function StatusPill({ label, count, variant }: { label: string; count: number; variant: 'muted' | 'success' | 'destructive' }) {
  const cls =
    variant === 'success' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
    variant === 'destructive' ? 'bg-destructive/10 text-destructive' :
    'bg-muted text-muted-foreground'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${cls}`}>
      {label} <span className="font-bold">{count}</span>
    </span>
  )
}

function RankRow({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="truncate">{label}</span>
        <span className="text-xs text-muted-foreground shrink-0">{count} · {pct}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Loader2, FlaskConical } from 'lucide-react'

export type ProfileDetail = {
  id: string
  firstName: string
  lastName: string
  professionCategory: string | null
  professionRole: string | null
  experienceBand: number
  experienceLabel: string
  secondaryProfessionRole: string | null
  secondaryExperienceBand: number | null
  secondaryExperienceLabel: string | null
  offerLabels: string[]
  seekingNeedLabels: string[]
  seekingRelationshipPrimary: string
  seekingRelationshipSecondary: string[]
  seekingGoal: string | null
  seekingProfessionRole: string | null
}

type MatchResult = {
  profileId: string
  score: number
  reason: string
  breakdown: {
    summary: string
    alignments: { yourNeed: string; theirOffer: string; explanation: string }[]
    gaps: { reason: string; explanation: string }[]
  } | null
}

type StreamEvent =
  | { type: 'log'; text: string }
  | { type: 'result'; matches: MatchResult[]; requesting: { firstName: string; lastName: string; professionRole: string } }
  | { type: 'error'; error: string }

function scoreVariant(score: number): string {
  if (score >= 70) return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
  if (score >= 40) return 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
  return 'bg-destructive/10 text-destructive'
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? 'bg-emerald-500' : score >= 40 ? 'bg-amber-500' : 'bg-destructive'
  return (
    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${score}%` }} />
    </div>
  )
}

function ProfileCard({ profile }: { profile: ProfileDetail }) {
  const profession = [profile.professionCategory, profile.professionRole].filter(Boolean).join(' · ')
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{profile.firstName} {profile.lastName}</CardTitle>
        {profession && (
          <CardDescription className="text-sm">{profession} · {profile.experienceLabel}</CardDescription>
        )}
        {profile.secondaryProfessionRole && (
          <CardDescription className="text-xs">
            Also: {profile.secondaryProfessionRole}
            {profile.secondaryExperienceLabel ? ` · ${profile.secondaryExperienceLabel}` : ''}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pt-0">
        <Separator />
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Offers</p>
            {profile.offerLabels.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {profile.offerLabels.map(l => (
                  <Badge key={l} variant="secondary" className="text-xs">{l}</Badge>
                ))}
              </div>
            ) : <p className="text-xs text-muted-foreground">None</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Seeking</p>
            {profile.seekingNeedLabels.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {profile.seekingNeedLabels.map(l => (
                  <Badge key={l} variant="outline" className="text-xs">{l}</Badge>
                ))}
              </div>
            ) : <p className="text-xs text-muted-foreground">None</p>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Relationship</p>
            <p className="text-sm">{profile.seekingRelationshipPrimary}</p>
            {profile.seekingRelationshipSecondary.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Also open to: {profile.seekingRelationshipSecondary.join(', ')}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            {profile.seekingProfessionRole && (
              <>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Seeking profession</p>
                <p className="text-sm">{profile.seekingProfessionRole}</p>
              </>
            )}
            {profile.seekingGoal && (
              <>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mt-1">Goal</p>
                <p className="text-sm">{profile.seekingGoal}</p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TerminalLog({ lines, running }: { lines: string[]; running: boolean }) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  return (
    <div className="rounded-lg border border-border bg-black overflow-hidden">
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border/50">
        <span className="size-2.5 rounded-full bg-red-500/70" />
        <span className="size-2.5 rounded-full bg-amber-500/70" />
        <span className="size-2.5 rounded-full bg-emerald-500/70" />
        <span className="ml-2 text-xs text-white/30 font-mono">match-engine</span>
      </div>
      <div className="p-4 font-mono text-xs leading-relaxed max-h-48 overflow-y-auto">
        {lines.map((line, i) => (
          <div key={i} className="text-emerald-400">{line}</div>
        ))}
        {running && (
          <div className="flex items-center gap-1.5 text-white/40 mt-1">
            <span className="inline-block w-2 h-3.5 bg-white/40 animate-pulse" />
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}

export function TestMatchClient({
  profiles,
  adminKey,
}: {
  profiles: ProfileDetail[]
  adminKey: string | undefined
}) {
  const [selectedId, setSelectedId] = useState<string>('')
  const [selectedLabel, setSelectedLabel] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [logLines, setLogLines] = useState<string[]>([])
  const [matches, setMatches] = useState<MatchResult[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const profileMap = new Map(profiles.map(p => [p.id, p]))

  const selectedProfile = selectedId ? profileMap.get(selectedId) : null

  function makeLabel(p: ProfileDetail) {
    return `${p.firstName} ${p.lastName}${p.professionRole ? ` — ${p.professionRole}` : ''}`
  }

  async function runTest() {
    if (!selectedId) return
    setLoading(true)
    setMatches(null)
    setError(null)
    setLogLines([])

    try {
      const res = await fetch('/api/admin/test-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId: selectedId, adminKey }),
      })

      if (!res.ok || !res.body) {
        const data = await res.json() as { error?: string }
        setError(data.error ?? 'Request failed')
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const event = JSON.parse(line) as StreamEvent
            if (event.type === 'log') {
              setLogLines(prev => [...prev, event.text])
            } else if (event.type === 'result') {
              setMatches(event.matches)
            } else if (event.type === 'error') {
              setError(event.error)
            }
          } catch {
            // malformed line — skip
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <FlaskConical className="size-5 text-muted-foreground" aria-hidden="true" />
          <h1 className="text-2xl font-semibold tracking-tight">Match tester</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Run the matching engine for any profile. Results are not persisted — for QA only.
        </p>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-6 items-start">

        {/* Left column — sticky */}
        <div className="w-80 shrink-0 flex flex-col gap-4 sticky top-6">

          {/* Controls */}
          <Card>
            <CardContent className="flex flex-col gap-4 pt-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium" htmlFor="profile-select">
                  Select a profile
                </label>
                <Select
                  value={selectedLabel}
                  onValueChange={(v) => {
                    const label = v ?? ''
                    const profile = profiles.find(p => makeLabel(p) === label)
                    setSelectedLabel(label)
                    setSelectedId(profile?.id ?? '')
                    setMatches(null)
                    setError(null)
                    setLogLines([])
                  }}
                >
                  <SelectTrigger id="profile-select" className="w-full">
                    <SelectValue placeholder="Choose a profile to test…" />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map(p => (
                      <SelectItem key={p.id} value={makeLabel(p)}>
                        {makeLabel(p)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={runTest}
                disabled={!selectedId || loading}
                className="self-start"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" data-icon="inline-start" aria-hidden="true" />
                    Running…
                  </>
                ) : (
                  'Run match'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Selected profile */}
          {selectedProfile && <ProfileCard profile={selectedProfile} />}

          {/* Terminal log */}
          {logLines.length > 0 && (
            <TerminalLog lines={logLines} running={loading} />
          )}

          {/* Error */}
          {error && (
            <Card className="border-destructive/50">
              <CardContent className="pt-5">
                <p className="text-sm text-destructive">{error}</p>
              </CardContent>
            </Card>
          )}

        </div>

        {/* Right column — results */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">

      {/* Results */}
      {matches !== null && (
        <div className="flex flex-col gap-4">
          <p className="text-sm font-medium text-muted-foreground">
            {matches.length} match{matches.length !== 1 ? 'es' : ''} ranked
          </p>

          {matches.length === 0 ? (
            <Card>
              <CardContent className="pt-5">
                <p className="text-sm text-muted-foreground">No matches — no other open-to-connect profiles.</p>
              </CardContent>
            </Card>
          ) : (
            matches.map((match, i) => {
              const matchProfile = profileMap.get(match.profileId)
              const displayName = matchProfile
                ? `${matchProfile.firstName} ${matchProfile.lastName}`
                : match.profileId

              return (
                <Card key={match.profileId}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <CardTitle className="text-base">
                          #{i + 1} · {displayName}
                        </CardTitle>
                        {matchProfile?.professionRole && (
                          <CardDescription className="text-sm">
                            {matchProfile.professionCategory ? `${matchProfile.professionCategory} · ` : ''}
                            {matchProfile.professionRole} · {matchProfile.experienceLabel}
                          </CardDescription>
                        )}
                      </div>
                      <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-sm font-semibold tabular-nums ${scoreVariant(match.score)}`}>
                        {match.score}%
                      </span>
                    </div>
                    <ScoreBar score={match.score} />
                  </CardHeader>

                  <CardContent className="flex flex-col gap-3 pt-0">
                    <p className="text-sm text-foreground">{match.reason}</p>

                    {matchProfile && (
                      <>
                        <Separator />
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Their offers</p>
                            <div className="flex flex-wrap gap-1">
                              {matchProfile.offerLabels.length > 0
                                ? matchProfile.offerLabels.map(l => <Badge key={l} variant="secondary" className="text-xs">{l}</Badge>)
                                : <span className="text-xs text-muted-foreground">None</span>}
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Their seeking</p>
                            <div className="flex flex-wrap gap-1">
                              {matchProfile.seekingNeedLabels.length > 0
                                ? matchProfile.seekingNeedLabels.map(l => <Badge key={l} variant="outline" className="text-xs">{l}</Badge>)
                                : <span className="text-xs text-muted-foreground">None</span>}
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {match.breakdown && (
                      <>
                        <Separator />
                        <div className="flex flex-col gap-2">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Alignments</p>
                          {match.breakdown.alignments.map((a, j) => (
                            <div key={j} className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <Badge variant="secondary" className="text-xs">{a.yourNeed}</Badge>
                                <span className="text-muted-foreground text-xs">↔</span>
                                <Badge variant="outline" className="text-xs">{a.theirOffer}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground pl-0.5">{a.explanation}</p>
                            </div>
                          ))}
                        </div>

                        {match.breakdown.gaps.length > 0 && (
                          <div className="flex flex-col gap-2">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Gaps</p>
                            {match.breakdown.gaps.map((g, j) => (
                              <div key={j} className="flex flex-col gap-0.5">
                                <span className="text-xs font-medium text-destructive/80">{g.reason}</span>
                                <p className="text-xs text-muted-foreground">{g.explanation}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      )}

        </div>
        {/* end right column */}

      </div>
      {/* end two-column */}

    </div>
  )
}

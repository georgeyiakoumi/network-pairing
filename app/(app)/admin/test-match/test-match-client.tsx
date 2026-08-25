'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2 } from 'lucide-react'

import type { ProfileDetail, MatchResult, StreamEvent } from '@/components/admin/test-match/types'
import { ProfileCard } from '@/components/admin/test-match/profile-card'
import { ProfilePicker } from '@/components/admin/test-match/profile-picker'
import { TerminalLog } from '@/components/admin/test-match/terminal-log'
import { MatchResultCard } from '@/components/admin/test-match/match-result-card'
import { MatchResultsSkeleton } from '@/components/admin/test-match/match-results-skeleton'

export type { ProfileDetail }

// ─── Cost estimate ───────────────────────────────────────────────────────────
// Haiku pricing: $1/M input, $5/M output
// ~2K input + ~1K output per call → ~$0.007 per call
const COST_PER_CALL = 0.007

function estimateCost(calls: number) {
  return `${calls} API call${calls !== 1 ? 's' : ''} · ~$${(calls * COST_PER_CALL).toFixed(3)}`
}

// ─── Cache helpers ───────────────────────────────────────────────────────────

function cacheKey(profileId: string) {
  return `match-tester:${profileId}`
}

function saveToCache(profileId: string, results: MatchResult[], calls: number) {
  try {
    localStorage.setItem(cacheKey(profileId), JSON.stringify({
      matches: results,
      apiCalls: calls,
      timestamp: Date.now(),
    }))
  } catch {
    // storage full — ignore
  }
}

function loadFromCache(profileId: string): { matches: MatchResult[]; apiCalls: number; timestamp: number } | null {
  try {
    const raw = localStorage.getItem(cacheKey(profileId))
    if (!raw) return null
    return JSON.parse(raw) as { matches: MatchResult[]; apiCalls: number; timestamp: number }
  } catch {
    return null
  }
}

// ─── Main component ──────────────────────────────────────────────────────────

export function TestMatchClient({
  profiles,
  adminKey,
}: {
  profiles: ProfileDetail[]
  adminKey: string | undefined
}) {
  const [selectedId, setSelectedId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [logLines, setLogLines] = useState<string[]>([])
  const [matches, setMatches] = useState<MatchResult[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [terminalExpanded, setTerminalExpanded] = useState(true)
  const [apiCalls, setApiCalls] = useState<number>(0)
  const [cached, setCached] = useState(false)

  const profileMap = useMemo(() => new Map(profiles.map(p => [p.id, p])), [profiles])
  const selectedProfile = selectedId ? profileMap.get(selectedId) : null

  async function runTest() {
    if (!selectedId) return
    setLoading(true)
    setMatches(null)
    setError(null)
    setLogLines([])
    setApiCalls(0)
    setCached(false)
    setTerminalExpanded(true)

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
      let finalMatches: MatchResult[] | null = null
      let finalCalls = 0

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
              finalMatches = event.matches
              finalCalls = event.stats.chunks * 2
              setMatches(event.matches)
              setApiCalls(finalCalls)
            } else if (event.type === 'error') {
              setError(event.error)
            }
          } catch {
            // malformed line — skip
          }
        }
      }

      if (finalMatches) {
        saveToCache(selectedId, finalMatches, finalCalls)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  function handleProfileSelect(id: string) {
    setSelectedId(id)
    setError(null)
    setLogLines([])

    const hit = loadFromCache(id)
    if (hit) {
      setMatches(hit.matches)
      setApiCalls(hit.apiCalls)
      setCached(true)
    } else {
      setMatches(null)
      setApiCalls(0)
      setCached(false)
    }
  }

  // ─── Layout ──────────────────────────────────────────────────────────────
  // Outer: flex-col, h-full — fills the viewport slot from the app layout.
  //   Row 1: page header (shrink-0)
  //   Row 2: two-column area (flex-1, min-h-0 so it doesn't overflow)
  //   Row 3: terminal (shrink-0, pinned to bottom)

  return (
    <div className="flex h-full flex-col">

      {/* Row 1 — Page header */}
      

      {/* Row 2 — Two columns */}
      <div className="flex flex-1 min-h-0 gap-6">

        {/* Left column — fixed width, scrolls independently */}
        
          <div className="flex flex-col gap-4 p-8">

            <header className="shrink-0 flex flex-col gap-1">
              <h1 className="text-2xl font-semibold tracking-tight">Match tester</h1>
              <p className="text-sm text-muted-foreground">
                Run the matching engine for any profile. Results are not persisted.
              </p>
            </header>

            {/* Profile picker + run button */}
            <div className="flex flex-col gap-3">
              <ProfilePicker
                profiles={profiles}
                selectedId={selectedId}
                onSelect={handleProfileSelect}
              />
              {cached ? (
                <div className="flex items-center gap-2">
                  <Button disabled>
                    Run match
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {matches?.length ?? 0} match{(matches?.length ?? 0) !== 1 ? 'es' : ''} cached
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      if (selectedId) {
                        try { localStorage.removeItem(cacheKey(selectedId)) } catch { /* ignore */ }
                      }
                      setCached(false)
                      setMatches(null)
                      setApiCalls(0)
                    }}
                  >
                    Clear cache
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Button
                    onClick={runTest}
                    disabled={!selectedId || loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" data-icon="inline-start" aria-hidden="true" />
                        Running...
                      </>
                    ) : (
                      'Run match'
                    )}
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {apiCalls > 0
                      ? estimateCost(apiCalls)
                      : `est. ${estimateCost(Math.ceil((profiles.length - 1) / 20) * 2)}`
                    }
                  </span>
                </div>
              )}
            </div>

            {/* Selected profile details */}
            {selectedProfile && <ProfileCard profile={selectedProfile} />}

            {/* Error */}
            {error && (
              <Card className="border-destructive/50">
                <CardContent className="pt-5">
                  <p className="text-sm text-destructive">{error}</p>
                </CardContent>
              </Card>
            )}
          </div>

        {/* Right column — fills remaining width, scrolls independently */}
        <ScrollArea className="flex-1 min-w-0 bg-muted" viewportClassName="scroll-fade-y">
          <div className="flex flex-col gap-4 p-8">
            {loading && matches === null ? (
              <MatchResultsSkeleton />
            ) : matches !== null ? (
              <>
                {matches.length === 0 ? (
                  <Card>
                    <CardContent className="pt-5">
                      <p className="text-sm text-muted-foreground">No matches — no other open-to-connect profiles.</p>
                    </CardContent>
                  </Card>
                ) : (
                  matches.map((match, i) => (
                    <MatchResultCard
                      key={match.profileId}
                      match={match}
                      rank={i + 1}
                      matchProfile={profileMap.get(match.profileId)}
                      selectedProfile={selectedProfile ?? undefined}
                    />
                  ))
                )}
              </>
            ) : !loading && (
              <div className="flex items-center justify-center py-24">
                <p className="text-sm text-muted-foreground">Select a profile and run a match to see results.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Row 3 — Terminal (pinned to bottom) */}
      <div className="shrink-0 border-t border-border">
        <TerminalLog
          lines={logLines}
          running={loading}
          expanded={terminalExpanded}
          onToggle={() => setTerminalExpanded(prev => !prev)}
        />
      </div>
    </div>
  )
}

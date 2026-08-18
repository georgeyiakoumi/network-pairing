/**
 * POST /api/admin/test-match
 *
 * Streams newline-delimited JSON events so the client can show a live log.
 * Event types:
 *   { "type": "log",    "text": "..." }
 *   { "type": "result", "matches": [...], "requesting": {...} }
 *   { "type": "error",  "error": "..." }
 *
 * Results are NOT persisted. For QA and debugging only.
 */

import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { runMatching } from '@/lib/matching/run-matching'
import { preFilterCandidates } from '@/lib/matching/pre-filter'
import { DbProfile, PROFILE_SELECT, toRequestingProfile, toCandidateProfile } from '@/lib/matching/db'

const ADMIN_KEY = process.env.ADMIN_SECRET_KEY

export async function POST(request: NextRequest) {
  const { profileId, adminKey } = await request.json() as { profileId?: string; adminKey?: string }

  if (!ADMIN_KEY || adminKey !== ADMIN_KEY) {
    return new Response(JSON.stringify({ type: 'error', error: 'Forbidden' }), { status: 403 })
  }
  if (!profileId) {
    return new Response(JSON.stringify({ type: 'error', error: 'profileId required' }), { status: 400 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      function emit(event: Record<string, unknown>) {
        controller.enqueue(encoder.encode(JSON.stringify(event) + '\n'))
      }

      try {
        emit({ type: 'log', text: '→ Authenticating request…' })

        const db = createServiceClient()

        emit({ type: 'log', text: '→ Fetching profiles from database…' })

        const [{ data: requestingRow, error: reqErr }, { data: candidateRows, error: candErr }] = await Promise.all([
          db.from('profiles').select(PROFILE_SELECT).eq('id', profileId).single(),
          db.from('profiles').select(PROFILE_SELECT).neq('id', profileId).eq('open_to_connect', true),
        ])

        if (reqErr || !requestingRow) {
          emit({ type: 'error', error: 'Profile not found' })
          controller.close()
          return
        }
        if (candErr) {
          emit({ type: 'error', error: `Database error: ${candErr.message}` })
          controller.close()
          return
        }

        const requesting = toRequestingProfile(requestingRow as unknown as DbProfile)
        const candidates = (candidateRows as unknown as DbProfile[] ?? []).map(toCandidateProfile)

        emit({ type: 'log', text: `→ Loaded requesting profile: ${requesting.firstName} ${requesting.lastName}` })
        emit({ type: 'log', text: `→ Found ${candidates.length} candidate profile${candidates.length !== 1 ? 's' : ''}` })

        if (candidates.length === 0) {
          emit({ type: 'log', text: '→ No candidates — returning empty result' })
          emit({ type: 'result', matches: [], requesting })
          controller.close()
          return
        }

        // Pre-filter here for immediate logging — runMatching receives the
        // already-filtered list so the filter only runs once.
        emit({ type: 'log', text: '→ Running deterministic pre-filter…' })
        const { filtered, eliminated } = preFilterCandidates(requesting, candidates)
        emit({ type: 'log', text: `→ ${filtered.length} candidate${filtered.length !== 1 ? 's' : ''} passed pre-filter (${eliminated} eliminated)` })

        if (filtered.length === 0) {
          emit({ type: 'log', text: '→ No candidates passed pre-filter — returning empty result' })
          emit({ type: 'result', matches: [], requesting })
          controller.close()
          return
        }

        emit({ type: 'log', text: '→ Sending to Claude (claude-haiku-4-5)…' })

        // Pass filtered list directly — runMatching skips its internal pre-filter
        // when the input is already filtered (candidates.length === filtered.length
        // handled internally; here we pass filtered to avoid a second pass).
        const result = await runMatching(requesting, filtered)

        if (!result.success) {
          emit({ type: 'error', error: result.error })
          controller.close()
          return
        }

        const { stats } = result
        emit({ type: 'log', text: `→ Scored in ${stats.chunks} chunk${stats.chunks !== 1 ? 's' : ''} × A→B + B→A (two-sided)` })
        emit({ type: 'log', text: `→ ${stats.aboveThreshold} match${stats.aboveThreshold !== 1 ? 'es' : ''} above threshold (≥40%)` })
        emit({ type: 'log', text: `→ Top score: ${result.matches[0]?.score ?? 'n/a'}%` })
        emit({ type: 'log', text: '→ Done.' })
        emit({ type: 'result', matches: result.matches, requesting })
      } catch (err) {
        emit({ type: 'error', error: err instanceof Error ? err.message : 'Unknown error' })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  })
}

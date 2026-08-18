/**
 * run-matching.ts
 *
 * The single source of truth for AI matching.
 * Called by:
 *   - app/api/matches/generate/route.ts  (user-facing)
 *   - app/api/admin/test-match/route.ts  (admin testing page, GEO-841)
 *
 * Never duplicate this logic. Both routes import from here.
 *
 * Pipeline:
 *   1. Pre-filter — deterministic rules eliminate structurally incompatible candidates
 *   2. Chunk — remaining candidates split into batches of CHUNK_SIZE (Claude attention degrades on large inputs)
 *   3. A→B score — Claude scores each chunk from the requester's perspective
 *   4. B→A score — Claude scores each candidate from their perspective (two-sided)
 *   5. Merge — combined score = (A→B + B→A) / 2, sorted descending, threshold applied
 */

import Anthropic from '@anthropic-ai/sdk'
import {
  MATCHING_SYSTEM_PROMPT,
  buildMatchingUserMessage,
  type CandidateProfile,
  type RequestingProfile,
  type MatchResult,
} from './matching-prompt'
import { preFilterCandidates } from './pre-filter'

export type RunMatchingResult =
  | { success: true; matches: MatchResult[]; stats: MatchingStats }
  | { success: false; error: string }

export type MatchingStats = {
  totalCandidates: number
  afterPreFilter: number
  eliminated: number
  chunks: number
  aboveThreshold: number
}

const CHUNK_SIZE = 20
const SCORE_THRESHOLD = 40

const client = new Anthropic()

/**
 * Runs one Claude call for a batch of candidates.
 * Returns parsed MatchResult[] or throws.
 */
async function scoreChunk(
  requesting: RequestingProfile,
  chunk: CandidateProfile[],
): Promise<MatchResult[]> {
  const userMessage = buildMatchingUserMessage(requesting, chunk)

  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 16000,
    system: MATCHING_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  })

  const textBlock = response.content.find(b => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from model')
  }

  const cleaned = textBlock.text
    .trim()
    .replace(/^```(?:json)?\r?\n?/i, '')
    .replace(/\r?\n?```\s*$/, '')
    .trim()

  let raw: unknown
  try {
    raw = JSON.parse(cleaned)
  } catch {
    throw new Error(`Failed to parse model response as JSON: ${textBlock.text.slice(0, 200)}`)
  }

  if (!Array.isArray(raw)) {
    throw new Error('Model response was not a JSON array')
  }

  const validIds = new Set(chunk.map(c => c.profileId))
  const results: MatchResult[] = []

  for (const item of raw) {
    if (
      typeof item !== 'object' || item === null ||
      typeof item.profileId !== 'string' ||
      typeof item.score !== 'number' ||
      typeof item.reason !== 'string'
    ) continue

    if (!validIds.has(item.profileId)) continue

    let breakdown: MatchResult['breakdown'] = null
    const b = (item as Record<string, unknown>).breakdown
    if (
      typeof b === 'object' && b !== null &&
      typeof (b as Record<string, unknown>).summary === 'string' &&
      Array.isArray((b as Record<string, unknown>).alignments)
    ) {
      const raw_b = b as Record<string, unknown>
      const alignments = (raw_b.alignments as unknown[])
        .filter((a): a is Record<string, unknown> =>
          typeof a === 'object' && a !== null &&
          typeof (a as Record<string, unknown>).yourNeed === 'string' &&
          typeof (a as Record<string, unknown>).theirOffer === 'string' &&
          typeof (a as Record<string, unknown>).explanation === 'string'
        )
        .map(a => ({
          yourNeed: a.yourNeed as string,
          theirOffer: a.theirOffer as string,
          explanation: a.explanation as string,
        }))
      const gaps = Array.isArray(raw_b.gaps)
        ? (raw_b.gaps as unknown[])
            .filter((g): g is Record<string, unknown> =>
              typeof g === 'object' && g !== null &&
              typeof (g as Record<string, unknown>).reason === 'string' &&
              typeof (g as Record<string, unknown>).explanation === 'string'
            )
            .map(g => ({
              reason: g.reason as string,
              explanation: g.explanation as string,
            }))
        : []

      breakdown = {
        summary: raw_b.summary as string,
        alignments,
        gaps,
      }
    }

    results.push({
      profileId: item.profileId,
      score: Math.max(0, Math.min(100, Math.round(item.score))),
      reason: item.reason.slice(0, 200),
      breakdown,
    })
  }

  return results
}

/**
 * Splits an array into chunks of at most `size` items.
 */
function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

/**
 * Converts a CandidateProfile to a RequestingProfile so it can be used
 * as the requester in a reverse (B→A) scoring call.
 */
function asRequesting(candidate: CandidateProfile): RequestingProfile {
  return {
    ...candidate,
    seekingProfessionRole: undefined,
  }
}

/**
 * Runs the full matching pipeline for a given requesting user against a pool of candidates.
 *
 * @param requesting - The profile requesting matches
 * @param candidates - All candidate profiles (pre-fetch, excluding self)
 */
export async function runMatching(
  requesting: RequestingProfile,
  candidates: CandidateProfile[],
): Promise<RunMatchingResult> {
  if (candidates.length === 0) {
    return {
      success: true,
      matches: [],
      stats: { totalCandidates: 0, afterPreFilter: 0, eliminated: 0, chunks: 0, aboveThreshold: 0 },
    }
  }

  // ── Step 1: Pre-filter ────────────────────────────────────────────────────
  const { filtered, eliminated } = preFilterCandidates(requesting, candidates)

  if (filtered.length === 0) {
    return {
      success: true,
      matches: [],
      stats: {
        totalCandidates: candidates.length,
        afterPreFilter: 0,
        eliminated,
        chunks: 0,
        aboveThreshold: 0,
      },
    }
  }

  // ── Step 2: Chunk ─────────────────────────────────────────────────────────
  const chunks = chunkArray(filtered, CHUNK_SIZE)

  try {
    // ── Step 3: A→B scoring (requester's perspective) — chunks in parallel ──
    const abChunkResults = await Promise.all(
      chunks.map(chunk => scoreChunk(requesting, chunk))
    )
    const abScores = new Map<string, MatchResult>()
    for (const chunkResult of abChunkResults) {
      for (const match of chunkResult) {
        // Keep highest A→B score if same profile appears in multiple chunks (shouldn't happen, but safe)
        const existing = abScores.get(match.profileId)
        if (!existing || match.score > existing.score) {
          abScores.set(match.profileId, match)
        }
      }
    }

    // ── Step 4: B→A scoring (candidate's perspective) — parallel ─────────
    // Only score candidates that passed the A→B threshold — no point doing
    // reverse scoring for profiles Claude already considered weak.
    const abPassers = filtered.filter(c => {
      const ab = abScores.get(c.profileId)
      return ab && ab.score >= SCORE_THRESHOLD
    })

    // For each B→A call, we ask: "if this candidate were requesting, how well
    // does the requester score as their match?" We use a single-candidate chunk.
    // To avoid N individual API calls, we group candidates into reverse chunks
    // using the requester as a single candidate.
    const requesterAsCandidate: CandidateProfile = {
      profileId: requesting.profileId,
      firstName: requesting.firstName,
      lastName: requesting.lastName,
      professionCategory: requesting.professionCategory,
      professionRole: requesting.professionRole,
      experienceBand: requesting.experienceBand,
      secondaryProfessionRole: requesting.secondaryProfessionRole,
      secondaryExperienceBand: requesting.secondaryExperienceBand,
      offerLabels: requesting.offerLabels,
      seekingNeedLabels: requesting.seekingNeedLabels,
      seekingRelationshipPrimary: requesting.seekingRelationshipPrimary,
      seekingRelationshipSecondary: requesting.seekingRelationshipSecondary,
      seekingGoal: requesting.seekingGoal,
    }

    // Run B→A: each candidate as requester, with only the original requester as the candidate pool
    const baScores = new Map<string, number>()
    if (abPassers.length > 0) {
      const baResults = await Promise.all(
        abPassers.map(async candidate => {
          const results = await scoreChunk(asRequesting(candidate), [requesterAsCandidate])
          const score = results.find(r => r.profileId === requesting.profileId)?.score ?? 0
          return { profileId: candidate.profileId, score }
        })
      )
      for (const { profileId, score } of baResults) {
        baScores.set(profileId, score)
      }
    }

    // ── Step 5: Merge, threshold, sort ────────────────────────────────────
    const merged: MatchResult[] = []
    const seen = new Set<string>()

    for (const [profileId, abMatch] of abScores) {
      if (seen.has(profileId)) continue
      seen.add(profileId)

      const baScore = baScores.get(profileId)
      const combinedScore = baScore !== undefined
        ? Math.round((abMatch.score + baScore) / 2)
        : abMatch.score

      merged.push({
        ...abMatch,
        score: combinedScore,
      })
    }

    const above = merged
      .filter(m => m.score >= SCORE_THRESHOLD)
      .sort((a, b) => b.score - a.score)

    return {
      success: true,
      matches: above,
      stats: {
        totalCandidates: candidates.length,
        afterPreFilter: filtered.length,
        eliminated,
        chunks: chunks.length,
        aboveThreshold: above.length,
      },
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

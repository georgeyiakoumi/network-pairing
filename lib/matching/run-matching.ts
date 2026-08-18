/**
 * run-matching.ts
 *
 * The single source of truth for AI matching.
 * Called by:
 *   - app/api/match/route.ts  (user-facing)
 *   - app/api/admin/match-test/route.ts  (admin testing page, GEO-841)
 *
 * Never duplicate this logic. Both routes import from here.
 */

import Anthropic from '@anthropic-ai/sdk'
import {
  MATCHING_SYSTEM_PROMPT,
  buildMatchingUserMessage,
  type CandidateProfile,
  type RequestingProfile,
  type MatchResult,
} from './matching-prompt'

export type RunMatchingResult =
  | { success: true; matches: MatchResult[] }
  | { success: false; error: string }

/**
 * Runs the AI matching engine for a given requesting user against a pool of candidates.
 * Returns matches sorted by score descending.
 *
 * @param requesting - The profile of the user requesting matches
 * @param candidates - All candidate profiles to rank (max 30 used per call)
 */
export async function runMatching(
  requesting: RequestingProfile,
  candidates: CandidateProfile[],
): Promise<RunMatchingResult> {
  if (candidates.length === 0) {
    return { success: true, matches: [] }
  }

  const client = new Anthropic()
  const userMessage = buildMatchingUserMessage(requesting, candidates)

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 16000,
      system: MATCHING_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const textBlock = response.content.find(b => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return { success: false, error: 'No text response from model' }
    }

    // Strip markdown code fences if the model wraps output despite instructions
    const cleaned = textBlock.text.trim().replace(/^```(?:json)?\r?\n?/i, '').replace(/\r?\n?```\s*$/, '').trim()

    let raw: unknown
    try {
      raw = JSON.parse(cleaned)
    } catch {
      return { success: false, error: `Failed to parse model response as JSON: ${textBlock.text.slice(0, 200)}` }
    }

    if (!Array.isArray(raw)) {
      return { success: false, error: 'Model response was not a JSON array' }
    }

    // Validate and filter — only allow profileIds that were in the candidate list
    const validIds = new Set(candidates.map(c => c.profileId))
    const matches: MatchResult[] = []

    for (const item of raw) {
      if (
        typeof item !== 'object' || item === null ||
        typeof item.profileId !== 'string' ||
        typeof item.score !== 'number' ||
        typeof item.reason !== 'string'
      ) continue

      if (!validIds.has(item.profileId)) continue  // hallucinated ID — discard

      // Parse breakdown if present and well-formed
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

      matches.push({
        profileId: item.profileId,
        score: Math.max(0, Math.min(100, Math.round(item.score))),
        reason: item.reason.slice(0, 200),
        breakdown,
      })
    }

    // Deduplicate (model occasionally returns same profileId twice) and sort
    const seen = new Set<string>()
    const deduped = matches.filter(m => {
      if (seen.has(m.profileId)) return false
      seen.add(m.profileId)
      return true
    })
    deduped.sort((a, b) => b.score - a.score)

    return { success: true, matches: deduped }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    }
  }
}

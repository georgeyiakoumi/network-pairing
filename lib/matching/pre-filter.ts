/**
 * pre-filter.ts
 *
 * Deterministic candidate pre-filter. Runs before any AI call.
 * Eliminates structurally incompatible candidates based on hard rules
 * so Claude only sees profiles worth scoring.
 *
 * Rules applied (all must pass):
 *   1. Offer ↔ need overlap — at least one item must match on either side
 *   2. Experience band compatibility — based on relationship type sought
 *   3. Relationship type plausibility — candidate experience/offers must
 *      plausibly support what the requester is seeking
 */

import type { CandidateProfile, RequestingProfile } from './matching-prompt'

// Offer labels that map to mentorship capability
const MENTOR_OFFER_SIGNALS = new Set([
  'Mentorship',
  'Career advice',
  'Business strategy advice',
  'Feedback on my work',
  'Accountability partner',
])

// Offer labels that map to investment/funding capability
const INVESTOR_OFFER_SIGNALS = new Set([
  'Investment / funding access',
])


/**
 * Returns true if the candidate passes all pre-filter rules and should
 * be sent to the AI for scoring.
 */
export function passesPreFilter(
  requesting: RequestingProfile,
  candidate: CandidateProfile,
): boolean {
  const primaryRel = requesting.seekingRelationshipPrimary.toLowerCase()
  const allRels = [primaryRel, ...(requesting.seekingRelationshipSecondary ?? []).map(r => r.toLowerCase())]

  // ── Rule 1: Offer ↔ need overlap ─────────────────────────────────────────
  // At least one of the candidate's offers must appear in the requester's
  // seeking needs, OR at least one of the requester's offers must appear in
  // the candidate's seeking needs.
  const candidateOfferSet = new Set(candidate.offerLabels)
  const requestingOfferSet = new Set(requesting.offerLabels)
  const candidateNeedSet = new Set(candidate.seekingNeedLabels)
  const requestingNeedSet = new Set(requesting.seekingNeedLabels)

  const candidateOffersWhatRequesterNeeds = requesting.seekingNeedLabels.some(n => candidateOfferSet.has(n))
  const requesterOffersWhatCandidateNeeds = candidate.seekingNeedLabels.some(n => requestingOfferSet.has(n))

  // Need overlap on at least one side — no bilateral zero overlap
  if (!candidateOffersWhatRequesterNeeds && !requesterOffersWhatCandidateNeeds) {
    // Allow through if either side has zero offers/needs defined (incomplete profile edge case)
    if (candidateOfferSet.size > 0 && requestingNeedSet.size > 0 &&
        requestingOfferSet.size > 0 && candidateNeedSet.size > 0) {
      return false
    }
  }

  // ── Rule 2: Experience band compatibility ─────────────────────────────────
  const reqBand = requesting.experienceBand
  const candBand = candidate.experienceBand

  const seekingMentor = allRels.some(r => r.includes('mentor') && !r.includes('mentee'))
  const seekingMentee = allRels.some(r => r.includes('mentee'))
  const seekingCofounder = allRels.some(r => r.includes('co-founder') || r.includes('cofounder'))
  const seekingInvestor = allRels.some(r => r.includes('investor') || r.includes('invest'))
  const seekingAdvisor = allRels.some(r => r.includes('advisor') || r.includes('adviser'))
  const seekingPeer = allRels.some(r => r.includes('peer') || r.includes('network') || r.includes('collaborat'))

  if (seekingMentor) {
    // Need someone more senior — candidate should be at least 2 bands above requester
    // or at minimum band 3. Exception: if requester is already band 4–5 seeking a peer-mentor.
    if (reqBand <= 3 && candBand < 3) return false
    if (reqBand <= 2 && candBand < 4) return false
  }

  if (seekingMentee) {
    // Requester wants to mentor someone — candidate should be less experienced
    if (candBand >= reqBand) return false
    if (reqBand < 3) return false  // band 1–2 can't really mentor
  }

  if (seekingInvestor) {
    // Investors are band 4–5 with investment offer signals
    const hasInvestorOffer = candidate.offerLabels.some(o => INVESTOR_OFFER_SIGNALS.has(o))
    if (candBand < 4 && !hasInvestorOffer) return false
  }

  if (seekingAdvisor) {
    // Advisors are band 3+
    if (candBand < 3) return false
  }

  if (seekingCofounder) {
    // Co-founders should be within 2 bands of each other
    if (Math.abs(reqBand - candBand) > 2) return false
  }

  if (seekingPeer && !seekingMentor && !seekingMentee && !seekingInvestor && !seekingAdvisor && !seekingCofounder) {
    // Pure peer matching — within 2 bands
    if (Math.abs(reqBand - candBand) > 2) return false
  }

  // ── Rule 3: Mentor/mentee plausibility ────────────────────────────────────
  // If requester is seeking a mentor, the candidate should plausibly be able
  // to mentor — either they have mentor offer signals or they're senior enough.
  if (seekingMentor) {
    const hasMentorOffer = candidate.offerLabels.some(o => MENTOR_OFFER_SIGNALS.has(o))
    const isSeniorEnough = candBand >= 4
    if (!hasMentorOffer && !isSeniorEnough) return false
  }

  return true
}

/**
 * Filters a candidate list down to those worth sending to the AI.
 * Returns { filtered, eliminated } for logging.
 */
export function preFilterCandidates(
  requesting: RequestingProfile,
  candidates: CandidateProfile[],
): { filtered: CandidateProfile[]; eliminated: number } {
  const filtered = candidates.filter(c => passesPreFilter(requesting, c))
  return { filtered, eliminated: candidates.length - filtered.length }
}

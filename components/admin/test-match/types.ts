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

export type MatchResult = {
  profileId: string
  score: number
  reason: string
  breakdown: {
    summary: string
    alignments: { yourNeed: string; theirOffer: string; explanation: string }[]
    gaps: { reason: string; explanation: string }[]
  } | null
}

export type MatchStats = {
  totalCandidates: number
  afterPreFilter: number
  eliminated: number
  chunks: number
  aboveThreshold: number
}

export type StreamEvent =
  | { type: 'log'; text: string }
  | { type: 'result'; matches: MatchResult[]; requesting: { firstName: string; lastName: string; professionRole: string }; stats: MatchStats }
  | { type: 'error'; error: string }

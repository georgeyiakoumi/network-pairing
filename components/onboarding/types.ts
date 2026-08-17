export type Profession = { id: string; category: string; role: string }
export type Option = { id: string; label: string }

export const STEPS = ['About you', 'Profession', 'What you offer', 'What you need', 'Review']

export const RELATIONSHIP_TYPES: Option[] = [
  { id: 'mentor', label: 'Mentors' },
  { id: 'co-founder', label: 'Co-founders' },
  { id: 'advisor', label: 'Advisors' },
  { id: 'accountability-partner', label: 'Accountability partners' },
  { id: 'investor', label: 'Investors' },
  { id: 'connector', label: 'Connectors' },
]

export const GOALS: Option[] = [
  { id: 'starting-a-business', label: 'Starting a business' },
  { id: 'growing-a-business', label: 'Growing a business' },
  { id: 'changing-careers', label: 'Changing careers' },
  { id: 'improving-my-craft', label: 'Improving my craft' },
  { id: 'building-a-team', label: 'Building a team' },
  { id: 'raising-investment', label: 'Raising investment' },
]

export const SEEKING_NEEDS_OPTIONS: Option[] = [
  { id: 'Career guidance', label: 'Career guidance' },
  { id: 'Industry introductions', label: 'Industry introductions' },
  { id: 'Technical coaching', label: 'Technical coaching' },
  { id: 'Business strategy', label: 'Business strategy' },
  { id: 'Hiring advice', label: 'Hiring advice' },
  { id: 'Funding access', label: 'Funding access' },
  { id: 'Feedback on work', label: 'Feedback on work' },
]

export const BAND_LABELS: Record<number, string> = {
  1: 'Graduate',
  2: 'Early career',
  3: 'Mid-level',
  4: 'Senior',
  5: 'Expert',
}

export function formatYears(years: number): string {
  if (years === 0) return '< 1 year'
  if (years === 1) return '1 year'
  if (years >= 15) return '15+ years'
  return `${years} years`
}

export function buildOfferLabelOverrides(
  offers: Option[],
  professions: Profession[],
  primaryId: string,
  secondaryId: string,
): Record<string, string> {
  const technicalOffer = offers.find(o => o.label.toLowerCase().includes('technical skills'))
  if (!technicalOffer) return {}
  const primary = professions.find(p => p.id === primaryId)
  const secondary = professions.find(p => p.id === secondaryId)
  const professionLabel = primary
    ? secondary ? `${primary.role} / ${secondary.role}` : primary.role
    : null
  if (!professionLabel) return {}
  return { [technicalOffer.id]: `Technical skills (${professionLabel})` }
}

'use client'

import { Pencil } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { BAND_LABELS, RELATIONSHIP_TYPES, GOALS, formatYears } from './types'
import { yearsToBand } from '@/components/experience-slider'
import type { Option, Profession } from './types'

interface StepReviewProps {
  // identity
  firstName: string
  lastName: string
  graduationYear: string
  locationId: string
  locations: Option[]
  // profession
  professions: Profession[]
  primaryProfessionId: string
  primaryYears: number
  secondaryProfessionId: string
  secondaryYears: number
  // offers
  selectedOffers: Option[]
  // seeking
  seekingRelationshipPrimary: string
  seekingRelationshipSecondary: string[]
  seekingProfessionId: string
  seekingSpecificNeeds: Option[]
  seekingGoal: string
  // nav
  onEditStep: (step: number) => void
}

function buildSeekingSummary({
  seekingRelationshipPrimary,
  seekingRelationshipSecondary,
  seekingProfessionId,
  seekingSpecificNeeds,
  seekingGoal,
  professions,
}: Pick<StepReviewProps, 'seekingRelationshipPrimary' | 'seekingRelationshipSecondary' | 'seekingProfessionId' | 'seekingSpecificNeeds' | 'seekingGoal' | 'professions'>) {
  const primaryLabel = RELATIONSHIP_TYPES.find(r => r.id === seekingRelationshipPrimary)?.label
  const secondaryLabels = RELATIONSHIP_TYPES.filter(r => seekingRelationshipSecondary.includes(r.id)).map(r => r.label)
  const professionLabel = professions.find(p => p.id === seekingProfessionId)?.role
  const goalLabel = GOALS.find(g => g.id === seekingGoal)?.label

  const parts: string[] = []

  if (goalLabel) {
    parts.push(`You're working towards ${goalLabel.toLowerCase()}.`)
  }

  if (primaryLabel) {
    let who = `You mostly want to meet ${primaryLabel.toLowerCase()}`
    if (secondaryLabels.length > 0) {
      who += ` and are open to meeting ${secondaryLabels.map(l => l.toLowerCase()).join(' or ')}`
    }
    if (professionLabel) {
      who += `, with experience as a ${professionLabel.toLowerCase()}`
    }
    parts.push(who + '.')
  }

  if (seekingSpecificNeeds.length > 0) {
    const needLabels = seekingSpecificNeeds.map(n => n.label.toLowerCase())
    const needStr = needLabels.length === 1
      ? needLabels[0]
      : needLabels.slice(0, -1).join(', ') + ' and ' + needLabels[needLabels.length - 1]
    parts.push(`Someone strong in ${needStr}.`)
  }

  return parts.join(' ')
}

export function StepReview({
  firstName,
  lastName,
  graduationYear,
  locationId,
  locations,
  professions,
  primaryProfessionId,
  primaryYears,
  secondaryProfessionId,
  secondaryYears,
  selectedOffers,
  seekingRelationshipPrimary,
  seekingRelationshipSecondary,
  seekingProfessionId,
  seekingSpecificNeeds,
  seekingGoal,
  onEditStep,
}: StepReviewProps) {
  const locationLabel = locations.find(l => l.id === locationId)?.label
  const seekingSummary = buildSeekingSummary({
    seekingRelationshipPrimary,
    seekingRelationshipSecondary,
    seekingProfessionId,
    seekingSpecificNeeds,
    seekingGoal,
    professions,
  })

  return (
    <div className="flex flex-col">

      {/* identity */}
      <div className="group/identity flex items-start justify-between gap-3 rounded-lg px-3 py-2.5 -mx-3 transition-colors hover:bg-muted/40">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-xl font-semibold tracking-tight">{firstName} {lastName}</h2>
          <span className="text-sm text-muted-foreground">
            Class of {graduationYear}
            {locationLabel && ` · ${locationLabel}`}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onEditStep(0)}
          className="opacity-0 group-hover/identity:opacity-100 text-muted-foreground hover:text-foreground mt-0.5 shrink-0 transition-opacity"
        >
          <Pencil className="size-3.5" />
        </button>
      </div>

      {/* seeking summary */}
      <div className="group/seeking flex items-start justify-between gap-3 rounded-lg px-3 py-2.5 -mx-3 transition-colors hover:bg-muted/40">
        <p className="text-sm leading-relaxed text-muted-foreground">{seekingSummary}</p>
        <button
          type="button"
          onClick={() => onEditStep(3)}
          className="opacity-0 group-hover/seeking:opacity-100 text-muted-foreground hover:text-foreground mt-0.5 shrink-0 transition-opacity"
        >
          <Pencil className="size-3.5" />
        </button>
      </div>

      <Separator className="my-2" />

      {/* profession */}
      <div className="group/profession flex items-start justify-between gap-3 rounded-lg px-3 py-2.5 -mx-3 transition-colors hover:bg-muted/40">
        <div className="flex flex-col gap-1.5 flex-1">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Profession</span>
          <ul className="flex flex-col gap-0.5">
            <li className="flex items-baseline gap-2 text-sm">
              <span className="text-muted-foreground shrink-0">·</span>
              <span>
                {professions.find(p => p.id === primaryProfessionId)?.role}
                <span className="text-muted-foreground">
                  {' · '}{formatYears(primaryYears)} ({BAND_LABELS[yearsToBand(primaryYears)]})
                </span>
              </span>
            </li>
            {secondaryProfessionId && (
              <li className="flex items-baseline gap-2 text-sm">
                <span className="text-muted-foreground shrink-0">·</span>
                <span>
                  {professions.find(p => p.id === secondaryProfessionId)?.role}
                  <span className="text-muted-foreground">
                    {' · '}{formatYears(secondaryYears)} ({BAND_LABELS[yearsToBand(secondaryYears)]})
                  </span>
                </span>
              </li>
            )}
          </ul>
        </div>
        <button
          type="button"
          onClick={() => onEditStep(1)}
          className="opacity-0 group-hover/profession:opacity-100 text-muted-foreground hover:text-foreground mt-0.5 shrink-0 transition-opacity"
        >
          <Pencil className="size-3.5" />
        </button>
      </div>

      {/* skills */}
      <div className="group/skills flex items-start justify-between gap-3 rounded-lg px-3 py-2.5 -mx-3 transition-colors hover:bg-muted/40">
        <div className="flex flex-col gap-1.5 flex-1">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Skills</span>
          <ul className="flex flex-col gap-0.5">
            {selectedOffers.map(o => (
              <li key={o.id} className="flex items-baseline gap-2 text-sm">
                <span className="text-muted-foreground shrink-0">·</span>
                <span>{o.label}</span>
              </li>
            ))}
          </ul>
        </div>
        <button
          type="button"
          onClick={() => onEditStep(2)}
          className="opacity-0 group-hover/skills:opacity-100 text-muted-foreground hover:text-foreground mt-0.5 shrink-0 transition-opacity"
        >
          <Pencil className="size-3.5" />
        </button>
      </div>

    </div>
  )
}

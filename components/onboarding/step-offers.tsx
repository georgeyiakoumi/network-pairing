'use client'

import { MultiSelectCombobox } from '@/components/multi-select-combobox'
import { OnboardingStep } from './onboarding-step'
import { buildOfferLabelOverrides } from './types'
import type { Option, Profession } from './types'

interface StepOffersProps {
  offers: Option[]
  professions: Profession[]
  selectedOffers: Option[]
  primaryProfessionId: string
  secondaryProfessionId: string
  action?: React.ReactNode
  onSelectedOffersChange: (offers: Option[]) => void
}

export function StepOffers({
  offers,
  professions,
  selectedOffers,
  primaryProfessionId,
  secondaryProfessionId,
  action,
  onSelectedOffersChange,
}: StepOffersProps) {
  return (
    <OnboardingStep title="What do you offer?" action={action}>
      <MultiSelectCombobox
        options={offers}
        value={selectedOffers}
        onValueChange={onSelectedOffersChange}
        placeholder="Select up to 3…"
        max={3}
        labelOverrides={buildOfferLabelOverrides(offers, professions, primaryProfessionId, secondaryProfessionId)}
      />
    </OnboardingStep>
  )
}

'use client'

import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { OnboardingStep } from './onboarding-step'
import { ProfessionCombobox } from '@/components/profession-combobox'
import { ExperienceSlider } from '@/components/experience-slider'
import { Plus } from 'lucide-react'
import type { Profession } from './types'

interface StepProfessionProps {
  professions: Profession[]
  primaryProfessionId: string
  primaryYears: number
  secondaryProfessionId: string
  secondaryYears: number
  showSecondary: boolean
  onPrimaryProfessionChange: (id: string) => void
  onPrimaryYearsChange: (years: number) => void
  onSecondaryProfessionChange: (id: string) => void
  onSecondaryYearsChange: (years: number) => void
  onShowSecondaryChange: (show: boolean) => void
}

export function StepProfession({
  professions,
  primaryProfessionId,
  primaryYears,
  secondaryProfessionId,
  secondaryYears,
  showSecondary,
  onPrimaryProfessionChange,
  onPrimaryYearsChange,
  onSecondaryProfessionChange,
  onSecondaryYearsChange,
  onShowSecondaryChange,
}: StepProfessionProps) {
  return (
    <OnboardingStep title="What do you do?">
        <div className="flex flex-col gap-1.5">
          <ProfessionCombobox
            professions={professions}
            value={primaryProfessionId}
            onValueChange={onPrimaryProfessionChange}
            excludeId={secondaryProfessionId}
            excludeLabel="Secondary"
          />
        </div>

        {primaryProfessionId && (
          <ExperienceSlider
            label="Experience"
            years={primaryYears}
            onYearsChange={onPrimaryYearsChange}
          />
        )}

        {primaryProfessionId && (
          !secondaryProfessionId && !showSecondary ? (
            <button
              type="button"
              onClick={() => onShowSecondaryChange(true)}
              className="flex items-center gap-2 w-full rounded-md border border-dashed border-border px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              <Plus className="size-4 shrink-0" />
              <span>Add secondary profession</span>
              <Badge variant="secondary" className="ml-auto text-xs">Optional</Badge>
            </button>
          ) : (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label>Secondary profession</Label>
                <button
                  type="button"
                  className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                  onClick={() => {
                    onSecondaryProfessionChange('')
                    onSecondaryYearsChange(0)
                    onShowSecondaryChange(false)
                  }}
                >
                  Remove
                </button>
              </div>
              <ProfessionCombobox
                professions={professions}
                value={secondaryProfessionId}
                onValueChange={onSecondaryProfessionChange}
                placeholder="Select profession"
                excludeId={primaryProfessionId}
                excludeLabel="Primary"
                autoOpen={showSecondary && !secondaryProfessionId}
                onDismissEmpty={() => onShowSecondaryChange(false)}
              />
            </div>
          )
        )}

        {secondaryProfessionId && (
          <ExperienceSlider
            label="Experience"
            years={secondaryYears}
            onYearsChange={onSecondaryYearsChange}
          />
        )}
    </OnboardingStep>
  )
}

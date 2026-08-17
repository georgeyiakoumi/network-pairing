'use client'

import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Label } from '@/components/ui/label'
import { OnboardingStep } from './onboarding-step'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ProfessionCombobox } from '@/components/profession-combobox'
import { MultiSelectCombobox } from '@/components/multi-select-combobox'
import { RelationshipTypeSelector } from '@/components/ui/relationship-type-selector'
import { RELATIONSHIP_TYPES, GOALS, SEEKING_NEEDS_OPTIONS } from './types'
import type { Option, Profession } from './types'

interface StepSeekingProps {
  professions: Profession[]
  relationshipPrimary: string
  relationshipSecondary: string[]
  professionId: string
  specificNeeds: Option[]
  goal: string
  error: string | null
  action?: React.ReactNode
  onRelationshipPrimaryChange: (id: string) => void
  onRelationshipSecondaryChange: (ids: string[]) => void
  onProfessionIdChange: (id: string) => void
  onSpecificNeedsChange: (needs: Option[]) => void
  onGoalChange: (id: string) => void
}

export function StepSeeking({
  professions,
  relationshipPrimary,
  relationshipSecondary,
  professionId,
  specificNeeds,
  goal,
  error,
  action,
  onRelationshipPrimaryChange,
  onRelationshipSecondaryChange,
  onProfessionIdChange,
  onSpecificNeedsChange,
  onGoalChange,
}: StepSeekingProps) {
  return (
    <OnboardingStep title="Who are you looking for?" action={action}>

        <RelationshipTypeSelector
          types={RELATIONSHIP_TYPES}
          primary={relationshipPrimary}
          secondary={relationshipSecondary}
          onPrimaryChange={onRelationshipPrimaryChange}
          onSecondaryChange={onRelationshipSecondaryChange}
        />

        <FieldGroup>
          <Field>
            <FieldLabel>
              What profession or expertise?{' '}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </FieldLabel>
            <ProfessionCombobox
              professions={professions}
              value={professionId}
              onValueChange={onProfessionIdChange}
              placeholder="Any profession"
            />
            {professionId && (
              <button
                type="button"
                onClick={() => onProfessionIdChange('')}
                className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground self-start"
              >
                Clear
              </button>
            )}
          </Field>
        </FieldGroup>

        <FieldGroup>
          <Field>
            <FieldLabel>What specifically do you need?</FieldLabel>
            <MultiSelectCombobox
              options={SEEKING_NEEDS_OPTIONS}
              value={specificNeeds}
              onValueChange={onSpecificNeedsChange}
              placeholder="Select up to 3…"
              max={3}
            />
          </Field>
        </FieldGroup>

        <div className="flex flex-col gap-2">
          <Label>
            What are you working toward?{' '}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Select value={goal} onValueChange={v => onGoalChange(v ?? '')}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select…">
                {GOALS.find(g => g.id === goal)?.label}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {GOALS.map(g => <SelectItem key={g.id} value={g.id}>{g.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
    </OnboardingStep>
  )
}

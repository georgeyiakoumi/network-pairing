'use client'

import { useState } from 'react'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Label } from '@/components/ui/label'
import { MessageCircle } from 'lucide-react'
import { OnboardingStep } from './onboarding-step'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ProfessionCombobox } from '@/components/profession-combobox'
import { MultiSelectCombobox } from '@/components/multi-select-combobox'
import { RelationshipTypeSelector } from '@/components/ui/relationship-type-selector'
import { SeekingAssistantSheet } from './seeking-assistant-sheet'
import { RELATIONSHIP_TYPES, GOALS, SEEKING_NEEDS_OPTIONS } from './types'
import type { Option, Profession } from './types'
import type { SeekingData } from '@/app/api/intake/seeking/route'

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
  const [sheetOpen, setSheetOpen] = useState(false)

  function handleApply(data: SeekingData) {
    onRelationshipPrimaryChange(data.seekingRelationshipPrimary)
    onRelationshipSecondaryChange(data.seekingRelationshipSecondary)
    if (data.seekingProfessionId) onProfessionIdChange(data.seekingProfessionId)
    const resolvedNeeds = SEEKING_NEEDS_OPTIONS.filter(n =>
      data.seekingSpecificNeedIds.includes(n.id)
    )
    onSpecificNeedsChange(resolvedNeeds)
    if (data.seekingGoal) onGoalChange(data.seekingGoal)
  }

  const aiLink = (
    <button
      type="button"
      onClick={() => setSheetOpen(true)}
      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
    >
      <MessageCircle className="size-3.5" />
      Not sure who you need? Let AI help
    </button>
  )

  return (
    <>
      <OnboardingStep title="Who are you looking for?" action={action} subtitle={aiLink}>

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

      <SeekingAssistantSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onApply={handleApply}
      />
    </>
  )
}

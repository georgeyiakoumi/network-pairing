'use client'

import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Spinner } from '@/components/ui/spinner'
import { ArrowLeft, ArrowRight, FileCheck } from 'lucide-react'

interface OnboardingNavProps {
  step: number
  totalSteps: number
  canAdvance: boolean
  hasReachedReview: boolean
  loading: boolean
  onBack: () => void
  onContinue: () => void
  onJumpToReview: () => void
  onSubmit: () => void
}

export function OnboardingNav({
  step,
  totalSteps,
  canAdvance,
  hasReachedReview,
  loading,
  onBack,
  onContinue,
  onJumpToReview,
  onSubmit,
}: OnboardingNavProps) {
  const isLastStep = step >= totalSteps - 1

  return (
    <div className="shrink-0 p-4">
      <div className="w-full max-w-sm mx-auto flex gap-3">
        {step > 0 && (
          <Button variant="outline" className="flex-1" onClick={onBack}>
            <ArrowLeft data-icon="inline-start" />
            Back
          </Button>
        )}
        {!isLastStep ? (
          hasReachedReview ? (
            <ButtonGroup className="flex-1">
              <Button className="flex-1" disabled={!canAdvance} onClick={onContinue}>
                Continue
                <ArrowRight data-icon="inline-end" />
              </Button>
              <Button onClick={onJumpToReview} aria-label="Back to review">
                <FileCheck />
              </Button>
            </ButtonGroup>
          ) : (
            <Button className="flex-1" disabled={!canAdvance} onClick={onContinue}>
              Continue
              <ArrowRight data-icon="inline-end" />
            </Button>
          )
        ) : (
          <Button className="flex-1" disabled={loading} onClick={onSubmit}>
            {loading ? <><Spinner data-icon="inline-start" /> Creating your profile…</> : 'Create profile'}
          </Button>
        )}
      </div>
    </div>
  )
}

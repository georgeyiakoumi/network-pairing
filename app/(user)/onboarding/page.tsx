'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { saveProfile } from '@/lib/onboarding/save-profile'
import { ButtonGroup } from '@/components/ui/button-group'
import { ArrowLeft, ArrowRight, FileCheck } from 'lucide-react'
import { yearsToBand } from '@/components/experience-slider'
import { StepAbout } from '@/components/onboarding/step-about'
import { StepProfession } from '@/components/onboarding/step-profession'
import { StepOffers } from '@/components/onboarding/step-offers'
import { StepSeeking } from '@/components/onboarding/step-seeking'
import { StepReview } from '@/components/onboarding/step-review'
import { STEPS } from '@/components/onboarding/types'
import type { Profession, Option, Location } from '@/components/onboarding/types'

export default function DirectOnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasReachedReview, setHasReachedReview] = useState(false)

  // lookup data
  const [professions, setProfessions] = useState<Profession[]>([])
  const [offers, setOffers] = useState<Option[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [lookupsReady, setLookupsReady] = useState(false)

  // step 0 — about you
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [graduationYear, setGraduationYear] = useState('')
  const [locationId, setLocationId] = useState('')

  // step 1 — profession
  const [primaryProfessionId, setPrimaryProfessionId] = useState('')
  const [primaryYears, setPrimaryYears] = useState(0)
  const [secondaryProfessionId, setSecondaryProfessionId] = useState('')
  const [secondaryYears, setSecondaryYears] = useState(0)
  const [showSecondary, setShowSecondary] = useState(false)

  // step 2 — offers
  const [selectedOffers, setSelectedOffers] = useState<Option[]>([])

  // step 3 — seeking
  const [seekingRelationshipPrimary, setSeekingRelationshipPrimary] = useState('')
  const [seekingRelationshipSecondary, setSeekingRelationshipSecondary] = useState<string[]>([])
  const [seekingProfessionId, setSeekingProfessionId] = useState('')
  const [seekingSpecificNeeds, setSeekingSpecificNeeds] = useState<Option[]>([])
  const [seekingGoal, setSeekingGoal] = useState('')

  useEffect(() => {
    async function fetchLookups() {
      const supabase = createClient()
      const [{ data: profs }, { data: ofrs }, { data: locs }] = await Promise.all([
        supabase.from('professions').select('id, category, role').eq('active', true).order('category').order('sort_order'),
        supabase.from('offers').select('id, label').eq('active', true).order('sort_order'),
        supabase.from('locations').select('id, label, category').eq('active', true).order('sort_order'),
      ])
      if (profs) setProfessions(profs)
      if (ofrs) setOffers(ofrs)
      if (locs) setLocations(locs)
      setLookupsReady(true)
    }
    fetchLookups()
  }, [])

  function canAdvance() {
    if (step === 0) return lookupsReady && !!(firstName.trim() && lastName.trim() && graduationYear && locationId)
    if (step === 1) return !!primaryProfessionId
    if (step === 2) return selectedOffers.length > 0
    if (step === 3) return !!seekingRelationshipPrimary && seekingSpecificNeeds.length > 0
    return true
  }

  function handleContinue() {
    const next = step + 1
    if (next === STEPS.length - 1) setHasReachedReview(true)
    setStep(next)
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)

    const result = await saveProfile({
      firstName,
      lastName,
      graduationYear: parseInt(graduationYear),
      locationId,
      primaryProfessionId,
      primaryExperience: yearsToBand(primaryYears) as 1 | 2 | 3 | 4 | 5,
      secondaryProfessionId: secondaryProfessionId || null,
      secondaryExperience: secondaryProfessionId ? yearsToBand(secondaryYears) as 1 | 2 | 3 | 4 | 5 : null,
      offerIds: selectedOffers.map(o => o.id),
      seekingRelationshipPrimary,
      seekingRelationshipSecondary,
      seekingProfessionId: seekingProfessionId || null,
      seekingSpecificNeedIds: seekingSpecificNeeds.map(n => n.id),
      seekingGoal: seekingGoal || null,
    }, 'direct')

    if (!result.success) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.push('/match')
  }

  const FORM_STEPS = STEPS.slice(0, -1) // exclude review
  const dots = (
    <div className="flex items-center gap-1.5">
      {FORM_STEPS.map((_, i) => (
        <div
          key={i}
          className={`size-1.5 rounded-full transition-colors ${i <= step ? 'bg-foreground' : 'bg-muted-foreground/30'}`}
        />
      ))}
    </div>
  )

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4 min-h-screen">
      <div className="w-full max-w-sm flex flex-col gap-6">

        {step === 0 && (
          <StepAbout
            action={dots}
            firstName={firstName}
            lastName={lastName}
            graduationYear={graduationYear}
            locationId={locationId}
            locations={locations}
            lookupsReady={lookupsReady}
            onFirstNameChange={setFirstName}
            onLastNameChange={setLastName}
            onGraduationYearChange={setGraduationYear}
            onLocationIdChange={setLocationId}
          />
        )}

        {step === 1 && (
          <StepProfession
            action={dots}
            professions={professions}
            primaryProfessionId={primaryProfessionId}
            primaryYears={primaryYears}
            secondaryProfessionId={secondaryProfessionId}
            secondaryYears={secondaryYears}
            showSecondary={showSecondary}
            onPrimaryProfessionChange={setPrimaryProfessionId}
            onPrimaryYearsChange={setPrimaryYears}
            onSecondaryProfessionChange={setSecondaryProfessionId}
            onSecondaryYearsChange={setSecondaryYears}
            onShowSecondaryChange={setShowSecondary}
          />
        )}

        {step === 2 && (
          <StepOffers
            action={dots}
            offers={offers}
            professions={professions}
            selectedOffers={selectedOffers}
            primaryProfessionId={primaryProfessionId}
            secondaryProfessionId={secondaryProfessionId}
            onSelectedOffersChange={setSelectedOffers}
          />
        )}

        {step === 3 && (
          <StepSeeking
            action={dots}
            professions={professions}
            relationshipPrimary={seekingRelationshipPrimary}
            relationshipSecondary={seekingRelationshipSecondary}
            professionId={seekingProfessionId}
            specificNeeds={seekingSpecificNeeds}
            goal={seekingGoal}
            error={error}
            onRelationshipPrimaryChange={setSeekingRelationshipPrimary}
            onRelationshipSecondaryChange={setSeekingRelationshipSecondary}
            onProfessionIdChange={setSeekingProfessionId}
            onSpecificNeedsChange={setSeekingSpecificNeeds}
            onGoalChange={setSeekingGoal}
          />
        )}

        {step === 4 && (
          <StepReview
            firstName={firstName}
            lastName={lastName}
            graduationYear={graduationYear}
            locationId={locationId}
            locations={locations}
            professions={professions}
            primaryProfessionId={primaryProfessionId}
            primaryYears={primaryYears}
            secondaryProfessionId={secondaryProfessionId}
            secondaryYears={secondaryYears}
            selectedOffers={selectedOffers}
            seekingRelationshipPrimary={seekingRelationshipPrimary}
            seekingRelationshipSecondary={seekingRelationshipSecondary}
            seekingProfessionId={seekingProfessionId}
            seekingSpecificNeeds={seekingSpecificNeeds}
            seekingGoal={seekingGoal}
            onEditStep={setStep}
          />
        )}

        {/* nav */}
        <div className="flex gap-3">
          {step > 0 && (
            <Button variant="outline" className="flex-1" onClick={() => setStep(s => s - 1)}>
              <ArrowLeft data-icon="inline-start" />
              Back
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            hasReachedReview ? (
              <ButtonGroup className="flex-1">
                <Button className="flex-1" disabled={!canAdvance()} onClick={() => setStep(s => s + 1)}>
                  Continue
                  <ArrowRight data-icon="inline-end" />
                </Button>
                <Button onClick={() => setStep(STEPS.length - 1)} aria-label="Back to review">
                  <FileCheck />
                </Button>
              </ButtonGroup>
            ) : (
              <Button className="flex-1" disabled={!canAdvance()} onClick={handleContinue}>
                Continue
                <ArrowRight data-icon="inline-end" />
              </Button>
            )
          ) : (
            <Button className="flex-1" disabled={loading} onClick={handleSubmit}>
              {loading ? 'Saving…' : 'Create profile'}
            </Button>
          )}
        </div>

      </div>
    </div>
  )
}

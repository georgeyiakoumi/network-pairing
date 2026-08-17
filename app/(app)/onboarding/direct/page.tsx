'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { yearsToBand } from '@/components/experience-slider'
import { StepAbout } from '@/components/onboarding/step-about'
import { StepProfession } from '@/components/onboarding/step-profession'
import { StepOffers } from '@/components/onboarding/step-offers'
import { StepSeeking } from '@/components/onboarding/step-seeking'
import { StepReview } from '@/components/onboarding/step-review'
import { STEPS } from '@/components/onboarding/types'
import type { Profession, Option } from '@/components/onboarding/types'

export default function DirectOnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasReachedReview, setHasReachedReview] = useState(false)

  // lookup data
  const [professions, setProfessions] = useState<Profession[]>([])
  const [offers, setOffers] = useState<Option[]>([])
  const [locations, setLocations] = useState<Option[]>([])

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
        supabase.from('locations').select('id, label').eq('active', true).order('sort_order'),
      ])
      if (profs) setProfessions(profs)
      if (ofrs) setOffers(ofrs)
      if (locs) setLocations(locs)
    }
    fetchLookups()
  }, [])

  function canAdvance() {
    if (step === 0) return !!(firstName.trim() && lastName.trim() && graduationYear && locationId)
    if (step === 1) return !!primaryProfessionId
    if (step === 2) return selectedOffers.length > 0
    if (step === 3) return !!seekingRelationshipPrimary && seekingSpecificNeeds.length > 0
    return true
  }

  function handleContinue() {
    if (hasReachedReview) {
      setStep(STEPS.length - 1)
    } else {
      const next = step + 1
      if (next === STEPS.length - 1) setHasReachedReview(true)
      setStep(next)
    }
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: user.id,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        graduation_year: parseInt(graduationYear),
        location_id: locationId || null,
        primary_profession_id: primaryProfessionId,
        primary_experience: yearsToBand(primaryYears),
        secondary_profession_id: secondaryProfessionId || null,
        secondary_experience: secondaryProfessionId ? yearsToBand(secondaryYears) : null,
        seeking_relationship_primary: seekingRelationshipPrimary || null,
        seeking_relationship_secondary: seekingRelationshipSecondary.length > 0 ? seekingRelationshipSecondary : null,
        seeking_profession_id: seekingProfessionId || null,
        seeking_goal: seekingGoal || null,
        intake_method: 'direct',
      })
      .select('id')
      .single()

    if (profileError || !profile) {
      setError('Something went wrong saving your profile. Please try again.')
      setLoading(false)
      return
    }

    await Promise.all([
      selectedOffers.length > 0
        ? supabase.from('profile_offers').insert(selectedOffers.map(o => ({ profile_id: profile.id, offer_id: o.id })))
        : Promise.resolve(),
      seekingSpecificNeeds.length > 0
        ? supabase.from('profile_seeking_needs').insert(seekingSpecificNeeds.map(n => ({ profile_id: profile.id, label: n.id })))
        : Promise.resolve(),
    ])

    router.push('/match')
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4 min-h-screen">
      <div className="w-full max-w-sm flex flex-col gap-6">

        {/* progress */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{STEPS[step]}</span>
            <span>{step + 1} of {STEPS.length}</span>
          </div>
          <Progress value={((step + 1) / STEPS.length) * 100} className="h-1.5" />
        </div>

        {step === 0 && (
          <StepAbout
            firstName={firstName}
            lastName={lastName}
            graduationYear={graduationYear}
            locationId={locationId}
            locations={locations}
            onFirstNameChange={setFirstName}
            onLastNameChange={setLastName}
            onGraduationYearChange={setGraduationYear}
            onLocationIdChange={setLocationId}
          />
        )}

        {step === 1 && (
          <StepProfession
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
            onEditStep={step => { setStep(step) }}
          />
        )}

        {/* nav */}
        <div className="flex gap-3">
          {step > 0 && (
            <Button variant="outline" className="flex-1" onClick={() => setStep(s => s - 1)}>
              Back
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button className="flex-1" disabled={!canAdvance()} onClick={handleContinue}>
              {hasReachedReview ? 'Back to review' : 'Continue'}
            </Button>
          ) : (
            <Button className="flex-1" disabled={loading} onClick={handleSubmit}>
              {loading ? 'Saving…' : 'Create my profile'}
            </Button>
          )}
        </div>

      </div>
    </div>
  )
}

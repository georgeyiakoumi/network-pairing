'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { saveProfile } from '@/lib/onboarding/save-profile'
import { yearsToBand } from '@/components/experience-slider'
import { StepDots } from '@/components/onboarding/onboarding-dots'
import { OnboardingNav } from '@/components/onboarding/onboarding-nav'
import { StepAbout } from '@/components/onboarding/step-about'
import { StepProfession } from '@/components/onboarding/step-profession'
import { StepOffers } from '@/components/onboarding/step-offers'
import { StepSeeking } from '@/components/onboarding/step-seeking'
import { StepReview } from '@/components/onboarding/step-review'
import { STEPS } from '@/components/onboarding/types'
import type { Profession, Option, Location } from '@/components/onboarding/types'

const STEP_TITLES = ['About you', 'What do you do?', 'What do you offer?', 'Who are you looking for?']
const FORM_STEP_COUNT = STEPS.length - 1

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
      const [{ data: profs }, { data: ofrs }, { data: locs }, { data: { user } }] = await Promise.all([
        supabase.from('professions').select('id, category, role').eq('active', true).order('category').order('sort_order'),
        supabase.from('offers').select('id, label').eq('active', true).order('sort_order'),
        supabase.from('locations').select('id, label, category').eq('active', true).order('sort_order'),
        supabase.auth.getUser(),
      ])
      if (profs) setProfessions(profs)
      if (ofrs) setOffers(ofrs)
      if (locs) setLocations(locs)
      setLookupsReady(true)

      // Dev shortcut: pre-fill for test@test.com → jump to review (dev only)
      if (process.env.NODE_ENV === 'development' && user?.email === 'test@test.com' && profs && ofrs && locs) {
        const designer = profs.find(p => p.role === 'Product Designer')
        const founder = profs.find(p => p.role === 'Founder / CEO')
        const jhb = locs.find(l => l.label === 'Johannesburg')
        const mentorship = ofrs.find(o => o.label === 'Mentorship')
        const techSkills = ofrs.find(o => o.label === 'Technical skills')

        setFirstName('Test')
        setLastName('User')
        setGraduationYear('2022')
        if (jhb) setLocationId(jhb.id)
        if (designer) { setPrimaryProfessionId(designer.id); setPrimaryYears(5) }
        if (founder) { setSecondaryProfessionId(founder.id); setSecondaryYears(2); setShowSecondary(true) }
        if (mentorship && techSkills) setSelectedOffers([mentorship, techSkills])
        setSeekingRelationshipPrimary('mentor')
        setSeekingSpecificNeeds(
          ofrs.filter(o => ['Business strategy', 'Funding access'].includes(o.label)).map(o => ({ id: o.id, label: o.label }))
        )
        setSeekingGoal('starting-a-business')
        setHasReachedReview(true)
        setStep(STEPS.length - 1)
      }
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

  const isReviewStep = step === STEPS.length - 1

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 min-h-0 overflow-y-auto px-6 pt-4 pb-2">
        <div className="w-full max-w-sm mx-auto flex flex-col gap-5">

          {!isReviewStep && <StepDots current={step} total={FORM_STEP_COUNT} />}
          {!isReviewStep && <h2 className="text-xl font-semibold tracking-tight">{STEP_TITLES[step]}</h2>}

          {step === 0 && (
            <StepAbout
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

          {isReviewStep && (
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

        </div>
      </div>

      <OnboardingNav
        step={step}
        totalSteps={STEPS.length}
        canAdvance={canAdvance()}
        hasReachedReview={hasReachedReview}
        loading={loading}
        onBack={() => setStep(s => s - 1)}
        onContinue={handleContinue}
        onJumpToReview={() => setStep(STEPS.length - 1)}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

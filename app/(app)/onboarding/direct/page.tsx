'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ProfessionCombobox } from '@/components/profession-combobox'
import { ExperienceSlider, yearsToBand } from '@/components/experience-slider'
import { MultiSelectCombobox } from '@/components/multi-select-combobox'
import { Plus, Pencil } from 'lucide-react'
import { RelationshipTypeSelector } from '@/components/ui/relationship-type-selector'

type Profession = { id: string; category: string; role: string }
type Option = { id: string; label: string }

const SEEKING_NEEDS_OPTIONS: Option[] = [
  { id: 'Career guidance', label: 'Career guidance' },
  { id: 'Industry introductions', label: 'Industry introductions' },
  { id: 'Technical coaching', label: 'Technical coaching' },
  { id: 'Business strategy', label: 'Business strategy' },
  { id: 'Hiring advice', label: 'Hiring advice' },
  { id: 'Funding access', label: 'Funding access' },
  { id: 'Feedback on work', label: 'Feedback on work' },
]

const STEPS = ['About you', 'Profession', 'What you offer', 'What you need', 'Review']

const RELATIONSHIP_TYPES = [
  { id: 'mentor', label: 'Mentor' },
  { id: 'co-founder', label: 'Co-founder' },
  { id: 'advisor', label: 'Advisor' },
  { id: 'accountability-partner', label: 'Accountability partner' },
  { id: 'investor', label: 'Investor' },
  { id: 'connector', label: 'Connector' },
]


const GOALS = [
  { id: 'starting-a-business', label: 'Starting a business' },
  { id: 'growing-a-business', label: 'Growing a business' },
  { id: 'changing-careers', label: 'Changing careers' },
  { id: 'improving-my-craft', label: 'Improving my craft' },
  { id: 'building-a-team', label: 'Building a team' },
  { id: 'raising-investment', label: 'Raising investment' },
]

function buildOfferLabelOverrides(
  offers: Option[],
  professions: { id: string; role: string; category: string }[],
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

const BAND_LABELS: Record<number, string> = {
  1: 'Student / Graduate',
  2: 'Early career',
  3: 'Mid-level',
  4: 'Senior',
  5: 'Expert / Executive',
}
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: CURRENT_YEAR - 1959 }, (_, i) => CURRENT_YEAR - i)

export default function DirectOnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // lookup data
  const [professions, setProfessions] = useState<Profession[]>([])
  const [offers, setOffers] = useState<Option[]>([])
  const [locations, setLocations] = useState<Option[]>([])

  // form state — about you
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [graduationYear, setGraduationYear] = useState('')
  const [locationId, setLocationId] = useState('')

  // form state — profession
  const [primaryProfessionId, setPrimaryProfessionId] = useState('')
  const [primaryYears, setPrimaryYears] = useState(0)
  const [secondaryProfessionId, setSecondaryProfessionId] = useState('')
  const [secondaryYears, setSecondaryYears] = useState(0)
  const [showSecondary, setShowSecondary] = useState(false)

  // form state — offers
  const [selectedOffers, setSelectedOffers] = useState<Option[]>([])

  // form state — seeking (step 3)
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
    if (step === 0) return firstName.trim() && lastName.trim() && graduationYear && locationId
    if (step === 1) return !!primaryProfessionId
    if (step === 2) return selectedOffers.length > 0
    if (step === 3) return !!seekingRelationshipPrimary && seekingSpecificNeeds.length > 0
    if (step === 4) return true
    return false
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

  const seekingRelationshipLabel = RELATIONSHIP_TYPES.find(r => r.id === seekingRelationshipPrimary)?.label
  const seekingRelationshipSecondaryLabels = RELATIONSHIP_TYPES.filter(r => seekingRelationshipSecondary.includes(r.id)).map(r => r.label)
  const seekingProfessionLabel = professions.find(p => p.id === seekingProfessionId)?.role
  const seekingGoalLabel = GOALS.find(g => g.id === seekingGoal)?.label

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

        {/* step 0 — personal */}
        {step === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About you</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex gap-3">
                <div className="flex flex-col gap-1.5 flex-1">
                  <Label htmlFor="firstName">First name</Label>
                  <Input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Jane" />
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Smith" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Graduation year</Label>
                <Select value={graduationYear} onValueChange={v => setGraduationYear(v ?? '')}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select year" /></SelectTrigger>
                  <SelectContent>
                    {YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Current location</Label>
                <Select value={locationId} onValueChange={v => setLocationId(v ?? '')}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select location">{locations.find(l => l.id === locationId)?.label}</SelectValue></SelectTrigger>
                  <SelectContent>
                    {locations.map(l => <SelectItem key={l.id} value={l.id}>{l.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* step 1 — profession */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What do you do?</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="flex flex-col gap-1.5">
                <ProfessionCombobox
                  professions={professions}
                  value={primaryProfessionId}
                  onValueChange={setPrimaryProfessionId}
                  excludeId={secondaryProfessionId}
                  excludeLabel="Secondary"
                />
              </div>
              {primaryProfessionId && (
                <ExperienceSlider
                  label="Experience"
                  years={primaryYears}
                  onYearsChange={setPrimaryYears}
                />
              )}
              {primaryProfessionId && (
                !secondaryProfessionId && !showSecondary ? (
                  <button
                    type="button"
                    onClick={() => setShowSecondary(true)}
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
                        onClick={() => { setSecondaryProfessionId(''); setSecondaryYears(0); setShowSecondary(false) }}
                      >
                        Remove
                      </button>
                    </div>
                    <ProfessionCombobox
                      professions={professions}
                      value={secondaryProfessionId}
                      onValueChange={setSecondaryProfessionId}
                      placeholder="Select profession"
                      excludeId={primaryProfessionId}
                      excludeLabel="Primary"
                      autoOpen={showSecondary && !secondaryProfessionId}
                      onDismissEmpty={() => setShowSecondary(false)}
                    />
                  </div>
                )
              )}
              {secondaryProfessionId && (
                <ExperienceSlider
                  label="Experience"
                  years={secondaryYears}
                  onYearsChange={setSecondaryYears}
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* step 2 — offers */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What do you offer?</CardTitle>
            </CardHeader>
            <CardContent>
              <MultiSelectCombobox
                options={offers}
                value={selectedOffers}
                onValueChange={setSelectedOffers}
                placeholder="Select up to 3…"
                max={3}
                labelOverrides={buildOfferLabelOverrides(offers, professions, primaryProfessionId, secondaryProfessionId)}
              />
            </CardContent>
          </Card>
        )}

        {/* step 3 — seeking (4-part) */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Who are you looking for?</CardTitle>
              <CardDescription>Help us find the right people for you.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">

              {/* Part 1 — relationship type */}
              <RelationshipTypeSelector
                types={RELATIONSHIP_TYPES}
                primary={seekingRelationshipPrimary}
                secondary={seekingRelationshipSecondary}
                onPrimaryChange={setSeekingRelationshipPrimary}
                onSecondaryChange={setSeekingRelationshipSecondary}
              />

              {/* Part 2 — profession/expertise */}
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between">
                  <Label>What profession or expertise?</Label>
                  <span className="text-sm text-muted-foreground">Optional</span>
                </div>
                <ProfessionCombobox
                  professions={professions}
                  value={seekingProfessionId}
                  onValueChange={setSeekingProfessionId}
                  placeholder="Any profession"
                />
                {seekingProfessionId && (
                  <button
                    type="button"
                    onClick={() => setSeekingProfessionId('')}
                    className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground self-start"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Part 3 — specific needs */}
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between">
                  <Label>What specifically do you need?</Label>
                  <span className="text-xs text-muted-foreground">Select up to 3</span>
                </div>
                <MultiSelectCombobox
                  options={SEEKING_NEEDS_OPTIONS}
                  value={seekingSpecificNeeds}
                  onValueChange={setSeekingSpecificNeeds}
                  placeholder="Select…"
                  max={3}
                />
              </div>

              {/* Part 4 — goal */}
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between">
                  <Label>What are you working toward?</Label>
                  <span className="text-sm text-muted-foreground">Optional</span>
                </div>
                <Select value={seekingGoal} onValueChange={v => setSeekingGoal(v ?? '')}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select…">{GOALS.find(g => g.id === seekingGoal)?.label}</SelectValue></SelectTrigger>
                  <SelectContent>
                    {GOALS.map(g => <SelectItem key={g.id} value={g.id}>{g.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
            </CardContent>
          </Card>
        )}

        {/* step 4 — review */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Looks good?</CardTitle>
              <CardDescription>Review your profile before we find your matches.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col divide-y divide-border">

              {/* personal */}
              <div className="flex items-start justify-between py-3 first:pt-0">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground font-medium">About you</span>
                  <span className="text-sm">{firstName} {lastName}</span>
                  <span className="text-sm text-muted-foreground">
                    Class of {graduationYear}
                    {locationId && locations.find(l => l.id === locationId) && ` · ${locations.find(l => l.id === locationId)!.label}`}
                  </span>
                </div>
                <button type="button" onClick={() => setStep(0)} className="text-muted-foreground hover:text-foreground mt-0.5">
                  <Pencil className="size-3.5" />
                </button>
              </div>

              {/* profession */}
              <div className="flex items-start justify-between py-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground font-medium">Profession</span>
                  <span className="text-sm">
                    {professions.find(p => p.id === primaryProfessionId)?.role}
                    {' · '}
                    <span className="text-muted-foreground">{BAND_LABELS[yearsToBand(primaryYears)]}</span>
                  </span>
                  {secondaryProfessionId && (
                    <span className="text-sm text-muted-foreground">
                      + {professions.find(p => p.id === secondaryProfessionId)?.role}
                      {' · '}
                      {BAND_LABELS[yearsToBand(secondaryYears)]}
                    </span>
                  )}
                </div>
                <button type="button" onClick={() => setStep(1)} className="text-muted-foreground hover:text-foreground mt-0.5">
                  <Pencil className="size-3.5" />
                </button>
              </div>

              {/* offers */}
              <div className="flex items-start justify-between py-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-muted-foreground font-medium">What I offer</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedOffers.map(o => (
                      <Badge key={o.id} variant="secondary" className="text-xs">{o.label}</Badge>
                    ))}
                  </div>
                </div>
                <button type="button" onClick={() => setStep(2)} className="text-muted-foreground hover:text-foreground mt-0.5">
                  <Pencil className="size-3.5" />
                </button>
              </div>

              {/* seeking */}
              <div className="flex items-start justify-between py-3 last:pb-0">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-muted-foreground font-medium">Looking for</span>
                  {seekingRelationshipLabel && (
                    <span className="text-sm">
                      {seekingRelationshipLabel}
                      {seekingRelationshipSecondaryLabels.length > 0 && (
                        <span className="text-muted-foreground"> · also open to {seekingRelationshipSecondaryLabels.join(', ')}</span>
                      )}
                      {seekingProfessionLabel && <span className="text-muted-foreground"> · {seekingProfessionLabel}</span>}
                    </span>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {seekingSpecificNeeds.map(n => (
                      <Badge key={n.id} variant="outline" className="text-xs">{n.label}</Badge>
                    ))}
                  </div>
                  {seekingGoalLabel && (
                    <span className="text-xs text-muted-foreground">Goal: {seekingGoalLabel}</span>
                  )}
                </div>
                <button type="button" onClick={() => setStep(3)} className="text-muted-foreground hover:text-foreground mt-0.5">
                  <Pencil className="size-3.5" />
                </button>
              </div>

            </CardContent>
          </Card>
        )}

        {/* nav */}
        <div className="flex gap-3">
          {step > 0 && (
            <Button variant="outline" className="flex-1" onClick={() => setStep(s => s - 1)}>
              Back
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button className="flex-1" disabled={!canAdvance()} onClick={() => setStep(s => s + 1)}>
              Continue
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

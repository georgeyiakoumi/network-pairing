import { createClient } from '@/lib/supabase/client'
import type { OnboardingData } from '@/components/onboarding/types'

export type SaveProfileResult =
  | { success: true }
  | { success: false; error: string }

export async function saveProfile(
  data: OnboardingData,
  intakeMethod: 'direct' | 'guided',
  intakeTranscript?: object,
): Promise<SaveProfileResult> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .insert({
      user_id: user.id,
      first_name: data.firstName.trim(),
      last_name: data.lastName.trim(),
      graduation_year: data.graduationYear,
      location_id: data.locationId,
      primary_profession_id: data.primaryProfessionId,
      primary_experience: data.primaryExperience,
      secondary_profession_id: data.secondaryProfessionId,
      secondary_experience: data.secondaryExperience,
      seeking_relationship_primary: data.seekingRelationshipPrimary,
      seeking_relationship_secondary: data.seekingRelationshipSecondary.length > 0
        ? data.seekingRelationshipSecondary
        : null,
      seeking_profession_id: data.seekingProfessionId,
      seeking_goal: data.seekingGoal,
      intake_method: intakeMethod,
      intake_transcript: intakeTranscript ?? null,
    })
    .select('id')
    .single()

  if (profileError || !profile) {
    return { success: false, error: 'Something went wrong saving your profile. Please try again.' }
  }

  const [offersResult, needsResult] = await Promise.all([
    data.offerIds.length > 0
      ? supabase.from('profile_offers').insert(
          data.offerIds.map(id => ({ profile_id: profile.id, offer_id: id }))
        )
      : Promise.resolve({ error: null }),
    data.seekingSpecificNeedIds.length > 0
      ? supabase.from('profile_seeking_needs').insert(
          data.seekingSpecificNeedIds.map(id => ({ profile_id: profile.id, label: id }))
        )
      : Promise.resolve({ error: null }),
  ])

  if (offersResult?.error || needsResult?.error) {
    return { success: false, error: 'Something went wrong saving your profile. Please try again.' }
  }

  return { success: true }
}

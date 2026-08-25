import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { ProfileView } from '@/components/profile/profile-view'

type ProfileData = {
  id: string
  first_name: string
  last_name: string
  graduation_year: number | null
  primary_experience: number
  secondary_experience: number | null
  primary_profession_id: string | null
  secondary_profession_id: string | null
  seeking_profession_id: string | null
  location_id: string | null
  seeking_relationship_primary: string | null
  seeking_relationship_secondary: string[] | null
  seeking_goal: string | null
  primary_profession: { category: string; role: string } | null
  secondary_profession: { category: string; role: string } | null
  seeking_profession: { category: string; role: string } | null
  location: { label: string } | null
  profile_offers: { offers: { label: string } | null }[]
  profile_seeking_needs: { label: string }[]
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const serviceSupabase = createServiceClient()

  const profileQuery = serviceSupabase
    .from('profiles')
    .select(`
      id,
      first_name,
      last_name,
      graduation_year,
      primary_experience,
      secondary_experience,
      primary_profession_id,
      secondary_profession_id,
      seeking_profession_id,
      location_id,
      seeking_relationship_primary,
      seeking_relationship_secondary,
      seeking_goal,
      primary_profession:professions!primary_profession_id(category, role),
      secondary_profession:professions!secondary_profession_id(category, role),
      seeking_profession:professions!seeking_profession_id(category, role),
      location:location_id(label),
      profile_offers(offers:offer_id(label)),
      profile_seeking_needs(label)
    `)
    .eq('user_id', user.id)
    .maybeSingle()

  const locationsQuery = serviceSupabase
    .from('locations')
    .select('id, label')
    .eq('active', true)
    .order('sort_order')

  const [profileResult, locationsResult] = await Promise.all([profileQuery, locationsQuery])
  const { data: profile, error } = profileResult as { data: ProfileData | null; error: unknown }
  const { data: locations } = locationsResult

  if (error) {
    console.error('[profile] Query error:', JSON.stringify(error, null, 2))
  }

  if (!profile) redirect('/onboarding')

  const offerLabels = profile.profile_offers
    .map(o => o.offers?.label ?? '')
    .filter(Boolean)

  const seekingLabels = profile.profile_seeking_needs
    .map(n => n.label)
    .filter(Boolean)

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <ProfileView
        profileId={profile.id}
        firstName={profile.first_name}
        lastName={profile.last_name}
        email={user.email ?? ''}
        graduationYear={profile.graduation_year}
        location={profile.location?.label ?? null}
        locationId={profile.location_id}
        primaryRole={profile.primary_profession?.role ?? 'Unknown'}
        primaryCategory={profile.primary_profession?.category ?? ''}
        primaryExperience={profile.primary_experience}
        primaryProfessionId={profile.primary_profession_id}
        secondaryRole={profile.secondary_profession?.role ?? null}
        secondaryCategory={profile.secondary_profession?.category ?? null}
        secondaryExperience={profile.secondary_experience}
        secondaryProfessionId={profile.secondary_profession_id}
        offerLabels={offerLabels}
        seekingLabels={seekingLabels}
        seekingRelationship={profile.seeking_relationship_primary}
        seekingRelationshipSecondary={profile.seeking_relationship_secondary}
        seekingGoal={profile.seeking_goal}
        seekingProfession={profile.seeking_profession?.role ?? null}
        seekingProfessionId={profile.seeking_profession_id}
        locations={(locations ?? []).map(l => ({ id: l.id, label: l.label }))}
      />
    </div>
  )
}

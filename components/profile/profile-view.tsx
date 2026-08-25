'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LogOut, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { BAND_LABELS } from '@/components/onboarding/types'
import { createClient } from '@/lib/supabase/client'

export type ProfileViewProps = {
  profileId: string
  firstName: string
  lastName: string
  email: string
  graduationYear: number | null
  location: string | null
  locationId: string | null
  primaryRole: string
  primaryCategory: string
  primaryExperience: number
  primaryProfessionId: string | null
  secondaryRole: string | null
  secondaryCategory: string | null
  secondaryExperience: number | null
  secondaryProfessionId: string | null
  offerLabels: string[]
  seekingLabels: string[]
  seekingRelationship: string | null
  seekingRelationshipSecondary: string[] | null
  seekingGoal: string | null
  seekingProfession: string | null
  seekingProfessionId: string | null
  locations: { id: string; label: string }[]
}

// ─── Section with edit button ────────────────────────────────────────────────

function Section({
  label,
  onEdit,
  children,
}: {
  label: string
  onEdit?: () => void
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
        {onEdit && (
          <button
            onClick={onEdit}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label={`Edit ${label}`}
          >
            <Pencil className="size-3.5" />
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

export function ProfileView(props: ProfileViewProps) {
  const {
    profileId,
    firstName,
    lastName,
    email,
    graduationYear,
    location,
    locationId,
    primaryRole,
    primaryCategory,
    primaryExperience,
    secondaryRole,
    secondaryExperience,
    offerLabels,
    seekingLabels,
    seekingRelationship,
    seekingRelationshipSecondary,
    seekingGoal,
    seekingProfession,
    locations,
  } = props

  const router = useRouter()
  const avatarUrl = `https://api.dicebear.com/9.x/lorelei/svg?seed=${encodeURIComponent(`${firstName} ${lastName}`)}`
  const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()

  // ── Drawer state ──────────────────────────────────────────────────────────
  const [editSection, setEditSection] = useState<string | null>(null)

  // ── About drawer state ────────────────────────────────────────────────────
  const [editFirstName, setEditFirstName] = useState(firstName)
  const [editLastName, setEditLastName] = useState(lastName)
  const [editGradYear, setEditGradYear] = useState(graduationYear?.toString() ?? '')
  const [editLocationId, setEditLocationId] = useState(locationId ?? '')
  const [saving, setSaving] = useState(false)

  function openEdit(section: string) {
    // Reset form state when opening
    if (section === 'about') {
      setEditFirstName(firstName)
      setEditLastName(lastName)
      setEditGradYear(graduationYear?.toString() ?? '')
      setEditLocationId(locationId ?? '')
    }
    setEditSection(section)
  }

  const currentYear = new Date().getFullYear()
  const gradYearNum = editGradYear ? parseInt(editGradYear, 10) : null
  const gradYearValid = gradYearNum === null || (gradYearNum >= 1950 && gradYearNum <= currentYear + 10)
  const nameValid = editFirstName.trim().length > 0 && editFirstName.length <= 100
    && editLastName.trim().length > 0 && editLastName.length <= 100
  const aboutFormValid = nameValid && gradYearValid

  async function saveAbout() {
    if (!aboutFormValid) return
    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: editFirstName.trim(),
          last_name: editLastName.trim(),
          graduation_year: gradYearNum,
          location_id: editLocationId || null,
        })
        .eq('id', profileId)

      if (error) {
        toast.error('Failed to save changes. Please try again.')
        return
      }

      setEditSection(null)
      router.refresh()
    } catch {
      toast.error('Network error. Please check your connection.')
    } finally {
      setSaving(false)
    }
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex flex-col items-center gap-6 p-6 max-w-md mx-auto w-full">
      {/* Avatar + name */}
      <div className="flex flex-col items-center gap-2">
        <Avatar className="size-20">
          <AvatarImage className="bg-background" src={avatarUrl} alt={`${firstName} ${lastName}`} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h1 className="text-xl font-semibold">{firstName} {lastName}</h1>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
      </div>

      <Separator />

      {/* About */}
      <div className="flex flex-col gap-4 w-full">
        <Section label="Primary profession" onEdit={() => openEdit('profession')}>
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-medium">{primaryRole}</p>
            <p className="text-xs text-muted-foreground">{primaryCategory} · {BAND_LABELS[primaryExperience] ?? ''}</p>
          </div>
        </Section>

        {secondaryRole && secondaryExperience && (
          <Section label="Secondary profession" onEdit={() => openEdit('profession')}>
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-medium">{secondaryRole}</p>
              <p className="text-xs text-muted-foreground">{BAND_LABELS[secondaryExperience] ?? ''}</p>
            </div>
          </Section>
        )}

        <Section label="Details" onEdit={() => openEdit('about')}>
          <div className="flex flex-wrap gap-1.5">
            {location && <Badge variant="secondary">{location}</Badge>}
            {graduationYear && <Badge variant="secondary">Class of {graduationYear}</Badge>}
          </div>
        </Section>
      </div>

      <Separator />

      {/* What I offer */}
      <div className="w-full">
        <Section label="What I offer" onEdit={() => openEdit('offers')}>
          <div className="flex flex-wrap gap-1.5">
            {offerLabels.map(label => (
              <Badge key={label} variant="secondary">{label}</Badge>
            ))}
          </div>
        </Section>
      </div>

      {/* What I'm looking for */}
      <div className="flex flex-col gap-4 w-full">
        {seekingLabels.length > 0 && (
          <Section label="What I need" onEdit={() => openEdit('seeking')}>
            <div className="flex flex-wrap gap-1.5">
              {seekingLabels.map(label => (
                <Badge key={label} variant="outline">{label}</Badge>
              ))}
            </div>
          </Section>
        )}

        {seekingRelationship && (
          <Section label="Looking for" onEdit={() => openEdit('seeking')}>
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-medium capitalize">{seekingRelationship}</p>
              {seekingRelationshipSecondary && seekingRelationshipSecondary.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Also open to: {seekingRelationshipSecondary.join(', ')}
                </p>
              )}
            </div>
          </Section>
        )}

        {seekingProfession && (
          <Section label="Seeking profession" onEdit={() => openEdit('seeking')}>
            <p className="text-sm font-medium">{seekingProfession}</p>
          </Section>
        )}

        {seekingGoal && (
          <Section label="Goal" onEdit={() => openEdit('seeking')}>
            <p className="text-sm font-medium capitalize">{seekingGoal.replace(/-/g, ' ')}</p>
          </Section>
        )}
      </div>

      <Separator />

      {/* Sign out */}
      <Button variant="outline" className="w-full" onClick={handleSignOut}>
        <LogOut data-icon="inline-start" aria-hidden="true" />
        Sign out
      </Button>

      {/* ── Edit drawers ─────────────────────────────────────────────────────── */}

      {/* About / Details drawer */}
      <Drawer open={editSection === 'about'} onOpenChange={(open) => !open && setEditSection(null)}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-lg">
            <DrawerHeader>
              <DrawerTitle>Edit details</DrawerTitle>
            </DrawerHeader>
            <div className="flex flex-col gap-4 px-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-first-name">First name</Label>
                  <Input
                    id="edit-first-name"
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-last-name">Last name</Label>
                  <Input
                    id="edit-last-name"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-grad-year">Graduation year</Label>
                <Input
                  id="edit-grad-year"
                  type="number"
                  value={editGradYear}
                  onChange={(e) => setEditGradYear(e.target.value)}
                  min={1950}
                  max={currentYear + 10}
                />
                {editGradYear && !gradYearValid && (
                  <p className="text-xs text-destructive">Year must be between 1950 and {currentYear + 10}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-location">Location</Label>
                <select
                  id="edit-location"
                  value={editLocationId}
                  onChange={(e) => setEditLocationId(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Select location</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <DrawerFooter>
              <Button onClick={saveAbout} disabled={saving || !aboutFormValid}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
              <Button variant="outline" onClick={() => setEditSection(null)}>Cancel</Button>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Profession drawer — placeholder for now */}
      <Drawer open={editSection === 'profession'} onOpenChange={(open) => !open && setEditSection(null)}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-lg">
            <DrawerHeader>
              <DrawerTitle>Edit profession</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-4">
              <p className="text-sm text-muted-foreground">Profession editing coming soon. For now, contact support to update your profession.</p>
            </div>
            <DrawerFooter>
              <Button variant="outline" onClick={() => setEditSection(null)}>Close</Button>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Offers drawer — placeholder for now */}
      <Drawer open={editSection === 'offers'} onOpenChange={(open) => !open && setEditSection(null)}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-lg">
            <DrawerHeader>
              <DrawerTitle>Edit what you offer</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-4">
              <p className="text-sm text-muted-foreground">Offer editing coming soon.</p>
            </div>
            <DrawerFooter>
              <Button variant="outline" onClick={() => setEditSection(null)}>Close</Button>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Seeking drawer — placeholder for now */}
      <Drawer open={editSection === 'seeking'} onOpenChange={(open) => !open && setEditSection(null)}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-lg">
            <DrawerHeader>
              <DrawerTitle>Edit what you need</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-4">
              <p className="text-sm text-muted-foreground">Need editing coming soon.</p>
            </div>
            <DrawerFooter>
              <Button variant="outline" onClick={() => setEditSection(null)}>Close</Button>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

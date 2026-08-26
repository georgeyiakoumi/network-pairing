'use client'

import { Input } from '@/components/ui/input'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ResponsiveCombobox, type ComboboxOption } from '@/components/responsive-combobox'
import type { Location } from './types'

const MIN_YEAR = 1960
const MAX_YEAR = new Date().getFullYear()

interface StepAboutProps {
  firstName: string
  lastName: string
  graduationYear: string
  locationId: string
  locations: Location[]
  lookupsReady: boolean
  onFirstNameChange: (v: string) => void
  onLastNameChange: (v: string) => void
  onGraduationYearChange: (v: string) => void
  onLocationIdChange: (v: string) => void
}

export function StepAbout({
  firstName,
  lastName,
  graduationYear,
  locationId,
  locations,
  lookupsReady,
  onFirstNameChange,
  onLastNameChange,
  onGraduationYearChange,
  onLocationIdChange,
}: StepAboutProps) {
  const locationOptions: ComboboxOption[] = locations.map(l => ({
    value: l.id,
    label: l.label,
    group: l.category,
  }))

  return (
    <>
      <div className="flex gap-3">
        <FieldGroup className="flex-1">
          <Field>
            <FieldLabel htmlFor="firstName">First name</FieldLabel>
            <Input
              id="firstName"
              value={firstName}
              onChange={e => onFirstNameChange(e.target.value)}
              placeholder="Jane"
            />
          </Field>
        </FieldGroup>
        <FieldGroup className="flex-1">
          <Field>
            <FieldLabel htmlFor="lastName">Last name</FieldLabel>
            <Input
              id="lastName"
              value={lastName}
              onChange={e => onLastNameChange(e.target.value)}
              placeholder="Smith"
            />
          </Field>
        </FieldGroup>
      </div>

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="graduationYear">Graduation year</FieldLabel>
          <Input
            id="graduationYear"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder={String(MAX_YEAR)}
            value={graduationYear}
            onChange={e => onGraduationYearChange(e.target.value.replace(/\D/g, '').slice(0, 4))}
            onBlur={() => {
              const n = parseInt(graduationYear, 10)
              if (!isNaN(n)) {
                if (n < MIN_YEAR) onGraduationYearChange(String(MIN_YEAR))
                else if (n > MAX_YEAR) onGraduationYearChange(String(MAX_YEAR))
              }
            }}
          />
        </Field>
      </FieldGroup>

      <div className="flex flex-col gap-1.5">
        <Label>Current location</Label>
        {!lookupsReady ? (
          <Button variant="outline" disabled className="w-full justify-between font-normal text-muted-foreground">
            Select location
          </Button>
        ) : (
          <ResponsiveCombobox
            options={locationOptions}
            value={locationId}
            onValueChange={onLocationIdChange}
            placeholder="Select location"
            searchPlaceholder="Search locations…"
            emptyText="No location found."
            drawerTitle="Current location"
          />
        )}
      </div>
    </>
  )
}

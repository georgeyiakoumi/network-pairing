'use client'

import * as React from 'react'
import { Input } from '@/components/ui/input'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Label } from '@/components/ui/label'
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from '@/components/ui/combobox'
import { Button } from '@/components/ui/button'
import { OnboardingStep } from './onboarding-step'
import type { Location } from './types'

const MIN_YEAR = 1960
const MAX_YEAR = new Date().getFullYear()

type LocationItem = Location & { value: string }
type LocationGroup = { value: string; items: LocationItem[] }

interface StepAboutProps {
  firstName: string
  lastName: string
  graduationYear: string
  locationId: string
  locations: Location[]
  lookupsReady: boolean
  action?: React.ReactNode
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
  action,
  onFirstNameChange,
  onLastNameChange,
  onGraduationYearChange,
  onLocationIdChange,
}: StepAboutProps) {
  const [locationOpen, setLocationOpen] = React.useState(false)

  const categories = Array.from(new Set(locations.map(l => l.category)))
  const groupedLocations: LocationGroup[] = categories.map(cat => ({
    value: cat,
    items: locations.filter(l => l.category === cat).map(l => ({ ...l, value: l.id })),
  }))

  const selected = groupedLocations.flatMap(g => g.items).find(l => l.id === locationId) ?? null

  return (
    <OnboardingStep title="About you" action={action}>
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
        <Combobox<Location>
          items={groupedLocations}
          value={selected}
          onValueChange={item => { if (item) onLocationIdChange(item.id) }}
          open={locationOpen}
          onOpenChange={setLocationOpen}
          itemToStringLabel={item => item?.label ?? ''}
          isItemEqualToValue={(a, b) => a.id === b.id}
        >
          <ComboboxTrigger
            render={
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={locationOpen}
                className="w-full justify-between font-normal"
              />
            }
          >
            <ComboboxValue placeholder="Select location" />
          </ComboboxTrigger>
          <ComboboxContent>
            <ComboboxInput showTrigger={false} placeholder="Search locations…" />
            <ComboboxEmpty>No location found.</ComboboxEmpty>
            <ComboboxList>
              {(group: LocationGroup) => (
                <ComboboxGroup key={group.value} items={group.items}>
                  <ComboboxLabel>{group.value}</ComboboxLabel>
                  <ComboboxCollection>
                    {(l: Location) => (
                      <ComboboxItem key={l.id} value={l}>
                        {l.label}
                      </ComboboxItem>
                    )}
                  </ComboboxCollection>
                </ComboboxGroup>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        )}
      </div>
    </OnboardingStep>
  )
}

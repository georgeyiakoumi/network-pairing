'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { OnboardingStep } from './onboarding-step'
import type { Option } from './types'

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: CURRENT_YEAR - 1959 }, (_, i) => CURRENT_YEAR - i)

interface StepAboutProps {
  firstName: string
  lastName: string
  graduationYear: string
  locationId: string
  locations: Option[]
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
  onFirstNameChange,
  onLastNameChange,
  onGraduationYearChange,
  onLocationIdChange,
}: StepAboutProps) {
  return (
    <OnboardingStep title="About you">
        <div className="flex gap-3">
          <div className="flex flex-col gap-1.5 flex-1">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={e => onFirstNameChange(e.target.value)}
              placeholder="Jane"
            />
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={e => onLastNameChange(e.target.value)}
              placeholder="Smith"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Graduation year</Label>
          <Select value={graduationYear} onValueChange={v => onGraduationYearChange(v ?? '')}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Current location</Label>
          <Select value={locationId} onValueChange={v => onLocationIdChange(v ?? '')}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select location">
                {locations.find(l => l.id === locationId)?.label}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {locations.map(l => <SelectItem key={l.id} value={l.id}>{l.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
    </OnboardingStep>
  )
}

'use client'

import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { BAND_LABELS, formatYears } from '@/components/onboarding/types'

// Maps a year value (0–15) to a band (1–5)
export function yearsToBand(years: number): number {
  if (years <= 1) return 1
  if (years <= 3) return 2
  if (years <= 5) return 3
  if (years <= 10) return 4
  return 5
}

interface ExperienceSliderProps {
  label: string
  years: number
  onYearsChange: (years: number) => void
}

export function ExperienceSlider({ label, years, onYearsChange }: ExperienceSliderProps) {
  const band = yearsToBand(years)
  const bandLabel = BAND_LABELS[band]

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <Label>{label}</Label>
        <span className="text-xs font-medium text-muted-foreground">{bandLabel}</span>
      </div>
      <Slider
        min={0}
        max={15}
        step={1}
        value={[years]}
        onValueChange={(vals) => { onYearsChange(Array.isArray(vals) ? vals[0] : vals) }}
      />
      <span className="text-xs text-muted-foreground">{formatYears(years)}</span>
    </div>
  )
}

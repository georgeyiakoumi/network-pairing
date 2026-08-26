'use client'

import { ResponsiveCombobox, type ComboboxOption } from '@/components/responsive-combobox'

type Profession = { id: string; category: string; role: string }

interface ProfessionComboboxProps {
  professions: Profession[]
  value: string
  onValueChange: (id: string) => void
  placeholder?: string
  disabled?: boolean
  excludeId?: string
  excludeLabel?: string
  autoOpen?: boolean
  onDismissEmpty?: () => void
}

export function ProfessionCombobox({
  professions,
  value,
  onValueChange,
  placeholder = 'Select profession',
  disabled = false,
  excludeId,
  excludeLabel,
  autoOpen = false,
  onDismissEmpty,
}: ProfessionComboboxProps) {
  const options: ComboboxOption[] = professions.map(p => ({
    value: p.id,
    label: p.role,
    group: p.category,
    disabled: p.id === excludeId,
    badge: p.id === excludeId && excludeLabel ? excludeLabel : undefined,
  }))

  return (
    <ResponsiveCombobox
      options={options}
      value={value}
      onValueChange={onValueChange}
      placeholder={placeholder}
      searchPlaceholder="Search professions…"
      emptyText="No profession found."
      drawerTitle="Select profession"
      disabled={disabled}
      autoOpen={autoOpen}
      onDismissEmpty={onDismissEmpty}
    />
  )
}

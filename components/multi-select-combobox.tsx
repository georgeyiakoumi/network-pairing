'use client'

import { ResponsiveMultiCombobox, type ComboboxOption } from '@/components/responsive-combobox'

type Option = { id: string; label: string }

interface MultiSelectComboboxProps {
  options: Option[]
  value: Option[]
  onValueChange: (value: Option[]) => void
  placeholder?: string
  max?: number
  labelOverrides?: Record<string, string>
}

export function MultiSelectCombobox({
  options,
  value,
  onValueChange,
  placeholder = 'Select…',
  max = 3,
  labelOverrides = {},
}: MultiSelectComboboxProps) {
  const comboboxOptions: ComboboxOption[] = options.map(o => ({
    value: o.id,
    label: o.label,
  }))

  const selectedIds = value.map(v => v.id)

  function handleChange(ids: string[]) {
    const selected = ids
      .map(id => options.find(o => o.id === id))
      .filter(Boolean) as Option[]
    onValueChange(selected)
  }

  return (
    <ResponsiveMultiCombobox
      options={comboboxOptions}
      value={selectedIds}
      onValueChange={handleChange}
      placeholder={placeholder}
      searchPlaceholder="Search…"
      emptyText="No options found."
      drawerTitle="Select options"
      max={max}
      labelOverrides={labelOverrides}
    />
  )
}

'use client'

import * as React from 'react'
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '@/components/ui/combobox'

type Option = { id: string; label: string }

interface MultiSelectComboboxProps {
  options: Option[]
  value: Option[]
  onValueChange: (value: Option[]) => void
  placeholder?: string
  max?: number
  /** Override the display label for specific option IDs */
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
  const anchor = useComboboxAnchor()

  function displayLabel(o: Option) {
    return labelOverrides[o.id] ?? o.label
  }

  const atMax = value.length >= max

  function handleValueChange(newValue: Option[]) {
    if (newValue.length > max) return
    onValueChange(newValue)
  }

  return (
    <Combobox<Option, true>
      multiple
      autoHighlight
      items={options}
      value={value}
      onValueChange={handleValueChange}
      itemToStringLabel={item => (item ? displayLabel(item) : '')}
      isItemEqualToValue={(a, b) => a.id === b.id}
    >
      <ComboboxChips ref={anchor} className="w-full">
        <ComboboxValue placeholder={placeholder}>
          {(values: Option[]) => (
            <React.Fragment>
              {values.map(v => (
                <ComboboxChip key={v.id}>{displayLabel(v)}</ComboboxChip>
              ))}
              {!atMax && <ComboboxChipsInput placeholder={values.length === 0 ? placeholder : ''} />}
            </React.Fragment>
          )}
        </ComboboxValue>
      </ComboboxChips>

      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>No options found.</ComboboxEmpty>
        <ComboboxList>
          {(o: Option) => (
            <ComboboxItem key={o.id} value={o}>
              {displayLabel(o)}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

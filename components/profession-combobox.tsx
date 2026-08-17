'use client'

import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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

type Profession = { id: string; category: string; role: string }
type ProfessionGroup = { value: string; items: Profession[] }

interface ProfessionComboboxProps {
  professions: Profession[]
  value: string
  onValueChange: (id: string) => void
  placeholder?: string
  disabled?: boolean
  /** ID of the profession selected in the other combobox — will be disabled and badged */
  excludeId?: string
  /** Label shown on the excluded item e.g. "Primary" or "Secondary" */
  excludeLabel?: string
  /** Open the popover immediately on mount */
  autoOpen?: boolean
  /** Called when the popover closes without a value having been selected */
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
  const [open, setOpen] = React.useState(autoOpen)

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next && !value) onDismissEmpty?.()
  }

  const selected = professions.find(p => p.id === value) ?? null

  // Build grouped items in the format Base UI expects for grouped collections
  const categories = Array.from(new Set(professions.map(p => p.category)))
  const groupedItems: ProfessionGroup[] = categories.map(cat => ({
    value: cat,
    items: professions.filter(p => p.category === cat),
  }))

  return (
    <Combobox<Profession>
      items={groupedItems}
      value={selected}
      onValueChange={item => {
        if (item) onValueChange(item.id)
      }}
      open={open}
      onOpenChange={handleOpenChange}
      disabled={disabled}
      itemToStringLabel={item => item?.role ?? ''}
      isItemEqualToValue={(a, b) => a.id === b.id}
    >
      <ComboboxTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
            disabled={disabled}
          />
        }
      >
        <ComboboxValue placeholder={placeholder} />
      </ComboboxTrigger>

      <ComboboxContent>
        <ComboboxInput showTrigger={false} placeholder="Search professions…" />
        <ComboboxEmpty>No profession found.</ComboboxEmpty>
        <ComboboxList>
          {(group: ProfessionGroup) => (
            <ComboboxGroup key={group.value} items={group.items}>
              <ComboboxLabel>{group.value}</ComboboxLabel>
              <ComboboxCollection>
                {(p: Profession) => {
                  const isExcluded = p.id === excludeId
                  return (
                    <ComboboxItem
                      key={p.id}
                      value={p}
                      disabled={isExcluded}
                      className={isExcluded ? 'opacity-50 cursor-not-allowed' : undefined}
                    >
                      <span className="flex-1">{p.role}</span>
                      {isExcluded && excludeLabel && (
                        <Badge variant="secondary" className="ml-2 text-xs pointer-events-none">
                          {excludeLabel}
                        </Badge>
                      )}
                    </ComboboxItem>
                  )
                }}
              </ComboboxCollection>
            </ComboboxGroup>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

'use client'

import * as React from 'react'
import { useIsMobile } from '@/hooks/use-mobile'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Single-select ───────────────────────────────────────────────────────────

export type ComboboxOption = {
  value: string
  label: string
  group?: string
  disabled?: boolean
  badge?: string
}

interface ResponsiveComboboxProps {
  options: ComboboxOption[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  drawerTitle?: string
  disabled?: boolean
  autoOpen?: boolean
  onDismissEmpty?: () => void
}

export function ResponsiveCombobox({
  options,
  value,
  onValueChange,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  emptyText = 'No results found.',
  drawerTitle = 'Select an option',
  disabled = false,
  autoOpen = false,
  onDismissEmpty,
}: ResponsiveComboboxProps) {
  const [open, setOpen] = React.useState(autoOpen)
  const isMobile = useIsMobile()

  const selectedLabel = options.find(o => o.value === value)?.label

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next && !value) onDismissEmpty?.()
  }

  function handleSelect(val: string) {
    onValueChange(val)
    setOpen(false)
  }

  const groups = Array.from(new Set(options.map(o => o.group ?? '')))
  const hasGroups = groups.length > 1 || (groups.length === 1 && groups[0] !== '')

  const list = (
    <Command>
      <CommandInput placeholder={searchPlaceholder} />
      <CommandList className="max-h-[300px]">
        <CommandEmpty>{emptyText}</CommandEmpty>
        {hasGroups ? (
          groups.map((group, i) => (
            <React.Fragment key={group}>
              {i > 0 && <CommandSeparator />}
              <CommandGroup heading={group || undefined}>
                {options
                  .filter(o => (o.group ?? '') === group)
                  .map(o => (
                    <CommandItem
                      key={o.value}
                      value={`${o.label} ${o.group ?? ''}`}
                      onSelect={() => !o.disabled && handleSelect(o.value)}
                      disabled={o.disabled}
                      className={o.disabled ? 'opacity-50' : undefined}
                    >
                      <span className="flex-1">{o.label}</span>
                      {o.badge && (
                        <span className="text-xs text-muted-foreground ml-2">{o.badge}</span>
                      )}
                      {o.value === value && <Check className="size-4 shrink-0" />}
                    </CommandItem>
                  ))}
              </CommandGroup>
            </React.Fragment>
          ))
        ) : (
          <CommandGroup>
            {options.map(o => (
              <CommandItem
                key={o.value}
                value={o.label}
                onSelect={() => !o.disabled && handleSelect(o.value)}
                disabled={o.disabled}
              >
                <span className="flex-1">{o.label}</span>
                {o.value === value && <Check className="size-4 shrink-0" />}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  )

  const triggerContent = (
    <>
      {selectedLabel ?? <span className="text-muted-foreground">{placeholder}</span>}
      <ChevronsUpDown className="shrink-0 opacity-50" data-icon="inline-end" aria-hidden="true" />
    </>
  )

  if (isMobile) {
    return (
      <>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal"
          onClick={() => setOpen(true)}
        >
          {triggerContent}
        </Button>
        <Drawer open={open} onOpenChange={handleOpenChange}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{drawerTitle}</DrawerTitle>
            </DrawerHeader>
            <div className="px-2 pb-4">
              {list}
            </div>
          </DrawerContent>
        </Drawer>
      </>
    )
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between font-normal"
          />
        }
      >
        {triggerContent}
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        {list}
      </PopoverContent>
    </Popover>
  )
}

// ─── Multi-select ────────────────────────────────────────────────────────────

interface ResponsiveMultiComboboxProps {
  options: ComboboxOption[]
  value: string[]
  onValueChange: (value: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  drawerTitle?: string
  max?: number
  labelOverrides?: Record<string, string>
}

export function ResponsiveMultiCombobox({
  options,
  value,
  onValueChange,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  emptyText = 'No results found.',
  drawerTitle = 'Select options',
  max = 3,
  labelOverrides = {},
}: ResponsiveMultiComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const isMobile = useIsMobile()

  function displayLabel(o: ComboboxOption) {
    return labelOverrides[o.value] ?? o.label
  }

  function handleToggle(val: string) {
    if (value.includes(val)) {
      onValueChange(value.filter(v => v !== val))
    } else if (value.length < max) {
      onValueChange([...value, val])
    }
  }

  const selectedLabels = value
    .map(v => {
      const o = options.find(opt => opt.value === v)
      return o ? displayLabel(o) : v
    })

  const list = (
    <Command>
      <CommandInput placeholder={searchPlaceholder} />
      <CommandList className="max-h-[300px]">
        <CommandEmpty>{emptyText}</CommandEmpty>
        <CommandGroup>
          {options.map(o => {
            const isSelected = value.includes(o.value)
            const atMax = value.length >= max && !isSelected
            return (
              <CommandItem
                key={o.value}
                value={displayLabel(o)}
                onSelect={() => !atMax && handleToggle(o.value)}
                disabled={atMax}
                className={cn(atMax && 'opacity-50')}
              >
                <span className="flex-1">{displayLabel(o)}</span>
                {isSelected && <Check className="size-4 shrink-0" />}
              </CommandItem>
            )
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  )

  const triggerContent = (
    <>
      {selectedLabels.length > 0 ? (
        <span className="truncate">{selectedLabels.join(', ')}</span>
      ) : (
        <span className="text-muted-foreground">{placeholder}</span>
      )}
      <ChevronsUpDown className="shrink-0 opacity-50" data-icon="inline-end" aria-hidden="true" />
    </>
  )

  if (isMobile) {
    return (
      <>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal min-h-9"
          onClick={() => setOpen(true)}
        >
          {triggerContent}
        </Button>
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{drawerTitle} ({value.length}/{max})</DrawerTitle>
            </DrawerHeader>
            <div className="px-2 pb-4">
              {list}
            </div>
          </DrawerContent>
        </Drawer>
      </>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal min-h-9"
          />
        }
      >
        {triggerContent}
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        {list}
      </PopoverContent>
    </Popover>
  )
}

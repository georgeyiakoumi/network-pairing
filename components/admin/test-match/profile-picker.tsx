'use client'

import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { ChevronsUpDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ProfileDetail } from './types'

export function ProfilePicker({
  profiles,
  selectedId,
  onSelect,
}: {
  profiles: ProfileDetail[]
  selectedId: string
  onSelect: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)

  const categories = useMemo(() => {
    const set = new Set<string>()
    for (const p of profiles) {
      if (p.professionCategory) set.add(p.professionCategory)
    }
    return Array.from(set).sort()
  }, [profiles])

  const filtered = useMemo(() => {
    if (!categoryFilter) return profiles
    return profiles.filter(p => p.professionCategory === categoryFilter)
  }, [profiles, categoryFilter])

  const selectedProfile = profiles.find(p => p.id === selectedId)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          />
        }
      >
        {selectedProfile ? (
          <span className="truncate">
            {selectedProfile.firstName} {selectedProfile.lastName}
            {selectedProfile.professionRole && (
              <span className="text-muted-foreground"> — {selectedProfile.professionRole}</span>
            )}
          </span>
        ) : (
          <span className="text-muted-foreground">Select a profile...</span>
        )}
        <ChevronsUpDown className="shrink-0 opacity-50" data-icon="inline-end" aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search by name or role..." />

          {/* Category filter badges */}
          <div className="flex flex-wrap gap-1 px-2 py-2 border-b border-border">
            <button
              onClick={() => setCategoryFilter(null)}
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors cursor-pointer',
                !categoryFilter
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(prev => prev === cat ? null : cat)}
                className={cn(
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors cursor-pointer',
                  categoryFilter === cat
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <CommandList>
            <CommandEmpty>No profiles found.</CommandEmpty>
            <CommandGroup>
              {filtered.map(p => (
                <CommandItem
                  key={p.id}
                  value={`${p.firstName} ${p.lastName} ${p.professionRole ?? ''} ${p.professionCategory ?? ''}`}
                  onSelect={() => {
                    onSelect(p.id)
                    setOpen(false)
                  }}
                  className="flex items-start gap-3 py-2.5"
                >
                  <Check
                    className={cn('mt-0.5 shrink-0', selectedId === p.id ? 'opacity-100' : 'opacity-0')}
                    aria-hidden="true"
                  />
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-medium">
                      {p.firstName} {p.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {[p.professionRole, p.experienceLabel].filter(Boolean).join(' · ')}
                    </span>
                    {p.secondaryProfessionRole && (
                      <span className="text-xs text-muted-foreground/60">
                        Also: {p.secondaryProfessionRole}
                      </span>
                    )}
                  </div>
                  {p.professionCategory && (
                    <Badge variant="secondary" className="ml-auto shrink-0 text-xs">
                      {p.professionCategory}
                    </Badge>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

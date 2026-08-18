'use client'

import { useState } from 'react'
import { Crown, CircleDot, CircleMinus, Plus } from 'lucide-react'

export type RelationshipType = { id: string; label: string }

interface RelationshipTypeSelectorProps {
  types: RelationshipType[]
  primary: string
  secondary: string[]
  onPrimaryChange: (id: string) => void
  onSecondaryChange: (ids: string[]) => void
}

export function RelationshipTypeSelector({
  types,
  primary,
  secondary,
  onPrimaryChange,
  onSecondaryChange,
}: RelationshipTypeSelectorProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-1.5">
      {types.map(r => {
        const isPrimary = primary === r.id
        const isSecondary = secondary.includes(r.id)
        const isHovered = hoveredId === r.id

        function handleRowClick() {
          if (isPrimary) return
          if (isSecondary) {
            onSecondaryChange(secondary.filter(id => id !== r.id))
            return
          }
          if (!primary) {
            onPrimaryChange(r.id)
          } else {
            onSecondaryChange([...secondary, r.id])
          }
        }

        function handlePromote(e: React.MouseEvent) {
          e.stopPropagation()
          onSecondaryChange([...secondary.filter(id => id !== r.id), primary])
          onPrimaryChange(r.id)
          setHoveredId(null)
        }

        return (
          <div
            key={r.id}
            onMouseEnter={() => setHoveredId(r.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={handleRowClick}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleRowClick() } }}
            className={[
              'relative flex items-center justify-between px-3 py-2.5 rounded-md border text-sm cursor-pointer select-none transition-colors',
              isPrimary
                ? 'border-foreground bg-foreground text-background'
                : isSecondary
                  ? 'border-foreground/30 bg-muted/50 text-foreground'
                  : isHovered
                    ? 'border-border/80 bg-muted/30 text-foreground'
                    : 'border-border text-muted-foreground',
            ].join(' ')}
          >
            {/* Icon + label */}
            <span className="flex items-center gap-2">
              {isPrimary ? (
                <Crown className="size-4 shrink-0 fill-background stroke-background transition-colors" />
              ) : isSecondary && isHovered ? (
                <CircleMinus className="size-4 shrink-0 text-muted-foreground transition-colors" />
              ) : isSecondary ? (
                <CircleDot className="size-4 shrink-0 text-muted-foreground transition-colors" />
              ) : primary ? (
                <CircleDot className={['size-4 shrink-0 transition-colors', isHovered ? 'text-muted-foreground' : 'text-muted-foreground/30'].join(' ')} />
              ) : (
                <Crown className={['size-4 shrink-0 transition-colors', isHovered ? 'text-muted-foreground' : 'text-muted-foreground/30'].join(' ')} />
              )}
              <span className={isPrimary ? 'font-medium' : ''}>{r.label}</span>
            </span>

            {/* Right side — contextual CTA */}
            <span className="absolute right-3 inset-y-0 flex items-center gap-1.5 text-xs">
              {isSecondary && isHovered && (
                <button
                  type="button"
                  onClick={handlePromote}
                  className="flex items-center gap-1 px-2 py-0.5 text-xs text-foreground rounded border border-border bg-popover hover:bg-accent transition-colors"
                >
                  <Crown className="size-3 shrink-0" />
                  Make primary
                </button>
              )}
              {!isPrimary && !isSecondary && isHovered && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Plus className="size-3 shrink-0" />
                  {primary ? 'Open to' : 'Primary'}
                </span>
              )}
            </span>
          </div>
        )
      })}
    </div>
  )
}

'use client'

export function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`size-1.5 rounded-full transition-colors ${i <= current ? 'bg-foreground' : 'bg-muted-foreground/30'}`}
        />
      ))}
    </div>
  )
}

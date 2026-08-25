'use client'

import { useRef, useEffect } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export function TerminalLog({ lines, running, expanded, onToggle }: {
  lines: string[]
  running: boolean
  expanded: boolean
  onToggle: () => void
}) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (expanded) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [lines, expanded])

  return (
    <div className="bg-black overflow-hidden">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-1.5 px-3 py-2 border-b border-border/50 cursor-pointer hover:bg-white/5 transition-colors"
      >
        <span className="text-xs text-white/80 font-mono uppercase tracking-wide">Log</span>
        {running && (
          <span className="text-xs text-emerald-400/60 font-mono animate-pulse">running</span>
        )}
        <span className="ml-auto text-white/30">
          {expanded ? <ChevronDown className="size-3.5" /> : <ChevronUp className="size-3.5" />}
        </span>
      </button>
      {expanded && (
        <div className="p-4 font-mono text-xs leading-relaxed max-h-48 overflow-y-auto">
          {lines.length === 0 && !running ? (
            <div className="text-white/20">Waiting for match run...</div>
          ) : (
            <>
              {lines.map((line, i) => (
                <div key={i} className="text-emerald-400">{line}</div>
              ))}
              {running && (
                <div className="flex items-center gap-1.5 text-white/40 mt-1">
                  <span className="inline-block w-2 h-3.5 bg-white/40 animate-pulse" />
                </div>
              )}
            </>
          )}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  )
}

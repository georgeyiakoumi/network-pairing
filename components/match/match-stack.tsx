'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { X, Handshake, CheckCircle } from 'lucide-react'
import { BAND_LABELS } from '@/components/onboarding/types'
import { SwipeableCard } from '@/components/match/swipeable-card'

// ─── Types ────────────────────────────────────────────────────────────────────

export type MatchCard = {
  matchId: string
  profileId: string
  firstName: string
  lastName: string
  professionRole: string
  professionCategory: string
  experienceBand: number
  offerLabels: string[]
  reason: string
  score: number
}

type PassReason = 'not_relevant' | 'wrong_level' | 'wrong_profession' | 'not_a_fit'

const PASS_REASONS: { value: PassReason; label: string }[] = [
  { value: 'not_relevant', label: 'Not relevant to my goals' },
  { value: 'wrong_level',  label: 'Wrong experience level' },
  { value: 'wrong_profession', label: 'Wrong profession' },
  { value: 'not_a_fit',   label: 'Just not a fit' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

type StrengthTier = { label: string; className: string }

function strengthTier(score: number): StrengthTier {
  if (score >= 70) return { label: 'Strong match', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' }
  if (score >= 45) return { label: 'Good match',   className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' }
  return              { label: 'Fair match',   className: 'bg-muted text-muted-foreground' }
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Handshake />
        </EmptyMedia>
        <EmptyTitle>You&apos;ve seen everyone</EmptyTitle>
        <EmptyDescription>
          Check back later — new alumni join regularly. Your profile is visible to others in the meantime.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

// ─── CardSection ──────────────────────────────────────────────────────────────

function CardSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      {children}
    </div>
  )
}

// ─── Match card ───────────────────────────────────────────────────────────────

function MatchCardView({
  card,
  onConnect,
  onPass,
  connecting,
}: {
  card: MatchCard
  onConnect: () => void
  onPass: () => void
  connecting: boolean
}) {
  const tier = strengthTier(card.score)
  const avatarUrl = `https://api.dicebear.com/9.x/lorelei/svg?seed=${encodeURIComponent(`${card.firstName} ${card.lastName}`)}`
  const initials = `${card.firstName[0]}${card.lastName[0]}`

  return (
    <Card className="w-full max-w-sm relative pt-12 overflow-visible">
      {/* Avatar — centered, overlapping top edge */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2">
        <Avatar className="size-20 ring-4 ring-background">
          <AvatarImage className="bg-background" src={avatarUrl} alt={`${card.firstName} ${card.lastName}`} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </div>

      <CardHeader className="justify-center gap-2">
        <CardTitle className="text-2xl">{card.firstName} {card.lastName}</CardTitle>
        <CardDescription className={`justify-self-center text-xs font-medium px-2.5 py-1 rounded-full ${tier.className}`}>{tier.label}</CardDescription>
      </CardHeader>
      <CardContent className="text-base text-muted-foreground leading-relaxed">
       {card.reason}
      </CardContent>
      <CardFooter className="gap-2">
        <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={onPass}
            disabled={connecting}
          >
            <X data-icon="inline-start" aria-hidden="true" />
            Pass
          </Button>
          <Button
            className="flex-1 gap-2"
            onClick={onConnect}
            disabled={connecting}
          >
            <Handshake data-icon="inline-start" aria-hidden="true" />
            {connecting ? 'Connecting…' : 'Connect'}
          </Button>
      </CardFooter>
    </Card>
  )
}

// ─── Main stack ───────────────────────────────────────────────────────────────

export function MatchStack({ initialCards }: { initialCards: MatchCard[] }) {
  const router = useRouter()
  const [cards] = useState(initialCards)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [connecting, setConnecting] = useState(false)

  // Undo: track whether the last pass can still be undone
  const undoRef = useRef<{ cancelled: boolean }>({ cancelled: false })

  const current = cards[currentIndex] ?? null

  function advance() {
    setCurrentIndex(i => i + 1)
  }

  async function commitPass(card: MatchCard, reason?: PassReason) {
    try {
      const res = await fetch('/api/matches/pass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId: card.matchId, reason }),
      })
      if (!res.ok) {
        toast.error('Failed to record pass. It may reappear later.')
      }
    } catch {
      toast.error('Network error — pass not saved.')
    }
  }

  function handlePass() {
    if (!current) return
    const passed = current
    const undo = { cancelled: false }
    undoRef.current = undo

    // Advance immediately
    advance()

    // Show fully custom toast — gives us control over the title row layout
    const toastId = toast.custom(
      () => (
        <PassToast
          firstName={passed.firstName}
          onSelect={async (reason) => {
            toast.dismiss(toastId)
            if (!undo.cancelled) {
              undo.cancelled = true
              await commitPass(passed, reason)
              toast('Feedback saved — thanks!', { duration: 2000 })
            }
          }}
          onUndo={() => {
            toast.dismiss(toastId)
            undo.cancelled = true
            setCurrentIndex(i => i - 1)
          }}
        />
      ),
      {
        duration: 6000,
        onDismiss: () => {
          if (!undo.cancelled) {
            undo.cancelled = true
            commitPass(passed)
          }
        },
        onAutoClose: () => {
          if (!undo.cancelled) {
            undo.cancelled = true
            commitPass(passed)
          }
        },
      }
    )
  }

  async function handleConnect() {
    if (!current) return
    const connected = current
    setConnecting(true)
    try {
      const res = await fetch('/api/matches/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId: connected.matchId }),
      })
      if (res.ok) {
        advance()
        router.refresh()
        toast.success(`Connected with ${connected.firstName}!`, {
          description: 'View their contact details in your Connections.',
          icon: <CheckCircle className="size-4" />,
          duration: 4000,
        })
      } else {
        toast.error('Failed to connect. Please try again.')
      }
    } catch {
      toast.error('Network error — connection not saved.')
    } finally {
      setConnecting(false)
    }
  }

  if (currentIndex >= cards.length) {
    return <EmptyState />
  }

  return (
    <div className="flex flex-col items-center w-full max-w-sm flex-1">
      <p className="text-xs text-muted-foreground py-2">
        {currentIndex + 1} of {cards.length}
      </p>
      <div className="flex flex-1 items-center">
      <SwipeableCard
        onSwipeLeft={handlePass}
        onSwipeRight={handleConnect}
        disabled={connecting}
      >
        <MatchCardView
          card={current}
          onConnect={handleConnect}
          onPass={handlePass}
          connecting={connecting}
        />
      </SwipeableCard>
      </div>
    </div>
  )
}

// ─── Pass toast — fully custom layout ────────────────────────────────────────

function PassToast({
  firstName,
  onSelect,
  onUndo,
}: {
  firstName: string
  onSelect: (reason: PassReason) => void
  onUndo: () => void
}) {
  return (
    <div className="flex flex-col gap-2 w-full rounded-lg border border-border bg-background px-4 py-3 shadow-lg text-sm">
      <div className="flex items-center justify-between gap-4">
        <span className="font-semibold">Passed on {firstName}</span>
        <button
          onClick={onUndo}
          className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors cursor-pointer shrink-0"
        >
          Undo
        </button>
      </div>
      <p className="text-xs text-muted-foreground">Why did you pass?</p>
      <div className="flex flex-wrap gap-1.5">
        {PASS_REASONS.map(r => (
          <button
            key={r.value}
            onClick={() => onSelect(r.value)}
            className="text-xs px-2.5 py-1 rounded-full border border-border bg-background hover:bg-muted transition-colors cursor-pointer"
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  )
}

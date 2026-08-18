'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Mail } from 'lucide-react'
import { BAND_LABELS } from '@/components/onboarding/types'
import type { MatchBreakdown } from '@/lib/matching/matching-prompt'

export type ConnectionCardProps = {
  firstName: string
  lastName: string
  professionRole: string
  experienceBand: number
  offerLabels: string[]
  matchScore: number
  matchReason: string | null
  matchBreakdown: MatchBreakdown | null
  email: string | null
}

export function ConnectionCard({
  firstName,
  lastName,
  professionRole,
  experienceBand,
  offerLabels,
  matchScore,
  matchReason,
  matchBreakdown,
  email,
}: ConnectionCardProps) {
  const [open, setOpen] = useState(false)
  const seed = encodeURIComponent(`${firstName} ${lastName}`)
  const avatarUrl = `https://api.dicebear.com/9.x/lorelei/svg?seed=${seed}`
  const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()

  const hasBreakdownContent = !!(matchBreakdown || matchReason)

  return (
    <>
    {hasBreakdownContent && (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>We scored this {matchScore}% because…</DialogTitle>
          </DialogHeader>
          {matchBreakdown ? (
            <div className="flex flex-col gap-5">
              <p className="text-sm text-muted-foreground leading-relaxed">{matchBreakdown.summary}</p>

              {matchBreakdown.alignments.length > 0 && (
                <div className="flex flex-col gap-2">
                  {matchBreakdown.alignments.map((a, i) => (
                    <div key={i} className="flex flex-col gap-2 rounded-lg border border-border p-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">You</span>
                          <span className="text-sm font-medium">{a.yourNeed}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{firstName}</span>
                          <span className="text-sm font-medium">{a.theirOffer}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed border-t border-border pt-2">{a.explanation}</p>
                    </div>
                  ))}
                </div>
              )}

              {matchBreakdown.gaps.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">What held it back</p>
                  {matchBreakdown.gaps.map((g, i) => (
                    <div key={i} className="flex flex-col gap-1 rounded-lg border border-border bg-muted/40 p-3">
                      <span className="text-sm font-medium">{g.reason}</span>
                      <p className="text-xs text-muted-foreground leading-relaxed">{g.explanation}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : matchReason ? (
            <p className="text-sm text-muted-foreground leading-relaxed">{matchReason}</p>
          ) : null}
        </DialogContent>
      </Dialog>
    )}
    <Card>
      <CardHeader>
        <Avatar className="size-12">
          <AvatarImage src={avatarUrl} alt={`${firstName} ${lastName}`} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <CardTitle className="text-lg">{firstName} {lastName}</CardTitle>
        <CardDescription className="text-base">{professionRole} · {BAND_LABELS[experienceBand] ?? ''}</CardDescription>
        {email && (
          <CardAction>
            <Button variant="outline" size="sm" nativeButton={false} render={<a href={`mailto:${email}`} />}>
              <Mail data-icon="inline-start" />
              Email
            </Button>
          </CardAction>
        )}
      </CardHeader>

      {matchReason && (
        <CardContent>
          <p className=" text-muted-foreground leading-relaxed">{matchReason}</p>
        </CardContent>
      )}

      {(offerLabels.length > 0 || matchScore) && (
        <CardFooter className="flex flex-wrap items-center gap-1.5">
          {offerLabels.map(label => (
            <Badge key={label} variant="secondary">{label}</Badge>
          ))}
          {matchScore > 0 && hasBreakdownContent && (
            <button
              onClick={() => setOpen(true)}
              className="ml-auto text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
            >
              {matchScore}% match
            </button>
          )}
        </CardFooter>
      )}
    </Card>
    </>
  )
}
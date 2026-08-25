import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { MatchResult, ProfileDetail } from './types'

function scoreVariant(score: number): string {
  if (score >= 70) return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
  if (score >= 40) return 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
  return 'bg-destructive/10 text-destructive'
}


export function MatchResultCard({
  match,
  rank,
  matchProfile,
  selectedProfile,
}: {
  match: MatchResult
  rank: number
  matchProfile: ProfileDetail | undefined
  selectedProfile: ProfileDetail | undefined
}) {
  const firstName = matchProfile?.firstName ?? ''
  const lastName = matchProfile?.lastName ?? ''
  const displayName = matchProfile
    ? `${firstName} ${lastName}`
    : match.profileId
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  const avatarUrl = matchProfile
    ? `https://api.dicebear.com/9.x/lorelei/svg?seed=${encodeURIComponent(`${firstName} ${lastName}`)}`
    : undefined
  const selectedAvatarUrl = selectedProfile
    ? `https://api.dicebear.com/9.x/lorelei/svg?seed=${encodeURIComponent(`${selectedProfile.firstName} ${selectedProfile.lastName}`)}`
    : undefined
  const selectedInitials = selectedProfile
    ? `${selectedProfile.firstName.charAt(0)}${selectedProfile.lastName.charAt(0)}`.toUpperCase()
    : ''

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <Avatar className="size-10 shrink-0">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} />}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-0.5 min-w-0">
              <CardTitle className="text-base">
                {displayName}
              </CardTitle>
              {matchProfile?.professionRole && (
                <CardDescription className="text-sm">
                  {matchProfile.professionCategory ? `${matchProfile.professionCategory} · ` : ''}
                  {matchProfile.professionRole} · {matchProfile.experienceLabel}
                </CardDescription>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-sm font-semibold text-muted-foreground tabular-nums">
              #{rank}
            </span>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-semibold tabular-nums ${scoreVariant(match.score)}`}>
              {match.score}%
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <p className="text-base text-muted-foreground">{match.reason}</p>

        {matchProfile && (matchProfile.offerLabels.length > 0 || matchProfile.seekingNeedLabels.length > 0) && (
          <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-1">
            {matchProfile.offerLabels.length > 0 && (
              <>
                <span>Offers</span>
                {matchProfile.offerLabels.map(l => <Badge key={l} variant="secondary">{l}</Badge>)}
              </>
            )}
            {matchProfile.offerLabels.length > 0 && matchProfile.seekingNeedLabels.length > 0 && (
              <span className="mx-0.5">·</span>
            )}
            {matchProfile.seekingNeedLabels.length > 0 && (
              <>
                <span>Seeks</span>
                {matchProfile.seekingNeedLabels.map(l => <Badge key={l} variant="outline">{l}</Badge>)}
              </>
            )}
          </p>
        )}

        {match.breakdown && (
          <>
            <div className="rounded-xl bg-emerald-500/5 overflow-hidden border border-emerald-500/10">
              <div className="px-3 pt-3 pb-2">
                <p className="text-xs font-medium text-emerald-600/60 dark:text-emerald-400/60 uppercase tracking-wide">Alignments</p>
              </div>
              {match.breakdown.alignments.map((a, j) => (
                <div key={j}>
                  {j > 0 && <Separator className="bg-emerald-500/10" />}
                  <div className="flex flex-col p-3 gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge className="bg-blue-500/10 text-blue-600 border border-blue-500/20 dark:text-blue-400 gap-1.5">
                        <Avatar className="size-4 shrink-0">
                          {selectedAvatarUrl && <AvatarImage src={selectedAvatarUrl} alt="" />}
                          <AvatarFallback className="text-[8px]">{selectedInitials}</AvatarFallback>
                        </Avatar>
                        {a.yourNeed}
                      </Badge>
                      <span className="text-muted-foreground text-sm">↔</span>
                      <Badge variant="outline">{a.theirOffer}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground px-1">{a.explanation}</p>
                  </div>
                </div>
              ))}
            </div>

            {match.breakdown.gaps.length > 0 && (
              <div className="rounded-xl bg-destructive/5 overflow-hidden">
                <div className="px-3 pt-3 pb-2">
                  <p className="text-xs font-medium text-destructive/60 uppercase tracking-wide">Gaps</p>
                </div>
                {match.breakdown.gaps.map((g, j) => (
                  <div key={j}>
                    {j > 0 && <Separator className="bg-destructive/10" />}
                    <div className="flex flex-col p-3 gap-1">
                      <span className="text-sm font-medium text-destructive/80">{g.reason}</span>
                      <p className="text-sm text-muted-foreground">{g.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

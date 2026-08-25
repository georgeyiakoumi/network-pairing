import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { ProfileDetail } from './types'

export function ProfileCard({ profile }: { profile: ProfileDetail }) {
  const profession = [profile.professionCategory, profile.professionRole].filter(Boolean).join(' · ')
  const initials = `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase()
  const avatarUrl = `https://api.dicebear.com/9.x/lorelei/svg?seed=${encodeURIComponent(`${profile.firstName} ${profile.lastName}`)}`

  return (
    <Card className="border-blue-500/20 bg-blue-500/5">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="size-10 shrink-0 mt-0.5">
            <AvatarImage src={avatarUrl} alt={`${profile.firstName} ${profile.lastName}`} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5 min-w-0">
            <CardTitle className="text-base">{profile.firstName} {profile.lastName}</CardTitle>
            {profession && (
              <CardDescription className="text-sm">{profession} · {profile.experienceLabel}</CardDescription>
            )}
            {profile.secondaryProfessionRole && (
              <CardDescription className="text-xs">
                Also: {profile.secondaryProfessionRole}
                {profile.secondaryExperienceLabel ? ` · ${profile.secondaryExperienceLabel}` : ''}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pt-0">
        <Separator />
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Offers</p>
            {profile.offerLabels.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {profile.offerLabels.map(l => (
                  <Badge key={l} variant="secondary">{l}</Badge>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground">None</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Seeking</p>
            {profile.seekingNeedLabels.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {profile.seekingNeedLabels.map(l => (
                  <Badge key={l} variant="outline">{l}</Badge>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground">None</p>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Relationship</p>
            <p className="text-sm">{profile.seekingRelationshipPrimary}</p>
            {profile.seekingRelationshipSecondary.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Also open to: {profile.seekingRelationshipSecondary.join(', ')}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            {profile.seekingProfessionRole && (
              <>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Seeking profession</p>
                <p className="text-sm">{profile.seekingProfessionRole}</p>
              </>
            )}
            {profile.seekingGoal && (
              <>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mt-1">Goal</p>
                <p className="text-sm">{profile.seekingGoal}</p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

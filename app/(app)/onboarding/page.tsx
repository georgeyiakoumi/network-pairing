'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export default function OnboardingPage() {
  const router = useRouter()

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4 min-h-screen">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="text-center flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Build your profile</h1>
          <p className="text-sm text-muted-foreground">
            Tell us who you are and what you&apos;re looking for so we can find your best matches.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Card
            className="cursor-pointer border-2 hover:border-primary transition-colors"
            onClick={() => router.push('/onboarding/direct')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base">I know what I need</CardTitle>
              <CardDescription className="text-sm">
                Select your profession, experience, and what you&apos;re looking for directly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => router.push('/onboarding/direct')}>
                Get started
              </Button>
            </CardContent>
          </Card>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">or</span>
            <Separator className="flex-1" />
          </div>

          <Card
            className="cursor-pointer border-2 hover:border-primary transition-colors"
            onClick={() => router.push('/onboarding/guided')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Help me figure it out</CardTitle>
              <CardDescription className="text-sm">
                Tell us about your goals and our AI will suggest the right connections for you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" onClick={() => router.push('/onboarding/guided')}>
                Start guided setup
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

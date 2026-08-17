'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface OnboardingStepProps {
  title: string
  description?: string
  children: React.ReactNode
}

export function OnboardingStep({ title, description, children }: OnboardingStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {children}
      </CardContent>
    </Card>
  )
}

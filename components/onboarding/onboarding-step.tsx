'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface OnboardingStepProps {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
}

export function OnboardingStep({ title, description, action, children }: OnboardingStepProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-lg">{title}</CardTitle>
          {action}
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {children}
      </CardContent>
    </Card>
  )
}

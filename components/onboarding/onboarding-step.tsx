'use client'

interface OnboardingStepProps {
  title: string
  children: React.ReactNode
}

export function OnboardingStep({ title, children }: OnboardingStepProps) {
  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="flex flex-col gap-6">
        {children}
      </div>
    </section>
  )
}
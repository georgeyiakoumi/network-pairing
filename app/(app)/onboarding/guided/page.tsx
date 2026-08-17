'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Send, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type Message = { role: 'user' | 'assistant'; content: string }

type StructuredData = {
  primary_profession_id: string
  primary_experience: number
  secondary_profession_id: string | null
  secondary_experience: number | null
  offer_ids: string[]
  need_ids: string[]
  location_id: string | null
  confidence: string
  missing_fields: string[]
  primary_profession: { id: string; category: string; role: string } | null
  secondary_profession: { id: string; category: string; role: string } | null
  offers: { id: string; label: string }[]
  needs: { id: string; label: string }[]
  location: { id: string; label: string } | null
}

const EXPERIENCE_LABEL: Record<number, string> = {
  1: 'Student / Graduate (0–1 yr)',
  2: 'Early career (1–3 yrs)',
  3: 'Mid-level (3–5 yrs)',
  4: 'Senior (5–10 yrs)',
  5: 'Expert / Executive (10+ yrs)',
}

const OPENING_MESSAGE =
  "Hi! I'm here to help you build your alumni profile. Tell me — what do you do professionally, and roughly how experienced are you?"

export default function GuidedOnboardingPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: OPENING_MESSAGE },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [structuredData, setStructuredData] = useState<StructuredData | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, structuredData])

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return

    const next: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })

      if (!res.ok) throw new Error('Request failed')

      const data = await res.json() as {
        message: string
        structuredData: StructuredData | null
        stop_reason: string
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
      if (data.structuredData) {
        setStructuredData(data.structuredData)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  async function confirmAndSave() {
    if (!structuredData) return
    setSaving(true)
    setError(null)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: user.id,
        primary_profession_id: structuredData.primary_profession_id,
        primary_experience: structuredData.primary_experience,
        secondary_profession_id: structuredData.secondary_profession_id ?? null,
        secondary_experience: structuredData.secondary_experience ?? null,
        location_id: structuredData.location_id ?? null,
        intake_method: 'guided',
        intake_transcript: messages,
      })
      .select('id')
      .single()

    if (profileError || !profile) {
      setError('Something went wrong saving your profile. Please try again.')
      setSaving(false)
      return
    }

    await Promise.all([
      structuredData.offer_ids.length > 0
        ? supabase.from('profile_offers').insert(
            structuredData.offer_ids.map(id => ({ profile_id: profile.id, offer_id: id }))
          )
        : Promise.resolve(),
      structuredData.need_ids.length > 0
        ? supabase.from('profile_needs').insert(
            structuredData.need_ids.map(id => ({ profile_id: profile.id, need_id: id }))
          )
        : Promise.resolve(),
    ])

    router.push('/match')
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4 min-h-screen">
      <div className="w-full max-w-sm flex flex-col gap-4">

        {/* Chat window */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Let&apos;s figure it out together</CardTitle>
            <CardDescription>Answer a few questions and we&apos;ll build your profile.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm max-w-[85%]',
                  m.role === 'assistant'
                    ? 'bg-muted text-foreground self-start'
                    : 'bg-primary text-primary-foreground self-end'
                )}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="bg-muted text-muted-foreground rounded-lg px-3 py-2 text-sm self-start">
                Thinking…
              </div>
            )}
            <div ref={bottomRef} />
          </CardContent>
          {!structuredData && (
            <CardFooter className="pt-3 border-t flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Type your reply…"
                disabled={loading}
                className="flex-1"
              />
              <Button size="icon" onClick={sendMessage} disabled={loading || !input.trim()}>
                <Send className="size-4" />
              </Button>
            </CardFooter>
          )}
        </Card>

        {/* Structured data confirmation card */}
        {structuredData && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="size-5 text-primary" />
                <CardTitle className="text-base">Here&apos;s what we captured</CardTitle>
              </div>
              <CardDescription>Review your profile before saving.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              {structuredData.primary_profession && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground font-medium">Primary profession</span>
                  <span>{structuredData.primary_profession.role} — {EXPERIENCE_LABEL[structuredData.primary_experience]}</span>
                </div>
              )}
              {structuredData.secondary_profession && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground font-medium">Secondary profession</span>
                  <span>
                    {structuredData.secondary_profession.role}
                    {structuredData.secondary_experience ? ` — ${EXPERIENCE_LABEL[structuredData.secondary_experience]}` : ''}
                  </span>
                </div>
              )}
              {structuredData.location && (
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground font-medium">Location</span>
                  <span>{structuredData.location.label}</span>
                </div>
              )}
              {structuredData.offers.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-muted-foreground font-medium">What I offer</span>
                  <div className="flex flex-wrap gap-1.5">
                    {structuredData.offers.map(o => (
                      <Badge key={o.id} variant="secondary">{o.label}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {structuredData.needs.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-muted-foreground font-medium">What I need</span>
                  <div className="flex flex-wrap gap-1.5">
                    {structuredData.needs.map(n => (
                      <Badge key={n.id} variant="outline">{n.label}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {structuredData.missing_fields.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Couldn&apos;t determine: {structuredData.missing_fields.join(', ')}. You can update these in your profile later.
                </p>
              )}
              {error && <p className="text-sm text-destructive">{error}</p>}
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button className="w-full" onClick={confirmAndSave} disabled={saving}>
                {saving ? 'Saving…' : 'Looks good — save profile'}
              </Button>
              <Button
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={() => {
                  setStructuredData(null)
                  setMessages(prev => [
                    ...prev,
                    { role: 'assistant', content: "No worries — let me ask a few more questions to get a better picture." },
                  ])
                  setTimeout(() => inputRef.current?.focus(), 50)
                }}
              >
                Something&apos;s off — let&apos;s adjust
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}

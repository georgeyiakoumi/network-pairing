'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SeekingData } from '@/app/api/intake/seeking/route'

type ChatMessage = { role: 'user' | 'assistant'; content: string }

const OPENING_MESSAGE = "What's going on for you right now — what are you working on or trying to figure out?"

interface SeekingAssistantSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApply: (data: SeekingData) => void
}

export function SeekingAssistantSheet({ open, onOpenChange, onApply }: SeekingAssistantSheetProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: OPENING_MESSAGE },
  ])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Focus input when sheet opens
  useEffect(() => {
    if (!open) return
    const id = setTimeout(() => inputRef.current?.focus(), 100)
    return () => clearTimeout(id)
  }, [open])

  // Scroll to bottom when messages or streaming content change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  // Re-focus after streaming
  useEffect(() => {
    if (streaming) return
    const id = setTimeout(() => inputRef.current?.focus(), 50)
    return () => clearTimeout(id)
  }, [streaming])

  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || streaming) return

    const next: ChatMessage[] = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setInput('')
    setStreaming(true)
    setStreamingText('')

    try {
      const res = await fetch('/api/intake/seeking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })

      if (!res.ok || !res.body) throw new Error('Request failed')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let accumulated = ''
      let gotData = false

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (raw === '[DONE]') break

          let event: { type: string; text?: string; data?: SeekingData; error?: string }
          try { event = JSON.parse(raw) } catch { continue }

          if (event.type === 'text' && event.text) {
            accumulated += event.text
            setStreamingText(accumulated)
          } else if (event.type === 'seeking_data' && event.data) {
            gotData = true
            const finalText = accumulated.trim()
            if (finalText) {
              setMessages(prev => [...prev, { role: 'assistant', content: finalText }])
            }
            setStreamingText('')
            // Brief pause so the user sees the final message before the sheet closes
            setTimeout(() => {
              onApply(event.data!)
              onOpenChange(false)
            }, 800)
          } else if (event.type === 'validation_error') {
            const retryText = accumulated.trim() || "Let me ask a couple more things to make sure I get this right."
            setMessages(prev => [...prev, { role: 'assistant', content: retryText }])
            setStreamingText('')
          }
        }
      }

      if (accumulated.trim() && !gotData) {
        setMessages(prev => [...prev, { role: 'assistant', content: accumulated.trim() }])
        setStreamingText('')
      }
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: "Sorry, something went wrong. Please try again." },
      ])
      setStreamingText('')
    } finally {
      setStreaming(false)
    }
  }, [input, messages, streaming, onApply, onOpenChange])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col p-0 w-full sm:max-w-sm gap-0">
        <SheetHeader className="shrink-0 border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="size-3.5 text-primary" />
            </div>
            <SheetTitle className="text-sm font-medium">Help me figure it out</SheetTitle>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="flex flex-col gap-4 px-4 py-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  'rounded-2xl px-3.5 py-2.5 text-sm max-w-[88%]',
                  m.role === 'assistant'
                    ? 'rounded-tl-sm bg-muted text-foreground self-start'
                    : 'rounded-tr-sm bg-primary text-primary-foreground self-end ml-auto'
                )}
              >
                {m.content}
              </div>
            ))}

            {/* Live streaming bubble */}
            {streamingText && (
              <div className="rounded-2xl rounded-tl-sm bg-muted px-3.5 py-2.5 text-sm text-foreground max-w-[88%] self-start">
                {streamingText}
              </div>
            )}

            {/* Typing indicator */}
            {streaming && !streamingText && (
              <div className="rounded-2xl rounded-tl-sm bg-muted px-3.5 py-2.5 self-start">
                <span className="flex gap-1 items-center h-4">
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </span>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        <div className="shrink-0 border-t px-4 py-3">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Type your reply…"
              disabled={streaming}
              className="flex-1"
            />
            <Button
              size="icon"
              onClick={sendMessage}
              disabled={streaming || !input.trim()}
              aria-label="Send"
            >
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

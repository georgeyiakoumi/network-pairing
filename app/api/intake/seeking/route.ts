import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { SEEKING_SYSTEM_PROMPT } from '@/lib/onboarding/seeking-system-prompt'
import { RELATIONSHIP_TYPES, SEEKING_NEEDS_OPTIONS, GOALS } from '@/components/onboarding/types'

type Message = { role: 'user' | 'assistant'; content: string }

export type SeekingData = {
  seekingRelationshipPrimary: string
  seekingRelationshipSecondary: string[]
  seekingProfessionId: string | null
  seekingSpecificNeedIds: string[]
  seekingGoal: string | null
}

const SIGNAL = 'SEEKING_DATA:'

const VALID_RELATIONSHIPS = RELATIONSHIP_TYPES.map(r => r.id)
const VALID_NEEDS = SEEKING_NEEDS_OPTIONS.map(n => n.id)
const VALID_GOALS = GOALS.map(g => g.id)

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { messages }: { messages: Message[] } = await request.json()

  const client = new Anthropic()

  const stream = await client.messages.stream({
    model: 'claude-haiku-4-5',
    max_tokens: 512,
    system: SEEKING_SYSTEM_PROMPT,
    messages,
  })

  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      let fullText = ''

      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          fullText += event.delta.text

          const signalIndex = fullText.indexOf(SIGNAL)
          if (signalIndex === -1) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'text', text: event.delta.text })}\n\n`)
            )
          }
        }
      }

      // Extract and validate structured data
      const signalIndex = fullText.indexOf(SIGNAL)
      if (signalIndex !== -1) {
        const jsonStr = fullText.slice(signalIndex + SIGNAL.length).trim()
        try {
          const raw = JSON.parse(jsonStr)
          const validated = validateSeekingData(raw)
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'seeking_data', data: validated })}\n\n`)
          )
        } catch (err) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'validation_error', error: String(err) })}\n\n`)
          )
        }
      }

      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      controller.close()
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

function validateSeekingData(raw: Record<string, unknown>): SeekingData {
  function requireString(val: unknown, field: string): string {
    if (typeof val !== 'string' || !val.trim()) throw new Error(`Missing required field: ${field}`)
    return val.trim()
  }

  const seekingRelationshipPrimary = requireString(raw.seekingRelationshipPrimary, 'seekingRelationshipPrimary')
  if (!VALID_RELATIONSHIPS.includes(seekingRelationshipPrimary)) {
    throw new Error(`Invalid seekingRelationshipPrimary: ${seekingRelationshipPrimary}`)
  }

  const seekingRelationshipSecondary = Array.isArray(raw.seekingRelationshipSecondary)
    ? (raw.seekingRelationshipSecondary as string[]).filter(r => VALID_RELATIONSHIPS.includes(r))
    : []

  const seekingProfessionId = raw.seekingProfessionId
    ? requireString(raw.seekingProfessionId, 'seekingProfessionId')
    : null

  const seekingSpecificNeedIds = raw.seekingSpecificNeedIds
  if (!Array.isArray(seekingSpecificNeedIds) || seekingSpecificNeedIds.length === 0 || seekingSpecificNeedIds.length > 3) {
    throw new Error(`seekingSpecificNeedIds must be an array of 1–3 items`)
  }
  const invalidNeeds = (seekingSpecificNeedIds as string[]).filter(n => !VALID_NEEDS.includes(n))
  if (invalidNeeds.length > 0) throw new Error(`Invalid seekingSpecificNeedIds: ${invalidNeeds.join(', ')}`)

  const seekingGoal = raw.seekingGoal
    ? (VALID_GOALS.includes(raw.seekingGoal as string) ? (raw.seekingGoal as string) : null)
    : null

  return {
    seekingRelationshipPrimary,
    seekingRelationshipSecondary,
    seekingProfessionId,
    seekingSpecificNeedIds: seekingSpecificNeedIds as string[],
    seekingGoal,
  }
}

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Lookup data types
type Profession = { id: string; category: string; role: string }

type Message = { role: 'user' | 'assistant'; content: string }

export async function POST(request: NextRequest) {
  // Verify authenticated user
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { messages }: { messages: Message[] } = body

  // Fetch lookup tables to build the taxonomy context
  const [
    { data: professions },
    { data: offers },
    { data: needs },
    { data: locations },
  ] = await Promise.all([
    supabase.from('professions').select('id, category, role').eq('active', true).order('category').order('sort_order'),
    supabase.from('offers').select('id, label').eq('active', true).order('sort_order'),
    supabase.from('needs').select('id, label').eq('active', true).order('sort_order'),
    supabase.from('locations').select('id, label').eq('active', true).order('sort_order'),
  ])

  // Build taxonomy strings for the system prompt
  const professionTaxonomy = buildProfessionTaxonomy(professions ?? [])
  const offerLabels = (offers ?? []).map(o => `"${o.label}"`).join(', ')
  const needLabels = (needs ?? []).map(n => `"${n.label}"`).join(', ')
  const locationLabels = (locations ?? []).map(l => `"${l.label}"`).join(', ')

  const systemPrompt = `You are a warm, concise intake assistant for a South African university alumni networking platform. Your job is to have a short conversation with alumni to understand what they're looking for, then translate that into structured profile fields.

You have exactly 3–4 turns to gather what you need. Do not extend the conversation beyond that.

AVAILABLE TAXONOMY (you must map responses to these exact values):

PROFESSIONS (by category):
${professionTaxonomy}

WHAT I OFFER options: ${offerLabels}

WHAT I NEED options: ${needLabels}

LOCATIONS: ${locationLabels}

EXPERIENCE BANDS:
1 = Student / Graduate (0–1 yr)
2 = Early career (1–3 yrs)
3 = Mid-level (3–5 yrs)
4 = Senior (5–10 yrs)
5 = Expert / Executive (10+ yrs)

CONVERSATION FLOW:
- Turn 1: Ask what they do professionally and how experienced they are
- Turn 2: Ask what they're looking for from the network (what they need)
- Turn 3: Ask what they can offer to other alumni
- Turn 4 (if needed): Any clarification, then ALWAYS end with the JSON block

ENDING THE CONVERSATION:
When you have enough information, end your final message with a JSON block in this exact format (no markdown fences, just raw JSON on its own line at the end of your message):

STRUCTURED_DATA:{"primary_profession_id":"<id from taxonomy>","primary_experience":<1-5>,"secondary_profession_id":"<id or null>","secondary_experience":<1-5 or null>,"offer_ids":["<id>"],"need_ids":["<id>"],"location_id":"<id or null>","confidence":"high"|"medium"|"low","missing_fields":["field names you couldn't determine"]}

Rules for the JSON:
- offer_ids and need_ids: select 1–3 each from the taxonomy IDs
- Only include fields you're reasonably confident about
- Set confidence to "low" if the user was vague
- List any fields you couldn't map in missing_fields

TONE: Friendly, brief, professional. South African context. Never mention the JSON to the user.`

  const client = new Anthropic()

  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 512,
    system: systemPrompt,
    messages: messages.map(m => ({ role: m.role, content: m.content })),
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  // Check if this message contains the structured data signal
  const structuredDataIndex = text.indexOf('STRUCTURED_DATA:')
  let structuredData = null
  let displayText = text

  if (structuredDataIndex !== -1) {
    const jsonStr = text.slice(structuredDataIndex + 'STRUCTURED_DATA:'.length).trim()
    displayText = text.slice(0, structuredDataIndex).trim()
    try {
      const raw = JSON.parse(jsonStr) as {
        primary_profession_id: string
        primary_experience: number
        secondary_profession_id: string | null
        secondary_experience: number | null
        offer_ids: string[]
        need_ids: string[]
        location_id: string | null
        confidence: string
        missing_fields: string[]
      }
      // Enrich with labels for confirmation UI
      structuredData = {
        ...raw,
        primary_profession: professions?.find(p => p.id === raw.primary_profession_id) ?? null,
        secondary_profession: raw.secondary_profession_id
          ? professions?.find(p => p.id === raw.secondary_profession_id) ?? null
          : null,
        offers: (offers ?? []).filter(o => raw.offer_ids.includes(o.id)),
        needs: (needs ?? []).filter(n => raw.need_ids.includes(n.id)),
        location: raw.location_id ? locations?.find(l => l.id === raw.location_id) ?? null : null,
      }
    } catch {
      // JSON parse failed — surface as normal message, user can retry
    }
  }

  return NextResponse.json({
    message: displayText,
    structuredData,
    stop_reason: response.stop_reason,
  })
}

function buildProfessionTaxonomy(professions: Profession[]): string {
  const byCategory: Record<string, Profession[]> = {}
  for (const p of professions) {
    if (!byCategory[p.category]) byCategory[p.category] = []
    byCategory[p.category].push(p)
  }
  return Object.entries(byCategory)
    .map(([cat, profs]) =>
      `${cat}:\n` + profs.map(p => `  - ${p.role} (id: ${p.id})`).join('\n')
    )
    .join('\n\n')
}

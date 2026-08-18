#!/usr/bin/env tsx
/**
 * Matching engine test harness — GEO-832
 *
 * Loads real profiles from Supabase, runs the matching engine against
 * 10 varied test subjects, and prints scored results for manual rating.
 *
 * Run: npx tsx scripts/test-matching.ts
 * Run single profile: npx tsx scripts/test-matching.ts --email seed.sipho.dlamini@demo.networkpairing.co.za
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { runMatching } from '../lib/matching/run-matching'
import { DbProfile, PROFILE_SELECT, toRequestingProfile, toCandidateProfile } from '../lib/matching/db'

// ─── Load env ────────────────────────────────────────────────────────────────

function loadEnv() {
  try {
    const raw = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8')
    for (const line of raw.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      const val = trimmed.slice(eq + 1).trim()
      if (!process.env[key]) process.env[key] = val
    }
  } catch { /* rely on env vars */ }
}

loadEnv()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ─── Fetch profiles from Supabase ────────────────────────────────────────────

async function fetchAllProfiles(): Promise<DbProfile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_SELECT)

  if (error) throw new Error(`Failed to fetch profiles: ${error.message}`)
  return (data ?? []) as unknown as DbProfile[]
}

// ─── Test subjects — 10 varied profiles ──────────────────────────────────────
// These are chosen to cover different archetypes in the seed data.

const TEST_SUBJECTS = [
  'seed.sipho.dlamini@demo.networkpairing.co.za',        // Founder/CEO, JHB, wants investor
  'seed.lungelo.zulu@demo.networkpairing.co.za',         // Junior full-stack dev, wants mentor
  'seed.zanele.mthembu@demo.networkpairing.co.za',       // CTO, wants advisor + co-founder
  'seed.lebo.radebe@demo.networkpairing.co.za',          // Senior investment analyst, wants connector
  'seed.khanya.ndlovu@demo.networkpairing.co.za',        // Junior product designer, wants mentor
  'seed.nokwanda.gumede@demo.networkpairing.co.za',      // Doctor + health tech, wants investor
  'seed.tumelo.motsepe@demo.networkpairing.co.za',       // Renewable energy engineer, wants investor
  'seed.danielle.pretorius@demo.networkpairing.co.za',   // Senior full-stack + CTO, wants co-founder
  'seed.amara.osei@demo.networkpairing.co.za',           // Founder in Ghana, wants investor
  'seed.stefan.muller@demo.networkpairing.co.za',        // Data scientist + ML, wants co-founder
]

// ─── Run ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2)
  const singleEmail = args.includes('--email') ? args[args.indexOf('--email') + 1] : null

  console.log('Fetching profiles from Supabase…')
  const allDbProfiles = await fetchAllProfiles()
  console.log(`Loaded ${allDbProfiles.length} profiles.\n`)

  // Build a lookup: email → profile (via auth users)
  // Since we don't have emails in profiles table, we match by name slug
  const emailToProfile = new Map<string, DbProfile>()
  for (const p of allDbProfiles) {
    const slug = (s: string) => s.toLowerCase()
      .replace(/[äáà]/g, 'a').replace(/[ëéè]/g, 'e').replace(/[ïíì]/g, 'i')
      .replace(/[öóò]/g, 'o').replace(/[üúù]/g, 'u').replace(/ñ/g, 'n')
      .replace(/ß/g, 'ss').replace(/[^a-z0-9]/g, '')
    const email = `seed.${slug(p.first_name)}.${slug(p.last_name)}@demo.networkpairing.co.za`
    emailToProfile.set(email, p)
  }

  const subjects = singleEmail ? [singleEmail] : TEST_SUBJECTS
  let passed = 0

  for (const email of subjects) {
    const subjectDb = emailToProfile.get(email)
    if (!subjectDb) {
      console.warn(`[skip] ${email} — not found in DB\n`)
      continue
    }

    const requesting = toRequestingProfile(subjectDb)
    const candidates = allDbProfiles
      .filter(p => p.id !== subjectDb.id)
      .map(toCandidateProfile)

    console.log(`━━━ ${requesting.firstName} ${requesting.lastName} ━━━`)
    console.log(`    ${requesting.professionRole} (band ${requesting.experienceBand}) · ${requesting.professionCategory}`)
    console.log(`    Offers: ${requesting.offerLabels.join(', ') || 'none'}`)
    console.log(`    Seeking: ${requesting.seekingRelationshipPrimary} · needs: ${requesting.seekingNeedLabels.join(', ')}`)
    if (requesting.seekingGoal) console.log(`    Goal: ${requesting.seekingGoal}`)
    console.log(`    Running against ${candidates.length} candidates…\n`)

    const result = await runMatching(requesting, candidates)

    if (!result.success) {
      console.error(`    [FAIL] ${result.error}\n`)
      continue
    }

    const top10 = result.matches.slice(0, 10)
    top10.forEach((m, i) => {
      const candidate = allDbProfiles.find(p => p.id === m.profileId)
      const name = candidate ? `${candidate.first_name} ${candidate.last_name}` : m.profileId
      const role = candidate?.professions?.role ?? '?'
      const band = candidate?.primary_experience ?? '?'
      console.log(`    ${i + 1}. [${m.score}] ${name} — ${role} (band ${band})`)
      console.log(`       "${m.reason}"`)
    })
    console.log()
    passed++
  }

  console.log(`━━━ Done. ${passed}/${subjects.length} test subjects ran successfully. ━━━`)
  console.log('\nRate each set of results 1–10 for match quality. Target: 7+/10 average.')
}

main().catch(err => {
  console.error('Unexpected error:', err)
  process.exit(1)
})

#!/usr/bin/env tsx
/**
 * Seed script — 75 realistic alumni profiles for demo matching.
 * Run: npx tsx scripts/seed.ts
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local (to bypass RLS and create auth users).
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

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
  } catch {
    // .env.local not found — rely on environment variables being set directly
  }
}

loadEnv()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ─── Lookup IDs (from DB as of 2026-08-18) ───────────────────────────────────

const LOCATIONS = {
  // South Africa (weighted heavily for a SA university network)
  capeTown:       '60414c6a-372f-41cf-9b08-eb8196009560',
  johannesburg:   '212c9a7e-c7b3-447c-a73f-99abffffa120',
  pretoria:       '344c65b8-e7d3-4f7e-9b1a-c718b5b12c11',
  durban:         '1de4ffae-c2f4-45b4-bca0-00f51a091588',
  gqeberha:       '0da78b35-8fdd-442f-b6e6-eeaabce2fbbb',
  bloemfontein:   '4fa99348-b3b0-4676-af2e-4b0907bd2198',
  eastLondon:     'df5eac08-bf8a-4f9e-a7be-344bee46b228',
  stellenbosch:   '3249aedb-c18b-4f28-94fb-40d68a6ad24b',
  // Africa diaspora
  kenya:          '3eeb2b5d-6527-4299-a27e-b65ba52d65c6',
  nigeria:        '5978248b-83fd-43cd-8575-a1f6a2dc30cc',
  ghana:          '8dc29a95-1a4e-4ad2-8c4c-ab960ac3c85c',
  rwanda:         '350c9342-7112-4682-a210-e27e4aa1c26c',
  mauritius:      'fb6d9c6b-998f-4d67-b4b8-6f370bfdc6c6',
  // International
  uk:             'a60f3b6f-49de-4cf0-8ff2-affff26c59b5',
  germany:        '96bc9919-d503-4c98-8c19-e3d5f7470e7a',
  netherlands:    '11c11b48-9fb0-4177-a776-2365ba1fe6a8',
  dubai:          'c149db43-6846-4043-82b6-acd471614e22',
  california:     '0d619512-915e-4f40-a5a9-2bf001c5b571',
  newYork:        'eed314e4-fafe-4de2-99b2-b0b36fe020ac',
  singapore:      '963888fe-30ef-4474-ac01-72242143c993',
  australia:      'ccb5bc0c-0c2c-40af-b4df-47c70233a5df',
  canada:         '3bda3e87-ef75-42e8-9d01-e2a32ed47da9',
}

const PROFESSIONS = {
  // AgriTech & Food
  agricultScientist:    'a219d611-1425-4169-8ad1-ee3b1af7bf82',
  agriTechSpec:         '3e0fb8e9-ecda-4acc-9d0b-b74495cfd2c6',
  // Business & Entrepreneurship
  founderCEO:           'c4281881-48c7-4649-9b92-65463c44e797',
  coFounder:            '39779239-9c17-4195-8147-dff14b7c75d0',
  bizDev:               '7c23bee5-6589-42bf-8fa7-5e3ea8524c93',
  sales:                '23d2f86e-f37c-4de6-98af-e4e77fec7715',
  socialEntrepreneur:   '8c623c04-441a-4165-ae4a-e24d56560f05',
  // Design & Creative
  productDesigner:      'be5ec9af-f872-44a5-af93-c523d2618e36',
  uxResearcher:         'a912d01e-bbd3-43a3-a59e-9f2368f81b03',
  brandDesigner:        '261a782a-243e-4a05-9def-cc087c53739a',
  creativeDirector:     '5451896d-76d9-4371-a220-496a3d77865e',
  contentCreator:       '1fd17615-f947-4d88-bfc5-04687fe53151',
  // Education & EdTech
  educator:             'bf10bccc-1fa8-4242-9c29-9d02a4ca5483',
  edTechSpec:           'ccbe7452-f7ef-4616-a248-c03719a09d05',
  academic:             '2dad81e4-32a1-45be-8105-2420e17e782c',
  // Energy & Climate
  renewableEng:         'ce20cbe2-a1ce-448b-b39f-aebc160fab4d',
  sustainabilitySpec:   '3b2aeac7-346a-4068-b3ff-818d47371cee',
  climatePolicy:        '985d4616-729b-438c-ac38-22655a0e2942',
  // Engineering & Technology
  frontendDev:          'cce56ee0-6c80-4e50-8686-5c749ab70e16',
  backendDev:           '2b28ad4c-f974-4a95-9cd0-1ca2e752af67',
  fullStackDev:         '5f3b2c37-6a79-4d10-bbc9-5c1a1334de8f',
  mobileDev:            '8b7f4d99-c7ce-4ea6-ae5f-f3175079024f',
  devOps:               '74274ee8-31d8-4c02-88a4-44eb1478e694',
  dataScientist:        '42b40b00-cada-4aed-bce8-114a736e724a',
  mlEngineer:           'faf9ece9-2a1d-4b66-8a36-980b7cd59151',
  cybersecurity:        '73c52725-f638-4ca7-9a3d-0b0dc5b08f9d',
  ctoTechLead:          '49baa1eb-af90-4129-b7e0-201d82d7d4e3',
  // Finance & FinTech
  financialAnalyst:     'e9f59efe-ab46-4b0d-9cd0-76d59c2a14c2',
  cfo:                  '2553e364-bda6-4b8f-8052-89ae29adaca7',
  investmentAnalyst:    'bc1aea01-0090-438d-a6bc-51603eb45894',
  finTechSpec:          'ccc7c889-91fb-489b-b04c-fea6c5b544d0',
  actuary:              'a690dfca-6d87-4a47-badb-5e6457bb20be',
  // Healthcare
  doctor:               '52879a3c-7d0f-4f4f-a9d4-c79e61589091',
  healthTech:           '5a01ff47-2879-49db-8810-98afd19eade7',
  publicHealth:         '4936ebc5-dd78-4d99-bef5-39ffda0f185e',
  // Legal
  lawyer:               'ab504f81-b5e6-4d21-bf4f-cb28ad1efacf',
  // Marketing & Growth
  marketingMgr:         'e609befa-8afd-4eee-8af5-c44313cee0a2',
  growthMarketer:       '3b787ef2-110a-4e76-9238-988c71682533',
  brandStrategist:      '15849ee8-f322-4443-8a2c-a905966fad46',
  // Product & Strategy
  productMgr:           'd4649892-ee6a-4a1b-ade6-1719be471445',
  strategyConsultant:   'bf300e2d-076b-40af-a86b-79dd60920e5f',
  operationsMgr:        '24df1ec5-53ae-423d-9b72-2369663a4156',
  // Public Sector & NGO
  ngoLeader:            'b217fe65-ce9c-4f3a-bebb-79841bcdf505',
  policyAnalyst:        '3e9eb186-bf30-4634-9b33-c29fe020eb4e',
  // People & Talent
  execCoach:            '1b5477da-fda8-4f63-8f56-05a0c37727d7',
  hrMgr:                '163edaed-2961-4a56-bf00-16e0b75b8efd',
  // Real Estate
  propertyDev:          'b3010cbf-9353-434e-a6c0-171c675846cd',
  architect:            '97fdad5f-fb59-4a41-b9fb-eabfa176f99d',
}

const OFFERS = {
  mentorship:       'e3e25cfb-9595-4384-ad43-36160436353c',
  technicalSkills:  '2cc8a085-41a6-45b9-a8ff-4cd76365c719',
  introductions:    '272a0711-b7ee-48fe-bbef-58baff1e6f42',
  investment:       'b290666b-f1c9-4c77-8950-b9860cc470a1',
  coFounder:        '0a82eaa2-84c7-4993-a37a-77d30c31da28',
  careerAdvice:     '0f02e109-19bc-4f92-ad40-ab7038f0fba6',
  bizStrategy:      '67252754-1c3b-465f-8a3d-fe7500b0910e',
  hiringAccess:     '7f6a8ca4-ba8d-4b1a-b1c1-679494a42554',
  feedback:         '47fbc89b-c2db-43d4-93b6-cfda03429bdc',
  accountability:   '719ed275-b30b-45ec-b5fe-65712987d0d2',
}

// profile_seeking_needs stores the label string directly (not an id FK)
const NEEDS = {
  mentor:           'Career guidance',
  technicalSkills:  'Technical coaching',
  introductions:    'Industry introductions',
  investment:       'Funding access',
  coFounder:        'Career guidance',
  careerAdvice:     'Career guidance',
  bizStrategy:      'Business strategy',
  hiringAdvice:     'Hiring advice',
  feedback:         'Feedback on work',
}
const ALL_NEED_LABELS = [
  'Career guidance',
  'Industry introductions',
  'Technical coaching',
  'Business strategy',
  'Hiring advice',
  'Funding access',
  'Feedback on work',
]

const RELATIONSHIP_TYPES = ['mentor', 'co-founder', 'advisor', 'accountability-partner', 'investor', 'connector'] as const
const GOALS = ['starting-a-business', 'growing-a-business', 'changing-careers', 'improving-my-craft', 'building-a-team', 'raising-investment'] as const

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// ─── Profile definitions ─────────────────────────────────────────────────────
// Structured as archetypes so the spread is intentional, not random noise.

type ProfileDef = {
  firstName: string
  lastName: string
  graduationYear: number
  locationId: string
  primaryProfessionId: string
  primaryExperience: 1 | 2 | 3 | 4 | 5
  secondaryProfessionId?: string
  secondaryExperience?: 1 | 2 | 3 | 4 | 5
  offerIds: string[]
  seekingNeedLabels: string[]
  seekingRelationshipPrimary: string
  seekingRelationshipSecondary: string[]
  seekingProfessionId?: string
  seekingGoal?: string
}

const PROFILES: ProfileDef[] = [
  // ── Founders & entrepreneurs (SA-based) ─────────────────────────────────
  {
    firstName: 'Sipho', lastName: 'Dlamini',
    graduationYear: 2015, locationId: LOCATIONS.johannesburg,
    primaryProfessionId: PROFESSIONS.founderCEO, primaryExperience: 4,
    offerIds: [OFFERS.bizStrategy, OFFERS.introductions, OFFERS.mentorship],
    seekingNeedLabels: ['Funding access', 'Business strategy'],
    seekingRelationshipPrimary: 'investor', seekingRelationshipSecondary: ['advisor'],
    seekingGoal: 'growing-a-business',
  },
  {
    firstName: 'Aisha', lastName: 'Mokoena',
    graduationYear: 2018, locationId: LOCATIONS.capeTown,
    primaryProfessionId: PROFESSIONS.founderCEO, primaryExperience: 3,
    secondaryProfessionId: PROFESSIONS.productMgr, secondaryExperience: 2,
    offerIds: [OFFERS.coFounder, OFFERS.bizStrategy],
    seekingNeedLabels: ['Technical coaching', 'Industry introductions'],
    seekingRelationshipPrimary: 'co-founder', seekingRelationshipSecondary: ['advisor'],
    seekingProfessionId: PROFESSIONS.ctoTechLead,
    seekingGoal: 'starting-a-business',
  },
  {
    firstName: 'Thabo', lastName: 'Nkosi',
    graduationYear: 2012, locationId: LOCATIONS.johannesburg,
    primaryProfessionId: PROFESSIONS.founderCEO, primaryExperience: 5,
    offerIds: [OFFERS.mentorship, OFFERS.investment, OFFERS.introductions],
    seekingNeedLabels: ['Business strategy', 'Hiring advice'],
    seekingRelationshipPrimary: 'advisor', seekingRelationshipSecondary: [],
    seekingGoal: 'growing-a-business',
  },
  {
    firstName: 'Nomvula', lastName: 'Khumalo',
    graduationYear: 2019, locationId: LOCATIONS.durban,
    primaryProfessionId: PROFESSIONS.socialEntrepreneur, primaryExperience: 2,
    offerIds: [OFFERS.feedback, OFFERS.accountability],
    seekingNeedLabels: ['Career guidance', 'Funding access'],
    seekingRelationshipPrimary: 'mentor', seekingRelationshipSecondary: ['investor'],
    seekingGoal: 'growing-a-business',
  },
  {
    firstName: 'Kagiso', lastName: 'Sithole',
    graduationYear: 2016, locationId: LOCATIONS.pretoria,
    primaryProfessionId: PROFESSIONS.bizDev, primaryExperience: 3,
    secondaryProfessionId: PROFESSIONS.sales, secondaryExperience: 3,
    offerIds: [OFFERS.introductions, OFFERS.bizStrategy],
    seekingNeedLabels: ['Industry introductions', 'Business strategy'],
    seekingRelationshipPrimary: 'connector', seekingRelationshipSecondary: ['advisor'],
    seekingGoal: 'growing-a-business',
  },

  // ── Tech / Engineering (SA) ───────────────────────────────────────────────
  {
    firstName: 'Lungelo', lastName: 'Zulu',
    graduationYear: 2020, locationId: LOCATIONS.capeTown,
    primaryProfessionId: PROFESSIONS.fullStackDev, primaryExperience: 2,
    offerIds: [OFFERS.technicalSkills, OFFERS.feedback],
    seekingNeedLabels: ['Career guidance', 'Industry introductions'],
    seekingRelationshipPrimary: 'mentor', seekingRelationshipSecondary: [],
    seekingGoal: 'improving-my-craft',
  },
  {
    firstName: 'Tebogo', lastName: 'Mahlangu',
    graduationYear: 2017, locationId: LOCATIONS.johannesburg,
    primaryProfessionId: PROFESSIONS.backendDev, primaryExperience: 3,
    secondaryProfessionId: PROFESSIONS.devOps, secondaryExperience: 2,
    offerIds: [OFFERS.technicalSkills, OFFERS.mentorship],
    seekingNeedLabels: ['Career guidance', 'Technical coaching'],
    seekingRelationshipPrimary: 'mentor', seekingRelationshipSecondary: ['accountability-partner'],
    seekingGoal: 'changing-careers',
  },
  {
    firstName: 'Zanele', lastName: 'Mthembu',
    graduationYear: 2014, locationId: LOCATIONS.johannesburg,
    primaryProfessionId: PROFESSIONS.ctoTechLead, primaryExperience: 4,
    offerIds: [OFFERS.mentorship, OFFERS.technicalSkills, OFFERS.introductions],
    seekingNeedLabels: ['Business strategy', 'Hiring advice'],
    seekingRelationshipPrimary: 'advisor', seekingRelationshipSecondary: ['co-founder'],
    seekingGoal: 'starting-a-business',
  },
  {
    firstName: 'Rethabile', lastName: 'Molete',
    graduationYear: 2021, locationId: LOCATIONS.pretoria,
    primaryProfessionId: PROFESSIONS.frontendDev, primaryExperience: 1,
    offerIds: [OFFERS.feedback, OFFERS.technicalSkills],
    seekingNeedLabels: ['Career guidance', 'Industry introductions'],
    seekingRelationshipPrimary: 'mentor', seekingRelationshipSecondary: [],
    seekingGoal: 'improving-my-craft',
  },
  {
    firstName: 'Mpho', lastName: 'Sehloho',
    graduationYear: 2019, locationId: LOCATIONS.capeTown,
    primaryProfessionId: PROFESSIONS.mlEngineer, primaryExperience: 2,
    secondaryProfessionId: PROFESSIONS.dataScientist, secondaryExperience: 2,
    offerIds: [OFFERS.technicalSkills, OFFERS.feedback],
    seekingNeedLabels: ['Career guidance', 'Industry introductions'],
    seekingRelationshipPrimary: 'mentor', seekingRelationshipSecondary: ['advisor'],
    seekingProfessionId: PROFESSIONS.ctoTechLead,
    seekingGoal: 'improving-my-craft',
  },
  {
    firstName: 'Bongani', lastName: 'Vilakazi',
    graduationYear: 2013, locationId: LOCATIONS.johannesburg,
    primaryProfessionId: PROFESSIONS.cybersecurity, primaryExperience: 5,
    offerIds: [OFFERS.mentorship, OFFERS.technicalSkills],
    seekingNeedLabels: ['Business strategy', 'Funding access'],
    seekingRelationshipPrimary: 'investor', seekingRelationshipSecondary: ['advisor'],
    seekingGoal: 'starting-a-business',
  },
  {
    firstName: 'Siyanda', lastName: 'Mchunu',
    graduationYear: 2022, locationId: LOCATIONS.durban,
    primaryProfessionId: PROFESSIONS.mobileDev, primaryExperience: 1,
    offerIds: [OFFERS.technicalSkills],
    seekingNeedLabels: ['Career guidance', 'Technical coaching'],
    seekingRelationshipPrimary: 'mentor', seekingRelationshipSecondary: [],
    seekingGoal: 'improving-my-craft',
  },

  // ── Finance & FinTech (SA) ────────────────────────────────────────────────
  {
    firstName: 'Lebo', lastName: 'Radebe',
    graduationYear: 2011, locationId: LOCATIONS.johannesburg,
    primaryProfessionId: PROFESSIONS.investmentAnalyst, primaryExperience: 5,
    offerIds: [OFFERS.investment, OFFERS.mentorship, OFFERS.introductions],
    seekingNeedLabels: ['Industry introductions', 'Business strategy'],
    seekingRelationshipPrimary: 'connector', seekingRelationshipSecondary: ['advisor'],
    seekingGoal: 'growing-a-business',
  },
  {
    firstName: 'Ntombi', lastName: 'Ngcobo',
    graduationYear: 2016, locationId: LOCATIONS.johannesburg,
    primaryProfessionId: PROFESSIONS.finTechSpec, primaryExperience: 3,
    secondaryProfessionId: PROFESSIONS.productMgr, secondaryExperience: 2,
    offerIds: [OFFERS.bizStrategy, OFFERS.feedback],
    seekingNeedLabels: ['Funding access', 'Industry introductions'],
    seekingRelationshipPrimary: 'investor', seekingRelationshipSecondary: ['co-founder'],
    seekingGoal: 'starting-a-business',
  },
  {
    firstName: 'Sandile', lastName: 'Buthelezi',
    graduationYear: 2009, locationId: LOCATIONS.johannesburg,
    primaryProfessionId: PROFESSIONS.cfo, primaryExperience: 5,
    offerIds: [OFFERS.mentorship, OFFERS.bizStrategy, OFFERS.introductions],
    seekingNeedLabels: ['Business strategy', 'Hiring advice'],
    seekingRelationshipPrimary: 'advisor', seekingRelationshipSecondary: [],
    seekingGoal: 'building-a-team',
  },
  {
    firstName: 'Palesa', lastName: 'Dube',
    graduationYear: 2018, locationId: LOCATIONS.capeTown,
    primaryProfessionId: PROFESSIONS.actuary, primaryExperience: 3,
    offerIds: [OFFERS.feedback, OFFERS.careerAdvice],
    seekingNeedLabels: ['Career guidance', 'Industry introductions'],
    seekingRelationshipPrimary: 'mentor', seekingRelationshipSecondary: ['advisor'],
    seekingGoal: 'changing-careers',
  },

  // ── Design & Product ─────────────────────────────────────────────────────
  {
    firstName: 'Khanya', lastName: 'Ndlovu',
    graduationYear: 2019, locationId: LOCATIONS.capeTown,
    primaryProfessionId: PROFESSIONS.productDesigner, primaryExperience: 2,
    secondaryProfessionId: PROFESSIONS.uxResearcher, secondaryExperience: 2,
    offerIds: [OFFERS.feedback, OFFERS.technicalSkills],
    seekingNeedLabels: ['Career guidance', 'Industry introductions'],
    seekingRelationshipPrimary: 'mentor', seekingRelationshipSecondary: [],
    seekingProfessionId: PROFESSIONS.productMgr,
    seekingGoal: 'improving-my-craft',
  },
  {
    firstName: 'Musa', lastName: 'Hadebe',
    graduationYear: 2015, locationId: LOCATIONS.johannesburg,
    primaryProfessionId: PROFESSIONS.creativeDirector, primaryExperience: 4,
    offerIds: [OFFERS.mentorship, OFFERS.feedback, OFFERS.introductions],
    seekingNeedLabels: ['Business strategy', 'Funding access'],
    seekingRelationshipPrimary: 'advisor', seekingRelationshipSecondary: ['investor'],
    seekingGoal: 'starting-a-business',
  },
  {
    firstName: 'Lindiwe', lastName: 'Sibiya',
    graduationYear: 2020, locationId: LOCATIONS.capeTown,
    primaryProfessionId: PROFESSIONS.brandDesigner, primaryExperience: 2,
    offerIds: [OFFERS.technicalSkills, OFFERS.feedback],
    seekingNeedLabels: ['Career guidance', 'Feedback on work'],
    seekingRelationshipPrimary: 'mentor', seekingRelationshipSecondary: ['accountability-partner'],
    seekingGoal: 'improving-my-craft',
  },
  {
    firstName: 'Andile', lastName: 'Mkhize',
    graduationYear: 2014, locationId: LOCATIONS.durban,
    primaryProfessionId: PROFESSIONS.productMgr, primaryExperience: 4,
    secondaryProfessionId: PROFESSIONS.strategyConsultant, secondaryExperience: 3,
    offerIds: [OFFERS.mentorship, OFFERS.bizStrategy],
    seekingNeedLabels: ['Business strategy', 'Industry introductions'],
    seekingRelationshipPrimary: 'advisor', seekingRelationshipSecondary: ['connector'],
    seekingGoal: 'growing-a-business',
  },

  // ── Marketing & Growth ───────────────────────────────────────────────────
  {
    firstName: 'Nandi', lastName: 'Zondo',
    graduationYear: 2017, locationId: LOCATIONS.johannesburg,
    primaryProfessionId: PROFESSIONS.growthMarketer, primaryExperience: 3,
    secondaryProfessionId: PROFESSIONS.contentCreator, secondaryExperience: 2,
    offerIds: [OFFERS.mentorship, OFFERS.introductions],
    seekingNeedLabels: ['Funding access', 'Business strategy'],
    seekingRelationshipPrimary: 'investor', seekingRelationshipSecondary: ['advisor'],
    seekingGoal: 'starting-a-business',
  },
  {
    firstName: 'Sizwe', lastName: 'Cele',
    graduationYear: 2016, locationId: LOCATIONS.capeTown,
    primaryProfessionId: PROFESSIONS.brandStrategist, primaryExperience: 3,
    offerIds: [OFFERS.bizStrategy, OFFERS.feedback],
    seekingNeedLabels: ['Industry introductions', 'Career guidance'],
    seekingRelationshipPrimary: 'connector', seekingRelationshipSecondary: ['mentor'],
    seekingGoal: 'improving-my-craft',
  },

  // ── Healthcare ───────────────────────────────────────────────────────────
  {
    firstName: 'Nokwanda', lastName: 'Gumede',
    graduationYear: 2013, locationId: LOCATIONS.durban,
    primaryProfessionId: PROFESSIONS.doctor, primaryExperience: 5,
    secondaryProfessionId: PROFESSIONS.healthTech, secondaryExperience: 2,
    offerIds: [OFFERS.mentorship, OFFERS.introductions],
    seekingNeedLabels: ['Business strategy', 'Funding access'],
    seekingRelationshipPrimary: 'advisor', seekingRelationshipSecondary: ['investor'],
    seekingGoal: 'starting-a-business',
  },
  {
    firstName: 'Yusuf', lastName: 'Osman',
    graduationYear: 2018, locationId: LOCATIONS.capeTown,
    primaryProfessionId: PROFESSIONS.healthTech, primaryExperience: 3,
    offerIds: [OFFERS.technicalSkills, OFFERS.bizStrategy],
    seekingNeedLabels: ['Funding access', 'Industry introductions'],
    seekingRelationshipPrimary: 'investor', seekingRelationshipSecondary: ['co-founder'],
    seekingProfessionId: PROFESSIONS.founderCEO,
    seekingGoal: 'starting-a-business',
  },
  {
    firstName: 'Priya', lastName: 'Naidoo',
    graduationYear: 2015, locationId: LOCATIONS.durban,
    primaryProfessionId: PROFESSIONS.publicHealth, primaryExperience: 4,
    offerIds: [OFFERS.mentorship, OFFERS.careerAdvice],
    seekingNeedLabels: ['Industry introductions', 'Career guidance'],
    seekingRelationshipPrimary: 'connector', seekingRelationshipSecondary: [],
    seekingGoal: 'changing-careers',
  },

  // ── Energy & Climate ─────────────────────────────────────────────────────
  {
    firstName: 'Tumelo', lastName: 'Motsepe',
    graduationYear: 2016, locationId: LOCATIONS.johannesburg,
    primaryProfessionId: PROFESSIONS.renewableEng, primaryExperience: 3,
    secondaryProfessionId: PROFESSIONS.sustainabilitySpec, secondaryExperience: 2,
    offerIds: [OFFERS.technicalSkills, OFFERS.introductions],
    seekingNeedLabels: ['Funding access', 'Business strategy'],
    seekingRelationshipPrimary: 'investor', seekingRelationshipSecondary: ['advisor'],
    seekingGoal: 'growing-a-business',
  },
  {
    firstName: 'Fikile', lastName: 'Mthembu',
    graduationYear: 2019, locationId: LOCATIONS.capeTown,
    primaryProfessionId: PROFESSIONS.climatePolicy, primaryExperience: 2,
    offerIds: [OFFERS.feedback, OFFERS.introductions],
    seekingNeedLabels: ['Career guidance', 'Industry introductions'],
    seekingRelationshipPrimary: 'mentor', seekingRelationshipSecondary: ['advisor'],
    seekingGoal: 'changing-careers',
  },

  // ── Education & NGO ──────────────────────────────────────────────────────
  {
    firstName: 'Bongiwe', lastName: 'Ntuli',
    graduationYear: 2014, locationId: LOCATIONS.durban,
    primaryProfessionId: PROFESSIONS.ngoLeader, primaryExperience: 4,
    secondaryProfessionId: PROFESSIONS.educator, secondaryExperience: 3,
    offerIds: [OFFERS.mentorship, OFFERS.introductions, OFFERS.careerAdvice],
    seekingNeedLabels: ['Funding access', 'Business strategy'],
    seekingRelationshipPrimary: 'investor', seekingRelationshipSecondary: ['connector'],
    seekingGoal: 'growing-a-business',
  },
  {
    firstName: 'Ntebo', lastName: 'Mofokeng',
    graduationYear: 2020, locationId: LOCATIONS.johannesburg,
    primaryProfessionId: PROFESSIONS.edTechSpec, primaryExperience: 2,
    offerIds: [OFFERS.technicalSkills, OFFERS.feedback],
    seekingNeedLabels: ['Career guidance', 'Technical coaching'],
    seekingRelationshipPrimary: 'mentor', seekingRelationshipSecondary: [],
    seekingGoal: 'improving-my-craft',
  },
  {
    firstName: 'Lerato', lastName: 'Tau',
    graduationYear: 2012, locationId: LOCATIONS.pretoria,
    primaryProfessionId: PROFESSIONS.policyAnalyst, primaryExperience: 5,
    offerIds: [OFFERS.mentorship, OFFERS.introductions],
    seekingNeedLabels: ['Industry introductions', 'Business strategy'],
    seekingRelationshipPrimary: 'connector', seekingRelationshipSecondary: ['advisor'],
    seekingGoal: 'changing-careers',
  },

  // ── Law ──────────────────────────────────────────────────────────────────
  {
    firstName: 'Sibongile', lastName: 'Majola',
    graduationYear: 2013, locationId: LOCATIONS.johannesburg,
    primaryProfessionId: PROFESSIONS.lawyer, primaryExperience: 5,
    offerIds: [OFFERS.mentorship, OFFERS.introductions],
    seekingNeedLabels: ['Business strategy', 'Industry introductions'],
    seekingRelationshipPrimary: 'advisor', seekingRelationshipSecondary: ['connector'],
    seekingGoal: 'starting-a-business',
  },

  // ── Stellenbosch / smaller SA cities ────────────────────────────────────
  {
    firstName: 'Francois', lastName: 'du Plessis',
    graduationYear: 2015, locationId: LOCATIONS.stellenbosch,
    primaryProfessionId: PROFESSIONS.agricultScientist, primaryExperience: 3,
    secondaryProfessionId: PROFESSIONS.agriTechSpec, secondaryExperience: 2,
    offerIds: [OFFERS.technicalSkills, OFFERS.introductions],
    seekingNeedLabels: ['Funding access', 'Business strategy'],
    seekingRelationshipPrimary: 'investor', seekingRelationshipSecondary: ['advisor'],
    seekingGoal: 'growing-a-business',
  },
  {
    firstName: 'Ruan', lastName: 'van der Merwe',
    graduationYear: 2018, locationId: LOCATIONS.stellenbosch,
    primaryProfessionId: PROFESSIONS.propertyDev, primaryExperience: 2,
    offerIds: [OFFERS.introductions, OFFERS.feedback],
    seekingNeedLabels: ['Funding access', 'Industry introductions'],
    seekingRelationshipPrimary: 'investor', seekingRelationshipSecondary: [],
    seekingGoal: 'growing-a-business',
  },
  {
    firstName: 'Chantelle', lastName: 'Botha',
    graduationYear: 2016, locationId: LOCATIONS.eastLondon,
    primaryProfessionId: PROFESSIONS.hrMgr, primaryExperience: 3,
    offerIds: [OFFERS.careerAdvice, OFFERS.hiringAccess],
    seekingNeedLabels: ['Career guidance', 'Business strategy'],
    seekingRelationshipPrimary: 'mentor', seekingRelationshipSecondary: ['advisor'],
    seekingGoal: 'changing-careers',
  },
  {
    firstName: 'Pieter', lastName: 'Joubert',
    graduationYear: 2010, locationId: LOCATIONS.bloemfontein,
    primaryProfessionId: PROFESSIONS.strategyConsultant, primaryExperience: 5,
    offerIds: [OFFERS.mentorship, OFFERS.bizStrategy, OFFERS.introductions],
    seekingNeedLabels: ['Industry introductions', 'Business strategy'],
    seekingRelationshipPrimary: 'connector', seekingRelationshipSecondary: ['advisor'],
    seekingGoal: 'growing-a-business',
  },

  // ── Africa diaspora ──────────────────────────────────────────────────────
  {
    firstName: 'Amara', lastName: 'Osei',
    graduationYear: 2017, locationId: LOCATIONS.ghana,
    primaryProfessionId: PROFESSIONS.founderCEO, primaryExperience: 3,
    offerIds: [OFFERS.introductions, OFFERS.bizStrategy],
    seekingNeedLabels: ['Funding access', 'Industry introductions'],
    seekingRelationshipPrimary: 'investor', seekingRelationshipSecondary: ['connector'],
    seekingGoal: 'growing-a-business',
  },
  {
    firstName: 'Chidi', lastName: 'Okonkwo',
    graduationYear: 2016, locationId: LOCATIONS.nigeria,
    primaryProfessionId: PROFESSIONS.finTechSpec, primaryExperience: 3,
    secondaryProfessionId: PROFESSIONS.backendDev, secondaryExperience: 3,
    offerIds: [OFFERS.technicalSkills, OFFERS.introductions],
    seekingNeedLabels: ['Funding access', 'Business strategy'],
    seekingRelationshipPrimary: 'investor', seekingRelationshipSecondary: ['co-founder'],
    seekingGoal: 'starting-a-business',
  },
  {
    firstName: 'Wanjiru', lastName: 'Kamau',
    graduationYear: 2018, locationId: LOCATIONS.kenya,
    primaryProfessionId: PROFESSIONS.productMgr, primaryExperience: 3,
    offerIds: [OFFERS.feedback, OFFERS.introductions],
    seekingNeedLabels: ['Career guidance', 'Industry introductions'],
    seekingRelationshipPrimary: 'mentor', seekingRelationshipSecondary: ['advisor'],
    seekingGoal: 'improving-my-craft',
  },
  {
    firstName: 'Claudine', lastName: 'Uwimana',
    graduationYear: 2019, locationId: LOCATIONS.rwanda,
    primaryProfessionId: PROFESSIONS.socialEntrepreneur, primaryExperience: 2,
    offerIds: [OFFERS.bizStrategy, OFFERS.feedback],
    seekingNeedLabels: ['Funding access', 'Business strategy'],
    seekingRelationshipPrimary: 'investor', seekingRelationshipSecondary: ['mentor'],
    seekingGoal: 'starting-a-business',
  },

  // ── UK / Europe ──────────────────────────────────────────────────────────
  {
    firstName: 'Simone', lastName: 'Erasmus',
    graduationYear: 2015, locationId: LOCATIONS.uk,
    primaryProfessionId: PROFESSIONS.productMgr, primaryExperience: 4,
    secondaryProfessionId: PROFESSIONS.strategyConsultant, secondaryExperience: 3,
    offerIds: [OFFERS.mentorship, OFFERS.introductions],
    seekingNeedLabels: ['Industry introductions', 'Career guidance'],
    seekingRelationshipPrimary: 'connector', seekingRelationshipSecondary: ['advisor'],
    seekingGoal: 'changing-careers',
  },
  {
    firstName: 'Werner', lastName: 'Steyn',
    graduationYear: 2013, locationId: LOCATIONS.uk,
    primaryProfessionId: PROFESSIONS.investmentAnalyst, primaryExperience: 5,
    offerIds: [OFFERS.investment, OFFERS.introductions, OFFERS.mentorship],
    seekingNeedLabels: ['Industry introductions', 'Business strategy'],
    seekingRelationshipPrimary: 'advisor', seekingRelationshipSecondary: [],
    seekingGoal: 'growing-a-business',
  },
  {
    firstName: 'Carla', lastName: 'Visser',
    graduationYear: 2017, locationId: LOCATIONS.netherlands,
    primaryProfessionId: PROFESSIONS.sustainabilitySpec, primaryExperience: 3,
    offerIds: [OFFERS.introductions, OFFERS.feedback],
    seekingNeedLabels: ['Career guidance', 'Industry introductions'],
    seekingRelationshipPrimary: 'mentor', seekingRelationshipSecondary: ['connector'],
    seekingGoal: 'changing-careers',
  },
  {
    firstName: 'Stefan', lastName: 'Müller',
    graduationYear: 2014, locationId: LOCATIONS.germany,
    primaryProfessionId: PROFESSIONS.dataScientist, primaryExperience: 4,
    secondaryProfessionId: PROFESSIONS.mlEngineer, secondaryExperience: 3,
    offerIds: [OFFERS.technicalSkills, OFFERS.mentorship],
    seekingNeedLabels: ['Business strategy', 'Career guidance'],
    seekingRelationshipPrimary: 'advisor', seekingRelationshipSecondary: ['co-founder'],
    seekingGoal: 'starting-a-business',
  },

  // ── Middle East ──────────────────────────────────────────────────────────
  {
    firstName: 'Tariq', lastName: 'Essop',
    graduationYear: 2014, locationId: LOCATIONS.dubai,
    primaryProfessionId: PROFESSIONS.founderCEO, primaryExperience: 4,
    offerIds: [OFFERS.investment, OFFERS.introductions, OFFERS.bizStrategy],
    seekingNeedLabels: ['Industry introductions', 'Business strategy'],
    seekingRelationshipPrimary: 'connector', seekingRelationshipSecondary: ['advisor'],
    seekingGoal: 'growing-a-business',
  },
  {
    firstName: 'Nadia', lastName: 'Jacobs',
    graduationYear: 2016, locationId: LOCATIONS.dubai,
    primaryProfessionId: PROFESSIONS.marketingMgr, primaryExperience: 3,
    offerIds: [OFFERS.mentorship, OFFERS.introductions],
    seekingNeedLabels: ['Career guidance', 'Industry introductions'],
    seekingRelationshipPrimary: 'mentor', seekingRelationshipSecondary: [],
    seekingGoal: 'improving-my-craft',
  },

  // ── USA ───────────────────────────────────────────────────────────────────
  {
    firstName: 'Danielle', lastName: 'Pretorius',
    graduationYear: 2015, locationId: LOCATIONS.california,
    primaryProfessionId: PROFESSIONS.fullStackDev, primaryExperience: 4,
    secondaryProfessionId: PROFESSIONS.ctoTechLead, secondaryExperience: 2,
    offerIds: [OFFERS.technicalSkills, OFFERS.mentorship, OFFERS.introductions],
    seekingNeedLabels: ['Business strategy', 'Funding access'],
    seekingRelationshipPrimary: 'co-founder', seekingRelationshipSecondary: ['investor'],
    seekingProfessionId: PROFESSIONS.founderCEO,
    seekingGoal: 'starting-a-business',
  },
  {
    firstName: 'Jordan', lastName: 'Fourie',
    graduationYear: 2017, locationId: LOCATIONS.newYork,
    primaryProfessionId: PROFESSIONS.financialAnalyst, primaryExperience: 3,
    offerIds: [OFFERS.feedback, OFFERS.introductions],
    seekingNeedLabels: ['Career guidance', 'Industry introductions'],
    seekingRelationshipPrimary: 'mentor', seekingRelationshipSecondary: ['advisor'],
    seekingGoal: 'changing-careers',
  },

  // ── Asia-Pacific ──────────────────────────────────────────────────────────
  {
    firstName: 'Michelle', lastName: 'Hendricks',
    graduationYear: 2016, locationId: LOCATIONS.singapore,
    primaryProfessionId: PROFESSIONS.productMgr, primaryExperience: 3,
    secondaryProfessionId: PROFESSIONS.growthMarketer, secondaryExperience: 2,
    offerIds: [OFFERS.introductions, OFFERS.bizStrategy],
    seekingNeedLabels: ['Industry introductions', 'Business strategy'],
    seekingRelationshipPrimary: 'connector', seekingRelationshipSecondary: ['advisor'],
    seekingGoal: 'growing-a-business',
  },
  {
    firstName: 'Sean', lastName: 'Swanepoel',
    graduationYear: 2014, locationId: LOCATIONS.australia,
    primaryProfessionId: PROFESSIONS.devOps, primaryExperience: 4,
    offerIds: [OFFERS.technicalSkills, OFFERS.mentorship],
    seekingNeedLabels: ['Career guidance', 'Technical coaching'],
    seekingRelationshipPrimary: 'mentor', seekingRelationshipSecondary: [],
    seekingGoal: 'improving-my-craft',
  },

  // ── Canada ────────────────────────────────────────────────────────────────
  {
    firstName: 'Amelia', lastName: 'Singh',
    graduationYear: 2018, locationId: LOCATIONS.canada,
    primaryProfessionId: PROFESSIONS.execCoach, primaryExperience: 3,
    offerIds: [OFFERS.mentorship, OFFERS.careerAdvice, OFFERS.accountability],
    seekingNeedLabels: ['Business strategy', 'Industry introductions'],
    seekingRelationshipPrimary: 'advisor', seekingRelationshipSecondary: ['connector'],
    seekingGoal: 'growing-a-business',
  },

  // ── Additional SA profiles (round out to 75) ─────────────────────────────
  {
    firstName: 'Zintle', lastName: 'Magwa',
    graduationYear: 2021, locationId: LOCATIONS.gqeberha,
    primaryProfessionId: PROFESSIONS.architect, primaryExperience: 1,
    offerIds: [OFFERS.feedback, OFFERS.technicalSkills],
    seekingNeedLabels: ['Career guidance', 'Feedback on work'],
    seekingRelationshipPrimary: 'mentor', seekingRelationshipSecondary: [],
    seekingGoal: 'improving-my-craft',
  },
  {
    firstName: 'Lwazi', lastName: 'Gqiba',
    graduationYear: 2015, locationId: LOCATIONS.capeTown,
    primaryProfessionId: PROFESSIONS.operationsMgr, primaryExperience: 4,
    secondaryProfessionId: PROFESSIONS.bizDev, secondaryExperience: 3,
    offerIds: [OFFERS.bizStrategy, OFFERS.mentorship],
    seekingNeedLabels: ['Business strategy', 'Hiring advice'],
    seekingRelationshipPrimary: 'advisor', seekingRelationshipSecondary: ['co-founder'],
    seekingGoal: 'building-a-team',
  },
  {
    firstName: 'Kgomotso', lastName: 'Ramphele',
    graduationYear: 2017, locationId: LOCATIONS.pretoria,
    primaryProfessionId: PROFESSIONS.marketingMgr, primaryExperience: 3,
    offerIds: [OFFERS.introductions, OFFERS.careerAdvice],
    seekingNeedLabels: ['Career guidance', 'Industry introductions'],
    seekingRelationshipPrimary: 'connector', seekingRelationshipSecondary: ['mentor'],
    seekingGoal: 'changing-careers',
  },
  {
    firstName: 'Sithembile', lastName: 'Mdlalose',
    graduationYear: 2020, locationId: LOCATIONS.durban,
    primaryProfessionId: PROFESSIONS.backendDev, primaryExperience: 2,
    offerIds: [OFFERS.technicalSkills, OFFERS.feedback],
    seekingNeedLabels: ['Technical coaching', 'Career guidance'],
    seekingRelationshipPrimary: 'mentor', seekingRelationshipSecondary: [],
    seekingGoal: 'improving-my-craft',
  },
  {
    firstName: 'Rorisang', lastName: 'Mosia',
    graduationYear: 2013, locationId: LOCATIONS.johannesburg,
    primaryProfessionId: PROFESSIONS.strategyConsultant, primaryExperience: 5,
    offerIds: [OFFERS.mentorship, OFFERS.bizStrategy],
    seekingNeedLabels: ['Business strategy', 'Industry introductions'],
    seekingRelationshipPrimary: 'advisor', seekingRelationshipSecondary: ['connector'],
    seekingGoal: 'growing-a-business',
  },
  {
    firstName: 'Naledi', lastName: 'Motsepe',
    graduationYear: 2019, locationId: LOCATIONS.johannesburg,
    primaryProfessionId: PROFESSIONS.dataScientist, primaryExperience: 2,
    secondaryProfessionId: PROFESSIONS.mlEngineer, secondaryExperience: 1,
    offerIds: [OFFERS.technicalSkills, OFFERS.feedback],
    seekingNeedLabels: ['Career guidance', 'Technical coaching'],
    seekingRelationshipPrimary: 'mentor', seekingRelationshipSecondary: ['advisor'],
    seekingProfessionId: PROFESSIONS.ctoTechLead,
    seekingGoal: 'improving-my-craft',
  },
  {
    firstName: 'Mthokozisi', lastName: 'Ndlela',
    graduationYear: 2011, locationId: LOCATIONS.durban,
    primaryProfessionId: PROFESSIONS.founderCEO, primaryExperience: 5,
    offerIds: [OFFERS.mentorship, OFFERS.investment, OFFERS.introductions],
    seekingNeedLabels: ['Business strategy', 'Hiring advice'],
    seekingRelationshipPrimary: 'advisor', seekingRelationshipSecondary: [],
    seekingGoal: 'building-a-team',
  },
  {
    firstName: 'Ayanda', lastName: 'Sithole',
    graduationYear: 2022, locationId: LOCATIONS.capeTown,
    primaryProfessionId: PROFESSIONS.productDesigner, primaryExperience: 1,
    offerIds: [OFFERS.feedback],
    seekingNeedLabels: ['Career guidance', 'Feedback on work'],
    seekingRelationshipPrimary: 'mentor', seekingRelationshipSecondary: [],
    seekingGoal: 'improving-my-craft',
  },
  {
    firstName: 'Tshepo', lastName: 'Molefe',
    graduationYear: 2016, locationId: LOCATIONS.johannesburg,
    primaryProfessionId: PROFESSIONS.bizDev, primaryExperience: 3,
    offerIds: [OFFERS.introductions, OFFERS.bizStrategy, OFFERS.careerAdvice],
    seekingNeedLabels: ['Funding access', 'Business strategy'],
    seekingRelationshipPrimary: 'investor', seekingRelationshipSecondary: ['advisor'],
    seekingGoal: 'starting-a-business',
  },
  {
    firstName: 'Mamello', lastName: 'Moagi',
    graduationYear: 2014, locationId: LOCATIONS.pretoria,
    primaryProfessionId: PROFESSIONS.ngoLeader, primaryExperience: 4,
    offerIds: [OFFERS.mentorship, OFFERS.introductions],
    seekingNeedLabels: ['Industry introductions', 'Funding access'],
    seekingRelationshipPrimary: 'connector', seekingRelationshipSecondary: ['investor'],
    seekingGoal: 'growing-a-business',
  },
  {
    firstName: 'Vuyo', lastName: 'Ngxokolo',
    graduationYear: 2018, locationId: LOCATIONS.capeTown,
    primaryProfessionId: PROFESSIONS.contentCreator, primaryExperience: 2,
    secondaryProfessionId: PROFESSIONS.brandDesigner, secondaryExperience: 2,
    offerIds: [OFFERS.feedback, OFFERS.technicalSkills],
    seekingNeedLabels: ['Career guidance', 'Industry introductions'],
    seekingRelationshipPrimary: 'mentor', seekingRelationshipSecondary: ['connector'],
    seekingGoal: 'changing-careers',
  },
  {
    firstName: 'Sbu', lastName: 'Shabalala',
    graduationYear: 2012, locationId: LOCATIONS.johannesburg,
    primaryProfessionId: PROFESSIONS.cfo, primaryExperience: 5,
    offerIds: [OFFERS.mentorship, OFFERS.bizStrategy, OFFERS.careerAdvice],
    seekingNeedLabels: ['Business strategy', 'Industry introductions'],
    seekingRelationshipPrimary: 'advisor', seekingRelationshipSecondary: ['connector'],
    seekingGoal: 'growing-a-business',
  },
  {
    firstName: 'Dineo', lastName: 'Phalatsi',
    graduationYear: 2019, locationId: LOCATIONS.johannesburg,
    primaryProfessionId: PROFESSIONS.growthMarketer, primaryExperience: 2,
    offerIds: [OFFERS.feedback, OFFERS.introductions],
    seekingNeedLabels: ['Career guidance', 'Funding access'],
    seekingRelationshipPrimary: 'mentor', seekingRelationshipSecondary: ['investor'],
    seekingGoal: 'starting-a-business',
  },
  {
    firstName: 'Thulisile', lastName: 'Dlamini',
    graduationYear: 2015, locationId: LOCATIONS.durban,
    primaryProfessionId: PROFESSIONS.lawyer, primaryExperience: 4,
    offerIds: [OFFERS.mentorship, OFFERS.careerAdvice],
    seekingNeedLabels: ['Business strategy', 'Industry introductions'],
    seekingRelationshipPrimary: 'advisor', seekingRelationshipSecondary: ['connector'],
    seekingGoal: 'changing-careers',
  },
  {
    firstName: 'Innocent', lastName: 'Chikwanda',
    graduationYear: 2017, locationId: LOCATIONS.johannesburg,
    primaryProfessionId: PROFESSIONS.fullStackDev, primaryExperience: 3,
    offerIds: [OFFERS.technicalSkills, OFFERS.mentorship],
    seekingNeedLabels: ['Technical coaching', 'Career guidance'],
    seekingRelationshipPrimary: 'mentor', seekingRelationshipSecondary: ['accountability-partner'],
    seekingGoal: 'improving-my-craft',
  },
]

// ─── Seed logic ───────────────────────────────────────────────────────────────

async function seed() {
  console.log(`Seeding ${PROFILES.length} profiles…\n`)

  let created = 0
  let failed = 0

  for (const p of PROFILES) {
    const slug = (s: string) => s.toLowerCase()
    .replace(/[äáà]/g, 'a').replace(/[ëéè]/g, 'e').replace(/[ïíì]/g, 'i')
    .replace(/[öóò]/g, 'o').replace(/[üúù]/g, 'u').replace(/ñ/g, 'n')
    .replace(/ß/g, 'ss').replace(/[^a-z0-9]/g, '')
  const email = `seed.${slug(p.firstName)}.${slug(p.lastName)}@demo.networkpairing.co.za`

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: 'SeedDemo2026!',
      email_confirm: true,
    })

    if (authError) {
      // User may already exist from a previous run — try to look them up
      if (authError.message?.includes('already been registered')) {
        console.warn(`  [skip] ${email} — already exists`)
        continue
      }
      console.error(`  [fail] ${email} — auth error: ${authError.message}`)
      failed++
      continue
    }

    const userId = authData.user.id

    // 2. Insert profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        first_name: p.firstName,
        last_name: p.lastName,
        graduation_year: p.graduationYear,
        location_id: p.locationId,
        primary_profession_id: p.primaryProfessionId,
        primary_experience: p.primaryExperience,
        secondary_profession_id: p.secondaryProfessionId ?? null,
        secondary_experience: p.secondaryExperience ?? null,
        seeking_relationship_primary: p.seekingRelationshipPrimary,
        seeking_relationship_secondary: p.seekingRelationshipSecondary.length > 0
          ? p.seekingRelationshipSecondary
          : null,
        seeking_profession_id: p.seekingProfessionId ?? null,
        seeking_goal: p.seekingGoal ?? null,
        intake_method: 'direct',
      })
      .select('id')
      .single()

    if (profileError || !profile) {
      console.error(`  [fail] ${p.firstName} ${p.lastName} — profile error: ${profileError?.message}`)
      failed++
      continue
    }

    // 3. Insert offers
    if (p.offerIds.length > 0) {
      const { error: offersError } = await supabase
        .from('profile_offers')
        .insert(p.offerIds.map(id => ({ profile_id: profile.id, offer_id: id })))
      if (offersError) {
        console.warn(`  [warn] ${p.firstName} ${p.lastName} — offers error: ${offersError.message}`)
      }
    }

    // 4. Insert seeking needs
    if (p.seekingNeedLabels.length > 0) {
      const { error: needsError } = await supabase
        .from('profile_seeking_needs')
        .insert(p.seekingNeedLabels.map(label => ({ profile_id: profile.id, label })))
      if (needsError) {
        console.warn(`  [warn] ${p.firstName} ${p.lastName} — needs error: ${needsError.message}`)
      }
    }

    console.log(`  [ok] ${p.firstName} ${p.lastName} (${email})`)
    created++
  }

  console.log(`\nDone. ${created} created, ${failed} failed.`)
}

seed().catch(err => {
  console.error('Unexpected error:', err)
  process.exit(1)
})

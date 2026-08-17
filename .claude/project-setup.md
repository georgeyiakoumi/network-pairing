# project-setup.md — Project Startup Routine

Run this routine at the start of every new project, or when picking up a project for the first time in a session.
Work through each phase in order. Do not skip ahead to design or code until phases 1 and 2 are complete.

---

## Phase 0 — Project configuration

Before running any checks or install commands, confirm the following with George. These decisions affect the scaffold commands and stack — they cannot be changed cheaply after components are added.

Ask the questions below in order. Do not proceed to Phase 1 until all are answered and the expected output is written.

---

**Q1 — Component system**

> "Which component system do you want for this project?"

| Option | Styling | Status | Notes |
|---|---|---|---|
| **shadcn/ui — Base UI** | Tailwind v4 | Stable (default since July 2026) | Recommended for new projects |
| **shadcn/ui — Radix UI** | Tailwind v4 | Stable | If you have a preference or existing Radix work |
| **shadcn/ui — React Aria** | Tailwind v4 | Stable | Adobe accessibility primitives |
| **Astryx (Meta)** | StyleX (pre-compiled CSS) | Public beta | 150+ components, agent-ready CLI, 10 built-in themes. Not Tailwind-compatible — requires different stack. See note below. |

**If shadcn is selected**, the scaffold command will be one of:
```bash
npx shadcn@latest init              # Base UI (default)
npx shadcn@latest init --base radix # Radix UI
npx shadcn@latest init --base aria  # React Aria
```

**If Astryx is selected**, note the following stack differences before proceeding:
- Tailwind is **not used** — Astryx ships pre-compiled CSS via StyleX
- Remove Tailwind from the stack; the `globals.css` Tailwind pipeline does not apply
- Install: `npm install @astryxdesign/core @astryxdesign/theme-neutral` + `npm install -D @astryxdesign/cli`
- CSS imports replace `globals.css` Tailwind directives:
  ```css
  @import '@astryxdesign/core/reset.css';
  @import '@astryxdesign/core/astryx.css';
  @import '@astryxdesign/theme-neutral/theme.css';
  ```
- Theming is done via CSS custom property token files, not shadcn's `@theme` block
- The `shadcn` skill does **not** apply — use the Astryx CLI and docs directly
- Astryx is public beta — WebSearch for the latest install instructions before running anything; do not rely on training knowledge
- An MCP server for Astryx has been referenced in press coverage but is not yet in the official docs — check `astryx.atmeta.com` at project start for current status

---

**Q2 — Storybook**

> "Do you want Storybook on this project? It's most valuable for component-heavy projects and design systems — less so for simple apps."

If yes:

> "Do you want the Storybook MCP server? It lets AI agents read your components, stories, and run tests — but it requires the Vite builder. Next.js defaults to Webpack, so this is an explicit opt-in."

Notes:
- Latest stable: **10.5** — install with `npm create storybook@latest`
- If Vite builder + MCP is confirmed: select **Vite** at the builder prompt during init — do not accept the Webpack default
- MCP setup docs: `storybook.js.org/docs/ai/setup` — WebSearch for current steps at project start; do not rely on training knowledge
- Storybook is installed in Phase 1b, after the core stack is verified

---

**Q3 — Icon set**

> "Which icon library will this project use? The default is Lucide React (already in the scaffold). Choosing a different library here means swapping it before the first screen — doing it later requires a multi-file migration."

| Option | Package | Notes |
|---|---|---|
| **Lucide React** | `lucide-react` | Default — already installed in scaffold |
| **Phosphor Icons** | `@phosphor-icons/react` | More expressive, variable weight |
| **Heroicons** | `@heroicons/react` | Tailwind Labs, clean and minimal |
| **Other** | — | Note which one and confirm before starting |

Record the choice. Enforce it from the first screen — mixed icon sets require a multi-file migration to fix.

---

**Q4 — Animation system**

> "What animation system will this project use? Pick one before starting — mixing systems causes visual inconsistency and debugging nightmares."

| Option | When to use |
|---|---|
| **CSS / Tailwind only** | Simple transitions, hover states, no JS animation needed |
| **Framer Motion** | React component animations, gestures, layout transitions |
| **GSAP** | Complex timelines, ScrollTrigger, SVG path animations |
| **Decide later** | Only if it's genuinely unknown — update CONTEXT.md when chosen |

Record the choice in the output block and in `CONTEXT.md` before writing the first animation.

---

**Expected output — confirm before moving to Phase 1:**
```
Phase 0 — Configuration
────────────────────────
Component system:  [shadcn/Base UI | shadcn/Radix | shadcn/React Aria | Astryx]
Storybook:         [Yes — Vite + MCP | Yes — Webpack, no MCP | No]
Icon set:          [Lucide React | Phosphor Icons | Heroicons | Other: ___]
Animation system:  [CSS/Tailwind | Framer Motion | GSAP | Undecided]
Notion updated:    [Yes — recorded under Constraints]
```

Do not proceed to Phase 1 until this block is output and George has confirmed.

---

## Phase 1 — MCP connectivity check

Before anything else, verify that the required MCPs are reachable. A missing MCP is not a warning — it is a **hard stop**.

**How to check (follow this order exactly):**

1. **Search for available tools** using the deferred tools mechanism. Cloud MCPs are loaded as deferred tools and will not appear until you explicitly search for them. Search for each by name before concluding it's missing.

2. **Attempt a lightweight call** to each found MCP (list teams in Linear, search in Notion, list commits in GitHub). A successful response confirms the connection is live.

3. **Classify each MCP into exactly one of three states:**

| State | Meaning | Action |
|---|---|---|
| ✅ Connected | Tool found, call succeeded | Proceed |
| ⚠️ Transient error | Tool found, call returned 502/timeout | Note it, retry later, proceed cautiously |
| ❌ Not configured | Tool not found after searching | **Hard stop — see below** |

**If any required MCP is ❌ not configured:**
- Stop. Do not proceed to scoping, design, or code.
- Tell George exactly which MCP is missing and why it's required.
- Provide the exact setup path: VS Code → Claude Code extension → MCP Servers panel. All required MCPs are cloud MCPs added via the VS Code extension — not config files.
- Wait for George to confirm it's been added, then re-check before continuing.

> **Why this is a hard stop:** Proceeding without a required MCP means falling back to training knowledge instead of the authoritative source. Training knowledge may be stale, incomplete, or wrong. This produces guesswork dressed as confidence.

**Required MCPs — check all of these:**

| MCP | Required for | Hard stop if missing? |
|---|---|---|
| Linear | All projects — issue tracking, decisions | Yes |
| Notion | All projects — master plan documentation | Yes |
| GitHub | All projects — repo access, PR status | Yes |
| Netlify | Projects deploying to Netlify | Yes if Netlify is in stack |
| Supabase | Projects with Supabase in stack | Yes if Supabase is in stack |

**Also list any additional MCPs connected beyond this set** — they may be relevant.

**Expected output:**
```
MCP Status
──────────
✅ Linear     — connected (workspace: [name])
✅ GitHub     — connected (repo: [name])
✅ Notion     — connected
✅ Netlify    — connected
✅ Supabase   — connected   (if applicable)
⚠️ [Other]   — connected but verify it's needed
❌ [Name]     — NOT CONFIGURED — hard stop, see above
```

---

## Phase 1b — Stack verification

After MCPs are confirmed, verify the codebase is correctly configured before any design or code work begins. Run these checks and fix anything that fails:

**Tailwind CSS pipeline (v4):**
1. `postcss.config.js` exists at the project root with `@tailwindcss/postcss` as the only plugin — there is no `tailwind.config.ts` in v4
2. `app/globals.css` starts with `@import "tailwindcss";` and `@import "tw-animate-css";` — not the old `@tailwind base/components/utilities` directives
3. `@tailwindcss/postcss` is in devDependencies (run `npm ls @tailwindcss/postcss` — if missing, `npm install -D @tailwindcss/postcss`)
4. There is no `tailwind.config.ts` — all theme configuration lives inside `globals.css` in the `@theme inline` block

**Quick smoke test:**
- Run `npx next build` — it should compile without errors
- If the build passes but styles don't render in the browser, clear the `.next` cache (`rm -rf .next`) and restart the dev server

**If any of these are missing, fix them before proceeding.** A broken CSS pipeline will waste hours downstream.

**Typecheck:**
- Run `npm run typecheck` — it should pass with zero errors
- Fix any type errors before proceeding. A codebase that starts with type errors compounds them quickly.

**Storybook setup (only if opted in during Phase 0):**

WebSearch for current install steps before running anything — do not rely on training knowledge for CLI flags.

```bash
npm create storybook@latest
```

Follow the interactive prompts. If the Vite builder was confirmed in Phase 0 (required for MCP server support):
- Select **Vite** when prompted for the builder — do not accept the Webpack default
- After setup, add the MCP addon and connect it per `storybook.js.org/docs/ai/setup`
- Add the Storybook MCP to the MCP status table in Phase 1 for this project

Write a basic story for the first component added to the project. Do not let stories drift — a story should be written in the same issue as the component it documents.

---

**Testing setup — Playwright (do this in Phase 1b, before any features are built):**

Install Playwright:
```bash
npm install -D @playwright/test
npx playwright install
```

Create `playwright.config.ts` at the project root:
```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

Add to `package.json` scripts:
```json
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui"
```

Create `e2e/` directory and write the first smoke test immediately — even before any features exist. A passing baseline of 1 test is more valuable than a planned suite of 20:
```ts
// e2e/smoke.spec.ts
import { test, expect } from '@playwright/test'

test('homepage loads', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/[A-Za-z]/)
})
```

> **Why set up testing on day one?** A test suite established early creates a passing baseline. That baseline is the only thing that proves future changes — upgrades, refactors, migrations — haven't regressed anything. A test suite added late has to be written against already-complex code with no baseline to compare against. See Standing engineering disciplines → Test suite hygiene.

> **Why run the build now?** `npm run dev` masks many production errors (missing Suspense boundaries, SSR/CSR mismatches, static prerendering failures). A build that passes locally on day one establishes a clean baseline. A build broken for weeks is much harder to diagnose than one broken since yesterday. Run `next build` on every PR via CI — or at minimum, run it manually before declaring any milestone done.

---

## Phase 1c — Skills and MCP scan

Once the stack is confirmed, scan for relevant skills and MCPs. This is **not a discovery exercise** — skills that apply to this project must be invoked before work begins in their domain, not just noted.

**Skill scan — invoke, don't just flag:**

Search available skills and confirm which apply to this project's stack:

| Condition | Skill | When to invoke |
|---|---|---|
| Any project | `shadcn` | Before any component work — covers both Base UI and Radix backends |
| Any project | `next-best-practices` | Before Phase 1b stack verification |
| Supabase included | `supabase-postgres-best-practices` | Before first table or query |
| Marketing site / landing page | `copywriting` | Before writing any conversion copy |
| Frontend UI design work | `frontend-design` | Before high-fidelity UI work |
| Claude API integration | `claude-api` | Before any AI integration code |

For each applicable skill: confirm it is available. If a skill is listed as applicable but not yet installed, use `find-skills` to locate and install it now — before starting work.

> **Why mandatory invocation matters:** Using training knowledge instead of an available skill produces guesswork. Skills contain authoritative, up-to-date usage patterns, component APIs, and best practices. A skill that exists but isn't invoked provides zero benefit.

**MCP scan — check for service-specific MCPs:**

Beyond the required MCPs checked in Phase 1, scan for any service-specific MCPs relevant to this project's stack. For each third-party service in the project:

1. Search `registry.modelcontextprotocol.io` for the service name
2. Check the Anthropic-curated list at `https://code.claude.ai/docs/mcp` (Claude Code docs MCP table)
3. Classify any found MCP by source tier:
   - **Tier 1 — Official vendor** (published by the company that makes the service) — always prefer
   - **Tier 2 — Anthropic-curated** (in the Claude Code docs MCP table or Anthropic subregistry)
   - **Tier 3 — Community** (in the registry but not from the official vendor — use with caution, note provenance)
4. If a Tier 1 or Tier 2 MCP is found: surface the name, tier, and install command. Flag to George and wait for it to be added before working with that service.
5. If only a Tier 3 MCP is found: surface it, note it is community-sourced, and let George decide.
6. If no MCP is found: note explicitly ("No official MCP found for [service]") and proceed.

**Expected output:**
```
Skills — confirmed available and applicable
────────────────────────────────────────────
✅ shadcn                          — invoke before any component work
✅ next-best-practices             — invoke before stack verification
✅ supabase-postgres-best-practices — invoke before schema/query work
⚠️ frontend-design                — not installed — running find-skills to install

Service MCPs (beyond required set)
────────────────────────────────────
✅ Supabase MCP  — Tier 1 (official) — already configured
ℹ️ [Service]    — Tier 2 MCP found: [name + install command] — flagging to George
⚠️ [Service]    — No official MCP found — proceeding with skill/training knowledge
```

**Skills invoked this session** (required — output this block at the end of Phase 1c):
```
Skills invoked this session
────────────────────────────
✅ shadcn                           — invoked
✅ next-best-practices              — invoked
✅ claude-api                       — invoked (AI integration in stack)
⏭️ supabase-postgres-best-practices — skipped (no Supabase in this project)
⏭️ copywriting                      — skipped (not a marketing site)
```

This block must appear in the session transcript before any domain work begins. George can verify at a glance that the right skills were loaded. Omitting this block means Phase 1c is not complete.

---

## Phase 1d — Prior context intake

Before running discovery, check whether George has prior context on this project idea — notes from a brainstorming session, a competitor teardown, a rough spec, user interview notes, or a handover document from a previous conversation.

Ask exactly this:

> "Do you have any prior context on this project — brainstorming notes, a handover doc, a rough spec, or anything else worth sharing before we begin? If yes, paste it here now and I'll factor it in before we scaffold the plan."

**If George says no:** proceed directly to Phase 2.

**If George says yes — do the following before proceeding:**

1. Ask what type of context it is, if not already clear:
   - **Brainstorm notes** — loosely held ideas; use to inform but don't over-commit to specifics
   - **Competitor teardown / market research** — high value; use to shape the differentiation thesis
   - **Rough spec or feature list** — treat as a starting point, not a contract; validate against discovery
   - **User interview or research notes** — high signal; treat as observed evidence, not assumption
   - **Handover doc from a previous Claude session** — treat as a peer summary; high confidence but verify key decisions

2. Once pasted, read it fully. Then produce a structured summary before moving on:

```
Prior context summary
─────────────────────
Type:              [brainstorm / spec / research / handover / other]
Key themes:        [2–4 bullet points — the strongest signals]
Assumptions it contains: [things stated as fact that still need validating]
Tensions with defaults:  [anything that conflicts with the standard discovery approach or stack defaults]
How it will influence the plan: [specific sections of the Notion master plan or Linear issues it affects]
```

3. **Flag any conflicts explicitly.** If the prior context contradicts something that would normally be decided in discovery (e.g. a strong persona assumption, a technology choice, a scope decision), name the tension:
   > "Your notes assume X, but I'd normally validate that in discovery. Do you want to carry it forward as a confirmed decision, or keep it as an assumption to test?"

4. Carry the summary forward into Phase 2. The discovery process should build on this context — not repeat it. Skip or abbreviate discovery steps that the prior context has already answered with sufficient confidence.

> **Why this matters:** Prior context from a brainstorm session often contains the sharpest problem framing and the clearest differentiation thinking — work that would otherwise get reconstructed from scratch in discovery. Capturing it before scaffolding ensures it shapes the Notion master plan from the start, not as a retrofit.

---

## Phase 2 — Discovery

**This phase is mandatory before scoping, design, or any code work. It is not optional and cannot be skipped or abbreviated.**

Load and run `.claude/discovery.md` in full. It covers:
- Problem framing — what problem is actually being solved, for whom
- Assumption mapping — risks ranked by severity and ease to validate
- Competitive research — web research + Notion competitor database + gap analysis
- User insight — what's known vs assumed
- Validation plan — the 3 questions that would change everything
- Discovery Summary — written to Notion before proceeding

**Discovery is complete when all boxes on the completion gate in `discovery.md` are checked.**

If George tries to skip this phase or move directly to scoping, say clearly:
> "Discovery isn't done yet. Moving to build before this is complete is the most common reason projects get rebuilt from scratch three months later. What would you like to tackle next from the checklist?"

---

## Phase 3 — Project scoping

Discovery complete? Only then proceed here.

Before creating anything in Linear or Notion, confirm scope through conversation. The discovery work should have answered most of these — only ask what isn't already clear:

- What is the project? One-sentence description.
- Who is it for? (Should already be established in discovery — confirm it.)
- What does success look like? Key outcomes, not features.
- What's the rough timeline or deadline?
- Are there any known constraints — technical, design, or otherwise?
- Which design reference files apply? (Check against `CLAUDE.md` routing table)

Do not over-question. If discovery already answered these, skip them.

---

## Phase 3 — Master plan (Notion)

Once scope is clear, create the master plan document in Notion. This is the single source of truth for what the project is and why — Linear tracks the how and when.

**Notion document structure:**
```
# [Project Name]

## Overview
One paragraph: what this is, who it's for, what success looks like.

## Discovery Summary
Pull directly from the Discovery session output:
- Problem statement (one sentence)
- Target user (with evidence level: observed / told / assumed)
- Success metrics
- Top assumptions + risk ratings
- Differentiation thesis
- Validation plan (top 3 questions)
- Open questions from discovery

## Goals
- Primary goal
- Secondary goals (max 3)

## Users
- [Persona name] — [one-line description of their need]

## Scope
### In scope
- [Feature / capability]

### Out of scope
- [Explicit exclusions — prevents scope creep]

## Constraints
- Technical, timeline, design, or resource constraints

## Design principles
- 2–4 product-specific principles that govern decisions on this project
- These sit alongside the global principles in CLAUDE.md

## Milestones
| Milestone | Description | Target |
|---|---|---|
| M1 | [Name] | [Date or sprint] |
| M2 | [Name] | [Date or sprint] |

## Decisions log
Capture every significant directional decision here on the day it's made — before any code is written.
Each entry uses the 4-field format (see `rules/process.md` → Notion documentation protocol). Never skip a field.

```
Date: YYYY-MM-DD  Tag: #strategic | #craft | #reflection

1. What changed: [The decision or work done — 1–2 sentences]
2. Why: [The reasoning — what problem or constraint was this answering]
3. What I almost did instead: [Rejected alternatives, even small ones — most valuable field]
4. What surprised me: [Pushback, unexpected outcomes, assumptions that turned out wrong]
```

> A decisions log pays for itself many times over. The cost is ten minutes of writing per decision; the value is never re-litigating the same question three weeks later when you're tired and the answer feels arbitrary. The 4-field format also generates the raw material for a case study — written continuously, not reconstructed at the end.

## Open questions
- Questions that need answers before specific tasks can be completed
```

After creating the document, share the Notion URL with George for review before proceeding to Linear.

---

## Phase 5 — Linear project + issues

Once George has confirmed the Notion plan, create the corresponding structure in Linear.

**What to create:**

1. **A new Linear project** named `[Project Name]`
   - Add a description (pull from the Notion Overview section)
   - Link to the Notion document in the project description

2. **One issue per discrete task**, grouped by milestone where milestones exist

**Issue format:**
```
Title:       [Short, action-oriented — "Build report export flow" not "Export"]
Description: [What needs to be done and why — 2–4 sentences]
             [Link to relevant Notion section if applicable]
Labels:      [design / frontend / backend / research / content]
Priority:    [Urgent / High / Medium / Low]
Milestone:   [M1 / M2 / etc. if defined]
Done when:   [Binary, mechanical acceptance criterion — a check a computer or human can run in seconds
              that returns pass/fail with no judgement required. Examples:
              - "`npm run build` exits 0 with no new warnings"
              - "User can complete [task] in a fresh browser session without console errors"
              - "`git grep 'deprecated-module'` returns zero matches"
              NOT: "the feature works" or "it feels complete"]
```

> **Why binary criteria matter.** "Feels done" is unreliable. A binary, mechanical check eliminates subjective decision points, makes the work decomposable into measurable steps, and absorbs setbacks without scope-reduction temptation — because scope reduction is visibly cheating when the criterion still fails.

**Issue granularity guide:**
- One issue = one reviewable unit of work (something that can be PR'd, tested, or signed off independently)
- If an issue would take more than 2–3 days, split it
- If an issue would take less than 30 minutes, consider combining it with a related one

**After creating all issues:**
- Confirm the total issue count and project structure with George
- Flag any dependencies between issues (i.e. issue B cannot start until issue A is complete)
- Identify any open questions from Notion that are blocking specific issues

**Scoping question to ask for every issue before creating it:**
> "What does this assume already exists?"

If the answer reveals a missing foundation — something multiple other issues also depend on — stop. Create the foundation work as its own issue first and reclassify the original as a follow-up. A half-day ticket that cascades into a multi-week foundation reset is a sign the precondition wasn't examined at scoping time.

---

## Phase 6 — Begin work

With MCPs verified, plan documented in Notion, and issues created in Linear, begin the first task following the order below. Do not skip ahead — each stage feeds the next.

### Stage 1 — UX process (always first)
Load [`ux-process.md`](./ux-process.md). Before any interface is designed, the following must be established:

1. **Research** — what do we know about the users? What assumptions need validating? → Document findings in **Notion** (one page per research round)
2. **Strategy** — does the feature align to a clear user goal and business outcome? → Record in the **Notion** master plan under Goals and Design principles
3. **Personas** — which persona(s) does this task serve? Reference them in every design decision → One **Notion** page per persona, linked from the master plan
4. **Brand identity** — establish tone of voice, colour direction, typography system, and icon style as a cohesive set → Document on a **Notion** page titled `[Project Name] — Brand Identity`, linked from the master plan. Then configure: colours and font variables in `globals.css` (`@theme inline` block), font imports in `layout.tsx`, icon library swap if needed via `npm run swap-icons`. When writing or reviewing any marketing or UI copy (headings, CTAs, landing pages, onboarding), invoke the `copywriting` skill.
5. **User stories** — write stories for all in-scope functionality before opening Figma or writing code → Draft in **Notion** first, then mirror each story as a **Linear** issue
6. **Information architecture** — define the structure and navigation before laying out screens → Document as a structured **Notion** page with the site map hierarchy, linked from the master plan
7. **User flows** — map the full flow (happy path + errors + edge cases) before designing individual screens → Document as **Notion** pages (one page per flow) using the flow notation format; link from the master plan and the relevant Linear issue

Do not proceed to Stage 2 until flows are mapped and reviewed.

### Stage 2 — Design psychology (runs throughout, starts here)
Load [`design-psychology.md`](./design-psychology.md). Before producing any UI, apply the relevant principles to the flows and structure established in Stage 1:

- Run each screen or flow through the checklist: Hick's Law, Gestalt grouping, Fitts's Law, Jakob's Law, Cognitive Load, Colour Psychology
- Flag any points in the flow where a principle is being violated — resolve at the flow level before moving to UI
- Document which principles are driving key decisions — these become the rationale when reviewing with stakeholders

Design psychology continues to apply through Stage 3. It is not a one-time gate.

### Stage 3 — UI standards (last)
Load [`ui-standards.md`](./ui-standards.md). Only once structure and psychology have been validated, apply the visual layer using the brand identity decisions from Stage 1:

1. **Layout** — translate flows into screen layouts using Tailwind grid/flex
2. **Components** — reach for shadcn primitives first; compose or extend as needed. When adding, composing, debugging, or styling shadcn components, invoke the `shadcn` skill — it has component docs, usage examples, and registry knowledge built in.
3. **Colour** — apply the brand palette via shadcn tokens in `globals.css`; verify dark mode and WCAG AA contrast
4. **Typography** — apply the brand's font system; confirm hierarchy reads clearly across the type scale
5. **Iconography** — use the project's chosen icon library; confirm sizing (`size-*`), labels, and accessibility attributes
6. **Spacing** — apply Tailwind spacing scale; confirm groupings read correctly

### Testing strategy (runs throughout)

Testing is not a phase that happens after features are built — it is a discipline applied continuously. Follow this approach:

**What to test with Playwright (E2E):**
- Every user-facing flow defined in the UX process — happy path first, then error states
- Any flow that involves auth, data mutation, or navigation across multiple pages
- Critical paths: sign up, log in, core feature task, export/save

**What NOT to test with Playwright:**
- Visual appearance (use manual dark mode / breakpoint checks instead)
- Internal implementation details — test what the user sees, not how the code works
- Every possible edge case — focus on the flows users will actually hit

**When to write tests:**
- Write the E2E test for a flow **in the same issue** as building the flow — not as a follow-up ticket
- After any refactor that touches a user-facing flow, run the full suite before marking done
- After any dependency upgrade (React, Next.js, Tailwind), run the full suite to confirm the baseline holds

**Maintaining the suite:**
- Update test selectors in the **same PR** that changes the UI — never let them drift
- If the pass count drops dramatically between runs, check the environment before reading the code — a stale dev server on port 3000 is a common false positive (see Standing engineering disciplines → Test suite hygiene)
- Keep `reuseExistingServer: !process.env.CI` in `playwright.config.ts` but be aware: if a background dev server is running from a previous session, Playwright will reuse it. Kill stray servers before running the suite locally if results look wrong (`lsof -i :3000`)

**The baseline number matters:**
After each milestone, note the passing test count in a Linear comment. This number is a load-bearing fact — it's what you compare against when something unexpected changes.

### Database work (Supabase)
When any work involves writing queries, designing schema, or optimising database performance, invoke the `supabase-postgres-best-practices` skill. This applies from the first time a table is created — schema decisions made early are expensive to undo later.

### README — rewrite it for this project

The `README.md` created by `create-project.sh` is a scaffold placeholder. Before any code is committed, replace it with a README that reflects the actual project.

A good project README covers:
- **What it is** — one paragraph, plain English, no jargon
- **Who it's for** — the primary user type(s) from the personas
- **Stack** — the actual stack for this project (from CLAUDE.md header)
- **Getting started** — `npm run dev`, env vars to fill in
- **Deployment** — how to deploy, where it lives
- **Repo structure** — the actual structure, not a generic template

Write this once scoping is complete (after Phase 2) and keep it up to date as the project evolves. A README that accurately describes the project is useful to future-you, collaborators, and anyone reading the case study.

### Throughout all stages
- Update the relevant Linear issue status as work progresses
- Log decisions and trade-offs as comments on the Linear issue — not just in conversation
- If scope changes materially, update the Notion document first, then adjust Linear issues to match

### On every issue merge to main — mandatory documentation step

When an issue branch is merged to `main`, before creating the next branch:

1. **Write a 4-field Notion entry** in the Decisions log for that issue:
   - What changed (what this issue shipped)
   - Why (the user need or problem it answered)
   - What I almost did instead (alternatives considered during implementation)
   - What surprised me (anything unexpected during build or review)
2. **Post a summary comment on the Linear issue** confirming the merge and linking the Notion entry if written.
3. **If this merge completes a milestone**, also write a milestone-level 4-field entry summarising what the milestone delivered as a whole — one entry that spans all the issues in the milestone.

> **Why this discipline matters:** The goal is to be able to write a full case study for every project without reconstructing anything from memory. That only works if documentation happens at merge time, when context is fresh. An issue merged without a 4-field entry is context that's gone forever.

### New service or package added mid-project — mandatory check

Any time a new package is installed (`npm install [x]`) or a new third-party service is introduced **after the initial setup phase**, pause and run this check before writing any implementation code:

**Step 1 — Skill check:**
1. Does a skill exist for this service or library? Search available skills.
2. If yes — invoke it before writing any code for that service.
3. If no — run `find-skills` to search for one. If installable, install it first.

**Step 2 — MCP check:**
1. Search `registry.modelcontextprotocol.io` for the service name.
2. Prioritise by tier: Tier 1 (official vendor) > Tier 2 (Anthropic-curated) > Tier 3 (community).
3. If Tier 1 or Tier 2 found: surface name, tier, install command. Stop and wait for George to add it.
4. If Tier 3 only: surface it, note it is community-sourced, let George decide.
5. If nothing found: note it explicitly and proceed.

**Never silently start implementing a new service.** The check takes 60 seconds. Discovering mid-feature that training knowledge was wrong costs hours.

---

---

## Phase 6 — Project close

Run this phase when the final milestone is shipped and the product is in a stable deployed state.

**1. Linear**
- Mark all remaining issues as Done or Cancelled (with a note explaining why)
- Mark the project itself as Completed

**2. Notion**
- Update the master plan's milestone table to reflect completion dates
- Add a "Status: Shipped" note to the Overview section
- Confirm the Decisions Log is up to date — every milestone should have a 4-field entry; any gaps must be filled now before the project is considered closed
- Review the log: the entries should collectively tell the story of the project in enough detail for a case study. If they don't, write the missing entries before moving on.

**3. Deployment**
- Confirm the production build is green (`next build` passes)
- Verify the live URL is accessible and environment variables are set correctly
- Check Netlify deploy log for any warnings

**4. Retrospective — Lessons & Insights**
Create a child page under the master plan titled `📚 Lessons & Insights`. This is a permanent record of what this project taught us — written for someone who has no project context, as case study material.

See the **Lessons & Insights** rules below for how to write and structure this page.

---

## Lessons & Insights — standing rules

These rules apply throughout the project, not just at close. Lessons should be captured in the moment — while the story is fresh — not reconstructed at the end.

### When to write a lesson
Write a lesson entry whenever any of the following happen:
- A non-obvious decision was made and the reasoning matters for future work
- Something broke in a way that wasn't anticipated — and the fix revealed a generalisation
- A process discipline was applied (binary acceptance criterion, regression checklist, etc.) and it worked or failed in an instructive way
- A milestone closes faster or slower than expected due to something that could have been predicted
- A refactor, migration, or architecture change produced a surprise — good or bad

Do not wait for the project to end. Write the lesson the same session it happened.

### Format for each entry
```
Date: YYYY-MM-DD
Headline: One sentence — what happened and why it matters

The story: What actually happened — specific, concrete, names the files/tickets/decisions involved.

The generalisation: The rule that applies beyond this project. Written for an external reader with no project context.

Linear reference: [ticket ID(s) if applicable]
```

### Page structure — one lesson per Notion page
**Do not write all lessons on a single page.** Each lesson is its own child page under `📚 Lessons & Insights`. The parent page contains only:
- A one-paragraph intro explaining the format
- A numbered index linking to each child page (title = lesson headline)

This keeps every individual lesson readable by the Notion MCP in a single fetch, and prevents the parent page from growing too large to read.

**To add a new lesson:**
1. Create a new child page under `📚 Lessons & Insights` titled `[N]. [Date] — [Headline]`
2. Write the full entry using the format above
3. Add a link to it in the index on the parent page

### Tone
Write for an external audience — someone reading this for a case study should not need project context to understand the point. The story is project-specific; the generalisation is universal.

---

## Standing engineering disciplines

These rules apply on every project, at every stage. They are derived from hard-won experience and exist to prevent specific, recurring failure modes.

### Declaring a milestone done

Before marking any milestone complete, open the user-facing surface in a fresh browser tab and click through it manually. Ask:
- Can I find any seam between old behaviour and new behaviour?
- Does the codebase still contain two vocabularies, two UI surfaces, or two data models where the milestone promised one?
- Does the binary acceptance criterion on every issue in this milestone pass?

If any answer is yes, the milestone is not done. "The engine works" is a developer story. "Every user-facing surface uses the engine" is the milestone.

### Before any refactor touching user-facing flows

Write a **regression checklist** *before* starting — not after. Walk through the working flows manually, enumerate every user-facing capability the refactor must preserve, and put the checklist in the PR description. Run it before declaring done.

Format:
```
## Regression checklist
- [ ] [User can do X — specific UI steps, not abstract feature name]
- [ ] [User can do Y — include any edge cases specific to this flow]
```

Automated tests are necessary but not sufficient. The checklist catches what tests don't cover. Skipping it leads to silent feature loss that only surfaces when a user manually tests.

### Removing a feature

Removing a feature is two jobs:
1. Remove the user-facing surface (UI, routes, buttons)
2. Remove the full implementation (data shapes, props, functions, types, state)

Doing only (1) is **worse than doing neither** — dead implementation creates a phantom mental model that misleads anyone who reads the code later. Either delete every trace in the same commit, or open a cleanup issue immediately and make the residue visible. "I'll come back to it" doesn't happen.

### Test suite hygiene

Update test selectors and assertions in the **same PR** that changes the UI — not as a follow-up. A test suite allowed to drift loses its value as a regression signal. When test results drop dramatically (e.g. 40 passing → 11 passing), check the test environment before reading the code — a stale dev server, build cache, or polluted port is often the culprit.

### Never use `next/dynamic` for components that render during client-side navigation

`next/dynamic` with `dynamicIconImports` or similar patterns causes silent hydration failures that freeze the browser during client-side navigation. No console errors — just a dead page. Use static imports or object lookups instead:

```tsx
// ❌ Crashes silently during client-side navigation
const Icon = dynamic(() => import('lucide-react').then(m => ({ default: m[name] })))

// ✅ Static object lookup — same API, no crashes
import { icons } from 'lucide-react'
const Icon = icons[name]
```

This applies to any component that renders during navigation — not just icons. If a page goes dead after navigating to it with no console errors, check for `next/dynamic` usage on that page.

### Fix the layout — don't hack around it

If centring or sizing a layout element requires `min-h-[calc(100svh-Xrem)]` or similar calc hacks, the parent layout is wrong. Fix the parent:

```tsx
// ❌ Hack — fighting the parent layout
<div className="min-h-[calc(100svh-4rem)] flex items-center justify-center">

// ✅ Fix — give the parent flex context so children can use flex-1
<main className="flex flex-1 flex-col">          {/* parent needs this */}
  <div className="flex flex-1 items-center justify-center">  {/* child works naturally */}
```

If it feels hacky, fix the parent. `calc()` hacks for layout sizing are always a symptom, never a solution.

### Restore working code — don't rebuild from scratch

When something worked before and doesn't now, use `git` to find and restore the working version before rewriting:

```bash
git log --oneline -- path/to/file.tsx   # find the last working commit
git show <commit>:path/to/file.tsx      # inspect it
git checkout <commit> -- path/to/file.tsx  # restore it
```

Test the restored file. If it works, the bug is elsewhere. Never rewrite a component to "fix" a bug that isn't in that component. Rewrites introduce new bugs and destroy the signal of what actually changed.

### Don't build features that need infrastructure not yet in place

Before starting any feature that depends on external infrastructure — OAuth providers, push notification services, native platform APIs, third-party accounts, paid API keys — confirm the infrastructure exists and is testable. If it isn't, note the feature as blocked and move on. Building a feature and then discovering it can't be tested wastes implementation time and produces code that can't be verified.

**Checklist before starting any integration feature:**
- [ ] Required accounts / credentials exist
- [ ] The feature can be tested in the current environment (not just in production)
- [ ] Any required build configuration is in place

If any answer is no — mark the issue as blocked, note what's missing, and move to the next issue.

### Netlify deploy budget — disable auto-publishing during active development

Netlify's free tier gives **300 build credits/month**. Each Next.js build costs ~10 credits, meaning ~30 deploys per month. During active development it's easy to burn through the entire month's budget in one session.

**Rules:**
- Disable auto-publishing at the start of every project: **Site settings → Build & deploy → Stop auto publishing**
- Work locally and push to GitHub freely — only trigger Netlify deploys manually when ready to ship
- Batch changes: multiple commits locally, one deploy
- If credits run out, all deploys are paused with no way to resume until the billing cycle resets

**Alternative:** For Next.js projects, Vercel has no credit system and a more generous free tier.

### Supabase + Render: always use Session Pooler

If the project uses Render (for Strapi or any other service) connecting to Supabase, **use the Session Pooler connection string**, not the Direct Connection. Render resolves Supabase's direct connection hostname to an IPv6 address it cannot reach, causing `ENETUNREACH` errors on every deploy.

**Session Pooler settings (from Supabase dashboard):**
- Host: `aws-X-[region].pooler.supabase.com`
- Port: check the Supabase UI — do not assume
- Username: `postgres.[project-ref]`

Things that do **not** fix the direct connection issue: `--dns-result-order=ipv4first`, pinning Node version, changing Render region.

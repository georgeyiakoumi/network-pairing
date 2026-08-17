# rules/process.md — Non-Negotiable Process Rules

These rules are not guidance. They are hard constraints that apply on every project, at every stage, without exception. Re-read this file after any `/compact` and before marking any milestone done.

---

## MCP gates — hard stops

A missing MCP is not a warning. It is a blocker.

**Distinguish three states — treat them differently:**

| State | Meaning | Action |
|---|---|---|
| ✅ Connected | Tool found, call succeeded | Proceed |
| ⚠️ Transient error | Tool found, call returned 502/timeout | Note it, retry later, proceed cautiously |
| ❌ Not configured | Tool not found after searching deferred tools | **Hard stop. Do not proceed.** |

**When an MCP is ❌ not configured:**
1. Stop. Do not attempt to work around it with training knowledge.
2. Tell George exactly which MCP is missing and why it's needed.
3. Provide the exact setup path: Claude Code → Settings → MCP Servers, or the `claude mcp add` command if known.
4. Wait for confirmation that it's been added and re-check before continuing.

Proceeding without a required MCP means falling back to potentially stale training knowledge instead of the authoritative source. This produces guesswork dressed as confidence.

---

## Required MCPs by stack item

When a project includes any of the following, the corresponding MCP is required — not optional:

| Stack item | Required MCP | Publisher |
|---|---|---|
| Any project | Linear | Anthropic / Linear |
| Any project | Notion | Anthropic / Notion |
| Any project | GitHub | Anthropic / GitHub |
| Netlify deployment | Netlify | Anthropic / Netlify |
| Supabase | Supabase MCP | Supabase (official) |
| Strapi | — (no official MCP yet — note this) | — |

Check this table during Phase 1. If a required MCP is missing, hard stop and flag it before any design or code work begins.

---

## Required skills by stack item

Skills must be **invoked** before working in their domain — not just noted as available. Knowing a skill exists and not using it is equivalent to not having it.

| Domain / tool | Skill to invoke | When |
|---|---|---|
| Any shadcn component work | `shadcn` | Before building or modifying any component |
| Any Next.js file conventions / patterns | `next-best-practices` | Before Phase 1b stack verification |
| Any Supabase schema or query work | `supabase-postgres-best-practices` | Before writing the first table or query |
| Any marketing copy / landing page | `copywriting` | Before writing any conversion copy |
| Any frontend UI design work | `frontend-design` | Before high-fidelity UI work |
| Any Claude API / Anthropic SDK integration | `claude-api` | Before writing any AI integration code |
| SVG animations (draw-on, morphing, path) | `svg-animations` | Before animating any SVG asset |
| GSAP animations (timelines, ScrollTrigger) | `gsap-core` + `gsap-react` + `gsap-scrolltrigger` | Before any GSAP implementation |
| Framer Motion (React animations, gestures, layout) | `framer-motion-react` + relevant sub-skill | Before any Framer Motion implementation |
| UI polish / micro-interactions / motion review | `impeccable` | When adding animations to existing UI or polishing a feature |

**Animation tool decision guide:**
- **SVG path animations** (draw-on, morphing, icons) → `svg-animations` skill, plain CSS or SMIL
- **React component animations** (enter/exit, layout shifts, gestures) → Framer Motion + `framer-motion-react`
- **Complex timelines or scroll-driven animations** → GSAP + `gsap-scrolltrigger`
- **UI polish pass on an existing feature** → `impeccable` (reviews and enhances motion holistically)

**The rule:** Before starting work in any of these domains, invoke the relevant skill. Do not use training knowledge as a substitute for an available skill. If the skill isn't yet installed, use `find-skills` to locate and install it first.

---

## New service added mid-project — mandatory check

Any time a new package is installed (`npm install [something]`) or a new third-party service is introduced during the project (not just at setup), pause and run this check before writing any implementation:

**Step 1 — Skill check:**
- Does a skill exist for this service/library? Search available skills.
- If yes: invoke it before writing any code.
- If no: use `find-skills` to search for one. If installable, install it first.

**Step 2 — MCP check:**
- Does an official MCP exist for this service?
- Search `registry.modelcontextprotocol.io` for the service name.
- **Prioritise by source tier:**
  1. **Official vendor MCP** — published by the company that makes the service (e.g. Stripe's own MCP). Always prefer this.
  2. **Anthropic-curated** — listed in the Anthropic subregistry or Claude Code docs MCP table.
  3. **Community** — listed in the registry but not from the official vendor. Use with caution; note provenance to George.
- If an official or curated MCP is found: surface the name, publisher tier, and install instructions. Stop and wait for George to add it before continuing.
- If no MCP is found: note it explicitly ("No official MCP found for [service] — proceeding with skill/training knowledge") and continue.

**Never silently proceed** with a new service without completing both checks. The cost of checking is seconds. The cost of using stale training knowledge for an API is bugs that are hard to diagnose.

---

## Pre-install version check — mandatory before any scaffold or install

Before running any scaffold command (e.g. `npx create-next-app`, `npx shadcn init`) or installing any package (`npm install [something]`), run this check first — every time, without exception.

Training knowledge has a cutoff date. Package versions, CLI flags, and scaffold output change between major releases. Installing from memory produces outdated dependencies and broken commands that are hard to diagnose.

**Step 1 — Look up the latest stable version:**
- WebSearch for: `[package name] latest stable version` or `[framework] latest release changelog`
- Check the official docs or GitHub releases if the search result is ambiguous
- Do not rely on training knowledge for version numbers

**Step 2 — Verify the scaffold CLI flags are current:**
- Scaffold CLIs change between major versions (flags are added, removed, renamed)
- WebSearch for the current scaffold command syntax — e.g. `create-next-app CLI flags [year]`
- Do not run a scaffold command from memory
- **shadcn specifically:** as of July 2026, `npx shadcn init` defaults to Base UI. To use Radix or React Aria instead, pass `--base radix` or `--base aria`. Confirm the intended backend with George before running init — changing it after components are added is a migration, not a flag swap.

**Step 3 — State versions before installing:**
Before running any command, output the following to George:
```
About to install:
- [package]: [version] (source: [where you checked])
- [package]: [version] (source: [where you checked])

Command: [exact command to run]
```
Wait for George to confirm before running.

**Step 4 — Pin major versions where it matters:**
For scaffold-generated `package.json` files, confirm that core dependencies (Next.js, React, Tailwind, TypeScript) are pinned to the versions actually installed — not floating ranges that will silently upgrade on the next `npm install`.

**The rule:** Never run `npx`, `npm install`, or any package manager command without completing Steps 1–3 first. "I think this is version X" is not a version check.

---

## Lessons & Insights — read before acting

**This is not a post-session ritual. It is a pre-action requirement.**

Before responding to any prompt that involves design, code, or process decisions:
1. Fetch the `📚 Lessons & Insights` page from Notion and read every lesson entry.
2. Also read `.claude/memory/lessons.md` as a local fallback (useful if Notion MCP is unreachable).
3. Do not act until both have been checked.

If a lesson is directly relevant to the current task, state it explicitly before proceeding:
> "Lesson [N] applies here — [one sentence summary]. Adjusting approach accordingly."

Lessons that are never read are a diary. Lessons that are read before acting are a system. The entire value of recording them depends on this step.

**When a new lesson is written to Notion**, also add a summary line to `.claude/memory/lessons.md` immediately — do not wait until the end of the session. Format:
```
- [N]. [Date] — [Headline] → [one-sentence generalisation]
```

---

## Never guess — always check documentation

When in doubt about how a library, API, framework feature, or tool works:
- **Do not guess.** Do not rely on training knowledge for anything version-specific or API-specific.
- Check the documentation. Use the relevant MCP if one exists (e.g. Supabase MCP for schema questions). Use the relevant skill if one is available. WebSearch if neither applies.
- State explicitly when you are working from documentation vs training knowledge: *"This is from the Next.js 15 docs"* vs *"I believe this is how it works — let me verify."*
- If you cannot verify and the stakes are meaningful, say so and ask George before proceeding.

Guessing and being wrong costs more time than checking. Never present training knowledge as documentation.

---

## Git workflow — non-negotiable

### Every piece of work lives on a branch

- **Never work on `main`.** No commits, no edits, no exceptions.
- Every branch must be derived from a Linear ticket. Branch naming format: `geo-[ticket-number]-[short-slug]` — e.g. `geo-42-add-export-flow`.
- If no Linear ticket exists for the work, create one before creating the branch.

### Before committing or pushing — always ask George first

- **Never commit or push without George's explicit approval.** He will want to test first.
- When work is ready, say exactly: *"Ready for your review — let me know when you've tested and I'll commit and push."*
- Do not interpret silence or "looks good" in conversation as approval to push. Wait for an explicit "go ahead" or equivalent.
- This applies to every commit — not just the first one on a branch.

### Commit message format

Every commit message must reference the Linear ticket ID:
```
geo-[N]: [Short description of what changed]
```
Example: `geo-42: Add CSV export button to report page`

Linear auto-links these. It also makes `git log` readable without opening a browser.

### Proposing to bundle work on the same ticket

If Claude thinks a small tweak or fix logically belongs on the current open branch and ticket (rather than opening a new one), propose it explicitly before doing it:
> "This fix is small and directly related to geo-[N]. Want me to include it on this branch rather than open a new ticket?"

Wait for George's answer. Never silently bundle unrelated work onto an open branch.

### After every commit — update the Linear ticket

After each commit, post a comment on the active Linear issue. Minimum content:
- What was committed (one sentence)
- What still remains on this branch, if anything

Do not batch these up. Comment at commit time, not at PR time.

### PR discipline

Before raising a PR:
1. Run `/improve quick` — review the output and fix any HIGH confidence findings before continuing. Cross-reference anything flagged against the Notion decisions log and `CONTEXT.md` before acting — intentional trade-offs should not be treated as bugs. Update `CONTEXT.md` with any new trade-offs surfaced.
2. Run `npm run typecheck` — must pass with zero errors
3. Run `npm run lint` — must pass with zero errors (catches JSX/ESLint issues `build` does not)
4. Run `npm run build` — must exit 0 with no new warnings
5. Fix anything that fails before raising the PR. Do not raise a PR against a broken build.

**Create the PR yourself using `gh pr create`.** Never output the description and ask George to paste it. Never push without also creating the PR. The PR description is your responsibility — draft it, then run `gh pr create` with it in the same step. Do not raise a PR without a description.

PR description must include:
- **What changed** — 2–4 sentences, plain English
- **Why** — the user need or bug this addresses
- **Linear ticket link**
- **Regression checklist** (if the PR touches a user-facing flow — see Standing engineering disciplines)

### After a PR merges

1. Switch to `main` and pull latest: `git checkout main && git pull`
2. Delete the remote branch: `git push origin --delete geo-[N]-[slug]`
3. Update the Linear ticket to Done and add a comment confirming the merge
4. Then — and only then — create the next branch for the next issue

Do not start the next branch from a stale `main`. Always pull before branching.

---

## Issue lifecycle

- **Binary acceptance criterion on every issue.** "Done when: `[mechanical check]`." Not "it works" or "it feels complete." A check that a computer or human can run in seconds with pass/fail.
- **Update the Linear issue status as work progresses.** Not just at the end — in progress when started, done when the criterion passes.
- **Log material decisions as Linear comments** — not just in conversation. Decisions that aren't logged are decisions that will be re-litigated.
- **When a solution is found or a decision is made mid-implementation, post a comment to the active Linear issue before moving on.** Do not wait until the end of the session. The comment should state what was decided and why — one sentence minimum.
- **After a git push, update the active Linear issue.** At minimum: confirm the issue is still the right status. If the push completed a task, mark it done and add a comment linking what was shipped. If Notion scope changed as a result, update the master plan first.

---

## Notion documentation protocol — 4-field format

Every significant project event must be documented in Notion using the four-field format below. This is not optional — it is the raw material for case studies, retrospectives, and future projects. Skipping it means the project leaves no institutional memory.

**Date format: DD/MM/YYYY** (George is UK-based). Never use MM/DD/YYYY or YYYY-MM-DD in Notion entries.

**The four fields — never skip one:**

1. **What changed** — the decision or work done. 1–2 sentences.
2. **Why** — the reasoning. What problem or constraint was this answering?
3. **What I almost did instead** — rejected alternatives, even small ones. This is the most valuable field — it explains the reasoning rather than just the outcome.
4. **What surprised me** — pushback, unexpected outcomes, assumptions that turned out wrong.

Tag every entry: `#strategic`, `#craft`, or `#reflection`.

**When to write a 4-field entry:**

| Trigger | Where to document |
|---|---|
| A significant mid-implementation decision | Notion decisions log + Linear issue comment |
| An issue is merged to main | Notion decisions log (one entry per issue, written at merge time) |
| A milestone is completed | Notion decisions log (one milestone-level entry summarising the milestone) |
| A lesson is written | Notion `📚 Lessons & Insights` child page |

**Decisions log structure:** The decisions log lives as a dedicated child page (📋 Decisions Log) under the project master plan. Each entry is its own sub-page under that child page. Entries are in chronological order (oldest first). Never append entries inline to the parent page — the parent is an index only.

**The case study principle:** Every project should be documentable as a fruitful case study when it ends. That only works if the documentation happens continuously — not reconstructed from memory at the end. The 4-field format is designed so each entry can stand alone: read by someone with no project context, the *why* and *what I almost did instead* fields carry the story.

**On every issue merge to main:**
Before creating the next branch, write a 4-field Notion entry for the issue just merged. If the merge completes a milestone, also write a milestone-level 4-field entry summarising the milestone as a whole.

---

## Milestone completion — never declare done early

Before marking any milestone complete:
1. Run `/improve` (full audit) — review all HIGH confidence findings. Fix genuine issues. Log intentional trade-offs in `CONTEXT.md` and the Notion decisions log so they don't surface again next run.
2. Open the user-facing surface in a fresh browser tab and walk through it manually.
3. Ask: is there any seam between old and new behaviour?
4. Ask: does the binary acceptance criterion on every issue in this milestone pass?
5. Ask: does the codebase still contain two vocabularies, two data models, or two UI surfaces where the milestone promised one?

If any answer is yes — the milestone is not done. "The engine works" is not "every consumer uses the engine."

---

## Production release — shipping to users

A production release happens when the MVP or a significant version is ready for real users. It is distinct from a PR merge or a milestone sign-off — it is a public commitment, with a version number and release notes.

### When to cut a release

- The agreed MVP scope is complete and the milestone completion gate has passed
- All critical bugs from QA are resolved
- The Netlify deployment is stable and verified in a fresh browser session
- George has explicitly confirmed "ready to ship"

Never cut a release speculatively. Wait for explicit confirmation.

### Versioning scheme (semver)

`MAJOR.MINOR.PATCH`

| Increment | When |
|---|---|
| **PATCH** (e.g. `1.0.1`) | Bug fixes that don't change the user-facing feature set |
| **MINOR** (e.g. `1.1.0`) | New features added in a backwards-compatible way |
| **MAJOR** (e.g. `2.0.0`) | Breaking changes, major redesigns, removed features |

First public release is always `1.0.0`. Pre-release work stays on `0.x.x` if public access is gated.

### Release checklist

Before tagging:

- [ ] Milestone completion gate passed (see above)
- [ ] `npm run typecheck` — zero errors
- [ ] `npm run lint` — zero errors
- [ ] `npm run build` — exits 0, no new warnings
- [ ] Deployed to Netlify production and verified in a fresh browser tab (not just local)
- [ ] Dark mode verified on the deployed URL
- [ ] Mobile viewport verified on the deployed URL
- [ ] All environment variables confirmed in Netlify → Site → Environment variables
- [ ] Notion master plan updated to reflect what actually shipped
- [ ] Notion decisions log has an entry for this release milestone

### Step-by-step

**1. Tag the release**
```bash
git tag -a v[X.Y.Z] -m "v[X.Y.Z] — [one-line description]"
git push origin v[X.Y.Z]
```

**2. Create the GitHub Release**
```bash
gh release create v[X.Y.Z] \
  --title "v[X.Y.Z] — [short description]" \
  --notes "[what shipped in plain English — 3–5 bullet points]"
```

Release notes should be written for a non-technical reader if the project has external stakeholders. Focus on what users can now do — not what code changed.

**3. Update Linear**

Post a comment on the relevant milestone issue:
- Version: `v[X.Y.Z]`
- Deployed URL
- GitHub Release link
- Mark the milestone issue Done

**4. Write the Notion 4-field entry**

Write a milestone-level entry in the Notion decisions log for the release:
- What changed: what shipped
- Why: the problem it solves for users
- What I almost did instead: scope that was cut, trade-offs made
- What surprised me: anything that differed from the plan

Tag: `#strategic`

### After the release

- Monitor Netlify deploy logs for the first 24 hours
- Check for any client/user feedback that reveals issues not caught in QA
- If a fix is needed, cut a PATCH release — do not push directly to main without a branch and PR

---

## Notion drift audit — mandatory at key checkpoints

Notion is the source of truth. If the codebase, Linear, or a conversation has moved ahead of Notion, Notion is wrong — and wrong documentation is worse than no documentation because it actively misleads.

**When to run the audit (non-negotiable):**
- Before marking any milestone complete
- After any `/compact` re-orientation
- When starting a new session on a project that's been running for more than one session
- Whenever a significant pivot or scope change occurs mid-implementation
- Before raising a PR

**What to check — go through each section of the Notion master plan:**

| Section | What to verify |
|---|---|
| Overview | Still accurate? Scope hasn't silently grown or shrunk? |
| Discovery Summary | Problem statement, target user, differentiation thesis — still what the project is building toward? |
| Goals | Primary and secondary goals still reflect what's actually being built? |
| Scope (in / out) | Anything that was "out of scope" that snuck in? Anything in scope that was quietly dropped? |
| Constraints | Any new constraints surfaced during build? Any old ones that no longer apply? |
| Milestones | Do the milestone descriptions match what was actually shipped? Completion dates accurate? |
| Decisions log | Is every significant implementation decision logged? Any gaps since the last audit? |
| Open questions | Have any open questions been answered? Are new ones unresolved? |

**How to run it:**
1. Fetch the Notion master plan page.
2. Compare each section against: the current codebase state, the Linear issue history, and the conversation context.
3. For every discrepancy found, update Notion immediately — do not continue work until Notion reflects reality.
4. State the result explicitly: *"Notion audit complete — N discrepancies found and updated."* or *"Notion audit complete — no drift detected."*

**The drift principle:** A Notion page that hasn't been updated in 3+ sessions is almost certainly stale. The longer drift goes unaddressed, the harder it is to reconstruct what was actually decided and why. An out-of-date decisions log is the most common reason the same question gets debated twice.

---

## Lessons — write in the moment

Write a lesson entry the same session something notable happens. Not at the end of the project — now.

Write a lesson when:
- Something broke in a non-obvious way and the fix revealed a generalisation
- A decision was made whose reasoning matters for future work
- A milestone closed faster or slower than expected due to something predictable
- A process discipline worked or failed in an instructive way

**One lesson = one Notion child page.** Never append lessons to the parent page as inline text. The parent page is an index only.

---

## After `/compact` — mandatory re-orientation

If the conversation has been compacted (context window was compressed), do the following before continuing any work:

1. **Re-read `CLAUDE.md`** — re-establish the project stack, principles, and routing.
2. **Re-read `.claude/rules/code.md`** — re-load non-negotiable code constraints.
3. **Re-read `.claude/rules/design.md`** — re-load non-negotiable design constraints including the honesty and self-evaluation rules.
4. **Re-read this file (`.claude/rules/process.md`)** — re-load process rules and MCP/skill tables.
5. **Re-read the Discovery Summary in Notion** — fetch the project's master plan page and re-read the Discovery Summary section. Every design and build decision must be informed by the validated problem statement, target user, differentiation thesis, and open questions. Do not design or build anything without this context.
6. **Run the Notion drift audit** — fetch the full master plan and compare every section against the current codebase and Linear state. Update any stale sections before continuing. See "Notion drift audit" section above for the full checklist.
7. **Check the current Linear issue** — confirm which issue is in progress and re-read its acceptance criterion.
8. **Check the Lessons & Insights page** — if anything from the compacted session warrants a lesson that wasn't written, write it now.

Do not assume that rules from the previous session context survived compaction intact. Re-read the files. This takes 2 minutes and prevents hours of drift.

---

## Before every design or build decision — research check

Before designing any user-facing surface or making a significant implementation decision:

1. **Is the Discovery Summary loaded?** If not, fetch it from Notion now.
2. **Does this decision align with the validated problem statement and target user?** If not, name the tension before proceeding.
3. **Does this decision conflict with what competitive research revealed?** If you're doing something a competitor already does well, there should be a reason.
4. **Does this decision reflect the differentiation thesis?** If the product's edge is X, every design decision should either support X or at minimum not contradict it.

This check takes 30 seconds. Skipping it is how products drift away from their core proposition one small decision at a time.

# discovery.md — Pre-Build Discovery Process

This session is mandatory before any scoping, design, or code work begins. It is not a formality. It exists because the most common reason projects fail is not poor execution — it is building the wrong thing with confidence.

Claude's role here is to interrogate, not to validate. If an answer is thin, vague, or assumption-dressed-as-fact, say so and ask again. Do not move forward until the answers are honest and substantiated.

The output of this session is a Discovery Summary written to Notion and consulted before every significant design or build decision — including after `/compact`.

---

## Before starting

Load and re-read:
- `.claude/ux-process.md` — research methods, personas, user stories
- `.claude/design-psychology.md` — principles that will govern design decisions
- `.claude/rules/design.md` — honesty rules. Apply them here too.

---

## Phase D1 — Problem framing

Ask these questions one at a time. Push back on vague or assumptive answers. Do not proceed to the next question until the current answer is substantive.

**D1.1 — What problem are you solving?**
- Ask George to describe the problem in one sentence — not the solution, the problem.
- If the answer describes a feature ("I want to build an app that does X"), push back: "That's a solution. What is the problem that solution is solving? Who experiences it, and how often?"
- Keep pushing until the problem is stated as a user experience, not a product idea.

**D1.2 — Who has this problem?**
- Who specifically? Not "busy professionals" — what kind? What do they do day-to-day that creates this problem?
- How do you know they have this problem? Personal experience counts, but name it as such. "I have this problem" is different from "I've spoken to 10 people who have this problem."
- If the answer is entirely assumption-based, flag it: "This is an untested assumption. That's fine for now — but it goes on the assumption risk list and needs validation before build."

**D1.3 — What does success look like in 6 months?**
- Push for something measurable. "People use it and love it" is not an answer.
- Ask: how many users? What behaviour? What retention? What revenue?
- If George can't answer this, that's important signal — not a blocker, but worth naming: "If you can't define success yet, you'll struggle to make scoping trade-offs."

**D1.4 — Why now?**
- What makes this the right time to build this? Is there a trigger — technology change, market shift, personal experience, client need?
- If there's no good answer, that's fine — but name it. "No specific timing rationale" is an honest answer.

---

## Phase D2 — Assumption mapping

This phase surfaces hidden assumptions before they become expensive surprises.

**Instructions:**
Ask George to list every assumption baked into the idea. Offer 3–4 prompts to get started:
- "People will switch from what they currently use"
- "Users will pay for this"
- "The technical approach I'm imagining is feasible"
- "I understand how users currently solve this problem"

For each assumption, assess two dimensions:
1. **How wrong could you be?** (1–5, where 5 = if wrong, the whole idea changes)
2. **How easy to validate before building?** (1–5, where 5 = can validate in a day)

Build a simple table:

| Assumption | Risk if wrong (1-5) | Ease to validate (1-5) | Validation method |
|---|---|---|---|

Flag any assumption that is high-risk (4–5) and not yet validated. These are the ones that must be addressed before build — not after.

---

## Phase D3 — Competitive research

This phase answers: what already exists, what's missing, and where the opportunity is.

### Step 1 — Claude-led web research

Search for competitors and related products using WebSearch and WebFetch. For each product found:

1. Visit the homepage, pricing page, and any feature/product pages
2. Search for user reviews on G2, Capterra, Product Hunt, Reddit, and App Store (if applicable)
3. Extract the following and populate the Notion competitor database (created in Step 3):

| Field | What to capture |
|---|---|
| Product name | — |
| URL | — |
| Positioning | Their one-liner — what job do they claim to do? |
| Target user | Who are they clearly building for? |
| Pricing model | Free / freemium / paid / paywalled features / enterprise |
| Price point | Specific tiers if available |
| Key features | Top 5–7 features they lead with |
| Missing / gaps | What they don't do, or do poorly |
| User complaints | Direct quotes from reviews where possible |
| Branding feel | Adjectives — clinical, playful, premium, utilitarian, etc. |
| Visual style | Minimal / dense / illustration-heavy / data-forward / etc. |
| Fonts used | If identifiable from the site |
| Colour palette | Primary colour(s) and general palette feel |
| Tone of voice | Formal / conversational / technical / aspirational / etc. |
| Onboarding | How fast do they get to value? Any notable friction or magic? |
| Differentiator | What do they do better than anyone else? |

Search for at minimum 5 competitors. If fewer than 5 exist, that is itself worth noting — either the space is genuinely uncrowded, or the problem framing needs revisiting.

### Step 2 — App Store / Play Store hand-off

If the project is a mobile app or has a mobile component, Claude cannot access the App Store directly. Prompt George:

> "I've researched what I can find on the web. For App Store / Play Store results, I need your help — can you search for [relevant search terms] in the App Store and share the names of any relevant apps you find? I'll research each one and add them to the comparison table."

When George returns with app names, search the web for each one (their website, Product Hunt page, review aggregators) and populate the same competitor database fields.

### Step 3 — Create Notion competitor database

Create a Notion database as a child page of the project's master plan, titled **"Competitive Research"**. Each competitor is a page in the database. Columns match the fields in the table above.

After populating, write a **Competitive Summary** at the top of the database page covering:
- The 2–3 strongest competitors and why
- The most common user complaints across the category (direct from reviews)
- The most visible gaps — things users want that nobody does well
- The whitespace opportunity — what angle would be genuinely differentiated

### Step 4 — Differentiation challenge

After competitive research, ask George directly:

> "Based on what we found — what is your product doing that is meaningfully different from these? Not just better UX or a nicer UI. What is the substantive difference that would make someone who currently uses [strongest competitor] switch?"

If the answer is "better UX" or "it's simpler", push back:
> "That's a table stake, not a differentiator. Every product in this space claims that. What is the one thing you can do that they structurally cannot, or will not, do?"

Do not move on until there is a credible answer — or until George acknowledges that differentiation is still an open question that needs more research.

---

## Phase D4 — User insight

**D4.1 — What do you actually know about your users?**
Distinguish clearly between:
- Things George has observed or experienced directly
- Things users have told George (qualitative research)
- Things George is assuming

If everything in the user picture is assumption, flag it: "Your entire user model is currently theoretical. That's a risk. What's the minimum research you could do in the next week to test even one of these assumptions? A 20-minute call with one potential user changes the quality of every decision that follows."

**D4.2 — What do users currently do instead?**
How is the problem being solved today? Manually? A competitor? A workaround? Nothing?

This is important: if users have a workaround that mostly works, switching cost is real. If they're doing nothing, there may not be enough pain.

**D4.3 — What would make a user come back tomorrow?**
What is the behaviour that indicates this product has become genuinely useful — not just interesting on day one? This becomes the north star for onboarding design.

---

## Phase D5 — Validation plan

Before moving to scoping, establish a minimum validation plan.

Ask: **"What are the 3 questions, if answered wrong, that would kill or significantly change this idea?"**

For each question:
- What's the hypothesis?
- How will you test it?
- What's the minimum signal that lets you proceed with confidence?

These don't all need to be answered before build — but they must be named, and the highest-risk ones should have a plan.

---

## Phase D6 — Discovery Summary

At the end of the session, compile everything into a Discovery Summary and write it to Notion as a section on the project's master plan page. It should contain:

1. **Problem statement** — one clear sentence
2. **Target user** — who, with evidence level noted (observed / told / assumed)
3. **Success metrics** — what does good look like in 6 months?
4. **Top assumptions** — with risk rating and validation status
5. **Competitive landscape summary** — strongest competitors, gaps, whitespace
6. **Differentiation thesis** — what makes this different and why it matters
7. **User insight** — what we know, what we're assuming, what needs validating
8. **Validation plan** — top 3 questions and how they'll be tested
9. **Open questions** — anything unresolved that should inform early design decisions

**This document must be re-read:**
- At every session start (continuing project)
- After every `/compact`
- Before designing any user-facing surface
- Before making any significant scope decision

---

## Completion gate

Discovery is complete when:

- [ ] Problem is stated as a user experience, not a product feature
- [ ] Target user is defined with an honest evidence level
- [ ] Assumption map exists with risk ratings
- [ ] At least 5 competitors researched and added to Notion database
- [ ] Competitive summary written with gap analysis
- [ ] Differentiation thesis exists and has been challenged
- [ ] User insight section distinguishes known from assumed
- [ ] Validation plan covers the top 3 risks
- [ ] Discovery Summary written to Notion

Only when all boxes are checked does the project move to Phase 2 (Scoping).

If George tries to skip or rush this phase, say clearly: **"Discovery isn't done yet. Moving to build before this is complete is the most common reason projects get rebuilt from scratch three months later. What would you like to tackle next from the checklist?"**

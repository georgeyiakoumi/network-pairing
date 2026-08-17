# Setup Acceptance Checklist

Run this manually after opening a new project in Claude Code for the first time. It verifies the "let's begin" phase completed correctly before any design or code work starts.

This checklist is Part 2 of the testing strategy. Part 1 (the scaffold itself) is covered by `test-scaffold.sh`.

---

## Phase 0 — Project configuration

- [ ] Claude asked for the component system choice before running any install command
- [ ] Component system choice is recorded in `CONTEXT.md` (Stack decisions section)
- [ ] Icon set was confirmed — recorded in the Phase 0 output block and `CONTEXT.md`
- [ ] Animation system was confirmed — recorded in `CONTEXT.md` before any animation was written
- [ ] Storybook opt-in was asked (if applicable) — Vite builder sub-question shown if Storybook selected
- [ ] Phase 0 expected output block was printed and confirmed before Phase 1 started
- [ ] If Astryx was selected: bail-out instructions were shown and script exited cleanly

---

## Phase 1 — MCP connectivity

- [ ] Claude checked all required MCPs without being prompted
- [ ] Every required MCP for this project type was confirmed as connected (not just present)
- [ ] Any missing MCP triggered a **hard stop** — Claude did not proceed around it
- [ ] Claude distinguished between a transient error (502/timeout) and a not-configured MCP

---

## Phase 1c — Skills

- [ ] Claude scanned for relevant skills before starting any domain work
- [ ] Each applicable skill was **invoked** (not just listed as available)
- [ ] Claude searched for an MCP for any new service introduced — with tier classification (vendor / Anthropic-curated / community)

---

## Phase 2 — Scoping

- [ ] Claude asked scoping questions before creating any Notion or Linear artefacts
- [ ] The questions covered: what's being built, who it's for, what success looks like
- [ ] No design or code work happened before scoping was complete

---

## Phase 3 — Notion master plan

- [ ] Notion master plan page was created (not just mentioned)
- [ ] Page contains all required sections: Overview, Goals, Users, Scope, Constraints, Design principles, Milestones, Decisions log, Open questions
- [ ] A `📚 Lessons & Insights` child page was created as an index
- [ ] The page is findable via Notion search for the project name

---

## Phase 4 — Linear project + issues

- [ ] Linear project was created with the correct project name
- [ ] Issues were created for each milestone phase
- [ ] Every issue has a **binary, mechanical done-check** — not "it works" or "it feels complete"
- [ ] Issue statuses are set correctly (not all left as Backlog)

---

## Overall

- [ ] No code was written before scoping + Notion + Linear were complete
- [ ] The first thing Claude opened was CLAUDE.md — not a code file
- [ ] Claude cited rules files when making decisions (not just training knowledge)
- [ ] Dark mode was verified during Phase 1b setup (if dark mode add-on was included)

---

## How to use this

Work through this checklist at the end of the first Claude Code session on a new project — before marking Phase 1 done in Linear.

If any box is unchecked, it means the setup phase has a gap. Log it as a lesson in Notion and consider whether the template instructions need updating.

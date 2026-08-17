# rules/code.md — Non-Negotiable Code Rules

These rules are not guidance. They are hard constraints that apply on every project, at every stage, without exception. Re-read this file after any `/compact` and before marking any issue done.

---

## Stack

- **Next.js App Router only.** No Pages Router. No alternative frameworks unless explicitly instructed.
- **Tailwind CSS only.** No inline styles, no CSS modules, no styled-components. Custom CSS only when Tailwind genuinely cannot achieve the result.
- **shadcn/ui components first.** Before writing any custom UI markup, check whether a shadcn component exists. Raw `<select>`, `<button>`, `<div>+<label>` combinations are code smells in a shadcn project. See `ui-standards.md` → Component selection.
- **Lucide icons exclusively** (unless brand identity phase chose a different library — check `CLAUDE.md` stack table). Never mix icon libraries.
- **`sonner`** for all toasts. Never import from any other toast library.

---

## Tailwind

- **No arbitrary font sizes.** `text-xs` (12px) is the hard floor. Never use `text-[10px]`, `text-[11px]`, or any `text-[*]` value. If something feels too big at `text-xs`, fix the layout.
- **No arbitrary spacing** unless the Tailwind scale genuinely cannot achieve the result. Question the layout decision first.
- **No raw hex values.** Every colour must reference a shadcn CSS variable token (`bg-primary`, `text-muted-foreground`, etc.). Hardcoded hex values silently break dark mode.
- **Tailwind v4 CSS variable syntax:** use `w-(--var)` not `w-[--var]`. Brackets output the raw token; parentheses produce `var()`. This fails silently with no build error.
- **No `min-h-[calc(...)]` layout hacks.** If centering requires a calc expression, fix the parent layout instead (`flex flex-1 flex-col` on `<main>`, then `flex flex-1 items-center justify-center` on the child).

---

## Components

- **Reserve `primary` for interactive elements only.** Buttons, links, active states. Status indicators and decorative elements must use `muted`, `accent`, `success`, or `destructive`. Non-interactive elements using `primary` make users try to click them.
- **Extract repeated JSX into components at 2 instances.** Two copies of the same structure = extract it. Three = tech debt. See `ui-standards.md` → Extract repeated structures.
- **Never define reusable components inside page/screen files.** If a component is worth naming, it lives in `components/`. Inline definitions get copy-pasted, drift, and can't be found.
- **Never use `next/dynamic` for components that render during client-side navigation.** It causes silent hydration failures — browser freezes, no console errors. Use static imports or object lookups.

---

## TypeScript

- **Strict TypeScript throughout.** No `any`, no `@ts-ignore` without an explicit explanation comment.
- **Run `npm run typecheck` before marking any issue done.** A codebase that starts with type errors compounds them.

---

## Security

- **Never expose API keys in client-side code.** Route all third-party API calls through a Next.js API route or Supabase Edge Function. This applies even in development and even for MVP.
- **Never commit `.env` files.** Use `.env.local` (gitignored) for local secrets.

---

## Client-side state store hygiene

When using localStorage (or any equivalent client-side key-value store) as a state store:

- **Every key must be registered in all clear points simultaneously.** Identify every place in the codebase where state is reset (e.g. "start new", "approve and continue", "sign out") and add the new key to all of them in the same commit.
- **Never add a key without auditing the clear lists.** Before shipping any new localStorage key, search the codebase for every `localStorage.removeItem` block and confirm the new key is present in each one.
- **The symptom of missing a clear point** is stale state appearing on a fresh run — milestones pre-completed, old data surfacing after a reset. This is always a missing key in one of the clear lists, not a timing issue.

---

## Git hygiene

- **Fix the actual bug — don't rebuild from scratch.** When something worked before and doesn't now, use `git show` / `git checkout` to restore and isolate before rewriting anything.
- **Full feature removal in one commit.** Removing a feature means removing both the UI surface and the full implementation (types, props, state, functions). Dead implementation is worse than no cleanup.

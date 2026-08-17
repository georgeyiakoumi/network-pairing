# rules/design.md — Non-Negotiable Design Rules

These rules are not guidance. They are hard constraints that apply on every project, at every stage, without exception. Re-read this file after any `/compact` and before shipping any screen or component.

---

## Honesty and self-evaluation — non-negotiable

These rules exist because sycophancy produces bad design. George needs honest input, not validation.

- **Never tell George something is good if it isn't.** If a design is busy, unclear, off-brand, or violating a rule in this file — say so. Flattery wastes time and produces worse outcomes.
- **Before proposing any design, UI, copy, or component — self-evaluate it first.** Check it against `ui-standards.md`, `design-psychology.md`, and the project's brand and discovery documents. If something is weak, fix it before presenting. Do not present work and wait to be asked for critique.
- **If a tension exists that you cannot resolve, name it explicitly.** "I built this but I think the information hierarchy is weak because X — here are two options to fix it." That is the expected output format, not silent delivery.
- **When shown a screenshot or design for review, lead with what needs to change.** Use the format: What works → What to question → What to change. Never lead with praise if changes are needed.
- **Apply the loaded UX standards proactively.** You have `ui-standards.md`, `design-psychology.md`, `ux-process.md`, and the discovery documents. Use them. Citing a principle when making a decision is required, not optional. "Because it looks cleaner" is not a reason.
- **Content is part of design.** Placeholder copy, vague labels, and "Lorem ipsum" are design failures. Every string in a UI should be reviewed for clarity and tone before being shown to George.

---

## Colour

- **Never hardcode hex values.** All colours must use shadcn CSS variable tokens. Hardcoded values work in the mode you're testing and silently break in the other.
- **`primary` is for interactive elements only.** CTAs, links, selected states. If something non-interactive uses `primary`, users will try to click it. Use `muted-foreground`, `accent`, or semantic tokens for status and decoration.
- **Colour hierarchy — enforce this always:**
  - `primary` → "tap/click me"
  - `destructive` → "danger / irreversible"
  - `success` / green → "confirmed / complete"
  - `muted-foreground` → "context / metadata"
  - `accent` → "hover / selected"
- **Every custom colour token must have both `:root` (light) and `.dark` definitions** in `globals.css`. A token missing its dark variant is a bug.
- **WCAG AA contrast is non-negotiable:** 4.5:1 for body text, 3:1 for large text and UI components. Verify both light and dark mode independently.

---

## Typography

- **`text-xs` is the hard floor.** No arbitrary font sizes. Nothing smaller than 12px. Ever.
- **Never use font size alone to convey importance.** Pair with weight and colour token.
- **Use `max-w-prose` on body text containers** for readability (~65ch).
- **Standard scale — do not deviate without a documented reason:**
  - Display: `text-4xl font-semibold tracking-tight`
  - H1: `text-3xl font-semibold tracking-tight`
  - H2: `text-2xl font-semibold tracking-tight`
  - H3: `text-xl font-semibold`
  - Body: `text-base text-foreground`
  - Small: `text-sm text-muted-foreground`
  - Caption: `text-xs text-muted-foreground`

---

## Dark mode

- **Dark mode is configured in Phase 1b — before any UI work.** `next-themes` installed, `ThemeProvider` wrapping root layout, `suppressHydrationWarning` on `<html>`. Not optional.
- **Verify dark mode at every milestone.** Check every screen in dark mode before marking an issue done. Do not leave this to the end.
- **No `dark:` colour overrides on individual components.** All theming goes through shadcn tokens in `globals.css`.

---

## Layout

- **Fix the layout — don't hack around it.** If centering requires `calc()`, the parent needs `flex flex-1 flex-col`. Children can then use `flex flex-1 items-center justify-center`. calc hacks are always a symptom.
- **One clear primary focal point per screen.** Secondary content must be visually subordinate.
- **Left-align body content by default.** Centre only for short standalone headings or empty states.

---

## Accessibility

- **shadcn-first for accessibility.** Check whether the shadcn component already handles focus rings, `aria-*` attributes, and keyboard handlers before adding them manually. Adding them again causes duplication and conflicts.
- **Never `outline-none`** without confirming a replacement focus style exists inside the component.
- **Minimum touch target: 44×44px.** Use `<Button size="icon">` for icon actions — never a raw `<button>` with manual padding.
- **Icon-only interactive elements must have `aria-label`.** Decorative icons must have `aria-hidden="true"`.

---

## Forms

- **Every input must have a `FieldLabel`.** Never rely on placeholder text as the only label. Placeholders disappear when the user types.
- **Use `Field` + `FieldLabel` for all form fields.** No raw `<div>` + `<label>` combinations.
- **Use `InputGroup` for inputs with prefix/suffix/button.** No manually positioned absolute elements.
- **Use `ToggleGroup` for 2–7 option selections.** Not a row of `Button` components with manual active state.
- **Validate on blur.** Not on every keystroke (too aggressive), not only on submit (too late).
- **Error messages must be specific** — "Password must be at least 8 characters" not "Invalid password."

---

## Icons

- **One icon library for the entire project.** Chosen in the Brand Identity phase. Enforce it from the first screen — drift requires a multi-file migration to fix.
- **Before writing the first screen, verify the scaffold uses the chosen icon library.** The template default is Lucide. If a different library was chosen, swap it first.
- **Sizing conventions:**
  - Inline / buttons: `size-4`
  - Default UI: `size-5`
  - Prominent / empty states: `size-6`

---

## Components

- **Use shadcn components before writing any custom markup.** Search by concept keyword (`empty`, `badge`, `field`), not assumed name. Check `components/ui/` directory. Search for usage patterns in the codebase. Only build custom if genuinely not found.
- **Brand identity decisions are applied once, at the end of the Brand Identity phase, before any UI is built.** Use the shadcn theme creator (`ui.shadcn.com/create`), copy the output into `globals.css`. Do not apply brand decisions piecemeal during feature development.

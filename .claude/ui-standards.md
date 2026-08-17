# ui-standards.md — UI Standards Reference

Reference this file when producing high-fidelity design decisions: components, tokens, visual language, or design system work.

**Default stack:** shadcn/ui · Tailwind CSS · Lucide icons. Do not introduce alternative component libraries, custom token systems, or separate icon sets unless explicitly instructed. Everything below is written against this stack.

---

## Layout

**The principle:** Layout creates hierarchy and flow. A well-structured layout guides the eye without the user noticing.

**Standards:**
- Use Tailwind's grid and flex utilities exclusively — no custom CSS layout unless Tailwind cannot achieve it
- Establish a clear visual hierarchy: one primary focal point per screen, secondary content clearly subordinate
- Use whitespace as a design element — space implies relationship. Prefer `gap-*` and `space-y-*` over manual margins
- Left-align body content by default (`text-left`); centre only for short standalone headings or empty states (`text-center`)
- Group related content into logical regions; separate with whitespace before reaching for visible dividers

**Tailwind layout utilities:**
```
Grid:       grid grid-cols-12 gap-4 (web) / grid-cols-4 (mobile)
Flex:       flex items-center justify-between gap-2
Container:  container mx-auto px-4 md:px-6 lg:px-8
Sections:   space-y-8 (between major sections) / space-y-4 (within sections)
```

**Layout patterns to know:**
- **F-pattern** — users scan in an F shape on content-heavy pages; put key info top-left
- **Z-pattern** — users scan in a Z on sparse layouts (landing pages); put CTA at the end of the Z
- **Card grid** — `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4` for equal-weight items
- **Master/detail** — `grid grid-cols-[280px_1fr]` for list + detail panels

**Questions to ask:**
- Is there one clear starting point on this screen?
- Does the visual hierarchy match the information hierarchy?
- Does the layout still work at the smallest breakpoint (`sm:`)? Test it.

---

## Colours

**The principle:** Use shadcn's CSS variable token system exclusively. Never hardcode hex values in components. All colours must adapt correctly in both light and dark mode.

**shadcn colour tokens — use these names in all code and design discussions:**

| Token | Usage |
|---|---|
| `background` / `foreground` | Page background and primary text |
| `card` / `card-foreground` | Card surfaces and their text |
| `primary` / `primary-foreground` | Primary actions, key CTAs |
| `secondary` / `secondary-foreground` | Secondary actions, supporting UI |
| `muted` / `muted-foreground` | Disabled states, placeholder text, metadata |
| `accent` / `accent-foreground` | Hover states, selected items |
| `destructive` / `destructive-foreground` | Delete, remove, irreversible actions |
| `border` | Default border colour |
| `input` | Input field border |
| `ring` | Focus ring colour |

**In Tailwind classes, these map as:**
```
bg-background        text-foreground
bg-card              text-card-foreground
bg-primary           text-primary-foreground
bg-secondary         text-secondary-foreground
bg-muted             text-muted-foreground
bg-accent            text-accent-foreground
bg-destructive       text-destructive-foreground
border-border        border-input        ring-ring
```

**Rules:**
- Customise the palette by editing CSS variables in `globals.css` — not by overriding individual component classes
- Always define both `:root` (light) and `.dark` variants when adding custom tokens
- Maintain WCAG AA contrast: 4.5:1 for body text, 3:1 for UI components and large text
- Use `destructive` for all destructive actions — never red as a one-off colour choice
- Use colour to reinforce meaning, not as decoration — if a colour isn't communicating something, remove it
- **Never hardcode hex values.** Any time you write a raw `#hex` or `rgb()` value in a component, that's a bug. Use a shadcn token. Hardcoded values are invisible debt: they work in the mode you're testing in and silently break in the other.
- **Reserve `primary` for interactive elements only.** Buttons, links, active states, selected indicators — these use `primary`. Status indicators, decorative highlights, and informational elements must use semantic tokens (`muted`, `accent`, `success`, `destructive`) or reduced opacity. If a non-interactive element uses `primary`, users will try to tap/click it and feel confused when nothing happens.

**Colour hierarchy:**
```
primary           → "tap me" — CTAs, links, selected state
destructive       → "danger" — delete, irreversible actions
success / green   → "good" — completed, confirmed, positive
muted-foreground  → "context" — metadata, timestamps, supporting info
accent            → "hover / selected" — not for status
```

**Questions to ask:**
- Are we using shadcn token names, or hardcoded hex values?
- Does this work correctly in dark mode?
- Does the layout communicate clearly in greyscale?
- Does anything non-interactive use `primary`? If so, change it.

---

## Typography

**The principle:** Use Tailwind's type scale throughout. Do not introduce custom font sizes outside the scale. Hierarchy is established through size, weight, and colour token combinations — not bespoke values.

**Tailwind type scale — standard usage:**

| Role | Classes | Notes |
|---|---|---|
| Display | `text-4xl font-semibold tracking-tight` | Hero headings only |
| H1 | `text-3xl font-semibold tracking-tight` | Page titles |
| H2 | `text-2xl font-semibold tracking-tight` | Section headings |
| H3 | `text-xl font-semibold` | Card titles, subsections |
| H4 | `text-lg font-medium` | Minor headings |
| Body | `text-base text-foreground` | Default body text |
| Small | `text-sm text-muted-foreground` | Supporting text, descriptions |
| Caption | `text-xs text-muted-foreground` | Metadata, timestamps, labels |

**Rules:**
- Use `font-semibold` (600) for headings, `font-medium` (500) for labels and emphasis, `font-normal` (400) for body
- Line height defaults are handled by Tailwind's scale — do not override with arbitrary values
- Maximum line length: add `max-w-prose` on body text containers (Tailwind sets this to ~65ch)
- Never use font size alone to convey importance — pair with weight and colour token
- **`text-xs` is the minimum font size.** Never use arbitrary font sizes (`text-[10px]`, `text-[11px]`, etc.). Anything smaller than `text-xs` (12px) fails WCAG accessibility standards and is unreadable on most screens. If something feels like it needs to be smaller than `text-xs`, the layout needs rethinking — not the font size.

**Questions to ask:**
- Is every text element using a class from the standard scale above?
- Is the typographic hierarchy clear if you squint — do the levels read as distinct?
- Is body text constrained to `max-w-prose` where readability matters?
- Are there any arbitrary font size values (`text-[*]`)? Remove them.

---

## Iconography

**The principle:** Lucide icons exclusively. Do not mix in Heroicons, Phosphor, Font Awesome, or any other library. Lucide is the default icon set for shadcn and ensures visual consistency across stroke weight and style.

**Usage:**
```tsx
import { Search, Settings, ChevronRight, Trash2 } from 'lucide-react'

// Standard sizing
<Search className="size-4" />            // inline / small UI
<Settings className="size-5" />          // default for most contexts
<ChevronRight className="size-6" />      // prominent / navigation

// With colour token
<Trash2 className="size-4 text-destructive" />
<Search className="size-4 text-muted-foreground" />
```

**Sizing conventions:**

| Context | Size class |
|---|---|
| Inline in text / buttons | `size-4` |
| Default UI (nav, list items) | `size-5` |
| Prominent actions, empty states | `size-6` |
| Decorative / illustration-weight | `size-8` or `size-10` |

**Rules:**
- Minimum touch target for interactive icons: wrap in a button with `p-2` padding to reach 44×44px
- Always pair icons with a visible label for primary actions — icon-only acceptable only for universally understood symbols (`X`, `Search`, `ChevronLeft`) or persistent nav with nearby labels
- Use `text-muted-foreground` for decorative/supporting icons, `text-foreground` for primary, `text-destructive` for destructive
- Add `aria-label` to icon-only interactive elements; add `aria-hidden="true"` to decorative icons

**Icon checklist:**
- [ ] All icons imported from `lucide-react` — no other sources
- [ ] Interactive icons have a minimum 44×44px touch target (use `p-2` padding on the wrapper)
- [ ] Primary actions have a visible text label alongside the icon
- [ ] Icon-only buttons have an `aria-label`
- [ ] Decorative icons have `aria-hidden="true"`

---

## Spacing

**The principle:** Use Tailwind's spacing scale exclusively. Arbitrary values (`p-[13px]`) are a last resort — if you're reaching for one, question whether the layout decision is correct first.

**Tailwind spacing scale — standard usage:**

| Token | px value | Use for |
|---|---|---|
| `1` | 4px | Tight internal gaps (icon to label) |
| `2` | 8px | Default internal padding, small gaps |
| `3` | 12px | Form field gaps, compact list items |
| `4` | 16px | Default component padding, standard gaps |
| `6` | 24px | Section padding, card padding |
| `8` | 32px | Between related sections |
| `12` | 48px | Between major page sections |
| `16` | 64px | Page-level vertical rhythm |

**Spacing rhythm conventions:**
```
Icon ↔ label:                    gap-1.5 or gap-2
Items in a list:                 space-y-1 or space-y-2
Form fields:                     space-y-4
Card internal padding:           p-4 or p-6
Between cards in a grid:         gap-4
Between page sections:           space-y-8 or space-y-12
Page horizontal padding:         px-4 (mobile) / px-6 (md) / px-8 (lg)
```

**Rules:**
- Never use arbitrary spacing values unless Tailwind's scale genuinely cannot achieve the result
- Use `gap-*` for flex/grid children rather than applying margins to individual items
- Use `space-y-*` for stacked vertical content where a gap utility isn't applicable
- Increase spacing between unrelated sections relative to spacing within them — whitespace communicates grouping

**Tailwind v4 — CSS variable arbitrary value syntax:**
In Tailwind v4, referencing a CSS variable in an arbitrary value uses **parentheses**, not brackets:
```
✅  w-(--sidebar-width)       →  width: var(--sidebar-width)
❌  w-[--sidebar-width]       →  outputs the raw token, not var() — silent layout failure
```
This affects any `w-`, `h-`, `max-w-`, `min-h-`, `gap-`, `p-`, etc. that reference a CSS variable. It will **not** produce a build error — it silently outputs an invalid CSS value, causing elements to collapse to zero width or overlap. If a layout looks broken with elements overlapping or collapsing, check arbitrary CSS variable references first.

**Questions to ask:**
- Are all spacing values from the Tailwind scale, or are there arbitrary values that should be revisited?
- Does the spacing visually imply the correct groupings (more space = less related)?

---

## Design systems

**The principle:** shadcn/ui is the component foundation. Before building a custom component, check whether a shadcn primitive already exists or can be composed to meet the need.

**Component decision order:**
1. Use an existing shadcn component as-is
2. Compose multiple shadcn primitives into a new pattern
3. Extend a shadcn component with additional Tailwind classes via `cn()`
4. Build a custom component only when shadcn cannot meet the requirement — document why

**Using `cn()` for variants:**
```tsx
import { cn } from '@/lib/utils'

// Extend a shadcn component without overriding its base styles
<Button className={cn("w-full", isDestructive && "bg-destructive text-destructive-foreground")}>
```

**Component state checklist — every interactive component must have:**
- [ ] Default
- [ ] Hover (`hover:`)
- [ ] Focus (`focus-visible:ring-2 ring-ring ring-offset-2`)
- [ ] Active / pressed (`active:`)
- [ ] Disabled (`disabled:opacity-50 disabled:pointer-events-none`)
- [ ] Error (where applicable — use `destructive` token)
- [ ] Dark mode (inherited from shadcn tokens — verify it works)

**Rules:**
- Do not override shadcn component internals directly — customise via the `className` prop and `cn()`
- Variants should be added to the component's `cva()` definition, not as one-off class overrides at usage sites
- Keep token names in Figma identical to shadcn CSS variable names — `--primary`, `--muted-foreground`, etc.

**Questions to ask:**
- Does a shadcn component already exist for this? (`Button`, `Card`, `Dialog`, `Select`, `Sheet`, `Table`, `Tabs`…)
- If extending, am I using `cn()` or fighting the component's base styles?
- Do all states work correctly — including focus ring and dark mode?

### Extract repeated structures into components

When writing or reading a file, if the same JSX structure appears more than once — even with slightly different content — extract it into a reusable component. The threshold is **two instances**. Three is too late.

**The signal:** Copy-pasted JSX with only prop values changing (different text, different icon, different href) is always a component waiting to be extracted.

```tsx
// ❌ Repeated structure — three copies of the same markup with different values
<div className="flex items-center gap-3 p-4 rounded-lg border">
  <BarChart className="size-5 text-primary" />
  <div>
    <p className="text-sm font-medium">Total revenue</p>
    <p className="text-2xl font-semibold">£24,000</p>
  </div>
</div>
<div className="flex items-center gap-3 p-4 rounded-lg border">
  <Users className="size-5 text-primary" />
  <div>
    <p className="text-sm font-medium">Active users</p>
    <p className="text-2xl font-semibold">1,429</p>
  </div>
</div>

// ✅ Extracted into a component
interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg border">
      {icon}
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </div>
    </div>
  )
}
```

**Where extracted components live:**
- Shared across multiple pages/features → `components/[name].tsx`
- Specific to one page or feature → co-locate in `components/[feature]/[name].tsx`
- Wraps or extends a shadcn primitive → `components/ui/[name].tsx`

**This is not premature abstraction.** Premature abstraction is building a flexible system for a hypothetical future need. Extracting a structure that already exists twice is removing duplication that already exists. The component's API is defined by the two instances — you're not inventing it, you're discovering it.

Note: if the repeated structure is a design *pattern* (same layout rule, same spacing convention) rather than the same JSX, apply the normalisation pass from `ux-process.md` → Design patterns: emerge first, enforce second. They are related but distinct: one is a code quality rule, the other is a design consistency rule.

---

## Charts (if enabled)

**The principle:** Charts use shadcn's `ChartContainer`, `ChartTooltip`, and `ChartLegend` wrappers around Recharts primitives. Charts inherit the brand palette through `--chart-*` CSS variables in `globals.css`, so they automatically adapt to light/dark mode.

**Setup (already done if charts were enabled at project creation):**
- `recharts` is installed as a dependency
- `components/ui/chart.tsx` exists (added via `npx shadcn add chart`)
- `--chart-1` through `--chart-5` tokens are defined in `globals.css` for both `:root` and `.dark`

**Usage pattern:**
```tsx
"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const chartConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
  expenses: { label: "Expenses", color: "var(--chart-2)" },
} satisfies ChartConfig

export function RevenueChart({ data }: { data: { month: string; revenue: number; expenses: number }[] }) {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
        <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
```

**Key conventions:**
- `"use client"` is required — Recharts uses browser APIs
- `ChartContainer` generates `--color-{key}` CSS variables from the config — reference these in Recharts `fill` and `stroke` props
- `accessibilityLayer` prop on the Recharts root adds keyboard navigation and screen reader support
- Edit `--chart-1` through `--chart-5` in `globals.css` to match your brand palette
- Available chart types: `BarChart`, `LineChart`, `AreaChart`, `PieChart`, `RadarChart`, `RadialBarChart`
- Tooltip `indicator` accepts `"dot"`, `"line"`, or `"dashed"`

**Chart checklist:**
- [ ] All charts use `ChartContainer` wrapper (not raw Recharts)
- [ ] Chart colours reference `--chart-*` tokens, not hardcoded hex values
- [ ] Both light and dark mode chart tokens are defined in `globals.css`
- [ ] `accessibilityLayer` prop is present on the Recharts root
- [ ] Charts render correctly at mobile widths (test `min-h-[200px] w-full`)
- [ ] `"use client"` directive is present on chart components

---

## Accessibility baseline

**The principle:** Accessibility is not a checklist bolted on at the end — it is a set of constraints applied as components are built. WCAG AA compliance is non-negotiable.

**shadcn-first rule:** Before adding any accessibility attribute or focus style manually, open the relevant shadcn component's `.tsx` file and check whether it's already handled. shadcn components ship with `focus-visible` rings, `aria-*` attributes, keyboard handlers, and role assignments built in. Adding them again at the `cn()` level creates duplication and can cause conflicts. Only add manually what the component genuinely doesn't provide.

### Colour contrast
- Body text: **4.5:1** minimum against its background
- Large text (≥18px regular or ≥14px bold) and UI components: **3:1** minimum
- Never rely on colour alone to convey meaning — always pair with a label, icon, or pattern
- Verify both light and dark mode independently

### Keyboard navigation
- Every interactive element must be reachable via keyboard
- Focus rings must be visible. Before adding `focus-visible:ring-*` manually, read the component's `.tsx` — most shadcn components already have it. Never add `outline-none` without confirming a replacement ring exists inside the component
- Modal focus trapping and return-to-trigger are handled by shadcn's `Dialog` — do not reimplement

### Touch targets
- Minimum: **44×44px**
- For icon-only buttons, use `<Button size="icon">` or `<Button size="icon-sm">` — sized correctly by default. Do not use a raw `<button>` with manual padding

### Text
- Minimum font size: `text-xs` (12px) — no exceptions
- No arbitrary font sizes (`text-[10px]`, `text-[11px]`, etc.) — ever

### Images and icons
- Meaningful images: `alt="[description]"`
- Decorative images: `alt=""` (empty string, not omitted)
- Decorative icons: `aria-hidden="true"` — check component source first
- Interactive icon-only buttons: `<Button size="icon" aria-label="[action]">` — `Button` handles semantics, you add `aria-label`

**Accessibility checklist — run before shipping any screen:**
- [ ] Colour contrast passes WCAG AA in both light and dark mode
- [ ] shadcn `.tsx` files checked before adding any manual focus/aria styles
- [ ] No `outline-none` without a confirmed replacement focus style in the component
- [ ] Icon-only buttons use `<Button size="icon">` with `aria-label`
- [ ] Font size floor is `text-xs` — no arbitrary `text-[*]`
- [ ] All images have appropriate `alt` text
- [ ] All decorative icons have `aria-hidden="true"`
- [ ] Modals use shadcn `Dialog` — no custom focus trap reimplementation

---

## Dark mode

**The principle:** Dark mode is configured on every project during Phase 1b — before any UI work begins. shadcn's token system is built for it. Setting it up at the start costs 10 minutes; retrofitting costs hours.

### Setup (Phase 1b — do this before any UI work)

**1. Install `next-themes`:**
```bash
npm install next-themes
```

**2. Create `components/theme-provider.tsx`:**
```tsx
"use client"
import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

**3. Wrap `app/layout.tsx`:**
```tsx
import { ThemeProvider } from "@/components/theme-provider"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

- `suppressHydrationWarning` — prevents a React hydration mismatch from the theme class being applied before hydration
- `defaultTheme="system"` — respects the user's OS preference out of the box
- `disableTransitionOnChange` — prevents a flash of unstyled transitions when switching themes

**4. Add a theme toggle:**
```tsx
"use client"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      <Sun className="size-4 dark:hidden" />
      <Moon className="size-4 hidden dark:block" />
    </Button>
  )
}
```

Place the toggle in the site header or navigation.

### Dark mode rules

- **Never hardcode colours** — always use shadcn CSS variable tokens. A hardcoded `bg-white` will not switch. See the shadcn skill's `styling.md`: "No manual `dark:` color overrides."
- **Define both modes for every custom token** — in `globals.css`, every new token needs both `:root` (light) and `.dark` definitions
- **Verify dark mode at every milestone** — check each screen in dark mode before marking an issue done. Do not leave this to the end
- **Images and logos** — use `dark:hidden` / `hidden dark:block` to swap assets that don't work on dark backgrounds

**Dark mode checklist:**
- [ ] `next-themes` installed and `ThemeProvider` wrapping root layout (Phase 1b)
- [ ] `suppressHydrationWarning` on the `<html>` tag
- [ ] Theme toggle in main navigation
- [ ] No hardcoded colour values — all using shadcn tokens
- [ ] All custom `globals.css` tokens have both `:root` and `.dark` definitions
- [ ] Colour contrast verified in dark mode
- [ ] Every screen checked in dark mode before milestone is marked done

---

## Forms

**The principle:** Forms are where users commit — they create accounts, submit data, make purchases. A poorly built form loses users at the moment they're trying to engage. Use shadcn's `Field` component family for all form construction.

> **Implementation detail** (correct API, validation patterns, composition rules) is covered in the `shadcn` skill's `forms.md`. The rules below are the *design* layer — when to use what and why.

### The right component for the job

| Situation | Use |
|---|---|
| Single input with label + helper/error | `Field` + `FieldLabel` + `FieldDescription` / `FieldError` |
| Multiple related inputs (e.g. address block) | `FieldSet` + `FieldLegend` + `FieldGroup` + `FieldSeparator` |
| Input with a prefix/suffix/button (e.g. search, URL field) | `InputGroup` + `InputGroupAddon` + `InputGroupInput` |
| Choosing between 2–7 options | `ToggleGroup` — not a row of `Button` components with manual active state |
| Related checkboxes or radios | `FieldSet` + `FieldLegend` — not a `div` with a heading |
| Horizontal toggle/switch row | `Field orientation="horizontal"` |
| Label beside input on desktop, stacked on mobile | `Field orientation="responsive"` |

### Labels
- Every input must have a `FieldLabel` — never rely on placeholder text as a substitute. Placeholders disappear when the user types.
- `htmlFor` on `FieldLabel` must match `id` on the input
- Required fields: append ` *` to the label and `aria-required="true"` on the input. Add a note at the top of the form: "Fields marked * are required."

### Helper text vs error text
- `FieldDescription` — persistent hint shown before interaction. Use for format guidance, not to restate the label
- `FieldError` — shown only in the error state (`data-invalid` on `Field`). Be specific: "Password must be at least 8 characters" not "Invalid password"
- Validate on blur — not on every keystroke (too aggressive) and not only on submit (too late)

### Placeholder text
- Use for format examples only — `e.g. george@example.com`
- Never use placeholder text as a label or instruction

### Submit buttons
- Place at the bottom of the form, left-aligned with the fields
- Label with the specific action: "Create account", "Save changes" — not "Submit"
- Disable and show a `Spinner` while in progress (see Loading states)

### Destructive form actions
- Visually separate from the submit button — never adjacent
- Use `<Button variant="destructive">`
- Require a `Dialog` confirmation for irreversible actions — not just a second click

### Multi-step forms
- Show a step indicator or progress bar
- Preserve entered data if the user goes back
- Validate each step before advancing

**Form checklist:**
- [ ] All inputs use `Field` + `FieldLabel` — no raw `div` + `label` combinations
- [ ] No input relies on placeholder text as its only label
- [ ] Required fields marked with `*` and `aria-required="true"`
- [ ] `InputGroup` used wherever an input has a prefix, suffix, or inline button
- [ ] `ToggleGroup` used for 2–7 option selections — not a row of `Button` components
- [ ] `FieldSet` + `FieldLegend` used for grouped checkboxes/radios
- [ ] Error messages are specific and tell the user how to fix the problem
- [ ] Submit button label describes the action; shows `Spinner` during submission
- [ ] Destructive actions are visually separated and require `Dialog` confirmation

---

## Component selection — reach for these first

The `shadcn` skill has a full component selection table. The components below are the ones most commonly hand-rolled when a shadcn component already exists. Always use the shadcn component.

| Instead of... | Use |
|---|---|
| Row of `Button` components with manual active state | `ToggleGroup` + `ToggleGroupItem` |
| Adjacent `Button` elements that belong together visually | `ButtonGroup` (horizontal or vertical) |
| `Input` with a manually positioned icon, text, or button | `InputGroup` + `InputGroupAddon` + `InputGroupInput` |
| Custom styled `div` for a callout or alert | `Alert` + `AlertTitle` + `AlertDescription` |
| Custom empty state markup | `Empty` (see Empty states section) |
| `<hr>` or `<div className="border-t">` | `Separator` |
| Custom `animate-pulse` div for loading | `Skeleton` |
| Custom styled `<span>` for status/labels | `Badge` |
| `toast()` from any library other than sonner | `toast()` from `sonner` |
| Raw `<button>` with padding for icon actions | `<Button size="icon">` or `<Button size="icon-sm">` |

**The rule:** Before building anything custom, run `npx shadcn@latest search` to check if a component exists. If it does, use it. If it doesn't quite fit, compose or extend it before reaching for custom markup.

**Search by concept, not assumed name.** A component may exist under a different name than you expect. Search for the concept keyword (`empty`, `toast`, `badge`, `field`) not the assumed component name (`EmptyState`, `ToastContainer`). Also check `components/ui/` directly and search for usage patterns (`<Empty`, `<Toast`) across the codebase. Only build new if genuinely not found after a broad search.

**Never write raw HTML when a shadcn component exists.** A raw `<select>` instead of `<Select>`, a `<div>` + `<label>` instead of `<Field>` + `<FieldLabel>`, a `<button>` instead of `<Button>` — these are code smells in a shadcn project. They produce inconsistent styling, miss built-in accessibility wiring, and drift visually from every other component on the screen. The cost of checking the library is 30 seconds. The cost of debugging an inconsistency or a runtime error from a hand-rolled duplicate is 30 minutes.

---

## Forms

**The principle:** Forms are the highest-stakes interaction in most products — they're where users give you data, make purchases, create accounts, and complete tasks. A poorly built form loses users at the exact moment they're trying to commit. Use shadcn's `Field` component family for all forms — it handles labelling, descriptions, validation states, and accessibility wiring in one consistent system.

**Install:**
```bash
npx shadcn@latest add field
```

**Import the full family:**
```tsx
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
```

---

### Basic field (label + input + helper text)
```tsx
<Field>
  <FieldLabel htmlFor="username">Username</FieldLabel>
  <Input id="username" placeholder="e.g. george_k" />
  <FieldDescription>This is how you'll appear to other users.</FieldDescription>
</Field>
```

### Validation error state
```tsx
<Field data-invalid>
  <FieldLabel htmlFor="email">Email</FieldLabel>
  <Input id="email" aria-invalid />
  <FieldError>Enter a valid email address.</FieldError>
</Field>
```
- Add `data-invalid` to `Field` to trigger error styling across the whole field
- Add `aria-invalid` to the input for screen readers
- Use `FieldError` not a plain `<p>` — it handles the error role correctly

### Grouping related fields (fieldset)
```tsx
<FieldSet>
  <FieldLegend>Billing address</FieldLegend>
  <FieldDescription>Used for invoice generation.</FieldDescription>
  <FieldGroup>
    <Field>
      <FieldLabel htmlFor="first-name">First name</FieldLabel>
      <Input id="first-name" />
    </Field>
    <FieldSeparator />
    <Field>
      <FieldLabel htmlFor="last-name">Last name</FieldLabel>
      <Input id="last-name" />
    </Field>
  </FieldGroup>
</FieldSet>
```

### Horizontal layout (toggle / checkbox rows)
```tsx
<Field orientation="horizontal">
  <Switch id="marketing" />
  <FieldLabel htmlFor="marketing">Send me product updates</FieldLabel>
</Field>
```

### Responsive layout (label beside input on desktop, stacked on mobile)
```tsx
<Field orientation="responsive">
  <FieldLabel htmlFor="name">Full name</FieldLabel>
  <FieldContent>
    <Input id="name" />
    <FieldDescription>As it appears on your ID.</FieldDescription>
  </FieldContent>
</Field>
```

---

### Form design rules

**Labels:**
- Every input must have a `FieldLabel` — never rely on placeholder text as a substitute. Placeholders disappear when the user starts typing.
- `htmlFor` on `FieldLabel` must match the `id` on the input — this is how the label is associated for accessibility
- Required fields: append `*` to the label text and add `aria-required="true"` to the input. Include a note at the top of the form: "Fields marked * are required."

**Helper text vs error text:**
- `FieldDescription` — persistent helper text shown before any interaction. Use for format hints ("Must be at least 8 characters"), not for restating the label.
- `FieldError` — shown only in the error state (`data-invalid`). Replaces or supplements `FieldDescription` when there's a problem. Be specific: "Password must be at least 8 characters" not "Invalid password".

**Validation timing:**
- Validate on blur (when the user leaves the field) — not on every keystroke (too aggressive) and not only on submit (too late)
- On submit, validate all fields and focus the first one with an error

**Placeholder text:**
- Use placeholders for format examples only — `e.g. george@example.com` — not as labels or instructions
- Do not use placeholder text that disappears and leaves the user without context

**Submit buttons:**
- Place the primary submit action at the bottom of the form, left-aligned with the fields (not right-aligned)
- Label it with the specific action: "Create account", "Save changes", "Send message" — not just "Submit"
- Disable and show a `Spinner` while submission is in progress (see Loading states)

**Destructive form actions** (delete, remove, deactivate):
- Separate visually from the submit button — never adjacent
- Use `variant="destructive"` on the `Button`
- Require explicit confirmation for irreversible actions (a Dialog, not just a second click)

**Multi-step forms:**
- Show progress — a step indicator or progress bar at the top
- Preserve entered data if the user goes back
- Validate each step before advancing — don't let users reach step 3 with broken data from step 1

**Form checklist:**
- [ ] Every input has a `FieldLabel` with a matching `htmlFor` / `id` pair
- [ ] No input relies on placeholder text as its only label
- [ ] Required fields are marked with `*` and `aria-required="true"`
- [ ] Validation errors use `Field data-invalid` + `FieldError` + `aria-invalid` on the input
- [ ] Error messages are specific — they say what's wrong and how to fix it
- [ ] Submit button label describes the action, not just "Submit"
- [ ] Submit button shows a `Spinner` and is disabled during submission
- [ ] Destructive actions are visually separated and require confirmation

---

## Empty states

**The principle:** An empty state is not an absence of content — it is a designed screen. A blank div with no explanation leaves users confused about whether something is broken or they've done something wrong. Every empty state should answer three questions: why is this empty, what can the user do about it, and how do they do it.

**Use the shadcn `Empty` component.** Install it with:
```bash
npx shadcn@latest add empty
```

Import the compound components:
```tsx
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
```

**Standard usage:**
```tsx
<Empty>
  <EmptyHeader>
    <EmptyMedia variant="icon">
      <FolderOpen className="size-8 text-muted-foreground" />
    </EmptyMedia>
    <EmptyTitle>No [things] yet</EmptyTitle>
    <EmptyDescription>
      [One sentence explaining why and what to do]
    </EmptyDescription>
  </EmptyHeader>
  <EmptyContent>
    <Button size="sm">Create [thing]</Button>
  </EmptyContent>
</Empty>
```

**Common empty state scenarios:**

| Situation | Title | Description | CTA |
|---|---|---|---|
| First use / nothing created yet | "No [things] yet" | "Create your first [thing] to get started." | "Create [thing]" button |
| Search / filter with no results | "No results found" | "Try adjusting your search or filters." | Clear filters link |
| Error loading content | "Couldn't load [things]" | "Something went wrong. Try refreshing." | "Retry" button |
| No permissions | "Nothing to see here" | "You don't have access to this section." | None or "Request access" |

**Rules:**
- Never leave a list, table, or content area blank — every one must have an empty state before it ships
- Don't use "No data available" — it's developer language, not user language
- `EmptyContent` is optional — don't force a CTA if there's no meaningful action (e.g. search with no results)
- Match the tone of the copy to the brand voice

**Empty state checklist:**
- [ ] Every list, table, and content feed has an empty state
- [ ] Title uses plain user language
- [ ] Description explains the situation and/or what to do
- [ ] CTA (where appropriate) resolves the emptiness directly
- [ ] `Empty` component used — not a hand-rolled div

---

## Error states

**The principle:** Error states are part of the UI, not edge cases to handle later. Users who hit an error are already frustrated — a well-designed error state recovers their trust; a poorly designed one loses it permanently. Every error must answer: what went wrong, whether it's their fault or ours, and what they should do next.

**Error categories and how to handle each:**

| Error type | Pattern | Severity |
|---|---|---|
| Validation (user input wrong) | Inline, field-level, on blur or submit | Non-blocking |
| Action failed (save, submit, delete) | Sonner toast with message + retry | Recoverable |
| Page not found (404) | Dedicated screen | Full page |
| Permission denied (403) | Dedicated screen | Full page |
| System error (500, network) | Dedicated screen with retry | Full page |
| Async content failed to load | Inline error in place of content, with retry | Inline |

**Validation error pattern (form fields):**
```tsx
<div className="space-y-1.5">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    className={cn(hasError && "border-destructive focus-visible:ring-destructive")}
  />
  {hasError && (
    <p className="text-sm text-destructive">Please enter a valid email address.</p>
  )}
</div>
```

**Action failure pattern (toast):**
```tsx
// Use Sonner — already in the stack
toast.error("Couldn't save changes", {
  description: "Check your connection and try again.",
  action: { label: "Retry", onClick: handleRetry },
})
```

**Full-screen error — use the `Empty` component:**
```tsx
<Empty>
  <EmptyHeader>
    <EmptyMedia variant="icon">
      <AlertCircle className="size-8 text-destructive" />
    </EmptyMedia>
    <EmptyTitle>Something went wrong</EmptyTitle>
    <EmptyDescription>
      We couldn't load this page. This is on us — try refreshing.
    </EmptyDescription>
  </EmptyHeader>
  <EmptyContent>
    <Button variant="outline" onClick={() => window.location.reload()}>Refresh</Button>
    <Button variant="ghost" asChild><Link href="/">Go home</Link></Button>
  </EmptyContent>
</Empty>
```

**Error message writing rules:**
- **Be specific** — "Email is required" not "Field is required"
- **Don't blame the user for system errors** — "Something went wrong on our end" not "Your request failed"
- **No technical jargon** — no HTTP status codes or stack traces in user-facing messages (log them, don't show them)
- **Always give a next step** — "Try again", "Go back", "Contact support" — never a dead end
- **Match severity** — a missing required field doesn't need the same visual weight as a payment failure

**Error state checklist:**
- [ ] All form fields have inline validation error states
- [ ] Action failures surface via Sonner toast with message and retry where applicable
- [ ] 404, 403, and 500 states have dedicated screens — not blank pages
- [ ] No error message uses technical jargon or blames the user for a system failure
- [ ] Every error state has a clear next step
- [ ] Error colours use the `destructive` token, not one-off red values

---

## Loading states

**The principle:** A loading state is not an edge case — it is a designed screen. If content takes any time to appear, the user must see something intentional. A blank or unresponsive-looking UI destroys trust faster than a slow one. The goal is to communicate: "something is happening, here's roughly what's coming."

Use the two shadcn loading primitives appropriately. They are not interchangeable.

**Install both:**
```bash
npx shadcn@latest add skeleton
npx shadcn@latest add spinner
```

---

### Skeleton — use for content that has a known shape

`Skeleton` is a pulsing placeholder that mimics the shape of the content being loaded. Use it when you know the layout of what's coming — a card, a list, a table row, a profile header.

```tsx
import { Skeleton } from "@/components/ui/skeleton"
```

**When to use Skeleton:**
- Page or section initial load (you know what the layout will look like)
- List or table rows loading in
- Card grids loading in
- Profile/avatar areas
- Any content area where the shape is predictable

**Pattern — mirror the real layout:**
The skeleton should match the structure of the real content as closely as possible. This sets user expectations and makes the transition from loading → loaded feel smooth rather than jarring.

```tsx
// Card skeleton — mirrors a real card with avatar, title, and two lines of text
function CardSkeleton() {
  return (
    <div className="flex items-start gap-3 p-4">
      <Skeleton className="size-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  )
}
```

**Skeleton sizing rules:**
- Use Tailwind scale values for height and width — `h-4`, `w-full`, `w-1/2` etc. **Do not use arbitrary values** (`h-[13px]`) — use the nearest scale step
- Match the approximate height of the real content: `h-4` for body text, `h-3` for small/caption text, `h-10` for input fields, `size-10` for avatars
- For text lines, vary widths (`w-full`, `w-4/5`, `w-1/2`) to look natural — identical widths look mechanical

---

### Spinner — use for actions and indeterminate waits

`Spinner` is an animated icon that communicates "something is in progress." Use it for user-triggered actions (saving, submitting, uploading) or when you don't know what content is coming.

```tsx
import { Spinner } from "@/components/ui/spinner"
```

**When to use Spinner:**
- Button loading state after user triggers an action (save, submit, delete)
- Form submission in progress
- File upload / processing
- Any action where the user is waiting for a response and the content shape is unknown

**Never use a spinner for initial page/section load** — use Skeleton instead. A spinner on a blank page looks broken; a skeleton looks intentional.

**Pattern — button with loading state:**
```tsx
<Button disabled={isLoading}>
  {isLoading && <Spinner className="mr-2" />}
  {isLoading ? "Saving..." : "Save changes"}
</Button>
```

**Spinner sizing:** Uses `size-4 animate-spin` by default. Adjust with `className="size-5"` etc. to match context.

---

### Decision guide

| Situation | Use |
|---|---|
| Page or section loading on first render | `Skeleton` |
| List/table rows populating | `Skeleton` |
| User clicked "Save" / "Submit" / "Delete" | `Spinner` in button |
| File uploading or processing | `Spinner` with progress message |
| Search results loading | `Skeleton` (if layout known) or `Spinner` (if not) |
| Data refreshing in background | Nothing, or subtle `Spinner` in a corner — don't block the UI |
| Navigating between pages (Next.js) | Nothing for fast transitions; `Skeleton` on the target page for slow data fetches |

**Never show both on the same surface at the same time.** Pick one signal per context.

**Loading state checklist:**
- [ ] Every page and section that fetches data has a Skeleton that mirrors the real content layout
- [ ] Every async user action (save, submit, upload) disables the trigger button and shows a Spinner
- [ ] No loading state uses a blank screen or unresponsive-looking empty div
- [ ] Skeleton heights use Tailwind scale values — no arbitrary `h-[*]` values
- [ ] Spinner is never used for initial page load (Skeleton only)
- [ ] Both Skeleton and Spinner are not shown simultaneously on the same surface

---

## Visual branding

**The principle:** Brand personality is expressed by customising shadcn's CSS variable layer — not by adding one-off styles outside the system. Brand decisions (tone, colour, typography, icons) are established during the UX process (see `ux-process.md` → Brand Identity) and applied here through the stack.

**How to apply brand through the stack:**
- **Colour:** Edit `--primary`, `--secondary`, `--accent` in `globals.css` using the palette from the brand identity page. Both `:root` and `.dark` must be updated. Use [ui.shadcn.com/themes](https://ui.shadcn.com/themes) to generate a full token set, then fine-tune.
- **Radius:** Edit `--radius` in `globals.css`. shadcn scales all component radii off this single value (`rounded-md` = `calc(var(--radius) - 2px)`, `rounded-lg` = `var(--radius)`). Sharp = `0.25rem`, default = `0.5rem`, rounded = `0.75rem`.
- **Typography:** Import fonts via `next/font/google` in `layout.tsx`, assign CSS variables to `<html>`, and map them in `globals.css` under the `@theme inline` block. See `ux-process.md` → Typography system for the implementation pattern.
- **Icons:** If the brand identity calls for a library other than Lucide, swap the package (`npm install` / `npm uninstall`), run `npm run swap-icons` to update shadcn components, and update the Iconography section in this file.
- **Motion:** Define transition durations consistently — `duration-150` for micro-interactions, `duration-300` for panel/modal transitions. Do not mix arbitrary durations.

**Brand expression checklist:**
- [ ] Brand identity page exists in Notion with tone, colour, typography, and icon decisions
- [ ] Brand colours are set via `--primary` / `--accent` CSS variables in `globals.css`, not hardcoded in components
- [ ] `--radius` is set to reflect brand personality
- [ ] Fonts are imported via `next/font/google` in `layout.tsx` and mapped in `globals.css` `@theme inline` block
- [ ] Dark mode colour variables are defined alongside light mode variables
- [ ] Icon library matches the brand identity decision; `ui-standards.md` Iconography section is up to date
- [ ] Motion and transition durations are consistent across components
- [ ] Tone of voice is applied consistently across all copy (headings, buttons, errors, empty states)

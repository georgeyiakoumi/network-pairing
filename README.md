# Network Pairing

A mobile-first AI-powered alumni professional matching platform. Alumni sign up with structured profiles — profession, skills, experience, and what they need — and are matched by AI with complementary alumni. The UX is swipe-style (Tinder/Hinge model applied to professional networking).

Built as a demo for a South African university alumni network.

---

## Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui — Base UI |
| Icons | Lucide React |
| Database | Supabase |
| AI matching | Claude API (Anthropic) — claude-haiku-4-5 |
| Animations | Framer Motion (swipe gestures) |
| Deployment | Netlify |

---

## Who it's for

- **Alumni seekers** — graduates looking for a mentor, co-founder, advisor, or specific professional skill
- **Alumni givers** — graduates with experience or skills to offer, open to connecting
- **Platform admin** — the university or owner monitoring match quality and engagement via the admin dashboard

---

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ANTHROPIC_API_KEY=your-anthropic-key
ADMIN_SECRET_KEY=your-admin-key
```

Supabase credentials: **Settings → API** in your Supabase project.
Anthropic key: **console.anthropic.com**.

### Mobile testing

To test on your phone (same Wi-Fi network):

```bash
npm run dev -- -H 0.0.0.0
```

Then open `http://<your-local-ip>:3000` on your phone.

### Dev shortcut

Sign up as `test@test.com` in development mode to skip onboarding — all fields are pre-filled and you land on the review step. Hit "Create profile" to test the post-onboarding flow.

---

## Pages

| Page | URL | Notes |
|---|---|---|
| Sign up | `/signup` | Create a new alumni account |
| Sign in | `/login` | Log in to an existing account |
| Onboarding | `/onboarding` | Profile setup — 4 steps + review |
| Match feed | `/match` | Swipe-style match cards (requires a complete profile) |
| Connections | `/connections` | Accepted matches with match breakdown drawer |
| Profile | `/profile` | View and edit your profile, sign out |
| Admin dashboard | `/admin?key=YOUR_KEY` | Stats, match quality, dataviz |
| Match tester | `/admin/test-match?key=YOUR_KEY` | Run the AI matching engine against any profile |

### Admin access

The admin key is set via `ADMIN_SECRET_KEY` in `.env.local`. On first visit with `?key=...`, an HttpOnly cookie is set — subsequent admin navigation doesn't require the key in the URL.

The admin section is desktop-only (sidebar hidden on mobile).

---

## Route groups

| Group | Pages | Layout |
|---|---|---|
| `(user)` | match, connections, onboarding, profile | Minimal mobile header — no sidebar |
| `(app)` | admin, admin/test-match | Full sidebar + breadcrumbs (desktop) |
| `(auth)` | login, signup | Centered auth shell |

---

## Repo structure

```
app/
  (auth)/               # Sign up / sign in
  (user)/               # Consumer pages — match, connections, profile, onboarding
  (app)/                # Admin pages — dashboard, match tester
  api/                  # API routes — matches, admin, auth
  globals.css           # Tailwind v4 + shadcn tokens
  layout.tsx            # Root layout — ThemeProvider, Toaster
components/
  ui/                   # shadcn components
  onboarding/           # Onboarding step components + nav + dots
  match/                # Match card stack + swipeable card
  connections/          # Connection card with drawer breakdown
  profile/              # Profile view + edit drawers
  admin/test-match/     # Admin match tester components
lib/
  matching/             # AI matching engine — prompt, pre-filter, runner, DB helpers
  supabase/             # Supabase client + server helpers
  onboarding/           # Profile save logic
hooks/                  # useIsMobile
scripts/                # Seed script for fake alumni profiles
supabase/               # Migrations and config
```

---

## Deployment

Configured for Netlify via `netlify.toml`.

1. Push to GitHub
2. Netlify → Add new site → Import from GitHub
3. Add environment variables in **Site → Environment variables**
4. Deploy

Live: [https://network-pairing.netlify.app](https://network-pairing.netlify.app)

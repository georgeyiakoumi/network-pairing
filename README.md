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
| AI matching | Claude API (Anthropic) |
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
NEXT_PUBLIC_APP_URL=http://localhost:3000
ANTHROPIC_API_KEY=your-anthropic-key
```

Supabase credentials: **Settings → API** in your Supabase project.
Anthropic key: **console.anthropic.com**.

---

## Pages

| Page | URL | Notes |
|---|---|---|
| Sign up | `/signup` | Create a new alumni account |
| Sign in | `/login` | Log in to an existing account |
| Onboarding | `/onboarding` | Profile setup — guided or direct |
| Match feed | `/match` | Swipe-style match UI (requires a complete profile) |
| Connections | `/connections` | Accepted matches |
| Admin dashboard | `/admin?key=YOUR_ADMIN_SECRET_KEY` | Requires `ADMIN_SECRET_KEY` from `.env.local` |
| Match tester | `/admin/test-match?key=YOUR_ADMIN_SECRET_KEY` | Run the AI matching engine against any profile — results not persisted |

The admin key is set via `ADMIN_SECRET_KEY` in `.env.local`. Anyone without the correct key gets a 404.

---

## Repo structure

```
├── app/
│   ├── (auth)/          # Sign up / sign in
│   ├── (app)/           # Main app — matching UI, profile
│   ├── admin/           # Admin dashboard
│   ├── globals.css      # Tailwind v4 + shadcn tokens
│   └── layout.tsx
├── components/ui/       # shadcn components
├── lib/
│   ├── supabase/        # Supabase client + server helpers
│   └── utils.ts
├── scripts/             # Seed script for fake alumni profiles
├── supabase/            # Migrations and config
├── .env.example
├── netlify.toml
└── package.json
```

---

## Deployment

Configured for Netlify via `netlify.toml`.

1. Push to GitHub
2. Netlify → Add new site → Import from GitHub
3. Add environment variables in **Site → Environment variables**
4. Deploy

**Important:** Disable auto-publishing during active development — Netlify's free tier has limited build credits. Site settings → Build & deploy → Stop auto publishing.

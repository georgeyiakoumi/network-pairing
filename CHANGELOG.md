# Changelog

All notable changes to gy-basecamp are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
Versioning: [Semantic Versioning](https://semver.org/)

---

## [1.1.0] — 29/07/2026

### Added
- **Script split** — `create-project.sh` broken into 4 files: main entry point + `.scripts/scaffold.sh`, `.scripts/install.sh`, `.scripts/output.sh`
- **Animation system question** — Phase 0 now asks which animation system (CSS/Framer Motion/GSAP); choice recorded in `CONTEXT.md` and Phase 0 output block
- **Icon set question** — Phase 0 now confirms icon library (Q3) before Phase 1; added to expected output block
- **`.github/pull_request_template.md`** — scaffolded automatically for all project types
- **`public/__forms.html`** — Netlify Forms static stub for Marketing site and Content site
- **Netlify auto-publish warning** — prominent red alert in final output with exact UI path (Site → Deploys → Deploy settings → Continuous deployment)
- **`CONTEXT.md`** — scaffolded in every project; records component system, animation system, intentional trade-offs, out-of-scope, known tech debt; fed to `shadcn/improve`
- **`shadcn/improve`** — installed automatically via `npx skills add shadcn/improve` on every project
- **Phase 0** added to `project-setup.md` — component system, Storybook, icon set, animation system questions before Phase 1
- **Storybook** — opt-in add-on with Vite builder and MCP server sub-question
- **Data visualisation** — 3-way choice: Recharts/shadcn, Visx, or None
- **Three.js / WebGL** — React Three Fiber + Drei as a project type (3D / Interactive experience) and add-on
- **8 project types** — added Internal tool, 3D / Interactive experience, Email templates (bail-out), with plain-English descriptions
- **Astryx** — bail-out option in component system question with manual setup instructions
- **shadcn Base UI default** — component system question defaults to Base UI (shadcn default since July 2026); `--base radix` / `--base aria` options available
- **Pre-install version check** — added to `process.md`; mandatory WebSearch before any `npx`/`npm install`

### Fixed
- Strapi `tsconfig.json` exclude missing — Next.js was compiling Strapi's TypeScript and failing
- `strapi/postcss.config.js` missing — Tailwind PostCSS config was leaking into Strapi's Vite build
- `.env.example` now pre-filled with Session Pooler format for Supabase — Direct Connection fails on Render (IPv6/`ENETUNREACH`)
- Cloudflare + ISR webhook question was asked for all project types — now Content site only
- Supabase question incorrectly skipped for Marketing site — now asked correctly

### Changed
- Stack summary block in final output now built dynamically from selections (was hardcoded per type)

### Migration

**If you downloaded `create-project.sh` manually** (stored at `~/Scripts/create-project.sh`): the script now requires three sub-scripts in a `.scripts/` folder alongside it. Re-download the full set — see the README "Creating a new project" section for the updated curl commands.

For existing scaffolded projects:

- If your project uses Strapi: manually add `"strapi"` to `exclude` in `tsconfig.json` and create an empty `strapi/postcss.config.js`
- If your project uses Supabase on Render: confirm your `DATABASE_URL` uses the Session Pooler connection string (port 6543), not Direct Connection (port 5432)

---

## [1.0.0] — initial release

Base scaffold: Next.js App Router, Tailwind CSS v4, shadcn/ui (new-york), Lucide React, Netlify deployment, Supabase optional, dark mode via next-themes, sidebar via shadcn/sidebar, Shiki, Recharts, Cloudinary, Cloudflare ISR webhook.

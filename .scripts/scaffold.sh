#!/bin/bash
# .scripts/scaffold.sh
# File operations run inside the cloned repo — after gh repo create.
# Sourced by create-project.sh. All variables are set by the parent script.

# ── Tailor scaffold based on project type ─────────────────────
echo ""
echo -e "${BLUE}Configuring scaffold for: $PROJECT_TYPE_LABEL...${RESET}"

if [ "$USE_SUPABASE" = false ]; then
  rm -rf supabase
  rm -f lib/supabase/client.ts lib/supabase/server.ts
  rmdir lib/supabase 2>/dev/null || true
  echo -e "  ${YELLOW}↳ Removed Supabase config${RESET}"
fi

if [ "$USE_NETLIFY" = false ]; then
  rm -f netlify.toml
  echo -e "  ${YELLOW}↳ Removed Netlify config${RESET}"
fi

# ── .env.example ──────────────────────────────────────────────
if [ "$USE_SUPABASE" = false ]; then
  cat > .env.example << 'EOF'
# ── App ───────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
else
  # Pre-fill Session Pooler format — Direct Connection fails on Render/IPv6.
  cat > .env.example << 'EOF'
# ── App ───────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ── Supabase ──────────────────────────────────────────────────
# Find these in your Supabase project under Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# !! Use Session Pooler — NOT Direct Connection !!
# Direct Connection (port 5432) fails on Render with ENETUNREACH (IPv6).
# Session Pooler URL is at: Settings → Database → Connection string → Session pooler
# Format: postgres://postgres.xxxx:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
DATABASE_URL=postgres://postgres.xxxx:[your-db-password]@aws-0-[region].pooler.supabase.com:6543/postgres
EOF
fi

# ── Strapi subfolder (Content site) ───────────────────────────
if [ "$USE_STRAPI" = true ]; then
  cat >> .env.example << 'EOF'

# ── Strapi ────────────────────────────────────────────────────
# Set once Strapi is deployed to Render
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your-strapi-api-token
EOF

  mkdir -p strapi
  cat > strapi/README.md << 'EOF'
# Strapi CMS

This subfolder contains the Strapi CMS instance for this project.

## Local setup

```bash
cd strapi
npx create-strapi-app@latest . --quickstart
```

## Deploying to Render

1. Push this repo to GitHub
2. Go to render.com → New Web Service → connect this repo
3. Set root directory to `strapi`
4. Build command: `npm run build`
5. Start command: `npm run start`

Set these environment variables in Render:
- `DATABASE_URL` — Supabase Session Pooler URL (Settings → Database → Connection string → Session pooler)
- `ADMIN_JWT_SECRET` — run: openssl rand -base64 32
- `API_TOKEN_SALT`   — run: openssl rand -base64 32
- `APP_KEYS`         — run: openssl rand -base64 32
- `JWT_SECRET`       — run: openssl rand -base64 32

Once deployed, copy the Render URL to NEXT_PUBLIC_STRAPI_URL in Netlify env vars.
EOF
  echo -e "  ${YELLOW}↳ Added Strapi subfolder — see strapi/README.md to init${RESET}"

  # Prevent Next.js from compiling Strapi's TypeScript
  if [ -f "tsconfig.json" ]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' 's/"exclude": \[/"exclude": ["strapi", /' tsconfig.json
    else
      sed -i 's/"exclude": \[/"exclude": ["strapi", /' tsconfig.json
    fi
    echo -e "  ${YELLOW}↳ Added \"strapi\" to tsconfig.json exclude array${RESET}"
  fi

  # Prevent Tailwind PostCSS config leaking into Strapi's Vite build
  cat > strapi/postcss.config.js << 'EOF'
// Empty — prevents the parent PostCSS config (Tailwind) from leaking
// into Strapi's Vite build. Do not remove this file.
module.exports = {}
EOF
  echo -e "  ${YELLOW}↳ Added strapi/postcss.config.js (prevents Tailwind PostCSS leak into Strapi)${RESET}"
fi

# ── Chart CSS tokens ──────────────────────────────────────────
if [ "$USE_CHARTS" = true ]; then
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' 's/"lucide-react": "[^"]*"/"lucide-react": "^0.460.0",\n    "recharts": "^2.15.0"/' package.json
  else
    sed -i 's/"lucide-react": "[^"]*"/"lucide-react": "^0.460.0",\n    "recharts": "^2.15.0"/' package.json
  fi

  python3 - << 'PYEOF'
import re

with open('app/globals.css', 'r') as f:
    css = f.read()

CHART_LIGHT = """
  /* ── Chart colours ─────────────────────────────────────────
     Used by shadcn Chart component. Edit to match your brand.
  ───────────────────────────────────────────────────────── */
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);"""

CHART_DARK = """
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);"""

css = re.sub(r'(  --radius: [^;]+;)', r'\1' + CHART_LIGHT, css, count=1)
css = re.sub(r'(\.dark \{[^}]*?)(})', lambda m: m.group(1) + CHART_DARK + '\n}', css, count=1, flags=re.DOTALL)

with open('app/globals.css', 'w') as f:
    f.write(css)
PYEOF
  echo -e "  ${YELLOW}↳ Added Recharts + chart colour tokens${RESET}"
fi

# ── Sidebar CSS variables ─────────────────────────────────────
if [ "$USE_SIDEBAR" = true ]; then
  python3 - << 'PYEOF'
import re

with open('app/globals.css', 'r') as f:
    css = f.read()

SIDEBAR_LIGHT = """
  /* ── Sidebar ───────────────────────────────────────────────
     Used by shadcn Sidebar component.
  ───────────────────────────────────────────────────────── */
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);"""

SIDEBAR_DARK = """
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);"""

css = re.sub(r'(  --radius: [^;]+;)', r'\1' + SIDEBAR_LIGHT, css, count=1)
css = re.sub(r'(\.dark \{[^}]*?)(})', lambda m: m.group(1) + SIDEBAR_DARK + '\n}', css, count=1, flags=re.DOTALL)

with open('app/globals.css', 'w') as f:
    f.write(css)
PYEOF
  echo -e "  ${YELLOW}↳ Added sidebar CSS variables (light + dark)${RESET}"
fi

# ── Dark mode layout ──────────────────────────────────────────
if [ "$USE_DARK_MODE" = true ]; then
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' 's/"lucide-react": "[^"]*"/"lucide-react": "^0.460.0",\n    "next-themes": "^0.4.4"/' package.json
  else
    sed -i 's/"lucide-react": "[^"]*"/"lucide-react": "^0.460.0",\n    "next-themes": "^0.4.4"/' package.json
  fi

  cat > app/layout.tsx << 'LAYOUTEOF'
import type { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import './globals.css'

export const metadata: Metadata = {
  title: 'Project',
  description: 'Built with Next.js, shadcn/ui, and Tailwind CSS.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
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
LAYOUTEOF
  echo -e "  ${YELLOW}↳ Added next-themes ThemeProvider to layout.tsx${RESET}"
else
  echo -e "  ${YELLOW}↳ Dark mode skipped — .dark CSS vars retained for future use${RESET}"
fi

# ── Netlify Forms stub ────────────────────────────────────────
# Next.js renders forms client-side — Netlify's build scanner misses them.
# This static stub registers forms during the build scan.
if [[ "$PROJECT_TYPE_LABEL" == "Marketing site" || "$PROJECT_TYPE_LABEL" == "Content site" ]]; then
  mkdir -p public
  cat > public/__forms.html << 'EOF'
<!DOCTYPE html>
<html>
  <head><title>Netlify Forms stub</title></head>
  <body>
    <!--
      This file exists so Netlify can detect your forms at build time.
      Next.js renders forms client-side, so Netlify's build scanner
      misses them — this static stub registers them instead.

      Mirror every form field from your React forms here.
      The `name` attribute on <form> must match your React form's
      data-netlify-name (or name) attribute.

      Example:
    -->
    <form name="contact" netlify netlify-honeypot="bot-field" hidden>
      <input type="text" name="name" />
      <input type="email" name="email" />
      <textarea name="message"></textarea>
    </form>
  </body>
</html>
EOF
  echo -e "  ${YELLOW}↳ Added public/__forms.html — update with your form fields for Netlify form detection${RESET}"
fi

echo -e "${GREEN}✓ Scaffold configured${RESET}"

# ── CLAUDE.md ─────────────────────────────────────────────────
echo ""
echo -e "${BLUE}Updating CLAUDE.md...${RESET}"

ORIGINAL_CLAUDE=$(cat CLAUDE.md)

DARK_MODE_FLAG="true"
if [ "$USE_DARK_MODE" = false ]; then DARK_MODE_FLAG="false"; fi
SIDEBAR_FLAG="false"
if [ "$USE_SIDEBAR" = true ]; then SIDEBAR_FLAG="true"; fi
SHIKI_FLAG="false"
if [ "$USE_SHIKI" = true ]; then SHIKI_FLAG="true"; fi

cat > CLAUDE.md << EOF
# Project: $PROJECT_NAME
**Type:** $PROJECT_TYPE_LABEL
**Created:** $(date +%Y-%m-%d)
**Dark mode:** $DARK_MODE_FLAG
**Sidebar:** $SIDEBAR_FLAG
**Shiki:** $SHIKI_FLAG

## Stack

| Layer | Tool |
|---|---|
$STACK_BLOCK

## Active MCPs

| MCP | When to use |
|---|---|
$MCP_BLOCK

**Standing rules:**
- Log decisions and trade-offs as comments on the relevant Linear issue — not just in conversation
- If scope changes, update Notion first, then adjust Linear to match
- Never create Linear issues without a corresponding Notion plan entry

---

$ORIGINAL_CLAUDE
EOF

echo -e "${GREEN}✓ CLAUDE.md updated${RESET}"

# ── README.md ─────────────────────────────────────────────────
echo -e "${BLUE}Updating README.md...${RESET}"

if [ "$USE_SUPABASE" = true ] && [ "$USE_STRAPI" = true ]; then
  ENV_SECTION='After the script runs, open `.env.local` and fill in your credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your-strapi-api-token
```

Find Supabase keys under **Settings → API** in your Supabase project. Strapi keys are set once Strapi is deployed to Render.'
elif [ "$USE_SUPABASE" = true ]; then
  ENV_SECTION='After the script runs, open `.env.local` and fill in your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Find these in your Supabase project under **Settings → API**.'
else
  ENV_SECTION='After the script runs, `.env.local` is ready to go:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

No external services to configure.'
fi

if [ "$USE_NETLIFY" = true ] && [ "$USE_STRAPI" = true ]; then
  DEPLOY_SECTION='## Deployment

### Frontend (Netlify)

Configured via `netlify.toml`. To connect:

1. Push the repo to GitHub
2. Go to [netlify.com](https://netlify.com) → Add new site → Import from GitHub
3. Select the repo — build settings are pre-configured
4. Add environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_STRAPI_URL`, `STRAPI_API_TOKEN`
5. Deploy

### Strapi CMS (Render)

See `strapi/README.md` for full setup instructions.'
elif [ "$USE_NETLIFY" = true ]; then
  DEPLOY_SECTION="## Deployment

Configured for Netlify via \`netlify.toml\`. To connect:

1. Push the repo to GitHub
2. Go to [netlify.com](https://netlify.com) → Add new site → Import from GitHub
3. Select the repo — build settings are pre-configured
4. Add environment variables in **Site → Environment variables**
5. Deploy"
else
  DEPLOY_SECTION='## Running locally

```bash
npm run dev
```

No deployment target is configured. Add one when you are ready to ship.'
fi

if [ "$USE_SUPABASE" = true ] && [ "$USE_STRAPI" = true ]; then
  STRUCTURE_SECTION='```
├── CLAUDE.md
├── .claude/
│   ├── project-setup.md
│   ├── design-psychology.md
│   ├── ui-standards.md
│   └── ux-process.md
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/ui/
├── lib/
│   ├── utils.ts
│   └── supabase/
│       ├── client.ts
│       └── server.ts
├── strapi/
│   └── README.md
├── supabase/
│   └── config.toml
├── public/
├── .env.example
├── netlify.toml
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```'
elif [ "$USE_SUPABASE" = true ]; then
  STRUCTURE_SECTION='```
├── CLAUDE.md
├── .claude/
│   ├── project-setup.md
│   ├── design-psychology.md
│   ├── ui-standards.md
│   └── ux-process.md
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/ui/
├── lib/
│   ├── utils.ts
│   └── supabase/
│       ├── client.ts
│       └── server.ts
├── supabase/
│   └── config.toml
├── public/
├── .env.example
├── netlify.toml
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```'
elif [ "$USE_NETLIFY" = true ]; then
  STRUCTURE_SECTION='```
├── CLAUDE.md
├── .claude/
│   ├── project-setup.md
│   ├── design-psychology.md
│   ├── ui-standards.md
│   └── ux-process.md
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/ui/
├── lib/
│   └── utils.ts
├── public/
├── .env.example
├── netlify.toml
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```'
else
  STRUCTURE_SECTION='```
├── CLAUDE.md
├── .claude/
│   ├── project-setup.md
│   ├── design-psychology.md
│   ├── ui-standards.md
│   └── ux-process.md
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/ui/
├── lib/
│   └── utils.ts
├── public/
├── .env.example
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```'
fi

cat > README.md << EOF
# $PROJECT_NAME

**Type:** $PROJECT_TYPE_LABEL
**Stack:** $STACK_SUMMARY

---

## Getting started

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000).

---

## Environment variables

$ENV_SECTION

---

$DEPLOY_SECTION

---

## Repo structure

$STRUCTURE_SECTION

---

## Adding shadcn components

\`\`\`bash
npx shadcn add button
npx shadcn add card dialog select table tabs
\`\`\`

Components land in \`components/ui/\` and inherit your brand tokens automatically.

---

## Applying your brand

**\`app/globals.css\`** — update the oklch values for \`--primary\`, \`--accent\`, \`--radius\`, and any other shadcn tokens.

**\`tailwind.config.ts\`** — update \`fontFamily.sans\` to your chosen typeface. Add the font import to \`layout.tsx\` using \`next/font\`.

Both light (\`:root\`) and dark (\`.dark\`) variants are pre-wired. Update both when changing colours.
EOF

echo -e "${GREEN}✓ README.md updated${RESET}"

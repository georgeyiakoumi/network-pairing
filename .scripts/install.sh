#!/bin/bash
# .scripts/install.sh
# All npm install / npx calls + file scaffolding that happens post-install.
# Sourced by create-project.sh. All variables are set by the parent script.

# ── Install dependencies ──────────────────────────────────────
echo ""
echo -e "${BLUE}Installing dependencies...${RESET}"
npm install
echo -e "${GREEN}✓ Dependencies installed${RESET}"

# ── shadcn/improve audit skill ────────────────────────────────
echo ""
echo -e "${BLUE}Installing shadcn/improve audit skill...${RESET}"
npx skills add shadcn/improve
echo -e "${GREEN}✓ shadcn/improve installed${RESET}"
echo -e "${YELLOW}  ↳ Run /improve before every milestone sign-off and PR${RESET}"
echo -e "${YELLOW}  ↳ Run /improve quick for a faster pass on smaller changes${RESET}"

# ── CONTEXT.md ────────────────────────────────────────────────
# Read by shadcn/improve to avoid re-flagging intentional trade-offs.
# Fill in from the Notion master plan during project setup.
cat > CONTEXT.md << EOF
# CONTEXT.md — Project context for AI tools

This file is read by \`shadcn/improve\` and other AI audit tools to avoid
re-flagging decisions that were intentional. Update it as the project evolves.

## What this project is

<!-- One paragraph: what it does, who it's for, what success looks like. -->
<!-- Pull from the Notion master plan Overview section. -->

## Stack decisions

- **Component system:** $COMPONENT_SYSTEM_LABEL
- **Animation system:** $ANIMATION_SYSTEM_LABEL

<!-- One animation system for the entire project — do not mix. -->
<!-- If "Undecided", update this before writing the first animation. -->

## Intentional trade-offs

<!-- List decisions that look like issues but are deliberate. -->
<!-- Format: "We did X instead of Y because Z." -->
<!-- Pull from the Notion decisions log. -->

## Out of scope

<!-- Features or patterns explicitly excluded from this project. -->
<!-- Pull from Notion scope → Out of scope section. -->

## Known tech debt

<!-- Things we know are imperfect and have accepted for now. -->
<!-- Update when a decision is made to defer a fix. -->
EOF
echo -e "${GREEN}✓ CONTEXT.md scaffolded${RESET}"
echo -e "${YELLOW}  ↳ Fill in from the Notion master plan after project setup${RESET}"

# ── PR template ───────────────────────────────────────────────
mkdir -p .github
cat > .github/pull_request_template.md << 'EOF'
## What changed

<!-- 2–4 sentences, plain English. What does this PR do? -->

## Why

<!-- The user need or bug this addresses. -->

## Linear ticket

<!-- Link: https://linear.app/george-yiakoumi/issue/GEO-XX -->

## Regression checklist

<!-- If this PR touches a user-facing flow, complete this before merging. -->
<!-- Remove if not applicable (e.g. config-only PRs). -->

- [ ] Manually walked through the affected flow in a fresh browser tab
- [ ] Checked both light and dark mode
- [ ] Checked mobile viewport
- [ ] No console errors
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` exits 0

## Intentional trade-offs

<!-- Anything flagged by /improve that was a deliberate decision. -->
<!-- Cross-reference CONTEXT.md and the Notion decisions log. -->
EOF
echo -e "${GREEN}✓ .github/pull_request_template.md written${RESET}"

# ── shadcn Chart component ────────────────────────────────────
if [ "$USE_CHARTS" = true ]; then
  echo -e "${BLUE}Adding shadcn Chart component...${RESET}"
  npx shadcn@latest add chart -y
  echo -e "${GREEN}✓ Chart component added${RESET}"
fi

# ── Shiki ─────────────────────────────────────────────────────
if [ "$USE_SHIKI" = true ]; then
  echo -e "${BLUE}Installing Shiki...${RESET}"
  npm install shiki
  echo -e "${GREEN}✓ Shiki installed${RESET}"
fi

# ── Visx ──────────────────────────────────────────────────────
if [ "$USE_VISX" = true ]; then
  echo -e "${BLUE}Installing Visx...${RESET}"
  npm install @visx/visx
  echo -e "${GREEN}✓ Visx installed${RESET}"
fi

# ── React Three Fiber + Drei ──────────────────────────────────
if [ "$USE_THREEJS" = true ]; then
  echo -e "${BLUE}Installing React Three Fiber + Drei...${RESET}"
  npm install three @react-three/fiber @react-three/drei
  npm install -D @types/three
  echo -e "${GREEN}✓ React Three Fiber + Drei installed${RESET}"
  echo -e "${YELLOW}  ↳ Community MCPs available: threejs-devtools-mcp, mcp-three${RESET}"
  echo -e "${YELLOW}  ↳ Check registry.modelcontextprotocol.io to add one${RESET}"
fi

# ── Storybook ─────────────────────────────────────────────────
if [ "$USE_STORYBOOK" = true ]; then
  echo -e "${BLUE}Setting up Storybook...${RESET}"
  if [ "$USE_STORYBOOK_MCP" = true ]; then
    echo -e "${YELLOW}  ↳ Vite builder selected — choose Vite at the builder prompt${RESET}"
    npx storybook@latest init --yes
    echo -e "${YELLOW}  ↳ MCP server setup: https://storybook.js.org/docs/ai/setup${RESET}"
  else
    npx storybook@latest init --yes
  fi
  echo -e "${GREEN}✓ Storybook initialised${RESET}"
fi

# ── Cloudinary ────────────────────────────────────────────────
if [ "$USE_CLOUDINARY" = true ]; then
  echo -e "${BLUE}Installing Cloudinary...${RESET}"
  npm install next-cloudinary

  mkdir -p lib
  cat > lib/cloudinary.ts << 'EOF'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export default cloudinary
EOF

  cat >> .env.example << 'EOF'

# ── Cloudinary ────────────────────────────────────────────────
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
EOF

  echo -e "  ${YELLOW}↳ Add Cloudinary keys to .env.local (Settings → API Keys in Cloudinary dashboard)${RESET}"
  echo -e "${GREEN}✓ Cloudinary scaffolded${RESET}"
fi

# ── Cloudflare + ISR revalidation ─────────────────────────────
if [ "$USE_CLOUDFLARE" = true ]; then
  echo -e "${BLUE}Scaffolding Cloudflare ISR webhook revalidation...${RESET}"

  mkdir -p app/api/revalidate
  cat > app/api/revalidate/route.ts << 'EOF'
import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')

  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const tag = body?.tag as string | undefined
  const path = body?.path as string | undefined

  if (tag) {
    revalidateTag(tag)
    return NextResponse.json({ revalidated: true, tag })
  }

  if (path) {
    revalidatePath(path)
    return NextResponse.json({ revalidated: true, path })
  }

  return NextResponse.json(
    { message: 'Provide a tag or path in the request body' },
    { status: 400 }
  )
}
EOF

  cat >> .env.example << 'EOF'

# ── Cloudflare / ISR revalidation ─────────────────────────────
# Generate with: openssl rand -base64 32
REVALIDATION_SECRET=your-revalidation-secret
EOF

  echo -e "  ${YELLOW}↳ Webhook endpoint: POST /api/revalidate?secret=\$REVALIDATION_SECRET${RESET}"
  echo -e "  ${YELLOW}↳ Body: { \"tag\": \"posts\" } or { \"path\": \"/blog\" }${RESET}"
  echo -e "  ${YELLOW}↳ Set up Cloudflare Worker or webhook in your CMS to call this on content publish${RESET}"
  echo -e "${GREEN}✓ ISR revalidation route scaffolded${RESET}"
fi

# ── .env.local ────────────────────────────────────────────────
if [ -f ".env.example" ]; then
  cp .env.example .env.local
  echo -e "${GREEN}✓ .env.local created from .env.example${RESET}"
  if [ "$USE_SUPABASE" = true ]; then
    echo -e "${YELLOW}  ↳ Fill in Supabase keys in .env.local before starting the dev server${RESET}"
  fi
  if [ "$USE_STRAPI" = true ]; then
    echo -e "${YELLOW}  ↳ Fill in STRAPI_API_TOKEN once Strapi is deployed to Render${RESET}"
  fi
fi

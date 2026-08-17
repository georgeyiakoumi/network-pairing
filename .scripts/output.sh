#!/bin/bash
# .scripts/output.sh
# Final output block — printed after everything is set up.
# Sourced by create-project.sh. All variables are set by the parent script.

# ── Open in VS Code ───────────────────────────────────────────
echo ""
if [ "$VSCODE_AVAILABLE" = true ]; then
  echo -e "${BLUE}Opening in VS Code...${RESET}"
  code .
  echo -e "${GREEN}✓ VS Code opened${RESET}"
  echo ""
  echo -e "${BOLD}Claude Code will load CLAUDE.md automatically.${RESET}"
  echo -e "It will run the project setup routine and check MCP connections."
else
  echo -e "${YELLOW}Open VS Code manually:${RESET}"
  echo -e "  cd \"$(pwd)\" && code ."
fi

# ── Done ──────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}╔══════════════════════════════════╗${RESET}"
echo -e "${GREEN}${BOLD}║     Project ready!               ║${RESET}"
echo -e "${GREEN}${BOLD}╚══════════════════════════════════╝${RESET}"
echo ""
echo -e "  ${BOLD}Name:${RESET}        $PROJECT_NAME"
echo -e "  ${BOLD}Type:${RESET}        $PROJECT_TYPE_LABEL"
echo -e "  ${BOLD}Components:${RESET}  $COMPONENT_SYSTEM_LABEL"
echo -e "  ${BOLD}Stack:${RESET}       $STACK_SUMMARY"
if [ "$USE_DARK_MODE" = true ]; then
  echo -e "  ${BOLD}Dark mode:${RESET}   enabled (next-themes)"
fi
if [ "$USE_SIDEBAR" = true ]; then
  echo -e "  ${BOLD}Sidebar:${RESET}     CSS variables injected"
fi
if [ "$USE_CHARTS" = true ]; then
  echo -e "  ${BOLD}Data viz:${RESET}    Recharts + shadcn Chart"
fi
if [ "$USE_VISX" = true ]; then
  echo -e "  ${BOLD}Data viz:${RESET}    Visx installed"
fi
if [ "$USE_SHIKI" = true ]; then
  echo -e "  ${BOLD}Shiki:${RESET}       syntax highlighting installed"
fi
if [ "$USE_THREEJS" = true ]; then
  echo -e "  ${BOLD}Three.js:${RESET}    React Three Fiber + Drei installed"
fi
if [ "$USE_SUPABASE" = true ] && [ "$USE_STRAPI" = false ]; then
  echo -e "  ${BOLD}Supabase:${RESET}    scaffolding included"
fi
if [ "$USE_STORYBOOK" = true ]; then
  if [ "$USE_STORYBOOK_MCP" = true ]; then
    echo -e "  ${BOLD}Storybook:${RESET}   component docs + MCP server (Vite)"
  else
    echo -e "  ${BOLD}Storybook:${RESET}   component docs (Webpack)"
  fi
fi
if [ "$USE_CLOUDINARY" = true ]; then
  echo -e "  ${BOLD}Cloudinary:${RESET}  lib/cloudinary.ts scaffolded"
fi
if [ "$USE_CLOUDFLARE" = true ]; then
  echo -e "  ${BOLD}Cloudflare:${RESET}  ISR route at /api/revalidate"
fi
echo -e "  ${BOLD}GitHub:${RESET}      https://github.com/georgeyiakoumi/$PROJECT_NAME"
echo -e "  ${BOLD}Local:${RESET}       $ACTIVE_DIR/$PROJECT_NAME"
echo ""

# ── Next steps ────────────────────────────────────────────────
if [ "$USE_SUPABASE" = true ]; then
  echo -e "  ${YELLOW}→ Fill in .env.local with your Supabase keys${RESET}"
fi
if [ "$USE_STRAPI" = true ]; then
  echo -e "  ${YELLOW}→ cd strapi && npx create-strapi-app@latest . --quickstart${RESET}"
fi
if [ "$USE_CLOUDINARY" = true ]; then
  echo -e "  ${YELLOW}→ Fill in Cloudinary keys in .env.local${RESET}"
fi
if [ "$USE_CLOUDFLARE" = true ]; then
  echo -e "  ${YELLOW}→ Set REVALIDATION_SECRET in .env.local and Netlify env vars${RESET}"
  echo -e "  ${YELLOW}→ Wire your CMS webhook to POST /api/revalidate?secret=...${RESET}"
fi
echo ""

# ── Branch protection ─────────────────────────────────────────
echo -e "${YELLOW}  One manual step — protect the main branch:${RESET}"
echo -e "  https://github.com/georgeyiakoumi/$PROJECT_NAME/settings/rules/new"
echo -e "  ${YELLOW}↳ Add target → Include by pattern → ${BOLD}main${RESET}"
echo -e "  ${YELLOW}↳ Enable: Restrict deletions${RESET}"
echo -e "  ${YELLOW}↳ Enable: Require a pull request before merging (0 approvals)${RESET}"
echo -e "  ${YELLOW}↳ Enable: Block force pushes${RESET}"
echo -e "  ${YELLOW}↳ Save ruleset${RESET}"
echo ""

# ── Netlify auto-publish warning ──────────────────────────────
if [ "$USE_NETLIFY" = true ]; then
  echo -e "${RED}${BOLD}  !! NETLIFY — DISABLE AUTO-PUBLISHING NOW !!${RESET}"
  echo -e "${RED}  The free tier gives ~300 build minutes / month (~10 min/build = ~30 deploys).${RESET}"
  echo -e "${RED}  Auto-publishing burns this on every push. Disable it before starting work.${RESET}"
  echo ""
  echo -e "  ${BOLD}How to disable:${RESET}"
  echo -e "  1. netlify.com → your site → Deploys"
  echo -e "  2. Deploy settings → Build settings"
  echo -e "  3. Set ${BOLD}\"Stop builds\"${RESET} or turn off ${BOLD}\"Auto publishing\"${RESET}"
  echo -e "     (exact path: Site → Deploys → Deploy settings → Continuous deployment)"
  echo -e "  4. Deploy manually with: ${CYAN}netlify deploy --prod${RESET}"
  echo ""
fi

# ── MCP checklist ─────────────────────────────────────────────
echo -e "${CYAN}  Tip: run ${BOLD}sync-template${RESET}${CYAN} from inside this project at any time"
echo -e "  to pull the latest rules and standards from the template.${RESET}"
echo ""
echo -e "${YELLOW}${BOLD}  Before starting work — verify MCPs are connected:${RESET}"
echo -e "${YELLOW}  Claude Code → Settings → MCP Servers${RESET}"
echo ""
echo -e "  ${BOLD}☐ Linear${RESET}   — required for all projects"
echo -e "  ${BOLD}☐ Notion${RESET}   — required for all projects"
echo -e "  ${BOLD}☐ GitHub${RESET}   — required for all projects"
if [ "$USE_NETLIFY" = true ]; then
  echo -e "  ${BOLD}☐ Netlify${RESET}  — required (Netlify deployment selected)"
fi
if [ "$USE_SUPABASE" = true ]; then
  echo -e "  ${BOLD}☐ Supabase${RESET} — required (Supabase selected)"
fi
echo ""
echo -e "  ${CYAN}Then run Phase 1 in project-setup.md to confirm connectivity${RESET}"
echo -e "  ${CYAN}before any design or code work begins.${RESET}"
echo ""

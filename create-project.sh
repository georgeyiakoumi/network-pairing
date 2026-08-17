#!/bin/bash

# ─────────────────────────────────────────────────────────────
# create-project.sh
# Creates a new project repo from George's design template.
#
# Sub-scripts (sourced after clone):
#   .scripts/scaffold.sh  — file operations inside the cloned repo
#   .scripts/install.sh   — npm install, npx calls, file scaffolding
#   .scripts/output.sh    — final output, branch protection, MCP checklist
#
# Prerequisites:
#   - GitHub CLI installed and authenticated (gh auth login)
#   - Node.js 18+ installed
#   - VS Code CLI installed (code command available)
#   - T7 Editing external drive mounted (preferred)
# ─────────────────────────────────────────────────────────────

set -e

TEMPLATE_REPO="georgeyiakoumi/gy-basecamp"
DRIVE_NAME="T7 Editing"
DRIVE_PATH="/Volumes/$DRIVE_NAME"
PROJECTS_DIR="$DRIVE_PATH/Projects"
FALLBACK_DIR="$HOME/Projects"
SCRIPTS_DIR="$(dirname "$0")/.scripts"

# ── Verify sub-scripts are present ───────────────────────────
for REQUIRED_SCRIPT in scaffold.sh install.sh output.sh; do
  if [ ! -f "$SCRIPTS_DIR/$REQUIRED_SCRIPT" ]; then
    echo ""
    echo "✗ Missing: $SCRIPTS_DIR/$REQUIRED_SCRIPT"
    echo ""
    echo "  create-project.sh requires three sub-scripts in a .scripts/ folder"
    echo "  alongside it. Re-download the full set — see the README for the"
    echo "  updated curl commands, or clone the repo directly:"
    echo ""
    echo "  https://github.com/georgeyiakoumi/gy-basecamp"
    echo ""
    exit 1
  fi
done

# ── Colours ──────────────────────────────────────────────────
BOLD='\033[1m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
RESET='\033[0m'

echo ""
echo -e "${BOLD}╔══════════════════════════════════╗${RESET}"
echo -e "${BOLD}║     New Project Setup            ║${RESET}"
echo -e "${BOLD}╚══════════════════════════════════╝${RESET}"
echo ""

# ── Check prerequisites ───────────────────────────────────────
echo -e "${BLUE}Checking prerequisites...${RESET}"

if ! command -v gh &> /dev/null; then
  echo -e "${RED}✗ GitHub CLI (gh) not found. Install: https://cli.github.com${RESET}"
  exit 1
fi

if ! command -v node &> /dev/null; then
  echo -e "${RED}✗ Node.js not found. Install: https://nodejs.org${RESET}"
  exit 1
fi

if ! command -v code &> /dev/null; then
  echo -e "${YELLOW}⚠ VS Code CLI (code) not found — open the project manually after.${RESET}"
  VSCODE_AVAILABLE=false
else
  VSCODE_AVAILABLE=true
fi

echo -e "${GREEN}✓ Prerequisites met${RESET}"
echo ""

# ── Check T7 Editing drive ────────────────────────────────────
if [ -d "$DRIVE_PATH" ]; then
  echo -e "${GREEN}✓ $DRIVE_NAME is connected${RESET}"
  mkdir -p "$PROJECTS_DIR"
  ACTIVE_DIR="$PROJECTS_DIR"
else
  echo -e "${YELLOW}⚠ $DRIVE_NAME is not connected.${RESET}"
  echo -e "  Projects will be saved to ${YELLOW}$FALLBACK_DIR${RESET} instead."
  echo ""
  read -p "Continue with fallback location? (y/n): " USE_FALLBACK
  if [[ "$USE_FALLBACK" != "y" && "$USE_FALLBACK" != "Y" ]]; then
    echo -e "${RED}Aborted. Connect $DRIVE_NAME and try again.${RESET}"
    exit 0
  fi
  mkdir -p "$FALLBACK_DIR"
  ACTIVE_DIR="$FALLBACK_DIR"
fi

echo ""

# ── Project name ──────────────────────────────────────────────
while true; do
  read -p "$(echo -e ${BOLD})Project name (kebab-case, e.g. client-dashboard): $(echo -e ${RESET})" PROJECT_NAME

  if [[ -z "$PROJECT_NAME" ]]; then
    echo -e "${RED}✗ Project name cannot be empty.${RESET}"
    echo ""
    continue
  fi

  if [[ ! "$PROJECT_NAME" =~ ^[a-z0-9-]+$ ]]; then
    echo -e "${RED}✗ Use lowercase letters, numbers, and hyphens only.${RESET}"
    echo ""
    continue
  fi

  if gh repo view "georgeyiakoumi/$PROJECT_NAME" &> /dev/null; then
    echo -e "${RED}✗ A repo named '$PROJECT_NAME' already exists on your GitHub account.${RESET}"
    echo ""
    continue
  fi

  if [ -d "$ACTIVE_DIR/$PROJECT_NAME" ]; then
    echo -e "${YELLOW}⚠ A folder named '$PROJECT_NAME' already exists at $ACTIVE_DIR${RESET}"
    read -p "Delete it and continue? (y/n): " DELETE_FOLDER
    if [[ "$DELETE_FOLDER" == "y" || "$DELETE_FOLDER" == "Y" ]]; then
      rm -rf "$ACTIVE_DIR/$PROJECT_NAME"
      echo -e "${GREEN}✓ Deleted $ACTIVE_DIR/$PROJECT_NAME${RESET}"
    else
      echo ""
      continue
    fi
  fi

  break
done

# ── Project type ──────────────────────────────────────────────
echo ""
echo -e "${BOLD}What are you building?${RESET}"
echo ""
echo -e "  ${CYAN}1)${RESET} ${BOLD}Web app${RESET}"
echo -e "     A product with users, auth, and data. Think dashboards,"
echo -e "     tools, SaaS. Supabase optional. Deploys to Netlify."
echo ""
echo -e "  ${CYAN}2)${RESET} ${BOLD}Marketing site${RESET}"
echo -e "     Public-facing, conversion-focused. Landing pages, pricing,"
echo -e "     about. No auth. Copywriting skill invoked. Deploys to Netlify."
echo ""
echo -e "  ${CYAN}3)${RESET} ${BOLD}Content site${RESET}"
echo -e "     Content-heavy site driven by a CMS. Strapi manages content,"
echo -e "     Supabase is the database, Render hosts Strapi, Netlify hosts"
echo -e "     the frontend. Pick this if editors need a publishing interface."
echo ""
echo -e "  ${CYAN}4)${RESET} ${BOLD}Internal tool${RESET}"
echo -e "     Ops dashboards, admin panels, CRUD-heavy interfaces. Always"
echo -e "     authenticated, no public surface. Supabase included."
echo -e "     Sidebar recommended. Deploys to Netlify."
echo ""
echo -e "  ${CYAN}5)${RESET} ${BOLD}UI component library${RESET}"
echo -e "     Building and documenting reusable components. No deployment"
echo -e "     target. Storybook recommended."
echo ""
echo -e "  ${CYAN}6)${RESET} ${BOLD}3D / Interactive experience${RESET}"
echo -e "     WebGL, product visualisers, creative work, immersive landing"
echo -e "     pages. React Three Fiber + Drei. Deploys to Netlify."
echo ""
echo -e "  ${CYAN}7)${RESET} ${BOLD}Email templates${RESET}"
echo -e "     React Email components for transactional or marketing email."
echo -e "     ${YELLOW}Note: exits with manual setup instructions — different scaffold.${RESET}"
echo ""
echo -e "  ${CYAN}8)${RESET} ${BOLD}Prototype${RESET}"
echo -e "     Quick explorations and client demos. Minimal setup, no"
echo -e "     backend, no deployment target."
echo ""
read -p "$(echo -e ${BOLD})Choose (1-8): $(echo -e ${RESET})" PROJECT_TYPE

case $PROJECT_TYPE in
  1)
    PROJECT_TYPE_LABEL="Web app"
    USE_NETLIFY=true
    USE_STRAPI=false
    USE_THREEJS=false
    MCP_BLOCK="| **Linear** | Creating/updating issues, logging decisions, tracking progress |
| **Notion** | Creating/updating the master plan document |
| **Netlify** | Checking deployment status and environment config |
| **GitHub** | Repo access, branch/PR status |"
    ;;
  2)
    PROJECT_TYPE_LABEL="Marketing site"
    USE_SUPABASE=false
    USE_NETLIFY=true
    USE_STRAPI=false
    USE_THREEJS=false
    MCP_BLOCK="| **Linear** | Creating/updating issues, logging decisions, tracking progress |
| **Notion** | Creating/updating the master plan document |
| **Netlify** | Checking deployment status and environment config |
| **GitHub** | Repo access, branch/PR status |
| **Excalidraw** | Generating IA diagrams and user flows |"
    ;;
  3)
    PROJECT_TYPE_LABEL="Content site"
    USE_SUPABASE=true
    USE_NETLIFY=true
    USE_STRAPI=true
    USE_THREEJS=false
    MCP_BLOCK="| **Linear** | Creating/updating issues, logging decisions, tracking progress |
| **Notion** | Creating/updating the master plan document |
| **Netlify** | Checking frontend deployment status |
| **GitHub** | Repo access, branch/PR status |
| **Excalidraw** | Generating IA diagrams and user flows |"
    ;;
  4)
    PROJECT_TYPE_LABEL="Internal tool"
    USE_SUPABASE=false
    USE_NETLIFY=true
    USE_STRAPI=false
    USE_THREEJS=false
    MCP_BLOCK="| **Linear** | Creating/updating issues, logging decisions, tracking progress |
| **Notion** | Creating/updating the master plan document |
| **Netlify** | Checking deployment status and environment config |
| **GitHub** | Repo access, branch/PR status |"
    ;;
  5)
    PROJECT_TYPE_LABEL="UI component library"
    USE_SUPABASE=false
    USE_NETLIFY=false
    USE_STRAPI=false
    USE_THREEJS=false
    MCP_BLOCK="| **Linear** | Creating/updating issues, logging decisions, tracking progress |
| **Notion** | Creating/updating the master plan document |
| **GitHub** | Repo access, branch/PR status |
| **Excalidraw** | Generating IA diagrams and user flows |"
    ;;
  6)
    PROJECT_TYPE_LABEL="3D / Interactive experience"
    USE_SUPABASE=false
    USE_NETLIFY=true
    USE_STRAPI=false
    USE_THREEJS=true
    MCP_BLOCK="| **Linear** | Creating/updating issues, logging decisions, tracking progress |
| **Notion** | Creating/updating the master plan document |
| **Netlify** | Checking deployment status and environment config |
| **GitHub** | Repo access, branch/PR status |"
    ;;
  7)
    echo ""
    echo -e "${YELLOW}${BOLD}Email templates use a different scaffold to this script.${RESET}"
    echo ""
    echo -e "  React Email is not a Next.js app in the traditional sense —"
    echo -e "  it has its own dev server, export pipeline, and no browser"
    echo -e "  Tailwind pipeline. Set it up manually:"
    echo ""
    echo -e "  ${CYAN}npx create-email@latest${RESET}"
    echo ""
    echo -e "  Docs: ${CYAN}https://react.email/docs${RESET}"
    echo ""
    echo -e "  Run create-project.sh again when you need a different project type."
    exit 0
    ;;
  8)
    PROJECT_TYPE_LABEL="Prototype"
    USE_SUPABASE=false
    USE_NETLIFY=false
    USE_STRAPI=false
    USE_THREEJS=false
    MCP_BLOCK="| **Linear** | Creating/updating issues, logging decisions, tracking progress |
| **Notion** | Creating/updating the master plan document |
| **GitHub** | Repo access, branch/PR status |"
    ;;
  *)
    echo -e "${RED}✗ Invalid choice. Run the script again and enter 1–8.${RESET}"
    exit 1
    ;;
esac

# ── Component system ──────────────────────────────────────────
echo ""
echo -e "${BOLD}What component system do you want?${RESET}"
echo ""
echo -e "  ${CYAN}1)${RESET} shadcn/ui — Base UI    ${YELLOW}(default — recommended)${RESET}"
echo -e "  ${CYAN}2)${RESET} shadcn/ui — Radix UI"
echo -e "  ${CYAN}3)${RESET} shadcn/ui — React Aria"
echo -e "  ${CYAN}4)${RESET} Astryx (Meta)          ${YELLOW}(public beta — exits with setup instructions)${RESET}"
echo ""
read -p "$(echo -e ${BOLD})Choose (1-4): $(echo -e ${RESET})" COMPONENT_SYSTEM

case $COMPONENT_SYSTEM in
  1)
    COMPONENT_SYSTEM_LABEL="shadcn/ui — Base UI"
    SHADCN_BACKEND="base"
    USE_SHADCN=true
    ;;
  2)
    COMPONENT_SYSTEM_LABEL="shadcn/ui — Radix UI"
    SHADCN_BACKEND="radix"
    USE_SHADCN=true
    ;;
  3)
    COMPONENT_SYSTEM_LABEL="shadcn/ui — React Aria"
    SHADCN_BACKEND="aria"
    USE_SHADCN=true
    ;;
  4)
    echo ""
    echo -e "${YELLOW}${BOLD}Astryx requires a different stack to this scaffold.${RESET}"
    echo ""
    echo -e "  Astryx uses StyleX instead of Tailwind, has its own theming"
    echo -e "  system, and does not use shadcn components. This script cannot"
    echo -e "  scaffold it correctly — set it up manually:"
    echo ""
    echo -e "  ${CYAN}npm install @astryxdesign/core @astryxdesign/theme-neutral${RESET}"
    echo -e "  ${CYAN}npm install -D @astryxdesign/cli${RESET}"
    echo ""
    echo -e "  Docs: ${CYAN}https://astryx.atmeta.com${RESET}"
    echo ""
    echo -e "  Run create-project.sh again and choose a shadcn option."
    exit 0
    ;;
  *)
    echo -e "${RED}✗ Invalid choice. Run the script again and enter 1–4.${RESET}"
    exit 1
    ;;
esac

# ── Supabase ──────────────────────────────────────────────────
# Content site: auto-enabled (Strapi needs it)
# Web app, Marketing site, Internal tool: asked
# UI component library, 3D, Prototype: skipped
if [ "$USE_STRAPI" = true ]; then
  USE_SUPABASE=true
elif [[ "$PROJECT_TYPE_LABEL" == "Web app" || "$PROJECT_TYPE_LABEL" == "Marketing site" || "$PROJECT_TYPE_LABEL" == "Internal tool" ]]; then
  echo ""
  read -p "$(echo -e ${BOLD})Will this project need Supabase (auth / database)? (y/n): $(echo -e ${RESET})" USE_SUPABASE_INPUT
  if [[ "$USE_SUPABASE_INPUT" == "y" || "$USE_SUPABASE_INPUT" == "Y" ]]; then
    USE_SUPABASE=true
  else
    USE_SUPABASE=false
  fi
else
  USE_SUPABASE=false
fi

# ── Dark mode ─────────────────────────────────────────────────
echo ""
read -p "$(echo -e ${BOLD})Include dark mode? (next-themes ThemeProvider) [Y/n]: $(echo -e ${RESET})" USE_DARK_MODE_INPUT
if [[ "$USE_DARK_MODE_INPUT" == "n" || "$USE_DARK_MODE_INPUT" == "N" ]]; then
  USE_DARK_MODE=false
else
  USE_DARK_MODE=true
fi

# ── Sidebar ───────────────────────────────────────────────────
USE_SIDEBAR=false
if [[ "$PROJECT_TYPE_LABEL" != "Prototype" ]]; then
  echo ""
  if [[ "$PROJECT_TYPE_LABEL" == "Internal tool" ]]; then
    echo -e "${YELLOW}  Tip: sidebar is recommended for internal tools.${RESET}"
  fi
  read -p "$(echo -e ${BOLD})Will this project use a sidebar layout? (shadcn/sidebar) (y/n): $(echo -e ${RESET})" USE_SIDEBAR_INPUT
  if [[ "$USE_SIDEBAR_INPUT" == "y" || "$USE_SIDEBAR_INPUT" == "Y" ]]; then
    USE_SIDEBAR=true
  fi
fi

# ── Data visualisation ────────────────────────────────────────
USE_CHARTS=false
USE_VISX=false
if [[ "$PROJECT_TYPE_LABEL" != "3D / Interactive experience" && "$PROJECT_TYPE_LABEL" != "Prototype" ]]; then
  echo ""
  echo -e "${BOLD}Will this project need data visualisation?${RESET}"
  echo -e "  ${CYAN}1)${RESET} Standard charts  — Recharts via shadcn/chart (bar, line, area, pie)"
  echo -e "  ${CYAN}2)${RESET} Custom / complex — Visx (D3 primitives as React components)"
  echo -e "  ${CYAN}n)${RESET} None"
  echo ""
  read -p "$(echo -e ${BOLD})Choose (1/2/n): $(echo -e ${RESET})" DATAVIZ_CHOICE
  case $DATAVIZ_CHOICE in
    1) USE_CHARTS=true ;;
    2) USE_VISX=true ;;
    *) ;;
  esac
fi

# ── Shiki ─────────────────────────────────────────────────────
USE_SHIKI=false
if [[ "$PROJECT_TYPE_LABEL" != "3D / Interactive experience" && "$PROJECT_TYPE_LABEL" != "Prototype" ]]; then
  echo ""
  read -p "$(echo -e ${BOLD})Will this project display code on the frontend? (Shiki syntax highlighting) (y/n): $(echo -e ${RESET})" USE_SHIKI_INPUT
  if [[ "$USE_SHIKI_INPUT" == "y" || "$USE_SHIKI_INPUT" == "Y" ]]; then
    USE_SHIKI=true
  fi
fi

# ── Three.js / WebGL ──────────────────────────────────────────
# Auto-enabled for 3D type; asked for others except Prototype
if [[ "$PROJECT_TYPE_LABEL" == "3D / Interactive experience" ]]; then
  USE_THREEJS=true
elif [[ "$PROJECT_TYPE_LABEL" != "Prototype" ]]; then
  echo ""
  read -p "$(echo -e ${BOLD})Will this project include any 3D or WebGL elements? (React Three Fiber + Drei) (y/n): $(echo -e ${RESET})" USE_THREEJS_INPUT
  if [[ "$USE_THREEJS_INPUT" == "y" || "$USE_THREEJS_INPUT" == "Y" ]]; then
    USE_THREEJS=true
  else
    USE_THREEJS=false
  fi
fi

# ── Cloudinary ────────────────────────────────────────────────
USE_CLOUDINARY=false
if [[ "$PROJECT_TYPE_LABEL" != "UI component library" && "$PROJECT_TYPE_LABEL" != "Prototype" ]]; then
  echo ""
  read -p "$(echo -e ${BOLD})Will this project need managed media or image uploads? (Cloudinary) (y/n): $(echo -e ${RESET})" USE_CLOUDINARY_INPUT
  if [[ "$USE_CLOUDINARY_INPUT" == "y" || "$USE_CLOUDINARY_INPUT" == "Y" ]]; then
    USE_CLOUDINARY=true
  fi
fi

# ── Cloudflare + ISR webhooks ─────────────────────────────────
USE_CLOUDFLARE=false
if [[ "$PROJECT_TYPE_LABEL" == "Content site" ]]; then
  echo ""
  read -p "$(echo -e ${BOLD})Will this project use Cloudflare + ISR webhook revalidation? (y/n): $(echo -e ${RESET})" USE_CLOUDFLARE_INPUT
  if [[ "$USE_CLOUDFLARE_INPUT" == "y" || "$USE_CLOUDFLARE_INPUT" == "Y" ]]; then
    USE_CLOUDFLARE=true
  fi
fi

# ── Storybook ─────────────────────────────────────────────────
USE_STORYBOOK=false
USE_STORYBOOK_MCP=false
if [[ "$PROJECT_TYPE_LABEL" != "Prototype" ]]; then
  echo ""
  if [[ "$PROJECT_TYPE_LABEL" == "UI component library" ]]; then
    echo -e "${YELLOW}  Tip: Storybook is recommended for component libraries.${RESET}"
  fi
  read -p "$(echo -e ${BOLD})Will this project need Storybook? (y/n): $(echo -e ${RESET})" USE_STORYBOOK_INPUT
  if [[ "$USE_STORYBOOK_INPUT" == "y" || "$USE_STORYBOOK_INPUT" == "Y" ]]; then
    USE_STORYBOOK=true
    echo ""
    echo -e "  The Storybook MCP server lets AI agents read your components,"
    echo -e "  stories, and run tests — but requires the ${BOLD}Vite builder${RESET}."
    echo -e "  Next.js defaults to Webpack, so this is an explicit opt-in."
    echo ""
    read -p "$(echo -e ${BOLD})Include Storybook MCP server? (Vite builder) (y/n): $(echo -e ${RESET})" USE_STORYBOOK_MCP_INPUT
    if [[ "$USE_STORYBOOK_MCP_INPUT" == "y" || "$USE_STORYBOOK_MCP_INPUT" == "Y" ]]; then
      USE_STORYBOOK_MCP=true
    fi
  fi
fi

# ── Animation system ──────────────────────────────────────────
ANIMATION_SYSTEM_LABEL="None"
if [[ "$PROJECT_TYPE_LABEL" != "Prototype" ]]; then
  echo ""
  echo -e "${BOLD}What animation system will this project use?${RESET}"
  echo -e "  ${CYAN}1)${RESET} CSS / Tailwind only   — transitions, keyframes, no JS library"
  echo -e "  ${CYAN}2)${RESET} Framer Motion          — React component animations, gestures, layout"
  echo -e "  ${CYAN}3)${RESET} GSAP                   — complex timelines, ScrollTrigger, SVG"
  echo -e "  ${CYAN}n)${RESET} Decide later           — note it in CONTEXT.md when chosen"
  echo ""
  read -p "$(echo -e ${BOLD})Choose (1/2/3/n): $(echo -e ${RESET})" ANIMATION_CHOICE
  case $ANIMATION_CHOICE in
    1) ANIMATION_SYSTEM_LABEL="CSS / Tailwind" ;;
    2) ANIMATION_SYSTEM_LABEL="Framer Motion" ;;
    3) ANIMATION_SYSTEM_LABEL="GSAP" ;;
    *) ANIMATION_SYSTEM_LABEL="Undecided — update CONTEXT.md when chosen" ;;
  esac
fi

# ── Build stack summary + block dynamically ───────────────────
STACK_BLOCK="| Framework | Next.js (App Router) |
| Styling | Tailwind CSS |
| Components | $COMPONENT_SYSTEM_LABEL |
| Icons | Lucide React |"

STACK_SUMMARY="Next.js · $COMPONENT_SYSTEM_LABEL · Tailwind CSS"

if [ "$USE_SUPABASE" = true ] && [ "$USE_STRAPI" = false ]; then
  STACK_BLOCK="$STACK_BLOCK
| Database | Supabase |"
  STACK_SUMMARY="$STACK_SUMMARY · Supabase"
fi

if [ "$USE_STRAPI" = true ]; then
  STACK_BLOCK="$STACK_BLOCK
| CMS | Strapi (subfolder → deployed to Render) |
| Database | Supabase (used by Strapi) |"
  STACK_SUMMARY="$STACK_SUMMARY · Strapi · Render"
fi

if [ "$USE_THREEJS" = true ]; then
  STACK_BLOCK="$STACK_BLOCK
| 3D / WebGL | React Three Fiber + Drei |"
  STACK_SUMMARY="$STACK_SUMMARY · R3F"
fi

if [ "$USE_NETLIFY" = true ]; then
  STACK_BLOCK="$STACK_BLOCK
| Deployment | Netlify |"
  STACK_SUMMARY="$STACK_SUMMARY · Netlify"
fi

# ── Visibility ────────────────────────────────────────────────
echo ""
echo -e "${BOLD}Repo visibility:${RESET}"
select VISIBILITY in "private" "public"; do
  case $VISIBILITY in
    private|public) break;;
  esac
done

# ── Confirm ───────────────────────────────────────────────────
echo ""
echo -e "${BOLD}Summary:${RESET}"
echo -e "  Name:             ${GREEN}$PROJECT_NAME${RESET}"
echo -e "  Type:             ${CYAN}$PROJECT_TYPE_LABEL${RESET}"
echo -e "  Components:       $COMPONENT_SYSTEM_LABEL"
echo -e "  Stack:            $STACK_SUMMARY"
if [ "$USE_SUPABASE" = true ] && [ "$USE_STRAPI" = false ]; then
  echo -e "  Supabase:         auth + database scaffolding included"
fi
if [ "$USE_DARK_MODE" = true ]; then
  echo -e "  Dark mode:        next-themes ThemeProvider"
else
  echo -e "  Dark mode:        ${YELLOW}skipped${RESET}"
fi
if [ "$USE_SIDEBAR" = true ]; then
  echo -e "  Sidebar:          shadcn Sidebar + CSS variables"
fi
if [ "$USE_CHARTS" = true ]; then
  echo -e "  Data viz:         Recharts + shadcn Chart"
fi
if [ "$USE_VISX" = true ]; then
  echo -e "  Data viz:         Visx (D3 primitives)"
fi
if [ "$USE_SHIKI" = true ]; then
  echo -e "  Shiki:            syntax highlighting"
fi
if [ "$USE_THREEJS" = true ] && [ "$PROJECT_TYPE_LABEL" != "3D / Interactive experience" ]; then
  echo -e "  Three.js:         React Three Fiber + Drei"
fi
if [ "$USE_CLOUDINARY" = true ]; then
  echo -e "  Cloudinary:       media + image management"
fi
if [ "$USE_CLOUDFLARE" = true ]; then
  echo -e "  Cloudflare:       ISR webhook revalidation"
fi
if [ "$USE_STORYBOOK" = true ]; then
  if [ "$USE_STORYBOOK_MCP" = true ]; then
    echo -e "  Storybook:        component docs + MCP server (Vite builder)"
  else
    echo -e "  Storybook:        component docs (Webpack)"
  fi
fi
echo -e "  Animation:        $ANIMATION_SYSTEM_LABEL"
echo -e "  Visibility:       $VISIBILITY"
echo -e "  Location:         ${BLUE}$ACTIVE_DIR/$PROJECT_NAME${RESET}"
echo ""
read -p "Continue? (y/n): " CONFIRM

if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
  echo "Aborted."
  exit 0
fi

# ── Create and clone repo ─────────────────────────────────────
cd "$ACTIVE_DIR"

echo ""
echo -e "${BLUE}Creating GitHub repo from template...${RESET}"

if [ "$VISIBILITY" = "private" ]; then
  gh repo create "$PROJECT_NAME" \
    --template "$TEMPLATE_REPO" \
    --private \
    --clone
else
  gh repo create "$PROJECT_NAME" \
    --template "$TEMPLATE_REPO" \
    --public \
    --clone
fi

echo -e "${GREEN}✓ Repo created and cloned${RESET}"
cd "$PROJECT_NAME"

# ── Run sub-scripts ───────────────────────────────────────────
# shellcheck source=.scripts/scaffold.sh
source "$SCRIPTS_DIR/scaffold.sh"

# shellcheck source=.scripts/install.sh
source "$SCRIPTS_DIR/install.sh"

# shellcheck source=.scripts/output.sh
source "$SCRIPTS_DIR/output.sh"

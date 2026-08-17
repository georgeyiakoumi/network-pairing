#!/bin/bash

# ─────────────────────────────────────────────────────────────
# sync-template.sh
# Pulls the latest shared files from george's gy-basecamp
# into the current project directory.
#
# Safe to run at any time — only overwrites known template files.
# Never touches CLAUDE.md, README.md, .env.local, or any code.
#
# Usage (from inside any project created from the template):
#   bash ~/Scripts/sync-template.sh
#   # or if aliased:
#   sync-template
#
# Store this script at ~/Scripts/sync-template.sh
# ─────────────────────────────────────────────────────────────

set -e

TEMPLATE_REPO="georgeyiakoumi/gy-basecamp"
BRANCH="main"
RAW_BASE="https://raw.githubusercontent.com/$TEMPLATE_REPO/$BRANCH"

# ── Colours ───────────────────────────────────────────────────
BOLD='\033[1m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
RESET='\033[0m'

# ── Verify we're inside a project ─────────────────────────────
if [ ! -f "CLAUDE.md" ] && [ ! -f "package.json" ]; then
  echo -e "${RED}✗ Run this from inside a project directory (must contain CLAUDE.md or package.json).${RESET}"
  exit 1
fi

PROJECT_NAME=$(basename "$(pwd)")

echo ""
echo -e "${BOLD}╔══════════════════════════════════╗${RESET}"
echo -e "${BOLD}║    Sync from gy-basecamp         ║${RESET}"
echo -e "${BOLD}╚══════════════════════════════════╝${RESET}"
echo ""
echo -e "Project:  ${CYAN}$PROJECT_NAME${RESET}"
echo -e "Template: ${CYAN}https://github.com/$TEMPLATE_REPO${RESET}"
echo ""

# ── Check prerequisites ───────────────────────────────────────
if ! command -v curl &>/dev/null; then
  echo -e "${RED}✗ curl is required. Install it and try again.${RESET}"
  exit 1
fi

# ── Files to sync ─────────────────────────────────────────────
# Format: "remote_path:local_path"
# remote_path is relative to the template repo root.
# local_path is relative to the current project root.
# Add entries here as new shared files are added to the template.

SYNC_FILES=(
  ".claude/rules/code.md:.claude/rules/code.md"
  ".claude/rules/design.md:.claude/rules/design.md"
  ".claude/rules/process.md:.claude/rules/process.md"
  ".claude/project-setup.md:.claude/project-setup.md"
  ".claude/release.md:.claude/release.md"
  ".claude/ui-standards.md:.claude/ui-standards.md"
  ".claude/ux-process.md:.claude/ux-process.md"
  ".claude/design-psychology.md:.claude/design-psychology.md"
  ".claude/setup-acceptance-checklist.md:.claude/setup-acceptance-checklist.md"
  ".github/pull_request_template.md:.github/pull_request_template.md"
  "CHANGELOG.md:CHANGELOG.md"
  "e2e/smoke.spec.ts:e2e/smoke.spec.ts"
  "playwright.config.ts:playwright.config.ts"
)

# ── Files that are NEVER synced (project-specific) ───────────
# CLAUDE.md         — has project identity header injected by create-project.sh
# README.md         — rewritten per project by create-project.sh
# .env.local        — secrets, never overwrite
# package.json      — project dependencies may differ
# app/              — project code
# components/       — project components
# lib/              — project utilities

# ── Dry run flag ──────────────────────────────────────────────
DRY_RUN=false
for arg in "$@"; do
  case $arg in
    --dry-run) DRY_RUN=true ;;
  esac
done

if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}Dry run — no files will be written.${RESET}"
  echo ""
fi

# ── Fetch latest version from GitHub ──────────────────────────
echo -e "${BLUE}Fetching latest template files...${RESET}"
echo ""

UPDATED=0
SKIPPED=0
FAILED=0

for entry in "${SYNC_FILES[@]}"; do
  REMOTE="${entry%%:*}"
  LOCAL="${entry##*:}"
  URL="$RAW_BASE/$REMOTE"

  # Fetch content
  HTTP_STATUS=$(curl -s -o /tmp/sync_tmp_file -w "%{http_code}" "$URL")

  if [ "$HTTP_STATUS" != "200" ]; then
    echo -e "  ${RED}✗${RESET} $LOCAL ${RED}(fetch failed: $HTTP_STATUS)${RESET}"
    ((FAILED++))
    continue
  fi

  # Compare with existing file
  if [ -f "$LOCAL" ] && diff -q "$LOCAL" /tmp/sync_tmp_file &>/dev/null; then
    echo -e "  ${CYAN}–${RESET} $LOCAL (already up to date)"
    ((SKIPPED++))
    continue
  fi

  if [ "$DRY_RUN" = true ]; then
    if [ -f "$LOCAL" ]; then
      echo -e "  ${YELLOW}~${RESET} $LOCAL (would update)"
    else
      echo -e "  ${YELLOW}+${RESET} $LOCAL (would create)"
    fi
    ((UPDATED++))
    continue
  fi

  # Create parent directory if needed
  mkdir -p "$(dirname "$LOCAL")"

  # Write file
  cp /tmp/sync_tmp_file "$LOCAL"

  if [ -f "$LOCAL" ]; then
    echo -e "  ${GREEN}✓${RESET} $LOCAL"
  else
    echo -e "  ${GREEN}+${RESET} $LOCAL (new)"
  fi
  ((UPDATED++))
done

rm -f /tmp/sync_tmp_file

# ── Summary ───────────────────────────────────────────────────
echo ""
echo -e "${BOLD}Results:${RESET}"
echo -e "  ${GREEN}Updated:${RESET}       $UPDATED"
echo -e "  ${CYAN}Already current:${RESET} $SKIPPED"
if [ "$FAILED" -gt 0 ]; then
  echo -e "  ${RED}Failed:${RESET}        $FAILED"
fi

echo ""

if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}Dry run complete. Run without --dry-run to apply changes.${RESET}"
elif [ "$UPDATED" -gt 0 ]; then
  echo -e "${GREEN}${BOLD}Sync complete.${RESET}"
  echo ""
  echo -e "${YELLOW}Note: CLAUDE.md, README.md, package.json, and all project code were not touched.${RESET}"
  echo -e "Review the updated files before committing — rules may have changed in ways that affect your project."
else
  echo -e "${GREEN}${BOLD}Already up to date.${RESET}"
fi

echo ""

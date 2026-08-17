#!/bin/bash

# ─────────────────────────────────────────────────────────────
# swap-icons.sh
# Replaces Lucide icon imports in shadcn components with the
# project's chosen icon library (Phosphor, Heroicons, or Tabler).
#
# Run this after: npx shadcn add <component>
# Usage: bash scripts/swap-icons.sh
# ─────────────────────────────────────────────────────────────

set -e

BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
RESET='\033[0m'

COMPONENTS_DIR="components/ui"

# ── Detect icon library from package.json ─────────────────────
if grep -q '"@phosphor-icons/react"' package.json; then
  LIBRARY="phosphor"
  LIBRARY_LABEL="Phosphor Icons"
  IMPORT_FROM="@phosphor-icons/react"
elif grep -q '"@heroicons/react"' package.json; then
  LIBRARY="heroicons"
  LIBRARY_LABEL="Heroicons"
  IMPORT_FROM="@heroicons/react/24/outline"
elif grep -q '"@tabler/icons-react"' package.json; then
  LIBRARY="tabler"
  LIBRARY_LABEL="Tabler Icons"
  IMPORT_FROM="@tabler/icons-react"
elif grep -q '"lucide-react"' package.json; then
  echo -e "${GREEN}✓ Project uses Lucide React — no swaps needed.${RESET}"
  exit 0
else
  echo -e "${RED}✗ No recognised icon library found in package.json.${RESET}"
  echo -e "  Supported: @phosphor-icons/react, @heroicons/react, @tabler/icons-react"
  exit 1
fi

echo -e "${BOLD}Swapping Lucide → $LIBRARY_LABEL in $COMPONENTS_DIR/${RESET}"
echo ""

# ── Check for files to process ────────────────────────────────
LUCIDE_FILES=$(grep -rl "lucide-react" "$COMPONENTS_DIR" 2>/dev/null || true)

if [ -z "$LUCIDE_FILES" ]; then
  echo -e "${GREEN}✓ No Lucide imports found — nothing to swap.${RESET}"
  exit 0
fi

# ── Icon name mappings ────────────────────────────────────────
# Each mapping: "LucideName:PhosphorName:HeroiconsName:TablerName"
#
# Covers all 19 unique Lucide icons used across shadcn/ui components.
# Lucide exports both "Check" and "CheckIcon" — we handle both forms.
#
# Heroicons: imported from @heroicons/react/24/outline as named exports
# with an "Icon" suffix (e.g. ArrowLeftIcon). The swap replaces the bare
# Lucide name with the Heroicons name; the Icon suffix is handled by the
# existing "LucideNameIcon → TargetName" replacement pass.

MAPPINGS=(
  "ArrowLeft:ArrowLeft:ArrowLeft:IconArrowLeft"
  "ArrowRight:ArrowRight:ArrowRight:IconArrowRight"
  "Check:Check:Check:IconCheck"
  "ChevronDown:CaretDown:ChevronDown:IconChevronDown"
  "ChevronLeft:CaretLeft:ChevronLeft:IconChevronLeft"
  "ChevronRight:CaretRight:ChevronRight:IconChevronRight"
  "ChevronUp:CaretUp:ChevronUp:IconChevronUp"
  "Circle:Circle:EllipsisHorizontalCircle:IconCircle"
  "CircleCheck:CheckCircle:CheckCircle:IconCircleCheck"
  "GripVertical:DotsSixVertical:Bars2:IconGripVertical"
  "Info:Info:InformationCircle:IconInfoCircle"
  "Loader2:SpinnerGap:ArrowPath:IconLoader2"
  "Minus:Minus:Minus:IconMinus"
  "MoreHorizontal:DotsThree:EllipsisHorizontal:IconDots"
  "OctagonX:XCircle:XCircle:IconXboxX"
  "PanelLeft:Sidebar:Bars3BottomLeft:IconLayoutSidebar"
  "Search:MagnifyingGlass:MagnifyingGlass:IconSearch"
  "TriangleAlert:Warning:ExclamationTriangle:IconAlertTriangle"
  "X:X:XMark:IconX"
)

# ── Build sed commands based on library ───────────────────────
SED_ARGS=()

for mapping in "${MAPPINGS[@]}"; do
  IFS=":" read -r LUCIDE PHOSPHOR HEROICONS TABLER <<< "$mapping"

  if [ "$LIBRARY" = "phosphor" ]; then
    TARGET="$PHOSPHOR"
  elif [ "$LIBRARY" = "heroicons" ]; then
    TARGET="$HEROICONS"
  else
    TARGET="$TABLER"
  fi

  # Skip if source and target are the same
  if [ "$LUCIDE" = "$TARGET" ]; then
    continue
  fi

  # Replace "LucideNameIcon" form (e.g. ChevronDownIcon → CaretDownIcon)
  SED_ARGS+=("-e" "s/${LUCIDE}Icon/${TARGET}Icon/g")
  # Replace bare "LucideName" form when used as JSX component
  # Use word boundary to avoid partial matches
  SED_ARGS+=("-e" "s/\b${LUCIDE}\b/${TARGET}/g")
done

# ── Replace import source ─────────────────────────────────────
SED_ARGS+=("-e" "s|\"lucide-react\"|\"${IMPORT_FROM}\"|g")

# ── Run replacements ──────────────────────────────────────────
COUNT=0
for file in $LUCIDE_FILES; do
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "${SED_ARGS[@]}" "$file"
  else
    sed -i "${SED_ARGS[@]}" "$file"
  fi
  echo -e "  ${GREEN}✓${RESET} $file"
  COUNT=$((COUNT + 1))
done

echo ""
echo -e "${GREEN}✓ Swapped icons in $COUNT file(s) → $LIBRARY_LABEL${RESET}"

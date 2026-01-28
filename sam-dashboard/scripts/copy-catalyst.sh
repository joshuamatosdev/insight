#!/bin/bash
# Script to copy Catalyst UI components and adapt for Vite/TanStack Router

CATALYST_SRC="C:/Projects/tailwind-ui/catalyst-ui-kit/catalyst-ui-kit/demo/typescript/src"
DEST="C:/Projects/SAMGov/sam-dashboard/src"

echo "=== Copying Catalyst UI Components ==="

# Create catalyst directory for UI primitives
mkdir -p "$DEST/components/catalyst"

# Components to copy (core UI primitives)
COMPONENTS=(
  "alert.tsx"
  "avatar.tsx"
  "badge.tsx"
  "button.tsx"
  "checkbox.tsx"
  "description-list.tsx"
  "dialog.tsx"
  "divider.tsx"
  "dropdown.tsx"
  "fieldset.tsx"
  "heading.tsx"
  "input.tsx"
  "link.tsx"
  "listbox.tsx"
  "pagination.tsx"
  "radio.tsx"
  "select.tsx"
  "switch.tsx"
  "table.tsx"
  "text.tsx"
  "textarea.tsx"
)

for comp in "${COMPONENTS[@]}"; do
  if [ -f "$CATALYST_SRC/components/$comp" ]; then
    echo "Copying $comp..."
    cp "$CATALYST_SRC/components/$comp" "$DEST/components/catalyst/$comp"
  fi
done

echo ""
echo "=== Adapting for TanStack Router ==="

# Replace next/link with TanStack Router Link
find "$DEST/components/catalyst" -name "*.tsx" -exec sed -i \
  -e "s|from 'next/link'|from '@tanstack/react-router'|g" \
  -e "s|import Link from 'next/link'|import { Link } from '@tanstack/react-router'|g" \
  -e "s|import NextLink from 'next/link'|import { Link } from '@tanstack/react-router'|g" \
  {} \;

echo ""
echo "=== Creating barrel export ==="

# Create index.ts
cat > "$DEST/components/catalyst/index.ts" << 'EOF'
// Catalyst UI Components
// Adapted from Tailwind UI Catalyst Kit

export * from './alert';
export * from './avatar';
export * from './badge';
export * from './button';
export * from './checkbox';
export * from './description-list';
export * from './dialog';
export * from './divider';
export * from './dropdown';
export * from './fieldset';
export * from './heading';
export * from './input';
export * from './link';
export * from './listbox';
export * from './pagination';
export * from './radio';
export * from './select';
export * from './switch';
export * from './table';
export * from './text';
export * from './textarea';
EOF

echo ""
echo "=== Copying Catalyst styles ==="

# Copy Catalyst's minimal CSS approach
cp "$CATALYST_SRC/styles/tailwind.css" "$DEST/styles/catalyst-tailwind.css"

echo ""
echo "=== Done! ==="
echo ""
echo "Next steps:"
echo "1. Review copied components in src/components/catalyst/"
echo "2. Update imports in your app to use Catalyst components"
echo "3. Consider replacing tailwind.css with catalyst-tailwind.css"

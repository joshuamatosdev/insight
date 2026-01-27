# Project Setup Summary - SAMGov Contract Intelligence Platform

## Overview

This document summarizes the complete setup of strict linting, accessibility, component-driven architecture, and TDD workflow for the SAMGov project.

---

## Files Created/Updated

### Project Documentation

| File | Description |
|------|-------------|
| `docs/TODO.md` | Unified TODO - 300+ features, roadmap, immediate tasks |
| `CLAUDE.md` | Project instructions with TDD workflow |
| `docs/SETUP_SUMMARY.md` | This file |

### Frontend Configuration (sam-dashboard/)

| File | Description |
|------|-------------|
| `package.json` | Added testing, linting, a11y dependencies |
| `eslint-plugin-strict-architecture.js` | Custom ESLint plugin with 4 rules |
| `.ls-lint.yml` | File naming conventions |
| `tsconfig.app.json` | Hyper-strict TypeScript settings |
| `vite.config.ts` | Path aliases (@/, @components/, etc.) |
| `vitest.config.ts` | Test configuration with coverage |
| `src/test/setup.ts` | Test setup file |

### Memory System (Serena)

| Memory | Content |
|--------|---------|
| `tdd-workflow-rules.md` | TDD cycle, component architecture, testing rules |

---

## Key Rules Established

### 1. TDD Mandatory (Red-Green-Refactor)

```
CYCLE: 🔴 RED → 🟢 GREEN → 🔵 REFACTOR

Feature is complete ONLY when:
- ✅ ALL existing tests pass (not just feature tests)
- ✅ New feature tests pass
- ✅ Type checking passes
- ✅ Linting passes
- ✅ No regressions anywhere
```

### 2. No Naked HTML

Raw HTML elements are FORBIDDEN outside component definitions:
- `<div>`, `<span>`, `<main>`, `<section>`, `<article>`, `<aside>`
- `<header>`, `<footer>`, `<nav>`
- `<ul>`, `<ol>`, `<li>`

**Allowed ONLY in:**
- `src/components/primitives/`
- `src/components/layout/`
- `src/components/ui/`

```tsx
// ❌ FORBIDDEN
<div className="flex gap-4">

// ✅ REQUIRED
<Flex gap="md">
```

### 3. Tailwind Only in Components

CSS classes should only exist inside component definitions, never in pages or features.

### 4. Strict TypeScript

| Pattern | Status | Fix |
|---------|--------|-----|
| `if (x)` | ❌ | `if (x !== undefined && x !== null)` |
| `any` | ❌ | Specific type |
| `data!` | ❌ | Null check |
| `arr[0].x` | ❌ | `arr.at(0)?.x` |

### 5. File Organization

- Types/Interfaces: Own file in `/types/` or `.types.ts`
- Functions > 3 lines: Own file
- Exports: Barrel `index.ts` only
- Folders > 5 files: Reorganize into subdirectories

### 6. Accessibility (WCAG 2.1 AA)

- All images: alt text
- All interactive elements: keyboard accessible
- All form inputs: associated labels
- Color contrast: 4.5:1 minimum

---

## ESLint Plugin Rules

The custom `eslint-plugin-strict-architecture` provides:

1. **one-interface-per-file** - Only one interface/enum per file
2. **no-naked-html** - No raw HTML elements outside components
3. **max-function-body-statements** - Limit statements per function
4. **require-barrel-import** - No deep imports

---

## NPM Scripts Added

```bash
npm run dev          # Start dev server
npm run dev:fresh    # Clear cache and start
npm run lint         # Run ESLint
npm run lint:fix     # Fix lint issues
npm run lint:naming  # Check file naming (ls-lint)
npm run typecheck    # TypeScript check
npm run validate     # All checks combined
npm run validate:fix # All checks with auto-fix
npm run test         # Run tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
```

---

## Dependencies Added

### Testing
- `vitest` - Test runner
- `@testing-library/react` - React testing utilities
- `@testing-library/user-event` - User event simulation
- `@testing-library/jest-dom` - DOM matchers
- `jsdom` - DOM environment

### Linting
- `@ls-lint/ls-lint` - File naming
- `eslint-plugin-jsx-a11y` - Accessibility
- `eslint-plugin-import` - Import ordering
- `eslint-plugin-simple-import-sort` - Import sorting
- `eslint-plugin-sonarjs` - Code quality

### Accessibility
- `@axe-core/react` - Runtime a11y checking

---

## TypeScript Strictness

Added to `tsconfig.app.json`:
- `exactOptionalPropertyTypes: true`
- `noUncheckedIndexedAccess: true`
- `noImplicitOverride: true`
- `noPropertyAccessFromIndexSignature: true`
- `useUnknownInCatchVariables: true`

---

## Next Steps

1. **Install Dependencies**
   ```bash
   cd sam-dashboard && npm install
   ```

2. **Run Validation**
   ```bash
   npm run validate
   ```

3. **Refactor Existing Code**
   - Replace raw HTML with components
   - Move types to `.types.ts` files
   - Add barrel exports

4. **Add Tests**
   - Write tests for all existing code
   - Aim for 80%+ coverage

5. **Use TDD for New Features**
   - Write test first
   - Implement to pass
   - Refactor

---

## Architecture Overview

```
sam-dashboard/src/
├── components/
│   ├── domain/          # Business components (use primitives/layout)
│   │   ├── opportunity/
│   │   ├── filters/
│   │   └── stats/
│   ├── layout/          # Layout wrappers (CAN use raw HTML)
│   │   ├── AppLayout/
│   │   ├── Card/
│   │   ├── Flex/
│   │   └── Grid/
│   └── primitives/      # Base primitives (CAN use raw HTML)
│       ├── Badge/
│       ├── Button/
│       └── Input/
├── hooks/               # Custom hooks
├── pages/               # Route pages (NO raw HTML)
├── services/            # API calls
├── types/               # Shared types
├── styles/              # CSS files
└── test/                # Test utilities
```

---

## Verification Commands

```bash
# Full validation
npm run validate

# Individual checks
npx tsc --noEmit        # TypeScript
npm run lint            # ESLint + architecture
npm run lint:naming     # File naming
npm test                # All tests
```

**All must pass before any work is considered complete.**

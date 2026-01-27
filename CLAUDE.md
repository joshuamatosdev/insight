# CLAUDE.md - SAMGov Contract Intelligence Platform

This file provides guidance to Claude Code when working with code in this repository.

---

## PROJECT OVERVIEW

Government & Commercial Contract Intelligence Platform
- **Backend**: Java Spring Boot (existing)
- **Frontend**: React + TypeScript + Vite (sam-dashboard)
- **Database**: PostgreSQL
- **Target**: Multi-Tenant SaaS for federal, state/local, and B2B contracting

---

## CRITICAL: TDD (TEST-DRIVEN DEVELOPMENT) MANDATORY

### The TDD Workflow (Red-Green-Refactor)

```
CYCLE: 🔴 RED → 🟢 GREEN → 🔵 REFACTOR

RULES:
  ✗ NO implementation before tests
  ✗ NO breaking existing tests
  ✗ NO losing features during refactor
  ✓ Write test FIRST
  ✓ Investigate test breaks
  ✓ Preserve all capabilities

ON TEST FAILURE:
  STOP → READ error → DIFF changes → ROOT CAUSE → FIX → VERIFY
```

### Feature Completion Criteria

**A feature is ONLY marked GREEN (complete) when:**
1. ✅ ALL existing tests in the codebase pass
2. ✅ New feature tests pass
3. ✅ Type checking passes (`npx tsc --noEmit`)
4. ✅ Linting passes (`npm run lint`)
5. ✅ No regressions in any other part of the system

**IMPORTANT:** Feature-based tests are NOT enough. The ENTIRE test suite must pass before marking any feature as complete.

### Verification Loop (MANDATORY)

After ANY code change, run:

```bash
# Frontend (sam-dashboard)
cd sam-dashboard
npx tsc --noEmit     # Type checking
npm run lint         # Linting
npm test             # ALL tests must pass

# Backend (Java)
./gradlew build      # Includes tests
```

**ALL checks must pass before considering work complete.**

---

## STRICT TYPESCRIPT PATTERNS

### The "No-Any" Policy

- **Absolute Ban:** Never use `any`. Use `unknown` with type guards.
- **Exception:** None in this project.

### Strict Boolean Checks

| Invalid | Valid |
|---------|-------|
| `if (data)` | `if (data !== undefined && data !== null)` |
| `!isLoading` | `isLoading === false` |
| `if (items.length)` | `if (items.length > 0)` |

### No Unchecked Indexing

| Invalid | Valid |
|---------|-------|
| `items[0].id` | `items.at(0)?.id` |
| `users[index]` | `users.at(index)` or guard first |

### Cognitive Complexity Limit (15)

If a function feels long, **stop** and split it into 2+ sub-functions.

---

## FILE ORGANIZATION RULES

| Rule | Requirement |
|------|-------------|
| **Functions > 3 lines** | MUST be in their own file |
| **Interfaces** | MUST be in their own file (e.g., `Opportunity.types.ts`) |
| **Types/Enums** | MUST be in their own file |
| **Exports** | MUST be in barrel `index.ts` files only |
| **Folders > 5 files** | MUST be reorganized into subdirectories |

### Frontend Folder Structure

```
sam-dashboard/src/
├── components/
│   ├── domain/          # Business logic components
│   │   ├── opportunity/
│   │   ├── filters/
│   │   └── stats/
│   ├── layout/          # Layout components
│   └── primitives/      # UI primitives (Button, Input, etc.)
├── hooks/               # Custom hooks
├── pages/               # Route pages
├── services/            # API calls
├── types/               # Shared types
└── styles/              # CSS files
```

---

## COMPONENT ARCHITECTURE (COMPONENT-DRIVEN DEVELOPMENT)

### NO NAKED HTML - Everything is a Component

**NEVER** use raw HTML elements (div, span, main, section, etc.) outside of component definitions.
**NEVER** use Tailwind classes in isolation - they should only exist inside component definitions.

This is enforced by ESLint rule `strict-architecture/no-naked-html`.

```tsx
// ❌ FORBIDDEN - Naked HTML elements
<div className="flex items-center gap-4">
<main className="p-8">
<section className="bg-gray-100">
<span className="text-sm">

// ✅ REQUIRED - Use component wrappers
<Flex align="center" gap="md">
<AppLayout>
<Section variant="default">
<Text size="sm">
```

### Where Raw HTML IS Allowed

Raw HTML elements and Tailwind classes are **ONLY** allowed inside:
- `src/components/primitives/` - Base UI primitives
- `src/components/layout/` - Layout components
- `src/components/ui/` - UI library components

These directories define the component library. Everything else uses these components.

### Available UI Components

| Category | Components |
|----------|------------|
| **Layout** | `AppLayout`, `Card`, `Grid`, `Flex`, `Stack`, `Section`, `Sidebar`, `Table` |
| **Typography** | `Text`, `Badge` |
| **Form** | `Input`, `Select`, `Button` |
| **Data** | `Table`, `OpportunityCard`, `OpportunityList`, `StatCard` |
| **Domain** | `FilterBar`, `NAICSBadge`, `TypeBadge` |

### Component Creation Rules

When creating new components:
1. Components go in appropriate `src/components/` subdirectory
2. Each component gets its own folder with:
   - `ComponentName.tsx` - Main component
   - `ComponentName.types.ts` - Types/interfaces
   - `index.ts` - Barrel export
3. Raw HTML/Tailwind is allowed ONLY inside the component definition
4. Export from barrel file, never import component file directly

---

## ACCESSIBILITY RULES (WCAG 2.1 AA)

All components must meet accessibility standards:

- [ ] All images have `alt` text
- [ ] All interactive elements are keyboard accessible
- [ ] All form inputs have associated labels
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Focus indicators are visible
- [ ] ARIA attributes are used correctly

### Required Patterns

```tsx
// ✅ Buttons must be accessible
<button aria-label="Close dialog">
  <Icon name="x" />
</button>

// ✅ Form inputs must have labels
<label htmlFor="search">Search</label>
<input id="search" type="text" />

// ✅ Interactive divs need roles
<div role="button" tabIndex={0} onKeyDown={handleKeyDown}>
```

---

## QUICK REFERENCE CARD

| Pattern | Status | Fix |
|---------|--------|-----|
| `if (x)` | ❌ | `if (x !== undefined && x !== null)` |
| `if (!x)` | ❌ | `if (x === undefined \|\| x === null)` |
| `if (arr.length)` | ❌ | `if (arr.length > 0)` |
| `x && y` | ❌ | `x !== undefined ? y : undefined` |
| `x \|\| y` | ❌ | `x ?? y` |
| `any` | ❌ | Specific type |
| `data!` | ❌ | `if (data !== null) { data }` |
| `arr[0].x` | ❌ | `const a = arr[0]; if (a) { a.x }` |
| Line > 120 | ⚠ | Break lines |
| Complexity > 15 | ⚠ | Extract functions |

---

## COMMANDS

### Frontend (sam-dashboard)

```bash
cd sam-dashboard
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Run linter
npm run lint:fix     # Fix lint issues
npx tsc --noEmit     # Type check
npm test             # Run tests
```

### Backend (Java/Gradle)

```bash
./gradlew bootRun    # Start server
./gradlew build      # Build + tests
./gradlew test       # Run tests only
```

### Architecture Checks

```bash
cd sam-dashboard
npx ls-lint          # File naming check
npm run lint         # ESLint + architecture rules
```

---

## TESTING STRATEGY

### Behavioral Testing ("Refactor Proof")

Before finalizing a test, ask:
> "If I rename helper functions or internal methods, does this test still pass?"

- **YES** → Good test
- **NO** → Rewrite required

### Test Patterns

| DO NOT Test | DO Test |
|-------------|---------|
| `spyOn(instance, '_privateMethod')` | `expect(publicAPI.result).toBe(x)` |
| `expect(div).toHaveClass('bg-red')` | `expect(screen.getByRole('alert'))` |
| Implementation details | Behavior and outcomes |

### Test File Location

```
src/
├── components/
│   └── MyComponent/
│       ├── MyComponent.tsx
│       ├── MyComponent.test.tsx    # Co-located test
│       └── index.ts
└── __tests__/                      # Integration tests
```

---

## PROJECT DOCUMENTATION

- **TODO**: `docs/TODO.md` (unified task list and roadmap)
- **Setup Summary**: `docs/SETUP_SUMMARY.md`
- **README**: `README.md`

---

## MEMORY: KEY DECISIONS & PATTERNS

### Workflow

```
Find → Qualify → Pursue → Propose → Award → Execute → Invoice/Close
```

### Core Entities

- Company Profile (UEI, CAGE, certifications)
- Opportunity (sources, deadlines, Q&A)
- Solicitation/RFP (sections, clauses, requirements)
- Bid/Proposal (versions, artifacts, approvals)
- Contract (CLINs, mods, deliverables)
- Tasks/Deliverables
- Contacts/Organizations
- Finance Objects
- Compliance Artifacts

### Architecture

- Multi-tenant SaaS (row-level security or schema-per-tenant)
- Spring-style layering: View → Service → API
- React Query for server state
- PostgreSQL with full-text search

---

## FILES NOT TO EDIT

- `node_modules/` - Dependencies
- `build/` / `dist/` - Build output
- `.git/` - Version control

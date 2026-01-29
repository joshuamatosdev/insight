# CLAUDE.md - Insight Contract Intelligence Platform

This file provides guidance to Claude Code when working with code in this repository.

**Production URL:** https://insight.doctrineone.us

---

## PROJECT OVERVIEW

Government & Commercial Contract Intelligence Platform
- **Backend**: Java Spring Boot (existing)
- **Frontend**: React + TypeScript + Vite (insight-dashboard)
- **Database**: PostgreSQL
- **Target**: Multi-Tenant SaaS for federal, state/local, and B2B contracting

---

## BUSINESS CONTEXT & DUAL NATURE

### Relationship to DoctrineOneLabs

Insight (insight.doctrineone.us) is the contract intelligence platform for **DoctrineOne Labs**, a defense-focused software consultancy based in Austin, Texas.

**DoctrineOne Mission**: "Startup Speed with Government Rigor"
- **Core Business**: Fixed-price software development for federal, state, and local government
- **Target Market**: Defense contractors, government agencies, regulated organizations
- **Differentiators**: Audit-ready compliance, no subcontracting, source code delivery, lean senior teams

### The Two Faces of Insight

Insight serves **two distinct user groups** with **two distinct purposes**:

#### Face One: Contracting Intelligence (Opportunity Discovery)
**Who Uses It**: DoctrineOne team + future paid subscribers (contractors seeking opportunities)

**Purpose**: Find and qualify government contracting opportunities

**Key Features**:
- Multi-source data ingestion (SAM.gov, SBIR.gov, USAspending.gov)
- Geographic intelligence with interactive map
- Full-text search with Elasticsearch
- Advanced filtering (NAICS, agency, set-aside types, clearances)
- Dashboard analytics (pipeline funnel, agency distribution, deadline timeline)
- Alerts & notifications (new matches, approaching deadlines)
- Pipeline management
- Saved searches and CSV export

**Business Model**:
- Internal use for DoctrineOne's own business development
- Future: Multi-tenant SaaS offering to other contractors

#### Face Two: Contractor Onboarding & Portal (Contract Execution)
**Who Uses It**: DoctrineOne's clients (contractors who have been onboarded)

**Purpose**: Manage active contract execution, deliverables, compliance, and communication

**Entry Methods**:
1. Client submits contact form on DoctrineOneLabs flagship site
2. Self-registration at insight.doctrineone.us
3. Manual onboarding by DoctrineOne team

**Key Features**:
- Multi-step onboarding wizard (company profile, certifications, team setup)
- Contractor dashboard (active contracts, invoices, deadlines, deliverables)
- Sprint tracking with Kanban board
- SBOM tracking (CycloneDX/SPDX compliance)
- Milestone timeline
- Scope tracking (prevent scope creep)
- Client-contractor messaging
- Feature request management
- Progress monitoring

**Critical Planned Feature** (NOT YET IMPLEMENTED):
- **AI-Assisted Contract Intake**: Upload/paste contract → AI analyzes → auto-generates intake forms → pre-fills data

### Target Personas

When designing features, consider which persona is the end user:

| Persona | Role | Face Used | Key Needs |
|---------|------|-----------|-----------|
| **DoctrineOne BD Team** | Business development | Face One | Find opportunities matching capabilities |
| **Defense Contract Procurer** | Federal DoD officer | Face Two (Client) | Track deliverables, compliance, milestones |
| **State Procurement Officer** | State purchasing manager | Face Two (Client) | Monitor progress, scope, invoices |
| **Local Government Manager** | City/county director | Face Two (Client) | Transparency, budget tracking, simple UI |
| **Future Contractor Subscribers** | Other contractors | Face One | Opportunity discovery (paid service) |

### Design Implications

**When Adding Features, Ask:**
1. **Which face does this serve?** (Intelligence or Portal)
2. **Who is the end user?** (DoctrineOne team, client, or both)
3. **What business problem does it solve?** (Find opportunities or manage contracts)
4. **Does it need multi-tenant isolation?** (Portal features = yes, internal tools = no)

**Examples**:
- Adding a new data source (FPDS) → Face One (Intelligence)
- Adding invoice tracking → Face Two (Portal)
- AI contract analysis → Face Two (Onboarding)
- Pipeline funnel visualization → Face One (Intelligence)

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

**Critical:** These rules prevent runtime errors like "Cannot read properties of undefined (reading 'filter')".

### The "No-Any" Policy

- **Absolute Ban:** Never use `any`. Use `unknown` with type guards.
- **Exception:** Test files only (for mocking flexibility).

### The "Unsafe *" Family (CORE TYPE SAFETY)

These five rules are **errors** and catch the most dangerous type violations:

```typescript
@typescript-eslint/no-unsafe-argument: "error"       // No passing `any` to functions
@typescript-eslint/no-unsafe-assignment: "error"     // No assigning `any` to typed vars
@typescript-eslint/no-unsafe-call: "error"           // No calling methods on `any`
@typescript-eslint/no-unsafe-member-access: "error"  // No accessing properties on `any`
@typescript-eslint/no-unsafe-return: "error"         // No returning `any` from typed functions
```

**What This Catches:**
- Implicit `any` types from third-party libraries
- Unsafe type assertions
- Missing type definitions
- Dynamic property access without guards

### Strict Boolean Checks (PREVENTS NULL/UNDEFINED CRASHES)

TypeScript's `strict-boolean-expressions` rule forces explicit null/undefined checks.

| ❌ FORBIDDEN | ✅ REQUIRED |
|-------------|------------|
| `if (data)` | `if (data !== undefined && data !== null)` |
| `if (!isLoading)` | `if (isLoading === false)` |
| `if (items.length)` | `if (items.length > 0)` |
| `data && data.filter()` | `data !== undefined && data !== null ? data.filter() : []` |
| `value \|\| defaultValue` | `value ?? defaultValue` |

**Rule Configuration:**
```typescript
@typescript-eslint/strict-boolean-expressions: [
  "error",
  {
    allowString: false,
    allowNumber: false,
    allowNullableObject: false,
    allowNullableBoolean: false,
    allowNullableString: false,
    allowNullableNumber: false,
    allowAny: false,
  }
]
```

### No Unchecked Indexing

With `noUncheckedIndexedAccess: true`, array/object access returns `T | undefined`.

| ❌ FORBIDDEN | ✅ REQUIRED |
|-------------|------------|
| `items[0].id` | `items.at(0)?.id` or check first |
| `users[index]` | `const user = users.at(index); if (user !== undefined) { ... }` |
| `obj[key]` | Check for undefined before using |

### No Non-Null Assertions

The `!` operator is **banned**. Always guard properly.

| ❌ FORBIDDEN | ✅ REQUIRED |
|-------------|------------|
| `data!.map()` | `if (data !== null && data !== undefined) { data.map() }` |
| `user!.name` | `user?.name ?? 'Unknown'` |

### Promise & Async Correctness

All promises must be handled or explicitly marked as fire-and-forget:

```typescript
@typescript-eslint/no-floating-promises: "error"     // Forgotten awaits
@typescript-eslint/await-thenable: "error"           // Awaiting non-promises
@typescript-eslint/no-misused-promises: "error"      // Wrong promise usage
```

| ❌ FORBIDDEN | ✅ REQUIRED |
|-------------|------------|
| `fetchData()` | `await fetchData()` or `void fetchData()` |
| `await nonPromise` | Only await actual promises |
| `onClick={async () => ...}` | Use `void` or proper handler |

### Type Import Consistency

Enforce separation of type and value imports:

```typescript
@typescript-eslint/consistent-type-imports: [
  "error",
  { prefer: "type-imports", fixStyle: "separate-type-imports" }
]
```

| ❌ FORBIDDEN | ✅ REQUIRED |
|-------------|------------|
| `import { User, getUser } from './api'` | `import type { User } from './api'; import { getUser } from './api'` |

### Template Expression Safety

Prevent coercion bugs in template strings:

```typescript
@typescript-eslint/restrict-template-expressions: [
  "error",
  {
    allowNumber: true,      // Numbers OK: `${5}`
    allowBoolean: false,    // Booleans NOT OK: `${true}` forbidden
    allowAny: false,        // Any type NOT OK
    allowNullish: false     // null/undefined NOT OK
  }
]
```

| ❌ FORBIDDEN | ✅ REQUIRED |
|-------------|------------|
| `` `Status: ${isActive}` `` | `` `Status: ${isActive === true ? 'active' : 'inactive'}` `` |
| `` `Value: ${maybeNull}` `` | `` `Value: ${maybeNull ?? 'N/A'}` `` |

### TypeScript Compiler Flags (Extra Strictness)

These compiler options enforce additional safety:

```json
{
  "exactOptionalPropertyTypes": true,        // `a?: string` ≠ `a?: string | undefined`
  "noUncheckedIndexedAccess": true,          // arr[0] returns T | undefined
  "noImplicitOverride": true,                // Must explicitly mark overrides
  "noPropertyAccessFromIndexSignature": true, // Prevent unsafe obj[key]
  "useUnknownInCatchVariables": true,        // catch(e) is unknown, not any
  "noUnusedLocals": true,
  "noUnusedParameters": true
}
```

### Cognitive Complexity Limit (15)

```typescript
sonarjs/cognitive-complexity: ["warn", 15]
```

If a function exceeds complexity 15, **stop** and split it into 2+ sub-functions.

### Switch Exhaustiveness

```typescript
@typescript-eslint/switch-exhaustiveness-check: "error"
```

All enum cases in switch statements must be handled (or have a default case).

### Exceptions by File Type

**Test Files** (`**/*.test.ts(x)`, `**/__tests__/**`):
- Relaxed for mocking: `any`, `!`, unsafe-* rules OFF
- BUT async rules stay ON (catch real test bugs)

**Catalyst/UI Components** (`src/components/catalyst/**`, `src/components/ui/**`):
- Relaxed strict-boolean and unsafe rules (third-party patterns)

**Services/Pages/Domain**: Full strict rules apply.

### Quick Reference Card

| Pattern | Status | Fix |
|---------|--------|-----|
| `if (x)` | ❌ | `if (x !== undefined && x !== null)` |
| `if (!x)` | ❌ | `if (x === undefined \|\| x === null)` |
| `if (arr.length)` | ❌ | `if (arr.length > 0)` |
| `x && y` | ❌ | `x !== undefined && x !== null ? y : undefined` |
| `x \|\| y` | ❌ | `x ?? y` |
| `any` | ❌ | Specific type or `unknown` |
| `data!` | ❌ | `if (data !== null) { data }` |
| `arr[0].x` | ❌ | `const a = arr.at(0); if (a !== undefined) { a.x }` |
| Line > 120 | ⚠ | Break lines |
| Complexity > 15 | ⚠ | Extract functions |

### Why This Matters

These rules **prevent runtime errors** that would otherwise crash the application.

**Before:** "Cannot read properties of undefined" in production
**After:** Compile-time errors that must be fixed before code runs

**Memory:** For more details, query `.claude/memories/strict-typescript-patterns.md`

---

## FILE ORGANIZATION RULES

### Standard Rules (Domain, Pages, Services, Hooks)

| Rule | Requirement |
|------|-------------|
| **Interfaces** | MUST be in their own file (e.g., `Opportunity.types.ts`) |
| **Types/Enums** | MUST be in their own file |
| **Exports** | MUST be in barrel `index.ts` files only |
| **Folders > 5 files** | MUST be reorganized into subdirectories |

### Catalyst Component Rules (`components/catalyst/`, `components/ui/`)

| Rule | Requirement |
|------|-------------|
| **Compound components** | Related components in ONE file (e.g., Dialog + DialogTitle + DialogBody) |
| **Colocated types** | TypeScript types defined inline in component file |
| **Class composition** | Use `clsx()` for conditional Tailwind classes |
| **Direct imports** | Import directly from component file (e.g., `from '@/components/catalyst/dialog'`) |

### Frontend Folder Structure

```
sam-dashboard/src/
├── components/
│   ├── catalyst/        # PRIMARY - Catalyst UI Kit (Tailwind UI)
│   ├── ui/              # Additional headless UI components
│   ├── domain/          # Business logic components (consume Catalyst)
│   │   ├── opportunity/
│   │   ├── filters/
│   │   └── stats/
│   ├── layout/          # Layout wrappers (consume Catalyst)
│   └── primitives/      # LEGACY - migrate to Catalyst
├── hooks/               # Custom hooks
├── pages/               # Route pages (consume Catalyst + domain)
├── services/            # API calls
├── types/               # Shared types
└── styles/              # CSS files
```

---

## COMPONENT ARCHITECTURE (CATALYST-FIRST)

### Catalyst UI Kit is the Primary Component Library

We use [Catalyst UI Kit](https://tailwindui.com/templates/catalyst) (Tailwind UI) as our **primary component library**. All new components should follow Catalyst patterns.

### Catalyst Design Patterns

| Pattern | Description |
|---------|-------------|
| **Compound components** | Related components in one file (e.g., `Dialog`, `DialogTitle`, `DialogBody`) |
| **Colocated types** | TypeScript types defined inline in component files |
| **clsx for classes** | Use `clsx()` for conditional Tailwind class composition |
| **Headless UI** | Built on `@headlessui/react` for accessibility |

```tsx
// ✅ Catalyst pattern - compound components in one file
// src/components/catalyst/dialog.tsx
export function Dialog({ size, className, children, ...props }) { ... }
export function DialogTitle({ className, ...props }) { ... }
export function DialogBody({ className, ...props }) { ... }
export function DialogActions({ className, ...props }) { ... }
```

### Key Dependencies

- `@headlessui/react` - Accessible headless UI primitives
- `clsx` - Conditional class composition
- `framer-motion` - Animations (optional)

### NO NAKED HTML Outside Component Definitions

**NEVER** use raw HTML elements (div, span, main, section, etc.) outside of component definitions.

This is enforced by ESLint rule `strict-architecture/no-naked-html`.

```tsx
// ❌ FORBIDDEN in pages/domain components
<div className="flex items-center gap-4">
<main className="p-8">

// ✅ REQUIRED - Use Catalyst or layout components
<Dialog>
<Sidebar>
<Card>
```

### Where Raw HTML IS Allowed

Raw HTML and Tailwind classes are **ONLY** allowed inside component definitions:
- `src/components/catalyst/` - **Primary UI library (Catalyst)**
- `src/components/ui/` - Additional UI components
- `src/components/layout/` - Layout components
- `src/components/primitives/` - Legacy primitives (migrate to Catalyst)

### Available Catalyst Components

| Category | Components |
|----------|------------|
| **Overlays** | `Dialog`, `DialogTitle`, `DialogBody`, `DialogActions`, `Drawer` |
| **Forms** | `Input`, `Select`, `Combobox`, `Checkbox`, `Radio`, `Switch`, `Textarea`, `Fieldset` |
| **Data** | `Table`, `DescriptionList`, `Badge` |
| **Navigation** | `Dropdown`, `Navbar`, `Sidebar`, `Pagination`, `Link` |
| **Feedback** | `Alert` |
| **Layout** | `SidebarLayout`, `StackedLayout`, `Divider` |
| **Typography** | `Heading`, `Text` |
| **Media** | `Avatar` |

### Creating New Components

New components should be added to `src/components/catalyst/`:

1. Follow compound component pattern (related components in one file)
2. Use `clsx` for class composition
3. Build on `@headlessui/react` for accessibility
4. Colocate TypeScript types in the same file
5. Export from the barrel file (`index.ts`)

### Component Migration Path

We are migrating to Catalyst as the primary component library:

| Current | Migrate To |
|---------|------------|
| `primitives/Button` | `catalyst/button` |
| `primitives/Input` | `catalyst/input` |
| `primitives/Select` | `catalyst/select` |
| `layout/Sidebar` | `catalyst/sidebar` |
| `layout/Table` | `catalyst/table` |

Domain components (`components/domain/`) should consume Catalyst components.

---

## TAILWIND COMPONENT DESIGN PATTERN

### The Problem
Raw Tailwind classes in page code creates inconsistency:
```tsx
// ❌ BAD - Raw Tailwind in pages
<div className="grid grid-cols-3 gap-6 p-4">
```

### The Solution: Type-Safe Component Abstraction

#### 1. Define Types (types.ts)
```typescript
export type Size = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface BaseStyleProps {
  margin?: Size;
  padding?: Size;
  gap?: Size;
  fullWidth?: boolean;
}

export interface GridProps extends HTMLAttributes<HTMLDivElement>, BaseStyleProps {
  columns?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | string;
}
```

#### 2. Create Mappings (mappings.ts)
```typescript
export const GAP_MAP: Record<string, string> = {
  none: 'gap-0',
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
  '2xl': 'gap-12',
};

export const COL_MAP: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  // ... up to 12
};
```

#### 3. Build Component with clsx
```typescript
export const Grid = ({ columns = 12, gap = 'none', className, ...props }: GridProps) => {
  const gapClass = typeof gap === 'string' ? GAP_MAP[gap] : '';
  const colClass = typeof columns === 'number' ? COL_MAP[columns] : '';

  const classes = clsx('grid', colClass, gapClass, className);

  // Escape hatch: arbitrary values via inline styles
  const dynamicStyles = {
    gridTemplateColumns: typeof columns === 'string' ? columns : undefined,
    gap: typeof gap === 'string' && !GAP_MAP[gap] ? gap : undefined,
  };

  return <div className={classes} style={dynamicStyles} {...props} />;
};
```

#### 4. Usage in Pages
```tsx
// ✅ GOOD - Declarative, type-safe
<Grid columns={3} gap="lg" padding="md" fullWidth>
  <GridItem colSpan={2}>Content</GridItem>
  <GridItem colSpan={1}>Sidebar</GridItem>
</Grid>
```

### Key Rules
- **Layout components** (Grid, Stack) encapsulate Tailwind classes
- **Pages** ONLY use typed props, never raw Tailwind for layout
- **Use `tailwind-merge`** to resolve class conflicts when `className` overrides base classes

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

### No Hardcoded Strings in Tests

**Problem:** Duplicate string literals in tests and components break when UI text changes.

```tsx
// ❌ BAD - Hardcoded strings in test
screen.getByText('Submit');
expect(element).toHaveTextContent('Dashboard');
```

**Solution:** Single source of truth for UI strings.

```typescript
// src/constants/labels.ts
export const LABELS = {
  SUBMIT_BUTTON: 'Submit',
  DASHBOARD_TITLE: 'Dashboard',
} as const;
```

```tsx
// Component
import { LABELS } from '@/constants/labels';
<Button>{LABELS.SUBMIT_BUTTON}</Button>

// Test - now immune to text changes
import { LABELS } from '@/constants/labels';
screen.getByText(LABELS.SUBMIT_BUTTON);
```

**Even better:** Use semantic selectors that don't depend on text at all:
```tsx
// Component
<Button data-testid="submit-btn">{LABELS.SUBMIT_BUTTON}</Button>

// Test - completely immune to text changes
screen.getByTestId('submit-btn');
screen.getByRole('button', { name: /submit/i });
```

**ESLint enforced:** `strict-architecture/no-hardcoded-test-strings`

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

### Workflows

#### Face One: Opportunity Discovery Workflow
```
Find → Filter → Analyze → Save → Alert → Qualify → Pursue
```

**Stages**:
1. **Find**: Ingest from SAM.gov, SBIR.gov, USAspending.gov
2. **Filter**: NAICS, agency, set-aside, geography, clearances
3. **Analyze**: Dashboard analytics, fit scoring, risk assessment
4. **Save**: Save to personal lists, create alerts
5. **Alert**: Notify on new matches, approaching deadlines
6. **Qualify**: Bid/no-bid decision support (planned)
7. **Pursue**: Capture management, proposal development (planned)

#### Face Two: Contract Execution Workflow
```
Onboard → Scope → Sprint → Track → Deliver → Invoice → Close
```

**Stages**:
1. **Onboard**: Multi-step wizard (company, certs, team, integrations)
2. **Scope**: Define deliverables, milestones, requirements
3. **Sprint**: Agile sprint planning and execution (Kanban board)
4. **Track**: Monitor progress, deadlines, scope changes
5. **Deliver**: Deliverable submission and approval
6. **Invoice**: Invoice generation and payment tracking
7. **Close**: Contract closeout and retrospective

### Core Entities

#### Face One: Intelligence Entities
- **Opportunity** (sources, deadlines, Q&A, NAICS, agency, set-aside)
- **Saved Search** (user-defined filters, alert rules)
- **Alert** (new matches, deadline approaching, status changes)
- **Pipeline Stage** (custom stages for tracking opportunities)
- **Organization Match** (company profile matching with opportunities)

#### Face Two: Portal Entities
- **Company Profile** (UEI, CAGE, certifications, capabilities)
- **Contract** (active contracts with CLINs, mods, deliverables)
- **Sprint** (agile sprint with tasks and status)
- **Task/Deliverable** (work items with progress tracking)
- **SBOM** (Software Bill of Materials for compliance)
- **Milestone** (contract milestones with deadlines)
- **Scope Item** (scope tracking to prevent scope creep)
- **Invoice** (billing and payment tracking)
- **Feature Request** (client-facing feature voting)
- **Message** (client-contractor communication)

#### Shared Entities
- **User** (authentication, roles, permissions)
- **Tenant** (multi-tenant isolation for both faces)
- **Notification** (system-wide notifications)
- **Audit Log** (activity tracking across both faces)

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

# TDD Workflow Rules - SAMGov Project

## MANDATORY: Test-Driven Development (Red-Green-Refactor)

### The TDD Cycle

```
🔴 RED    → Write a failing test first
🟢 GREEN  → Write minimal code to make test pass
🔵 REFACTOR → Clean up code while keeping tests green
```

### Critical Rules

1. **NO implementation before tests** - Always write tests first
2. **NO breaking existing tests** - All tests must pass at all times
3. **NO losing features** - Preserve all capabilities during refactor

### Feature Completion Criteria

A feature is ONLY marked GREEN/complete when:
- ✅ ALL existing tests in the codebase pass (not just feature tests)
- ✅ New feature tests pass
- ✅ Type checking passes (`npx tsc --noEmit`)
- ✅ Linting passes (`npm run lint`)
- ✅ No regressions anywhere in the system

### On Test Failure

```
STOP → READ error → DIFF changes → ROOT CAUSE → FIX → VERIFY
```

Never ignore a failing test. Investigate root cause before proceeding.

### Verification Loop (Run After Every Change)

```bash
# Frontend
cd sam-dashboard
npx tsc --noEmit     # Type checking
npm run lint         # Linting
npm test             # ALL tests

# Backend
./gradlew build      # Includes all tests
```

ALL checks must pass before marking work complete.

### Behavioral Testing ("Refactor Proof")

Before finalizing a test, ask:
> "If I rename internal methods, does this test still pass?"

- YES → Good test (tests behavior)
- NO → Bad test (tests implementation) - rewrite it

### Test Patterns

| DO NOT Test | DO Test |
|-------------|---------|
| Private methods | Public API results |
| CSS classes | ARIA roles and accessibility |
| Implementation details | User-visible behavior |

---

## Component-Driven Architecture (No Naked HTML)

### Core Principle

**NEVER use raw HTML elements outside of component definitions.**

Forbidden in pages/features:
- `<div>`, `<span>`, `<main>`, `<section>`, `<article>`, `<aside>`
- `<header>`, `<footer>`, `<nav>`
- `<ul>`, `<ol>`, `<li>`
- Any element with `className` (Tailwind)

### Where Raw HTML IS Allowed

Only inside component definitions:
- `src/components/primitives/`
- `src/components/layout/`
- `src/components/ui/`

### Correct Patterns

```tsx
// ❌ FORBIDDEN
<div className="flex gap-4">
<main className="p-8">

// ✅ REQUIRED
<Flex gap="md">
<AppLayout>
```

---

## Architecture Rules

### Strict TypeScript

- Never use `any` - use `unknown` with type guards
- Explicit boolean checks: `if (x !== undefined && x !== null)`
- Safe array access: `items.at(0)?.id` not `items[0].id`
- Cognitive complexity limit: 15

### File Organization

- Functions > 3 lines: own file
- Interfaces: own file in types/
- Exports: barrel index.ts only
- Folders > 5 files: reorganize into subdirectories

### Accessibility (WCAG 2.1 AA)

- All images: alt text
- All interactive elements: keyboard accessible
- All form inputs: associated labels
- Color contrast: 4.5:1 minimum
- Focus indicators: always visible

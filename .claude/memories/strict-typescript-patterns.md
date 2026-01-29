# Strict TypeScript Patterns (MANDATORY)

**Keyword:** `strict_typescript_null_safety`
**Category:** `typescript`, `safety`
**Confidence:** 5/5

## The Problem

Runtime errors like "Cannot read properties of undefined (reading 'filter')" occur when code doesn't properly check for null/undefined values.

The strict TypeScript configuration **prevents these errors at compile time**.

## Core Rules

### 1. No Implicit Truthy Checks

TypeScript's `strict-boolean-expressions` rule forces explicit null/undefined checks.

| ❌ FORBIDDEN | ✅ REQUIRED |
|-------------|------------|
| `if (data)` | `if (data !== undefined && data !== null)` |
| `if (!isLoading)` | `if (isLoading === false)` |
| `if (items.length)` | `if (items.length > 0)` |
| `data && data.filter()` | `data !== undefined && data !== null ? data.filter() : []` |
| `value \|\| defaultValue` | `value ?? defaultValue` |

### 2. No Unchecked Array Access

With `noUncheckedIndexedAccess: true`, array access returns `T | undefined`.

| ❌ FORBIDDEN | ✅ REQUIRED |
|-------------|------------|
| `items[0].id` | `items.at(0)?.id` or check first |
| `arr[index]` | `const item = arr.at(index); if (item !== undefined) { ... }` |

### 3. No Non-Null Assertions

The `!` operator is banned. Always guard properly.

| ❌ FORBIDDEN | ✅ REQUIRED |
|-------------|------------|
| `data!.map()` | `if (data !== null && data !== undefined) { data.map() }` |
| `user!.name` | `user?.name ?? 'Unknown'` |

### 4. The "Unsafe *" Family (ALL ERRORS)

These five rules catch type safety violations:

```typescript
@typescript-eslint/no-unsafe-argument: "error"
@typescript-eslint/no-unsafe-assignment: "error"
@typescript-eslint/no-unsafe-call: "error"
@typescript-eslint/no-unsafe-member-access: "error"
@typescript-eslint/no-unsafe-return: "error"
```

They prevent:
- Passing `any` types to functions
- Assigning `any` to typed variables
- Calling methods on `any`
- Accessing properties on `any`
- Returning `any` from typed functions

### 5. Promise Handling

All promises must be handled:

```typescript
@typescript-eslint/no-floating-promises: "error"
@typescript-eslint/await-thenable: "error"
```

| ❌ FORBIDDEN | ✅ REQUIRED |
|-------------|------------|
| `fetchData()` | `await fetchData()` or `void fetchData()` |
| `await nonPromise` | Only await actual promises |

### 6. Template Expression Safety

Prevents coercion bugs in template strings:

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

## TypeScript Compiler Flags

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

## Common Patterns

### Filtering Arrays

```typescript
// ❌ BAD - might be undefined
items.filter(x => x.active)

// ✅ GOOD - guard first
if (items !== undefined && items !== null) {
  items.filter(x => x.active)
}

// ✅ BETTER - use optional chaining with default
const filtered = items?.filter(x => x.active) ?? []
```

### Accessing Properties

```typescript
// ❌ BAD - multiple violations
if (user && user.profile && user.profile.name) { ... }

// ✅ GOOD - explicit checks
if (
  user !== undefined &&
  user !== null &&
  user.profile !== undefined &&
  user.profile !== null &&
  user.profile.name !== undefined &&
  user.profile.name !== null
) { ... }

// ✅ BETTER - optional chaining
if (user?.profile?.name !== undefined && user?.profile?.name !== null) { ... }
```

### Function Return Types

```typescript
// ❌ BAD - implicit any return
function getData() {
  return fetch('/api/data')
}

// ✅ GOOD - explicit return type
function getData(): Promise<Response> {
  return fetch('/api/data')
}
```

## Exception: Test Files

Test files have relaxed rules for mocking flexibility, but async rules still apply:

```typescript
// In tests, these are OFF:
@typescript-eslint/no-explicit-any: "off"
@typescript-eslint/strict-boolean-expressions: "off"

// But these stay ON (catch real bugs):
@typescript-eslint/no-floating-promises: "error"
@typescript-eslint/await-thenable: "error"
```

## Exception: Catalyst/UI Components

Third-party component libraries (`src/components/catalyst/**`, `src/components/ui/**`) have relaxed strict-boolean rules to accommodate their patterns.

## Quick Reference Card

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

## Why This Matters

These rules **prevent runtime errors** that would otherwise crash the application. The error mentioned in the issue ("Cannot read properties of undefined (reading 'filter')") is exactly what these rules catch at compile time.

**Before:** Crashes in production
**After:** Compile-time errors that must be fixed before code runs

## Verification

After any code change, run:

```bash
cd sam-dashboard
npx tsc --noEmit     # Type checking
npm run lint         # Linting
npm test             # Tests
```

All three must pass before considering work complete.

# Strict Linting Rules Migration - Complete

**Date:** 2026-01-28
**Status:** ✅ COMPLETE (with one pending package installation)

---

## Summary

Successfully ported strict TypeScript linting rules and patterns from `C:\Projects\MasterBluePrint` to SAMGov project. These rules **prevent runtime errors like "Cannot read properties of undefined (reading 'filter')"** by enforcing null/undefined checks at compile time.

---

## What Was Completed

### 1. ✅ ESLint Configuration (`sam-dashboard/eslint.config.js`)

**Added Strict TypeScript Rules:**

- **The "Unsafe *" Family** - 5 core type safety rules (all errors):
  - `no-unsafe-argument`
  - `no-unsafe-assignment`
  - `no-unsafe-call`
  - `no-unsafe-member-access`
  - `no-unsafe-return`

- **Strict Boolean Expressions** - Forces explicit null/undefined checks:
  ```typescript
  // ❌ Forbidden: if (data)
  // ✅ Required: if (data !== undefined && data !== null)
  ```

- **Promise Handling** - Prevents forgotten awaits:
  - `no-floating-promises`
  - `await-thenable`
  - `no-misused-promises`

- **Type Import Consistency** - Separates type vs value imports:
  - `consistent-type-imports`
  - `consistent-type-exports`

- **Template Expression Safety** - Prevents coercion bugs:
  - Allows numbers, bans booleans/nullish in templates

- **Accessibility (WCAG 2.1 AA/AAA)** - All `jsx-a11y` rules as errors

- **Code Quality (SonarJS)**:
  - Cognitive complexity limit: 15
  - Duplicate string detection
  - Code maintainability rules

- **Import Ordering** - Consistent alphabetical import structure

**Test File Exceptions:**
- Relaxed rules for mocking flexibility in `*.test.ts(x)` files
- BUT async rules still enforced (catch real bugs)

**Catalyst/UI Exceptions:**
- Relaxed strict-boolean for third-party component patterns
- `src/components/catalyst/**` and `src/components/ui/**`

### 2. ✅ TypeScript Compiler Flags (`sam-dashboard/tsconfig.app.json`)

**Enabled Extra Strictness Flags:**

```json
{
  "exactOptionalPropertyTypes": true,        // `a?: string` ≠ `a?: string | undefined`
  "noUncheckedIndexedAccess": true,          // arr[0] returns T | undefined
  "noImplicitOverride": true,                // Must mark overrides
  "noPropertyAccessFromIndexSignature": true, // Prevent unsafe obj[key]
  "useUnknownInCatchVariables": true,        // catch(e) is unknown, not any
  "noUnusedLocals": true,
  "noUnusedParameters": true
}
```

**What This Catches:**
- Array access without guards: `items[0].id` → requires `items.at(0)?.id`
- Optional property confusion
- Unguarded property access on dynamic objects
- Implicit any in catch blocks

### 3. ✅ Memory Files (`.claude/memories/`)

Created two memory files for future reference:

1. **`strict-typescript-patterns.md`**
   - Comprehensive guide to strict TypeScript patterns
   - Quick reference card for forbidden vs required patterns
   - Exception rules for tests and UI components
   - Verification commands

2. **`architecture-api-client.md`**
   - Current API client pattern (centralized `API_BASE`)
   - Recent changes (commit history)
   - Future improvement path (network governance)
   - Reference to MasterBluePrint's `useControlPlane` pattern

### 4. ✅ Enhanced CLAUDE.md

**Updated `STRICT TYPESCRIPT PATTERNS` Section:**
- Added comprehensive explanation of all strict rules
- Included "Unsafe *" family details
- Promise handling rules
- Type import consistency
- Template expression safety
- TypeScript compiler flags
- Quick reference card
- File-type exceptions (tests, Catalyst/UI)

### 5. ✅ Validation

**Current Status:**
- ✅ ESLint config loads successfully
- ✅ TypeScript compilation passes
- ✅ No immediate errors detected

**Observation:**
The codebase is **already fairly clean** with defensive patterns:
- Uses `?? []` for array defaults
- Explicit `!== undefined && !== null` checks in many places
- Type guards with `: code is string` filters

---

## What's Pending

### ⚠️ eslint-plugin-boundaries

**Status:** Package installation issue (npm not adding to node_modules)

**What It Does:**
- Enforces domain architecture boundaries (Spring-style layering)
- Prevents deep imports (forces barrel file usage)
- Ensures data flows: API → Services → Views

**Temporary Solution:**
- Plugin import and rules are **commented out** in `eslint.config.js`
- Lines marked with `// TODO: Install package`

**To Fix Later:**
```bash
cd sam-dashboard
npm install --save-dev eslint-plugin-boundaries@^5.0.2
```

Then uncomment in `eslint.config.js`:
- Line 10: `import boundariesPlugin`
- Line 27: `boundaries: boundariesPlugin`
- Lines 41-58: `boundaries/elements` and `boundaries/ignore` settings

---

## Key Rules to Remember

### Strict Boolean Checks (CRITICAL)

| ❌ FORBIDDEN | ✅ REQUIRED |
|-------------|------------|
| `if (data)` | `if (data !== undefined && data !== null)` |
| `if (!isLoading)` | `if (isLoading === false)` |
| `if (arr.length)` | `if (arr.length > 0)` |
| `data && data.filter()` | `data !== undefined && data !== null ? data.filter() : []` |
| `value \|\| defaultValue` | `value ?? defaultValue` |

### Array Access

| ❌ FORBIDDEN | ✅ REQUIRED |
|-------------|------------|
| `items[0].id` | `items.at(0)?.id` |
| `arr[index]` | `const item = arr.at(index); if (item !== undefined) { ... }` |

### Promises

| ❌ FORBIDDEN | ✅ REQUIRED |
|-------------|------------|
| `fetchData()` | `await fetchData()` or `void fetchData()` |
| `await nonPromise` | Only await promises |

### Type Imports

| ❌ FORBIDDEN | ✅ REQUIRED |
|-------------|------------|
| `import { User, getUser }` | `import type { User } from './api'; import { getUser } from './api'` |

---

## Verification Commands

After any code change, run:

```bash
cd sam-dashboard

# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Naming conventions
npm run lint:naming

# All checks
npm run validate
```

**ALL checks must pass before considering work complete.**

---

## Migration Impact

### Benefits

1. **Runtime Error Prevention**
   - "Cannot read properties of undefined" caught at compile time
   - No more production crashes from null/undefined access

2. **Type Safety**
   - No implicit `any` types
   - Explicit type guards required
   - Better IDE autocomplete

3. **Code Quality**
   - Cognitive complexity enforcement
   - Consistent code patterns
   - Accessibility compliance (WCAG 2.1 AA/AAA)

4. **Maintainability**
   - Explicit null checks make intent clear
   - Fewer runtime surprises
   - Easier to reason about code

### Potential Gradual Migration Areas

While the codebase appears clean, future work may identify:

1. **Third-party library integrations** - May need type assertions or wrapper functions
2. **Dynamic data from APIs** - May need runtime validation with Zod/Yup
3. **Legacy components** - Older code may need refactoring to meet strict standards

---

## Skills and Agents

**Note:** MasterBluePrint did not have custom skills/agents in `.claude/skills/`. The memory system and CLAUDE.md patterns were successfully ported.

---

## Next Steps (Optional)

### 1. Enable eslint-plugin-boundaries

Once npm installation issue is resolved, uncomment the boundaries plugin to enforce:
- Domain architecture boundaries
- Barrel file imports only (no deep imports)
- Spring-style layering (API → Services → Views)

### 2. Add Pre-commit Hooks

Consider adding git hooks for automatic validation:

```bash
# .husky/pre-commit
npm run lint
npm run typecheck
npm run lint:naming
```

### 3. Monitor for Issues

As development continues, watch for:
- Type errors in new code
- ESLint warnings to address
- Patterns that need additional rules

---

## References

- **Source Project:** `C:\Projects\MasterBluePrint`
- **Memory Files:** `.claude/memories/strict-typescript-patterns.md`, `architecture-api-client.md`
- **ESLint Config:** `sam-dashboard/eslint.config.js`
- **TypeScript Config:** `sam-dashboard/tsconfig.app.json`
- **CLAUDE.md:** Updated with strict patterns

---

## Conclusion

The SAMGov project now has **one of the strictest TypeScript configurations available**, matching the MasterBluePrint project's standards. The rules prevent null/undefined errors at compile time and enforce high code quality and accessibility standards.

The codebase already shows good defensive patterns, indicating the team was already following many best practices. The strict linting rules will help maintain this quality as the project grows.

**Status:** ✅ COMPLETE - Ready for development with strict type safety enforcement.

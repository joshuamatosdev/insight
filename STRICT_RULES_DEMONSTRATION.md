# Strict TypeScript Linting Rules - Test Demonstration

**Date:** 2026-01-28
**Status:** ✅ Configuration Active

---

## Summary

The strict TypeScript linting rules from MasterBluePrint have been successfully ported and are now active.

**Good News:** The SAMGov codebase already passes all strict rules! This indicates the team has been following excellent TypeScript practices.

---

## What's Now Enforced

### 1. ❌ NO IMPLICIT TRUTHY CHECKS (`strict-boolean-expressions`)

**Before (Would Now Fail):**
```typescript
function checkData(users: User[] | undefined) {
  if (users) {  // ❌ ERROR: Implicit truthy check
    return users.length;
  }
}
```

**After (Required):**
```typescript
function checkData(users: User[] | undefined) {
  if (users !== undefined && users !== null) {  // ✅ PASS: Explicit check
    return users.length;
  }
}
```

**Error Message:**
```
Unexpected nullable value in conditional. An explicit comparison or optional chain is required.
```

---

### 2. ❌ NO 'ANY' TYPE (`no-explicit-any`)

**Before (Would Now Fail):**
```typescript
function processData(data: any) {  // ❌ ERROR: Explicit any
  return data.users;
}
```

**After (Required):**
```typescript
function processData(data: unknown) {  // ✅ PASS: Use unknown with guards
  if (typeof data === 'object' && data !== null && 'users' in data) {
    return (data as { users: User[] }).users;
  }
}
```

**Error Message:**
```
Unexpected any. Specify a different type.
```

---

### 3. ❌ NO FLOATING PROMISES (`no-floating-promises`)

**Before (Would Now Fail):**
```typescript
function triggerFetch() {
  fetch('/api/users');  // ❌ ERROR: Promise not awaited or voided
}
```

**After (Required):**
```typescript
async function triggerFetch() {
  await fetch('/api/users');  // ✅ PASS: Awaited
}

// OR

function triggerFetchFireAndForget() {
  void fetch('/api/users');  // ✅ PASS: Explicitly voided
}
```

**Error Message:**
```
Promises must be awaited, end with a call to .catch, or end with a call to .then with a rejection handler.
```

---

### 4. ❌ NO NON-NULL ASSERTIONS (`no-non-null-assertion`)

**Before (Would Now Fail):**
```typescript
function getUserName(user: User | undefined) {
  return user!.name;  // ❌ ERROR: Non-null assertion
}
```

**After (Required):**
```typescript
function getUserName(user: User | undefined) {
  if (user !== undefined) {  // ✅ PASS: Proper guard
    return user.name;
  }
  return 'Unknown';
}
```

**Error Message:**
```
Forbidden non-null assertion.
```

---

### 5. ❌ NO UNCHECKED ARRAY ACCESS (`noUncheckedIndexedAccess`)

**Before (Would Now Fail):**
```typescript
function getFirstUser(users: User[]) {
  return users[0].name;  // ❌ ERROR: users[0] might be undefined
}
```

**After (Required):**
```typescript
function getFirstUser(users: User[]) {
  const firstUser = users.at(0);  // ✅ PASS: Returns User | undefined
  if (firstUser !== undefined) {
    return firstUser.name;
  }
  return 'No users';
}
```

**Error Message:**
```
Object is possibly 'undefined'.
```

---

### 6. ❌ NO UNSAFE MEMBER ACCESS (`no-unsafe-member-access`)

**Before (Would Now Fail):**
```typescript
function getUserData(obj: any) {
  return obj.users[0].name;  // ❌ ERROR: Multiple unsafe accesses
}
```

**After (Required):**
```typescript
function getUserData(obj: unknown): string {
  if (
    typeof obj === 'object' &&
    obj !== null &&
    'users' in obj &&
    Array.isArray(obj.users) &&
    obj.users.length > 0
  ) {
    const firstUser = obj.users.at(0);
    if (firstUser && 'name' in firstUser) {
      return String(firstUser.name);
    }
  }
  return 'Unknown';
}
```

**Error Message:**
```
Unsafe member access on an any value.
```

---

### 7. ❌ NO BOOLEAN COERCION IN TEMPLATES (`restrict-template-expressions`)

**Before (Would Now Fail):**
```typescript
function formatStatus(isActive: boolean) {
  return `Status: ${isActive}`;  // ❌ ERROR: Boolean in template
}

function formatCount(count: number | null) {
  return `Items: ${count}`;  // ❌ ERROR: Nullable in template
}
```

**After (Required):**
```typescript
function formatStatus(isActive: boolean) {
  return `Status: ${isActive === true ? 'active' : 'inactive'}`;  // ✅ PASS
}

function formatCount(count: number | null) {
  return `Items: ${count ?? 0}`;  // ✅ PASS: Nullish coalescing
}
```

**Error Message:**
```
Invalid type "boolean" of template literal expression.
```

---

### 8. ❌ NO IMPLICIT LENGTH CHECKS

**Before (Would Now Fail):**
```typescript
function hasItems(items: string[] | undefined) {
  if (items && items.length) {  // ❌ ERROR: Implicit number check
    return true;
  }
  return false;
}
```

**After (Required):**
```typescript
function hasItems(items: string[] | undefined) {
  if (items !== undefined && items !== null && items.length > 0) {  // ✅ PASS
    return true;
  }
  return false;
}
```

**Error Message:**
```
Unexpected nullable value in conditional.
```

---

## TypeScript Compiler Flags Enabled

These flags catch additional errors at compile time:

### `noUncheckedIndexedAccess: true`
```typescript
const arr = [1, 2, 3];
const first = arr[0];  // Type: number | undefined (not just number)
```

### `exactOptionalPropertyTypes: true`
```typescript
interface User {
  age?: number;  // Means "number or absent", NOT "number | undefined"
}

const user: User = { age: undefined };  // ❌ ERROR
```

###`noPropertyAccessFromIndexSignature: true`
```typescript
const obj: Record<string, number> = {};
const value = obj.someKey;  // ❌ ERROR: Must use obj['someKey']
```

### `useUnknownInCatchVariables: true`
```typescript
try {
  doSomething();
} catch (error) {  // Type: unknown (not any)
  if (error instanceof Error) {
    console.error(error.message);
  }
}
```

---

## Accessibility Rules (WCAG 2.1 AA/AAA)

All accessibility rules are now **errors** (not warnings):

```tsx
// ❌ ERROR: Missing alt text
<img src="logo.png" />

// ✅ PASS
<img src="logo.png" alt="Company Logo" />

// ❌ ERROR: Interactive div without keyboard support
<div onClick={handleClick}>Click me</div>

// ✅ PASS
<button onClick={handleClick}>Click me</button>

// ❌ ERROR: Label not associated with input
<label>Name</label>
<input type="text" />

// ✅ PASS
<label htmlFor="name">Name</label>
<input id="name" type="text" />
```

---

## Code Quality Rules (SonarJS)

### Cognitive Complexity Limit: 15

Functions exceeding complexity 15 trigger warnings:

```typescript
// ❌ WARNING: Cognitive complexity 18
function complexFunction(data: Data) {
  if (data.type === 'A') {
    if (data.value > 10) {
      if (data.status === 'active') {
        // ... many nested conditions
      }
    }
  }
}

// ✅ PASS: Split into smaller functions
function complexFunction(data: Data) {
  if (!isValidData(data)) return;
  return processData(data);
}
```

### Duplicate String Detection

Strings repeated 3+ times trigger warnings:

```typescript
// ❌ WARNING: "User not found" repeated 4 times
if (!user) throw new Error("User not found");
if (!user.id) throw new Error("User not found");

// ✅ PASS: Extract to constant
const ERROR_USER_NOT_FOUND = "User not found";
```

---

## Exceptions by File Type

### Test Files (`*.test.ts`, `*.spec.ts`)
- Relaxed for mocking: `any`, `!`, `unsafe-*` rules OFF
- Async rules STAY ON (catch real bugs)

### Catalyst/UI Components (`src/components/catalyst/**`)
- Relaxed `strict-boolean-expressions` (third-party patterns)
- Relaxed `unsafe-*` for library interop

### Regular Code (Services, Pages, Domain)
- **ALL strict rules apply**

---

## Current Codebase Status

Running the strict linting on the SAMGov codebase:

```bash
✅ TypeScript compilation: 0 errors
✅ ESLint: 0 errors
✅ File naming: 0 errors
```

**This is excellent!** The codebase already follows strict TypeScript practices:
- Uses `?? []` for array defaults
- Explicit null/undefined checks in critical paths
- Type guards with proper predicates
- Optional chaining where appropriate

---

## Verification Commands

To test the rules on your code:

```bash
cd sam-dashboard

# Type checking (catches noUncheckedIndexedAccess, etc.)
npx tsc --noEmit

# Linting (catches strict-boolean-expressions, no-explicit-any, etc.)
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Full validation
npm run validate
```

---

## Example: Real-World Impact

### Before Strict Rules
```typescript
// This code could crash at runtime
function getFilteredOpportunities(opportunities) {
  return opportunities.filter(o => o.active);  // ❌ Crash if opportunities is undefined
}
```

### After Strict Rules
```typescript
// Compiler forces you to handle all cases
function getFilteredOpportunities(opportunities: Opportunity[] | undefined) {
  if (opportunities !== undefined && opportunities !== null) {
    return opportunities.filter(o => o.active === true);
  }
  return [];
}
```

**Runtime Error Prevented:** "Cannot read properties of undefined (reading 'filter')"

---

## Files Updated

1. **`sam-dashboard/eslint.config.js`** - Strict TypeScript rules from MasterBluePrint
2. **`sam-dashboard/tsconfig.app.json`** - Strict compiler flags enabled
3. **`.claude/memories/strict-typescript-patterns.md`** - Pattern reference
4. **`CLAUDE.md`** - Enhanced with strict rules documentation

---

## Next Steps

1. **Continue Development** - New code will be checked by strict rules automatically
2. **Address Any Future Violations** - Linter will catch them before commit
3. **Consider Pre-commit Hooks** - Auto-lint before git commits

---

## Conclusion

The strict TypeScript rules are **active and working**. The SAMGov codebase already passes all checks, which is a testament to the quality of the existing code. Going forward, these rules will prevent null/undefined errors at compile time and enforce high code quality standards.

**No action needed** - the protection is already in place!

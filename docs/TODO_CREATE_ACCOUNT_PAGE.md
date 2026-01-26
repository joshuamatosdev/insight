# TODO: Create Account / Registration Page

## Overview

Add a registration page to allow new users to create accounts through the UI instead of requiring API calls.

---

## Requirements

### Page: `/register`

Create `src/pages/RegisterPage.tsx` with:

#### Form Fields
- [ ] **Email** - Required, valid email format
- [ ] **Password** - Required, min 8 characters
- [ ] **Confirm Password** - Must match password
- [ ] **First Name** - Required
- [ ] **Last Name** - Required
- [ ] **Organization Name** - Optional (creates tenant if provided)

#### Validation
- [ ] Email format validation
- [ ] Password strength indicator
- [ ] Password match validation
- [ ] Required field validation

#### Features
- [ ] Show/hide password toggle
- [ ] Loading state on submit
- [ ] Error message display (from API)
- [ ] Success → redirect to dashboard
- [ ] Link back to login page

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/pages/RegisterPage.tsx` | Registration form component |
| `src/pages/RegisterPage.types.ts` | Form state and validation types |

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/index.ts` | Export RegisterPage |
| `src/App.tsx` | Add `/register` route |
| `src/pages/LoginPage.tsx` | Add "Create Account" link |
| `src/services/auth.ts` | Already has `register()` function |

---

## UI Design

### Layout
- Same centered card layout as LoginPage
- Blue header with logo
- White form body
- Footer text

### Login Page Addition
Add below the Sign In button:
```
Don't have an account? Create one
```

---

## API Integration

Already implemented in `src/services/auth.ts`:

```typescript
export async function register(data: RegisterData): Promise<LoginResponse>
```

Calls `POST /api/v1/auth/register` with:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "organizationName": "Acme Corp"  // optional
}
```

---

## Acceptance Criteria

- [ ] User can navigate to `/register` from login page
- [ ] Form validates all fields before submission
- [ ] Successful registration logs user in automatically
- [ ] Failed registration shows clear error message
- [ ] User is redirected to dashboard after registration
- [ ] "Already have an account?" links back to login

---

*Created: 2026-01-26*
*Priority: High*
*Estimate: 1-2 hours*

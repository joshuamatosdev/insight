# E2E Test Plan - Parallel Execution

## Overview

| Agent | E2E Test Suites | Est. Files |
|-------|-----------------|------------|
| **Claude Code** | 4 suites | 8 files |
| **Cursor Agent 1** | 4 suites | 8 files |
| **Cursor Agent 2** | 4 suites | 8 files |
| **Cursor Agent 3** | 3 suites | 6 files |

**Total: 15 suites, ~30 test files**

---

## Existing E2E Tests (Already Done)

```
e2e/
├── auth/
│   ├── login.spec.ts       ✅
│   ├── logout.spec.ts      ✅
│   └── register.spec.ts    ✅
├── opportunities/
│   ├── detail.spec.ts      ✅
│   ├── filter.spec.ts      ✅
│   └── search.spec.ts      ✅
└── fixtures/
    └── test-fixtures.ts    ✅
```

---

## CLAUDE CODE - E2E Tests to Write

### Suite 1: Onboarding Flow (`e2e/onboarding/`)
| File | Tests |
|------|-------|
| `wizard.spec.ts` | Complete wizard flow, step navigation, progress tracking |
| `steps.spec.ts` | Each step form validation, skip optional steps |

**Test Scenarios:**
- [ ] Display onboarding wizard on first login
- [ ] Navigate through all 5 steps
- [ ] Skip optional steps (certifications, team invite, integrations)
- [ ] Save progress and resume
- [ ] Complete onboarding and redirect to dashboard
- [ ] Dismiss wizard early

### Suite 2: AI Insights (`e2e/ai/`)
| File | Tests |
|------|-------|
| `insights-panel.spec.ts` | AI panel display, tab switching, loading states |
| `analysis.spec.ts` | Summary, fit score, risk assessment display |

**Test Scenarios:**
- [ ] Display AI Insights panel on opportunity detail
- [ ] Switch between Summary, Fit Score, Risk tabs
- [ ] Show loading state during analysis
- [ ] Display AI summary content
- [ ] Display fit score with breakdown
- [ ] Display risk assessment with levels
- [ ] Handle AI service errors gracefully

### Suite 3: Portal Dashboard (`e2e/portal/`)
| File | Tests |
|------|-------|
| `dashboard.spec.ts` | Dashboard layout, quick stats, loading |
| `widgets.spec.ts` | Contract cards, invoices, deliverables, deadlines |

**Test Scenarios:**
- [ ] Display contractor dashboard
- [ ] Show quick stats (contracts, invoices, deadlines, value)
- [ ] Display contract status cards
- [ ] Display invoice summary
- [ ] Display deliverable tracker
- [ ] Display upcoming deadlines
- [ ] Navigate to detail pages from widgets

### Suite 4: RBAC Admin (`e2e/admin/`)
| File | Tests |
|------|-------|
| `roles.spec.ts` | Role CRUD, permission assignment |
| `users.spec.ts` | User role management, search |

**Test Scenarios:**
- [ ] View roles list
- [ ] Create new role with permissions
- [ ] Edit existing role
- [ ] Delete non-system role
- [ ] Prevent deletion of system roles
- [ ] Assign role to user
- [ ] Remove role from user
- [ ] Search users

---

## CURSOR AGENT 1 - E2E Tests to Write

### Suite 5: Billing (`e2e/billing/`)
| File | Tests |
|------|-------|
| `subscription.spec.ts` | View plan, upgrade, downgrade |
| `plans.spec.ts` | Plan comparison, feature display |

**Test Scenarios:**
- [ ] Display current subscription
- [ ] Show plan comparison cards
- [ ] Upgrade to higher plan
- [ ] Downgrade to lower plan
- [ ] Cancel subscription with confirmation
- [ ] Display billing history

### Suite 6: Alerts (`e2e/alerts/`)
| File | Tests |
|------|-------|
| `list.spec.ts` | Alert list display, filtering |
| `crud.spec.ts` | Create, edit, delete alerts |

**Test Scenarios:**
- [ ] Display alerts list
- [ ] Create new alert with criteria
- [ ] Edit existing alert
- [ ] Delete alert with confirmation
- [ ] Toggle alert active/inactive
- [ ] Filter alerts by type

### Suite 7: Notifications (`e2e/notifications/`)
| File | Tests |
|------|-------|
| `center.spec.ts` | Notification panel, mark read |
| `preferences.spec.ts` | Notification settings |

**Test Scenarios:**
- [ ] Open notification panel
- [ ] Display unread count badge
- [ ] Mark notification as read
- [ ] Mark all as read
- [ ] Navigate to notification source
- [ ] Configure notification preferences

### Suite 8: Audit Log (`e2e/audit/`)
| File | Tests |
|------|-------|
| `log.spec.ts` | Audit log display, filtering |
| `detail.spec.ts` | Audit entry details |

**Test Scenarios:**
- [ ] Display audit log entries
- [ ] Filter by date range
- [ ] Filter by action type
- [ ] Filter by user
- [ ] View entry details
- [ ] Export audit log

---

## CURSOR AGENT 2 - E2E Tests to Write

### Suite 9: Settings/Preferences (`e2e/settings/`)
| File | Tests |
|------|-------|
| `profile.spec.ts` | User profile settings |
| `preferences.spec.ts` | Theme, notifications, display |

**Test Scenarios:**
- [ ] Update profile information
- [ ] Change password
- [ ] Toggle dark/light theme
- [ ] Configure display preferences
- [ ] Save preferences

### Suite 10: MFA (`e2e/auth/`)
| File | Tests |
|------|-------|
| `mfa-setup.spec.ts` | Enable MFA, QR code, backup codes |
| `mfa-login.spec.ts` | Login with TOTP, backup code |

**Test Scenarios:**
- [ ] Enable MFA from settings
- [ ] Display QR code for authenticator
- [ ] Verify TOTP code
- [ ] Generate backup codes
- [ ] Login with TOTP
- [ ] Login with backup code
- [ ] Disable MFA

### Suite 11: SSO/OAuth (`e2e/auth/`)
| File | Tests |
|------|-------|
| `sso.spec.ts` | SSO login buttons, redirect flow |
| `oauth-link.spec.ts` | Link/unlink OAuth accounts |

**Test Scenarios:**
- [ ] Display SSO login options (Google, Microsoft)
- [ ] Initiate OAuth flow
- [ ] Link OAuth account to existing user
- [ ] Unlink OAuth account
- [ ] Handle OAuth errors

### Suite 12: Tenant Admin (`e2e/admin/`)
| File | Tests |
|------|-------|
| `tenant-settings.spec.ts` | Tenant configuration |
| `branding.spec.ts` | Logo, colors, custom branding |

**Test Scenarios:**
- [ ] View tenant settings
- [ ] Update organization name
- [ ] Upload company logo
- [ ] Configure custom colors
- [ ] Preview branding changes
- [ ] Save branding settings

---

## CURSOR AGENT 3 - E2E Tests to Write

### Suite 13: Reports (`e2e/reports/`)
| File | Tests |
|------|-------|
| `builder.spec.ts` | Report builder interface |
| `list.spec.ts` | Report list, run, export |

**Test Scenarios:**
- [ ] Open report builder
- [ ] Add filters to report
- [ ] Select columns/metrics
- [ ] Preview report
- [ ] Save report
- [ ] Run saved report
- [ ] Export report (CSV, PDF)

### Suite 14: Search Enhancements (`e2e/search/`)
| File | Tests |
|------|-------|
| `autocomplete.spec.ts` | Search autocomplete |
| `faceted.spec.ts` | Faceted filtering |

**Test Scenarios:**
- [ ] Display autocomplete suggestions
- [ ] Select suggestion and search
- [ ] Display faceted filter counts
- [ ] Apply multiple facet filters
- [ ] Clear facet filters

### Suite 15: Export Enhancements (`e2e/export/`)
| File | Tests |
|------|-------|
| `batch.spec.ts` | Batch export selection |
| `scheduled.spec.ts` | Scheduled export setup |

**Test Scenarios:**
- [ ] Select multiple items for export
- [ ] Choose export format
- [ ] Execute batch export
- [ ] Create scheduled export
- [ ] Edit scheduled export
- [ ] Delete scheduled export

---

## Test Fixtures to Add

### `e2e/fixtures/test-fixtures.ts` - Add:

```typescript
// Add these page objects
export class OnboardingPage { ... }
export class PortalPage { ... }
export class AdminPage { ... }
export class BillingPage { ... }
export class ReportsPage { ... }
export class SettingsPage { ... }
```

---

## Directory Structure (After Implementation)

```
e2e/
├── admin/
│   ├── roles.spec.ts
│   ├── users.spec.ts
│   ├── tenant-settings.spec.ts
│   └── branding.spec.ts
├── ai/
│   ├── insights-panel.spec.ts
│   └── analysis.spec.ts
├── alerts/
│   ├── list.spec.ts
│   └── crud.spec.ts
├── audit/
│   ├── log.spec.ts
│   └── detail.spec.ts
├── auth/
│   ├── login.spec.ts        (existing)
│   ├── logout.spec.ts       (existing)
│   ├── register.spec.ts     (existing)
│   ├── mfa-setup.spec.ts
│   ├── mfa-login.spec.ts
│   ├── sso.spec.ts
│   └── oauth-link.spec.ts
├── billing/
│   ├── subscription.spec.ts
│   └── plans.spec.ts
├── export/
│   ├── batch.spec.ts
│   └── scheduled.spec.ts
├── fixtures/
│   └── test-fixtures.ts
├── notifications/
│   ├── center.spec.ts
│   └── preferences.spec.ts
├── onboarding/
│   ├── wizard.spec.ts
│   └── steps.spec.ts
├── opportunities/
│   ├── detail.spec.ts       (existing)
│   ├── filter.spec.ts       (existing)
│   └── search.spec.ts       (existing)
├── portal/
│   ├── dashboard.spec.ts
│   └── widgets.spec.ts
├── reports/
│   ├── builder.spec.ts
│   └── list.spec.ts
├── search/
│   ├── autocomplete.spec.ts
│   └── faceted.spec.ts
└── settings/
    ├── profile.spec.ts
    └── preferences.spec.ts
```

---

## Execution Plan

### Step 1: Claude Code starts first (creates fixtures)
1. Update `e2e/fixtures/test-fixtures.ts` with new page objects
2. Create `e2e/onboarding/` suite
3. Create `e2e/ai/` suite
4. Create `e2e/portal/` suite
5. Create `e2e/admin/roles.spec.ts` and `e2e/admin/users.spec.ts`

### Step 2: Cursor agents run in parallel
**Agent 1:** Billing, Alerts, Notifications, Audit
**Agent 2:** Settings, MFA, SSO, Tenant Admin
**Agent 3:** Reports, Search, Export

### Step 3: Merge and verify
1. All agents commit to feature branches
2. Merge to master
3. Run full E2E suite: `npm run test:e2e`

---

## Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run specific suite
npx playwright test e2e/onboarding/

# Run with UI
npx playwright test --ui

# Generate report
npx playwright show-report
```

---

*Created: 2026-01-26*

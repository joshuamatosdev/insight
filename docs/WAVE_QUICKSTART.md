# Multi-Agent Parallel Development - Quick Start

## Overview

This project uses a multi-agent parallel development strategy with **96 branches** across **6 waves**.

| Component | Branches |
|-----------|----------|
| Claude Code (via git:agent) | 26 branches |
| Cursor (manual) | 70 branches |
| **Total** | **96 branches** |

---

## Quick Commands

```bash
# List all waves and their agents
npm run wave:list

# Show status of Wave 1 branches
npm run wave:status 1

# Get commands to run Wave 1
npm run wave:run 1

# Run a specific agent
npm run git:agent wave1-registration "implement registration flow"

# List all agent branches
npm run git:merge:list

# Merge a branch with verification
npm run git:merge <branch-name>
```

### Alternative Commands (Node v25+)

If npm scripts don't show output, use direct node commands:

```bash
# List waves
node --import=tsx scripts/wave-executor.ts list

# Run wave
node --import=tsx scripts/wave-executor.ts run 1

# Check status
node --import=tsx scripts/wave-executor.ts status 1

# Run agent
node --import=tsx scripts/git-agent-runner.ts wave1-registration "task description"
```

---

## Wave Execution Strategy

### WAVE 1: Foundation (10 branches)

**Claude Code (4 parallel):**
```bash
# Terminal 1
npm run git:agent wave1-registration "implement registration with email verification"

# Terminal 2
npm run git:agent wave1-openapi "setup OpenAPI type generation"

# Terminal 3
npm run git:agent wave1-password-reset "implement password reset flow"

# Terminal 4
npm run git:agent wave1-rbac-core "implement core RBAC system"
```

**Cursor (6 parallel):**
See `docs/CURSOR_MULTI_AGENT_INSTRUCTIONS.md`

---

### WAVE 2: Core Features (23 branches)

**Claude Code (5 parallel):**
```bash
npm run git:agent wave2-rbac-ui "create RBAC admin UI"
npm run git:agent wave2-alerts "implement opportunity alerts"
npm run git:agent wave2-notifications "create notification system"
npm run git:agent wave2-audit-log "implement audit trail"
npm run git:agent wave2-user-prefs "create user preferences"
```

**Cursor (18 parallel):**
- CRM: 10 branches (contacts, organizations, interactions)
- Documents: 8 branches

---

### WAVE 3: Advanced Features (20 branches)

**Claude Code (6 parallel):**
```bash
npm run git:agent wave3-sso-oauth "implement OAuth2 with Google/Microsoft"
npm run git:agent wave3-mfa "implement TOTP multi-factor auth"
npm run git:agent wave3-tenant-admin "create tenant admin portal"
npm run git:agent wave3-search-enhance "integrate Elasticsearch"
npm run git:agent wave3-export-enhance "implement PDF and batch export"
npm run git:agent wave3-dashboard-enhance "add dashboard widgets"
```

---

### WAVE 4: Financial & Analytics (18 branches)

**Claude Code (4 parallel):**
```bash
npm run git:agent wave4-billing "implement Stripe subscription billing"
npm run git:agent wave4-usage-tracking "implement usage tracking"
npm run git:agent wave4-report-builder "create custom report builder"
npm run git:agent wave4-analytics-core "build analytics engine"
```

---

### WAVE 5: Polish & Accessibility (14 branches)

**Claude Code (4 parallel):**
```bash
npm run git:agent wave5-perf-optimize "optimize performance"
npm run git:agent wave5-security-audit "implement security hardening"
npm run git:agent wave5-api-docs "enhance API documentation"
npm run git:agent wave5-error-handling "implement global error handling"
```

---

### WAVE 6: Contractor Portal (11 branches)

**Claude Code (3 parallel):**
```bash
npm run git:agent wave6-onboarding-flow "create onboarding wizard"
npm run git:agent wave6-ai-integration "integrate OpenAI for analysis"
npm run git:agent wave6-portal-dashboard "create contractor dashboard"
```

---

## Merge Order

Each wave follows this merge order:

1. **Entities** (models, repositories) - merge first
2. **Services** - after entities
3. **Controllers/APIs** - after services
4. **Frontend/UI** - after APIs
5. **Tests** - merge last

```bash
# Example Wave 1 merge sequence
npm run git:merge claude/wave1/registration/...
npm run git:merge claude/wave1/openapi/...
npm run git:merge claude/wave1/password-reset/...
npm run git:merge claude/wave1/rbac-core/...
```

---

## Branch Naming

| Agent Type | Pattern |
|------------|---------|
| Claude Code (wave) | `claude/wave{N}/{feature}/{timestamp}-{slug}-{random}` |
| Claude Code (general) | `agent/{agent-name}/{timestamp}-{slug}-{random}` |
| Cursor | `cursor/wave{N}/{feature}` |

---

## File Boundaries

### Claude Code ONLY
- `SecurityConfig.java`
- `AuthController.java`
- `AuthenticationService.java`
- `LoginPage.tsx`
- `App.tsx`
- All auth-related code

### Cursor ONLY
- CRM entities/pages
- Document entities/pages
- Compliance entities/pages
- Financial entities/pages
- Most new domain features

---

## Verification (MANDATORY)

Before merging ANY branch:

```bash
# Backend
./gradlew build

# Frontend
cd sam-dashboard
npx tsc --noEmit
npm run lint
npm test
```

All checks must pass before merge.

---

## Status Tracking

Update `docs/PARALLEL_DEVELOPMENT_TRACKER.md` as work progresses:

- ⬜ Not Started
- 🟡 In Progress
- ✅ Complete
- ❌ Blocked

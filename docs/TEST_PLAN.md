# SAMGov Test Plan - Slice-Based TDD

## Testing Methodology

### Core Principles
1. **We only test behavior** - Not internals
2. **No integration tests** - Use E2E for integration scenarios
3. **Real database** - Use dev PostgreSQL via Testcontainers, never in-memory
4. **Slice-based development** - Backend → Frontend → E2E

### The Slice Pattern

```
Backend Slice → TDD → RGR (Red-Green-Refactor)
↓
Check: Is SQL/migration needed? → Apply to dev PostgreSQL
↓
Double-check with subagent verification
↓
All backend unit tests must pass
↓
Generate TypeScript from OpenAPI
↓
Frontend Slice → API calls TDD → Components TDD
↓
Double-check with subagent verification
↓
All frontend unit tests must pass
↓
Write E2E Playwright tests (don't run yet)
↓
After phase complete → Run all E2E tests
```

---

## Phase Structure

### Phase 1: Foundation (Auth & Multi-Tenancy)
| Slice | Backend | Frontend | E2E |
|-------|---------|----------|-----|
| 1.1 Auth - Login | AuthController, AuthenticationService, JwtService | LoginPage, auth service, AuthContext | Login flow |
| 1.2 Auth - Register | AuthController (register) | RegisterPage | Registration flow |
| 1.3 Auth - Session | SessionController, SessionService | Token refresh, logout | Session management |
| 1.4 User Management | UserController, UserService | User list/edit (future) | User CRUD |
| 1.5 Tenant Management | TenantController, TenantService | Tenant context | Tenant isolation |

### Phase 2: Opportunity Discovery
| Slice | Backend | Frontend | E2E |
|-------|---------|----------|-----|
| 2.1 Opportunity Search | OpportunityController, OpportunityService | FilterBar, OpportunityList | Search & filter |
| 2.2 Opportunity Detail | OpportunityController (getById) | OpportunityCard | View details |
| 2.3 Saved Opportunities | SavedOpportunityController | Bookmark feature | Save/unsave |
| 2.4 SBIR Awards | SbirController, SbirIngestionService | SBIRAwardsPage | SBIR data |

### Phase 3: Pipeline & Contracts
| Slice | Backend | Frontend | E2E |
|-------|---------|----------|-----|
| 3.1 Pipeline | PipelineController, PipelineService | Pipeline board (future) | Pipeline flow |
| 3.2 Contract CRUD | ContractController, ContractService | Contract list (future) | Contract management |
| 3.3 Invoicing | InvoiceController, InvoiceService | Invoice list (future) | Invoice flow |

### Phase 4: Compliance & Reporting
| Slice | Backend | Frontend | E2E |
|-------|---------|----------|-----|
| 4.1 Compliance | ComplianceController | Compliance dashboard | Compliance tracking |
| 4.2 Audit | AuditController, AuditService | Audit log view | Audit trail |
| 4.3 Reports | ReportController | Report builder | Report generation |

---

## Completion Criteria

| Checkpoint | Requirement |
|------------|-------------|
| Backend slice done | All backend unit tests pass |
| Frontend slice done | All frontend unit tests pass |
| Phase done | All E2E tests pass |

---

## Test File Structure

### Backend (Java)
```
src/test/java/com/samgov/ingestor/
├── controller/
│   ├── AuthControllerTest.java
│   ├── OpportunityControllerTest.java
│   └── ...
├── service/
│   ├── AuthenticationServiceTest.java
│   ├── OpportunityServiceTest.java
│   └── ...
├── repository/
│   └── (repository tests with Testcontainers)
└── TestConfig.java (shared test configuration)
```

### Frontend (TypeScript)
```
sam-dashboard/src/
├── services/
│   ├── api.test.ts
│   └── auth.test.ts
├── auth/
│   ├── AuthProvider.test.tsx
│   └── useAuth.test.tsx
├── pages/
│   ├── LoginPage.test.tsx
│   └── DashboardPage.test.tsx
└── components/
    └── (already have some tests)
```

### E2E (Playwright)
```
sam-dashboard/e2e/
├── auth/
│   ├── login.spec.ts
│   └── register.spec.ts
├── opportunities/
│   ├── search.spec.ts
│   └── filter.spec.ts
└── playwright.config.ts
```

---

## Current Status

### Backend
- [ ] Test infrastructure setup (Testcontainers, base classes)
- [ ] Phase 1 slices
- [ ] Phase 2 slices
- [ ] Phase 3 slices
- [ ] Phase 4 slices

### Frontend
- [x] Test infrastructure exists (Vitest)
- [x] Some component tests exist
- [ ] Service tests
- [ ] Auth tests
- [ ] Page tests

### E2E
- [ ] Playwright setup
- [ ] Phase 1 E2E
- [ ] Phase 2 E2E
- [ ] Phase 3 E2E
- [ ] Phase 4 E2E

---

## OpenAPI Type Generation

1. Backend already has springdoc-openapi configured
2. Generate spec at `/v3/api-docs`
3. Use `openapi-typescript` to generate frontend types
4. Script: `npm run generate:types`

---

*Last Updated: 2026-01-26*

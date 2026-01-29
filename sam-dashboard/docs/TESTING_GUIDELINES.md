# Testing Guidelines - SAMGov Frontend

## Testing Philosophy: No Mock Data Policy

**CRITICAL**: Frontend tests must use REAL API calls to the backend, NOT mock data.

This policy ensures:
- ✅ Integration validation across the full stack
- ✅ Real-world error detection (serialization, CORS, contracts)
- ✅ Type safety validation at runtime
- ❌ No false positives from passing mocked tests

## Test Architecture

### Two-Tier Testing Strategy

#### Tier 1: Backend E2E Tests (Java)
**Location**: `backend/src/test/java/.../e2e/`

**Purpose**: Validate full stack integration (HTTP → Service → Database)

**What They Test**:
- All API endpoints with real PostgreSQL database
- Authentication and authorization
- Multi-tenant data isolation
- Request/response serialization
- Business logic validation
- Error cases (400, 401, 404, 500)

**Example**: `AnalyticsE2ETest.java`
```java
@Test
void shouldReturnDashboardStats() throws Exception {
    createTestAnalyticsEvents();

    performGet("/api/analytics/dashboard")
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.opportunitiesViewed").isNumber())
        .andExpect(jsonPath("$.pipelineValue").isNumber());
}
```

#### Tier 2: Frontend Contract Tests (TypeScript)
**Location**: `sam-dashboard/src/services/*.test.ts`, `sam-dashboard/src/hooks/*.test.ts`

**Purpose**: Validate client-side logic and type contracts

**What They Test**:
- TypeScript type definitions match runtime schemas
- URL construction and parameter handling
- Error handling logic
- State management (hooks)
- Request body serialization

**Example**: `analyticsService.test.ts`
```typescript
describe('analyticsService - Contract Validation', () => {
    it('matches backend contract schema', () => {
        const stats: DashboardStats = {...};
        const result = DashboardStatsSchema.safeParse(stats);
        expect(result.success).toBe(true);
    });
});
```

## What To Mock vs What NOT To Mock

### ✅ ALLOWED TO MOCK (External APIs Only)

| Service | Mock? | Why |
|---------|-------|-----|
| Stripe API | ✅ YES | Don't charge real money in tests |
| AWS S3 | ✅ YES | Avoid cloud costs and external dependencies |
| SendGrid | ✅ YES | Don't send real emails |
| External webhooks | ✅ YES | Can't control third-party services |

**Use Mock Service Worker (MSW)** for external API mocking:
```typescript
import {rest} from 'msw';
import {setupServer} from 'msw/node';

const server = setupServer(
    rest.post('https://api.stripe.com/v1/charges', (req, res, ctx) => {
        return res(ctx.json({id: 'ch_test', status: 'succeeded'}));
    })
);
```

### ❌ FORBIDDEN TO MOCK (Internal Backend APIs)

| Pattern | Status | Alternative |
|---------|--------|-------------|
| `global.fetch = vi.fn()` | ❌ FORBIDDEN | Backend E2E tests |
| `vi.mock('../services/api')` | ❌ FORBIDDEN | Contract tests with Zod |
| `mockResolvedValue(mockData)` | ❌ FORBIDDEN | Real API calls or E2E tests |
| Mock localStorage | ❌ FORBIDDEN | Use real localStorage in tests |
| Mock database | ❌ FORBIDDEN | Use test database (localhost:5433) |

## Service Layer Tests

### Purpose
Validate that service functions construct correct URLs, headers, and request bodies.

### Pattern: Contract Validation with Zod

```typescript
import {z} from 'zod';

// Define schema
const DashboardStatsSchema = z.object({
    opportunitiesViewed: z.number(),
    opportunitiesSaved: z.number(),
    pipelineValue: z.number(),
    winRate: z.number().nullable(),
});

describe('analyticsService - Contract Validation', () => {
    describe('fetchDashboardStats', () => {
        it('matches backend contract schema', () => {
            const stats: DashboardStats = {
                opportunitiesViewed: 142,
                opportunitiesSaved: 38,
                pipelineValue: 2500000,
                winRate: 32.5,
            };

            // Validate TypeScript type matches Zod schema
            const result = DashboardStatsSchema.safeParse(stats);
            expect(result.success).toBe(true);
        });
    });

    describe('Error handling', () => {
        it('throws descriptive error on non-OK response', () => {
            const response = {ok: false, statusText: 'Internal Server Error'};

            expect(() => {
                if (response.ok === false) {
                    throw new Error(`Failed: ${response.statusText}`);
                }
            }).toThrow('Failed: Internal Server Error');
        });
    });
});
```

### What To Test

- ✅ **Type Contracts**: Zod schemas validate TypeScript types match runtime
- ✅ **Error Logic**: Test error message construction without mocking
- ✅ **URL Construction**: Verify correct endpoints are used
- ❌ **NOT**: Mock fetch to test actual HTTP calls (use backend E2E instead)

## Hook Layer Tests

### Purpose
Validate React hook state management and lifecycle behavior.

### Pattern: State Management Only

```typescript
describe('useAnalyticsDashboard - State Management', () => {
    describe('Loading states', () => {
        it('initializes with loading=true', () => {
            const {result} = renderHook(() => useAnalyticsDashboard());

            expect(result.current.isLoading).toBe(true);
            expect(result.current.stats).toBe(null);
            expect(result.current.activities).toEqual([]);
        });
    });

    describe('Refresh functionality', () => {
        it('provides refresh callback', () => {
            const {result} = renderHook(() => useAnalyticsDashboard());

            expect(typeof result.current.refresh).toBe('function');
        });
    });

    describe('Hook return shape', () => {
        it('returns all expected properties', () => {
            const {result} = renderHook(() => useAnalyticsDashboard());

            expect(result.current).toHaveProperty('stats');
            expect(result.current).toHaveProperty('activities');
            expect(result.current).toHaveProperty('isLoading');
            expect(result.current).toHaveProperty('error');
            expect(result.current).toHaveProperty('refresh');
        });
    });
});
```

### What To Test

- ✅ **Initial State**: Verify default values on mount
- ✅ **Return Shape**: Ensure hook returns expected properties
- ✅ **Callback Existence**: Verify callbacks are functions
- ❌ **NOT**: Mock services to test async behavior (use E2E instead)

## Component Tests

### Purpose
Validate React component rendering and user interactions.

### Pattern: User-Centric Testing

```typescript
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('AnalyticsDashboardPage', () => {
    it('renders dashboard title', () => {
        render(<AnalyticsDashboardPage />);

        expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    });

    it('shows loading state initially', () => {
        render(<AnalyticsDashboardPage />);

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('calls refresh on button click', async () => {
        const user = userEvent.setup();
        render(<AnalyticsDashboardPage />);

        const refreshButton = screen.getByRole('button', {name: /refresh/i});
        await user.click(refreshButton);

        // Verify UI updates (not service calls)
    });
});
```

### What To Test

- ✅ **Rendering**: Component displays correctly
- ✅ **User Interactions**: Buttons, forms, clicks work
- ✅ **Conditional Rendering**: Loading/error/success states
- ❌ **NOT**: Mock services (use E2E tests for integration)

## Zod Schemas for Contract Validation

All analytics types have corresponding Zod schemas at:
**Location**: `sam-dashboard/src/test/schemas/analytics.schema.ts`

### Available Schemas

- `DashboardStatsSchema` - Dashboard metrics
- `ActivityItemSchema` - Activity feed entries
- `TopPerformerSchema` - Top performers data
- `AnalyticsEventSchema` - Analytics events
- `TrackEventRequestSchema` - Event tracking requests
- Plus 10+ more comprehensive schemas

### Usage Example

```typescript
import {DashboardStatsSchema} from '@/test/schemas/analytics.schema';

it('validates DashboardStats type', () => {
    const stats: DashboardStats = {...};

    const result = DashboardStatsSchema.safeParse(stats);

    expect(result.success).toBe(true);
    if (result.success === false) {
        console.log('Validation errors:', result.error.issues);
    }
});
```

## Running Tests

### Frontend Tests
```bash
cd sam-dashboard

# Run all tests
npm test

# Run specific test file
npm test -- analyticsService.test.ts

# Run with coverage
npm test -- --coverage

# Type checking
npx tsc --noEmit

# Linting
npm run lint
```

### Backend E2E Tests
```bash
cd backend

# Run all E2E tests
./gradlew test --tests "*E2ETest"

# Run specific E2E test
./gradlew test --tests "AnalyticsE2ETest"
```

## Writing New Tests

### Checklist for Service Tests

- [ ] Create Zod schema if type doesn't have one
- [ ] Test TypeScript type matches Zod schema
- [ ] Test error handling logic (without mocking)
- [ ] Verify URL construction
- [ ] NO `vi.mock()` or `global.fetch = vi.fn()`

### Checklist for Hook Tests

- [ ] Test initial state values
- [ ] Test hook return shape
- [ ] Test callback existence
- [ ] NO `vi.mock()` of services
- [ ] Focus on state management only

### Checklist for Component Tests

- [ ] Test component renders
- [ ] Test user interactions
- [ ] Test conditional rendering (loading, error, success)
- [ ] Use semantic queries (`getByRole`, `getByLabelText`)
- [ ] NO hardcoded strings (use constants)

## Test File Organization

```
sam-dashboard/src/
├── services/
│   ├── analyticsService.ts
│   └── analyticsService.test.ts       # Contract validation
├── hooks/
│   ├── useAnalytics.ts
│   └── useAnalytics.test.ts           # State management
├── components/
│   └── domain/
│       └── MetricCard/
│           ├── MetricCard.tsx
│           └── MetricCard.test.tsx    # Component behavior
└── test/
    └── schemas/
        └── analytics.schema.ts        # Zod schemas
```

## Verification Commands

### Check for Prohibited Mocking

```bash
# Should return NO matches
grep -r "vi.mock\|vi.fn\|mockResolvedValue" src/**/*.test.ts
```

### Verify All Tests Pass

```bash
npm test && npx tsc --noEmit && npm run lint
```

Expected output: All tests pass, no type errors, no lint errors.

## Common Pitfalls

### ❌ DON'T: Mock Internal APIs

```typescript
// WRONG - mocks internal backend
global.fetch = vi.fn();
(fetch as vi.Mock).mockResolvedValue({ok: true, json: async () => mockData});
```

### ✅ DO: Contract Validation

```typescript
// RIGHT - validates type contracts
const result = DashboardStatsSchema.safeParse(stats);
expect(result.success).toBe(true);
```

### ❌ DON'T: Test Implementation Details

```typescript
// WRONG - tests how (implementation)
expect(fetchDashboardStats).toHaveBeenCalledWith('/api/analytics/dashboard');
```

### ✅ DO: Test Behavior

```typescript
// RIGHT - tests what (behavior)
it('returns all expected properties', () => {
    const {result} = renderHook(() => useAnalyticsDashboard());
    expect(result.current).toHaveProperty('stats');
});
```

## When To Use Each Test Type

| Scenario | Test Type | Location |
|----------|-----------|----------|
| Test full API integration | Backend E2E | `backend/.../e2e/` |
| Validate type contracts | Frontend Contract | `sam-dashboard/src/services/*.test.ts` |
| Test React state management | Frontend Hook | `sam-dashboard/src/hooks/*.test.ts` |
| Test component rendering | Frontend Component | `sam-dashboard/src/components/**/*.test.tsx` |
| Test user interactions | Frontend Component | `sam-dashboard/src/components/**/*.test.tsx` |
| Validate external API mocks | Frontend Integration | Use MSW |

## Additional Resources

- **Backend E2E Tests README**: `backend/src/test/java/com/samgov/ingestor/e2e/README.md`
- **Zod Documentation**: https://zod.dev
- **Testing Library**: https://testing-library.com
- **Vitest**: https://vitest.dev
- **CLAUDE.md Testing Policy**: `C:\Projects\SAMGov\CLAUDE.md` (Search for "TESTING STRATEGY")

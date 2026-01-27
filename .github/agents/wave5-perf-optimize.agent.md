---
name: "wave5-perf-optimize"
description: "Wave 5: Performance Optimization - Query optimization, caching, and lazy loading."
tools: ['vscode', 'execute', 'read', 'edit', 'search']
model: 'inherit'
permissionMode: 'default'
---
## Mission

Optimize application performance through query optimization, strategic caching, and lazy loading.

## Branch

`claude/wave5/perf-optimize`

## Scope

### Backend Optimizations
- Add database indexes
- Optimize N+1 queries with `@EntityGraph`
- Add Redis caching for hot data
- Implement query result caching
- Add connection pooling tuning

### Frontend Optimizations
- React.memo for heavy components
- useMemo/useCallback optimization
- Lazy loading routes
- Virtual scrolling for large lists
- Image optimization

## Optimization Areas

### 1. Database Indexes
```sql
-- Add to migration or document
CREATE INDEX idx_opportunities_tenant_status ON opportunities(tenant_id, status);
CREATE INDEX idx_opportunities_deadline ON opportunities(response_deadline);
CREATE INDEX idx_contracts_tenant_status ON contracts(tenant_id, status);
```

### 2. Query Optimization
```java
// Before (N+1)
@Query("SELECT o FROM Opportunity o WHERE o.tenant.id = :tenantId")

// After (eager fetch)
@EntityGraph(attributePaths = {"tenant", "savedBy"})
@Query("SELECT o FROM Opportunity o WHERE o.tenant.id = :tenantId")
```

### 3. Caching Strategy
```java
@Cacheable(value = "opportunities", key = "#id")
public OpportunityDTO getById(UUID id) { ... }

@CacheEvict(value = "opportunities", key = "#id")
public void update(UUID id, UpdateRequest request) { ... }
```

### 4. Frontend Lazy Loading
```tsx
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const OpportunitiesPage = lazy(() => import('./pages/OpportunitiesPage'));
```

### 5. Virtual Scrolling
```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

// For lists with 1000+ items
const virtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 50,
});
```

## Metrics to Track

- Page load time (target: < 2s)
- Time to interactive (target: < 3s)
- API response time (target: < 200ms)
- Database query time (target: < 50ms)

## Verification

```bash
./gradlew build && ./gradlew test
cd sam-dashboard && npx tsc --noEmit && npm run lint && npm test
```

## Output

`docs/WAVE5_PERF_OPTIMIZE_COMPLETE.md`

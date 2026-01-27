---
name: "frontend-page"
description: "Frontend Page Agent: Creates React pages following SAMGov component-driven architecture."
tools: ['vscode', 'execute', 'read', 'edit', 'search']
model: 'inherit'
permissionMode: 'default'
---
## Mission

Create and maintain React pages for the SAMGov dashboard following established patterns and component-driven architecture.

## Scope (ONLY these paths)

- `sam-dashboard/src/pages/`
- `sam-dashboard/src/hooks/`
- `sam-dashboard/src/services/`

## DO NOT TOUCH

- `App.tsx` (document routes in CRM_ROUTES.md instead)
- Any existing pages (unless explicitly requested)
- Any component files in `components/`

## Patterns to Follow

### Page Pattern

```tsx
import { useMemo, useState } from 'react';
import { Section, SectionHeader, Card, Grid } from '../components/layout';
import { Text, Button } from '../components/primitives';
import { DomainComponent } from '../components/domain';
import { useResourceHook } from '../hooks/useResource';
import { PageProps } from './Pages.types';

export function ResourcePage({ initialData }: ResourcePageProps) {
  const { data, isLoading, error, refresh } = useResourceHook();
  const [filters, setFilters] = useState<FilterState>({ search: '' });

  const filteredData = useMemo(() => {
    // Filtering logic
    return data;
  }, [data, filters]);

  return (
    <Section id="resource-page">
      <SectionHeader title="Resources" icon={<ResourceIcon size="lg" />}>
        <Button onClick={() => setShowModal(true)}>Add Resource</Button>
      </SectionHeader>
      
      <Card>
        <ResourceList data={filteredData} isLoading={isLoading} />
      </Card>
    </Section>
  );
}
```

### Hook Pattern

```tsx
export interface UseResourceReturn {
  data: Resource[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  create: (request: CreateRequest) => Promise<Resource>;
  update: (id: string, request: UpdateRequest) => Promise<Resource>;
  remove: (id: string) => Promise<void>;
}

export function useResource(): UseResourceReturn {
  const [data, setData] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await fetchResources();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, isLoading, error, refresh: loadData, create, update, remove };
}
```

### Service Pattern

```tsx
const API_BASE = '/api/v1';

async function authFetch(url: string, options?: RequestInit): Promise<Response> {
  const headers = { ...getAuthHeaders(), ...options?.headers };
  return fetch(url, { ...options, headers });
}

export async function fetchResources(): Promise<Resource[]> {
  const response = await authFetch(`${API_BASE}/resources`);
  if (response.ok === false) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }
  return response.json();
}
```

## Strict TypeScript Rules

- NO `any` type - use `unknown` with type guards
- Strict boolean checks: `if (x !== null && x !== undefined)` not `if (x)`
- No unchecked indexing: use `.at(0)?.id` not `[0].id`
- Components use layout primitives (no naked HTML)

## Verification

After changes, run:

```bash
cd sam-dashboard
npx tsc --noEmit
npm run lint
npm test
```

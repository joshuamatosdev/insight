---
name: "test-frontend"
description: "Frontend Test Agent: Creates React tests following SAMGov behavioral testing patterns with testing-library."
tools: ['vscode', 'execute', 'read', 'edit', 'search']
model: 'inherit'
permissionMode: 'default'
---
## Mission

Create and maintain React tests for the SAMGov frontend following behavioral testing patterns with @testing-library.

## Scope (ONLY these paths)

- `sam-dashboard/src/pages/**/*.test.tsx`
- `sam-dashboard/src/components/domain/**/*.test.tsx`
- `sam-dashboard/src/hooks/**/*.test.ts`

## DO NOT TOUCH

- Any implementation code
- Test setup files (vitest.config.ts, etc.)

## Patterns to Follow

### Page Test Pattern

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResourcePage } from './ResourcePage';

// Mock data factory
function createMockResource(overrides: Partial<Resource> = {}): Resource {
  return {
    id: '1',
    name: 'Test Resource',
    status: 'ACTIVE',
    createdAt: '2024-01-15',
    ...overrides,
  };
}

describe('ResourcePage', () => {
  describe('Rendering', () => {
    it('should render page heading', () => {
      render(<ResourcePage />);
      expect(screen.getByRole('heading', { name: /resources/i })).toBeInTheDocument();
    });

    it('should render resource list', () => {
      const resources = [createMockResource()];
      render(<ResourcePage initialData={resources} />);
      expect(screen.getByText('Test Resource')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onEdit when edit button clicked', async () => {
      const user = userEvent.setup();
      const handleEdit = vi.fn();
      render(<ResourcePage onEdit={handleEdit} />);

      await user.click(screen.getByRole('button', { name: /edit/i }));
      expect(handleEdit).toHaveBeenCalledTimes(1);
    });
  });

  describe('Empty State', () => {
    it('should show empty message when no resources', () => {
      render(<ResourcePage initialData={[]} />);
      expect(screen.getByText(/no resources found/i)).toBeInTheDocument();
    });
  });
});
```

### Hook Test Pattern

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useResource } from './useResource';
import * as api from '../services/resourceService';

vi.mock('../services/resourceService');

describe('useResource', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch resources on mount', async () => {
    const mockData = [{ id: '1', name: 'Test' }];
    vi.mocked(api.fetchResources).mockResolvedValue(mockData);

    const { result } = renderHook(() => useResource());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('should handle errors', async () => {
    vi.mocked(api.fetchResources).mockRejectedValue(new Error('Failed'));

    const { result } = renderHook(() => useResource());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.data).toEqual([]);
  });
});
```

## Behavioral Testing Rules

**DO Test:**
- User-visible behavior
- Accessibility (roles, labels)
- User interactions
- Component outcomes

**DO NOT Test:**
- Implementation details
- Internal state
- CSS classes
- Private methods

### Good vs Bad

```tsx
// BAD - Tests implementation
expect(component.state.isLoading).toBe(true);
expect(div).toHaveClass('loading-spinner');

// GOOD - Tests behavior
expect(screen.getByRole('status')).toBeInTheDocument();
expect(screen.getByText('Loading...')).toBeInTheDocument();
```

## Accessibility Queries (Preferred Order)

1. `getByRole` - Most preferred
2. `getByLabelText`
3. `getByPlaceholderText`
4. `getByText`
5. `getByTestId` - Last resort

## Verification

After changes, run:

```bash
cd sam-dashboard
npm test
```

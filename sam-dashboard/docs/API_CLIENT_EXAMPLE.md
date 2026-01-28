# Type-Safe API Client Usage Examples

## Basic GET Request

```typescript
import { apiClient } from '@/services/apiClient';

// Automatic type inference!
const { data, error } = await apiClient.GET('/opportunities');

if (error !== undefined) {
  console.error('Failed to fetch opportunities:', error);
  return;
}

// data is typed automatically from OpenAPI spec
console.log(data); // TypeScript knows the exact shape!
```

## GET with Query Parameters

```typescript
const { data, error } = await apiClient.GET('/contracts', {
  params: {
    query: {
      page: 0,
      size: 20,
      status: 'active'
    }
  }
});
```

## GET with Path Parameters

```typescript
const { data, error } = await apiClient.GET('/api-keys/{id}', {
  params: {
    path: {
      id: 'api-key-123'
    }
  }
});
```

## POST Request

```typescript
const { data, error } = await apiClient.POST('/api-keys', {
  body: {
    name: 'Production API Key',
    scopes: ['READ', 'WRITE'],
    expiresAt: '2025-12-31T23:59:59Z'
  }
});

if (error !== undefined) {
  throw new Error('Failed to create API key');
}

// data contains the created API key with secret
console.log('New API key:', data.key);
```

## PUT Request

```typescript
const { data, error } = await apiClient.PUT('/contracts/{id}', {
  params: {
    path: {
      id: 'contract-123'
    }
  },
  body: {
    status: 'completed',
    endDate: '2025-12-31'
  }
});
```

## PATCH Request

```typescript
const { data, error } = await apiClient.PATCH('/users/{id}', {
  params: {
    path: {
      id: 'user-123'
    }
  },
  body: {
    email: 'newemail@example.com'
  }
});
```

## DELETE Request

```typescript
const { data, error } = await apiClient.DELETE('/api-keys/{id}', {
  params: {
    path: {
      id: 'api-key-123'
    }
  }
});

if (error !== undefined) {
  console.error('Failed to delete API key');
}
```

## Error Handling Pattern

```typescript
async function fetchUserData(userId: string) {
  const { data, error, response } = await apiClient.GET('/users/{id}', {
    params: {
      path: { id: userId }
    }
  });

  // Check for errors
  if (error !== undefined) {
    // error is typed based on OpenAPI error responses
    if (response.status === 404) {
      throw new Error('User not found');
    }
    throw new Error(`Failed to fetch user: ${String(error)}`);
  }

  // data is guaranteed to exist here and is fully typed
  return data;
}
```

## React Query Integration

```typescript
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/apiClient';

export function useOpportunities(page: number = 0) {
  return useQuery({
    queryKey: ['opportunities', page],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/opportunities', {
        params: {
          query: { page, size: 20 }
        }
      });

      if (error !== undefined) {
        throw new Error(String(error));
      }

      // Handle paginated response
      return Array.isArray(data) ? data : data.content ?? [];
    }
  });
}
```

## Type Safety Examples

```typescript
// ✅ CORRECT - TypeScript knows this endpoint exists
const { data } = await apiClient.GET('/opportunities');

// ❌ COMPILE ERROR - TypeScript catches wrong path
const { data } = await apiClient.GET('/invalid-endpoint');

// ❌ COMPILE ERROR - TypeScript catches wrong parameter
const { data } = await apiClient.GET('/opportunities', {
  params: {
    query: {
      invalidParam: 'value' // Not in OpenAPI spec!
    }
  }
});

// ✅ CORRECT - TypeScript auto-completes valid parameters
const { data } = await apiClient.GET('/opportunities', {
  params: {
    query: {
      page: 0,      // ✓ Valid
      size: 20,     // ✓ Valid
      status: 'active' // ✓ Valid
    }
  }
});
```

## Migrating Service Functions

### Before (Manual Types)

```typescript
export async function fetchApiKeys(): Promise<ApiKey[]> {
  const response = await apiClient.get<ApiKey[]>('/api-keys');
  if (response.success === false) {
    throw new Error(response.error.message);
  }
  return response.data;
}
```

### After (Auto-Inferred Types)

```typescript
export async function fetchApiKeys() {
  const { data, error } = await apiClient.GET('/api-keys');

  if (error !== undefined) {
    throw new Error(String(error));
  }

  // Return type is automatically inferred!
  return data;
}
```

## Advanced: Custom Headers

```typescript
const { data, error } = await apiClient.GET('/opportunities', {
  params: {
    query: { page: 0 }
  },
  headers: {
    'X-Custom-Header': 'value'
  }
});
```

## Advanced: Streaming Responses

For file downloads or streaming:

```typescript
const { data, error, response } = await apiClient.GET('/files/{id}/download', {
  params: {
    path: { id: 'file-123' }
  },
  parseAs: 'stream' // or 'blob', 'arrayBuffer'
});

if (error !== undefined) {
  throw new Error('Download failed');
}

// data is a ReadableStream
const blob = await response.blob();
```

## Key Takeaways

1. **No manual type annotations** - TypeScript infers everything
2. **Compile-time safety** - Wrong paths/params caught before runtime
3. **IntelliSense support** - Auto-complete for all endpoints and parameters
4. **Consistent error handling** - Check `error !== undefined`
5. **Response access** - Get raw `response` object when needed

# Type-Safe OpenAPI Client

## 📚 Quick Start

### For New Development

Use the type-safe client for all new code:

```typescript
import { apiClient } from '@/services/apiClient';

// Get data - types are automatically inferred!
const { data, error } = await apiClient.GET('/opportunities', {
  params: {
    query: { page: 0, size: 20 }
  }
});

if (error !== undefined) {
  console.error('Failed:', error);
  return;
}

// data is fully typed - IntelliSense knows all fields!
console.log(data);
```

### For Existing Code

Existing services continue to work with legacy methods:

```typescript
import { apiClient } from './apiClient';

// This still works during migration period
const response = await apiClient.get<Opportunity[]>('/opportunities');
```

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [Summary](./OPENAPI_CLIENT_SUMMARY.md) | Overview and accomplishments |
| [Migration Guide](./API_CLIENT_MIGRATION.md) | How to migrate existing services |
| [Usage Examples](./API_CLIENT_EXAMPLE.md) | Code examples and patterns |
| [Implementation Status](./OPENAPI_IMPLEMENTATION_STATUS.md) | Current progress and TODO |

## 🎯 Key Benefits

✅ **100% Type Safety** - Types auto-inferred from OpenAPI spec
✅ **Compile-Time Validation** - Wrong paths/params caught before runtime
✅ **Zero Manual Types** - No more `<T>` type parameters
✅ **IntelliSense Support** - Auto-complete for all endpoints
✅ **API Contract Enforcement** - Frontend stays in sync with backend

## 🚀 Quick Examples

### GET Request
```typescript
const { data, error } = await apiClient.GET('/contracts');
```

### POST Request
```typescript
const { data, error } = await apiClient.POST('/api-keys', {
  body: {
    name: 'My Key',
    scopes: ['READ', 'WRITE']
  }
});
```

### With Parameters
```typescript
const { data, error } = await apiClient.GET('/contracts/{id}', {
  params: {
    path: { id: 'contract-123' },
    query: { include: 'details' }
  }
});
```

### React Query Hook
```typescript
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/apiClient';

export function useContracts(page: number = 0) {
  return useQuery({
    queryKey: ['contracts', page],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/contracts', {
        params: { query: { page } }
      });

      if (error !== undefined) {
        throw new Error(String(error));
      }

      return data;
    }
  });
}
```

## 📋 Status

**Phase 1**: ✅ Complete
- Type-safe client implemented
- Backward compatibility maintained
- All tests passing
- Documentation created

**Phase 2**: 🔄 In Progress
- Migrating services to type-safe client
- See [Implementation Status](./OPENAPI_IMPLEMENTATION_STATUS.md)

## 🔧 Commands

```bash
# Regenerate types from backend
npm run generate:types

# Type check
npx tsc --noEmit

# Run tests
npm test

# Lint
npm run lint
```

## 📞 Need Help?

- Read the [Migration Guide](./API_CLIENT_MIGRATION.md)
- Check [Usage Examples](./API_CLIENT_EXAMPLE.md)
- Review [OpenAPI Spec](http://localhost:8080/v3/api-docs)
- Browse [Swagger UI](http://localhost:8080/swagger-ui.html)

## 🎉 Success!

The type-safe API client is ready for use. All new development should use the openapi-fetch client for automatic type inference and compile-time safety.

---
name: "frontend-component"
description: "Frontend Component Agent: Creates React domain components following SAMGov component-driven architecture."
tools: ['vscode', 'execute', 'read', 'edit', 'search']
model: 'inherit'
permissionMode: 'default'
---
## Mission

Create and maintain React domain components for the SAMGov dashboard following established patterns and no-naked-HTML architecture.

## Scope (ONLY these paths)

- `sam-dashboard/src/components/domain/`

## DO NOT TOUCH

- `sam-dashboard/src/components/primitives/` (unless adding new primitives)
- `sam-dashboard/src/components/layout/`
- Any page files

## Patterns to Follow

### Component Structure

Each component should have:
- `ComponentName.tsx` - Main component
- `ComponentName.types.ts` - Types and interfaces
- `index.ts` - Barrel export

### Component Pattern

```tsx
// ResourceCard.types.ts
import { CSSProperties, ReactNode } from 'react';

export interface Resource {
  id: string;
  name: string;
  status: ResourceStatus;
  createdAt: string;
}

export type ResourceStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export interface ResourceCardProps {
  resource: Resource;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
  style?: CSSProperties;
}
```

```tsx
// ResourceCard.tsx
import { Card, CardHeader, CardBody, HStack } from '../../layout';
import { Text, Badge, Button } from '../../primitives';
import { ResourceCardProps } from './ResourceCard.types';

export function ResourceCard({ 
  resource, 
  onEdit, 
  onDelete,
  className,
  style 
}: ResourceCardProps) {
  const handleEdit = (): void => {
    if (onEdit !== undefined) {
      onEdit(resource.id);
    }
  };

  return (
    <Card className={className} style={style}>
      <CardHeader>
        <HStack justify="between" align="center">
          <Text variant="heading5">{resource.name}</Text>
          <Badge color={getStatusColor(resource.status)}>
            {resource.status}
          </Badge>
        </HStack>
      </CardHeader>
      <CardBody>
        <Text size="sm" color="muted">
          Created: {formatDate(resource.createdAt)}
        </Text>
      </CardBody>
    </Card>
  );
}
```

### NO NAKED HTML

**FORBIDDEN:**
```tsx
<div className="flex items-center">
<span className="text-sm">
<main className="p-4">
```

**REQUIRED:**
```tsx
<HStack align="center">
<Text size="sm">
<Section>
```

### Available Layout/Primitive Components

| Category | Components |
|----------|------------|
| Layout | `Section`, `Card`, `Grid`, `Flex`, `Stack`, `HStack` |
| Typography | `Text`, `Badge` |
| Form | `Input`, `Select`, `Button` |
| Data | `Table`, `TableRow`, `TableCell` |

## Strict TypeScript Rules

- NO `any` type - use `unknown` with type guards
- Strict boolean checks: `if (x !== null && x !== undefined)` not `if (x)`
- No unchecked indexing: use `.at(0)?.id` not `[0].id`
- Types in separate `.types.ts` files

## Verification

After changes, run:

```bash
cd sam-dashboard
npx tsc --noEmit
npm run lint
npm test
```

# GitHub Copilot Instructions - Insight Contract Intelligence Platform

## Tailwind Component Design Pattern

### Layout Abstraction
Always use typed layout components instead of raw Tailwind:

```tsx
// ❌ Never do this in pages
<div className="grid grid-cols-3 gap-6">

// ✅ Always do this
<Grid columns={3} gap="lg">
  <GridItem colSpan={2}>Content</GridItem>
  <GridItem colSpan={1}>Sidebar</GridItem>
</Grid>
```

### Semantic Size Tokens
Use: `none`, `xs`, `sm`, `md`, `lg`, `xl`, `2xl`

### Semantic Color Tokens
| Raw (banned) | Semantic (use this) |
|--------------|---------------------|
| `text-emerald-*` | `text-success` |
| `text-rose-*` | `text-danger` |
| `text-amber-*` | `text-warning` |
| `text-cyan-*` | `text-accent` |
| `bg-zinc-*` | `bg-surface-*` |

## TypeScript Patterns

### Strict Booleans
```tsx
// Wrong
if (data) { }

// Right
if (data !== undefined && data !== null) { }
```

### Safe Array Access
```tsx
// Wrong
items[0].id

// Right
items.at(0)?.id
```

### No Any
Use `unknown` with type guards, never `any`.

## Component Architecture

### Catalyst UI Kit
Primary component library in `src/components/catalyst/`.
Use: `Card`, `Button`, `Input`, `Select`, `Dialog`, `Table`, `PageHeading`, etc.

### Layout Components
From `src/components/layout/`:
- `Grid`, `GridItem` - CSS Grid
- `Stack`, `HStack`, `VStack` - Flexbox
- `AppLayout`, `Sidebar`

### Raw HTML Restrictions
Raw HTML + Tailwind only allowed in:
- `components/catalyst/`
- `components/layout/`
- `components/ui/`

Pages and domain components must use abstractions.

## Testing
- Behavioral tests only (no implementation details)
- Use `screen.getByRole()` not `getByClass()`
- Run: `npm test`, `npx tsc --noEmit`, `npm run lint`

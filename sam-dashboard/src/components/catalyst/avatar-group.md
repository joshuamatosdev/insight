# AvatarGroup

A component that displays multiple avatars in an overlapping group, with optional overflow indicator.

## Usage

```tsx
import { Avatar, AvatarGroup } from '@/components/catalyst'

export function TeamMembers() {
  return (
    <AvatarGroup max={3}>
      <Avatar src="/user1.jpg" alt="Alice Brown" />
      <Avatar src="/user2.jpg" alt="Charlie Davis" />
      <Avatar src="/user3.jpg" alt="Emma Foster" />
      <Avatar src="/user4.jpg" alt="George Harris" />
    </AvatarGroup>
  )
}
```

## Props

### AvatarGroup

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `max` | `number` | `undefined` | Maximum number of avatars to display. Shows overflow indicator if exceeded. |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Size of the avatars in the group. |
| `className` | `string` | `undefined` | Additional CSS classes to apply to the container. |
| `children` | `ReactNode` | `undefined` | Avatar components to display in the group. |

## Features

- **Overlapping avatars**: Avatars overlap with negative margin for compact display
- **Overflow indicator**: Shows "+N" badge when more avatars exist than the max limit
- **Size variants**: Supports sm, md (default), lg, and xl sizes
- **Ring separation**: Adds white/dark ring around each avatar for visual separation
- **Responsive**: Works across different screen sizes

## Examples

### Basic Avatar Group

```tsx
<AvatarGroup>
  <Avatar initials="AB" alt="Alice Brown" />
  <Avatar initials="CD" alt="Charlie Davis" />
  <Avatar initials="EF" alt="Emma Foster" />
</AvatarGroup>
```

### Limited Display with Overflow

```tsx
<AvatarGroup max={3}>
  <Avatar initials="AB" alt="Alice Brown" />
  <Avatar initials="CD" alt="Charlie Davis" />
  <Avatar initials="EF" alt="Emma Foster" />
  <Avatar initials="GH" alt="George Harris" />
  <Avatar initials="IJ" alt="Isabella Jones" />
</AvatarGroup>
// Shows 3 avatars + "+2" indicator
```

### Different Sizes

```tsx
{/* Small */}
<AvatarGroup size="sm">
  <Avatar initials="AB" />
  <Avatar initials="CD" />
</AvatarGroup>

{/* Medium (default) */}
<AvatarGroup size="md">
  <Avatar initials="AB" />
  <Avatar initials="CD" />
</AvatarGroup>

{/* Large */}
<AvatarGroup size="lg">
  <Avatar initials="AB" />
  <Avatar initials="CD" />
</AvatarGroup>

{/* Extra Large */}
<AvatarGroup size="xl">
  <Avatar initials="AB" />
  <Avatar initials="CD" />
</AvatarGroup>
```

### With Images

```tsx
<AvatarGroup max={4}>
  <Avatar src="/avatars/user1.jpg" alt="User 1" />
  <Avatar src="/avatars/user2.jpg" alt="User 2" />
  <Avatar src="/avatars/user3.jpg" alt="User 3" />
  <Avatar src="/avatars/user4.jpg" alt="User 4" />
  <Avatar src="/avatars/user5.jpg" alt="User 5" />
</AvatarGroup>
```

## Accessibility

- Overflow indicator includes `aria-label` describing the number of hidden users
- Each Avatar should have descriptive `alt` text
- Supports keyboard navigation through focus management

## Design Patterns

This component follows the Catalyst UI Kit design patterns:

- **Compound components**: Works with the Avatar component
- **Colocated types**: TypeScript types defined in the same file
- **clsx composition**: Uses clsx for conditional class application
- **Semantic sizing**: Consistent size scale (sm, md, lg, xl)

## Size Reference

| Size | Container | Overflow Badge |
|------|-----------|----------------|
| `sm` | 32px (2rem) | 32px with text-xs |
| `md` | 40px (2.5rem) | 40px with text-sm |
| `lg` | 48px (3rem) | 48px with text-base |
| `xl` | 56px (3.5rem) | 56px with text-lg |

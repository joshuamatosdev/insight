# Breadcrumbs Component

A navigation component that shows the current page's location within a hierarchical structure.

## Usage

```tsx
import { Breadcrumbs, BreadcrumbItem } from '@/components/catalyst'

function MyPage() {
  return (
    <Breadcrumbs>
      <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
      <BreadcrumbItem href="/projects/123" current={true}>
        Project Nero
      </BreadcrumbItem>
    </Breadcrumbs>
  )
}
```

## Components

### Breadcrumbs

The container component for breadcrumb navigation.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `separator` | `'slash' \| 'chevron' \| 'arrow'` | `'chevron'` | Visual separator between items |
| `showHome` | `boolean` | `true` | Show home icon as first item |
| `homeHref` | `string` | `'/'` | URL for home link |
| `className` | `string` | - | Additional CSS classes |
| `children` | `ReactNode` | - | BreadcrumbItem components |

### BreadcrumbItem

Individual breadcrumb item.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `href` | `string` | - | Link URL (optional) |
| `current` | `boolean` | `false` | Mark as current page |
| `separator` | `'slash' \| 'chevron' \| 'arrow'` | `'chevron'` | Override separator style |
| `className` | `string` | - | Additional CSS classes |
| `children` | `ReactNode` | - | Item content |

## Examples

### Basic Usage

```tsx
<Breadcrumbs>
  <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>
  <BreadcrumbItem href="/projects/123" current={true}>
    Project Nero
  </BreadcrumbItem>
</Breadcrumbs>
```

### Different Separators

#### Slash

```tsx
<Breadcrumbs separator="slash">
  <BreadcrumbItem href="/contracts" separator="slash">Contracts</BreadcrumbItem>
  <BreadcrumbItem separator="slash" current={true}>Details</BreadcrumbItem>
</Breadcrumbs>
```

#### Arrow

```tsx
<Breadcrumbs separator="arrow">
  <BreadcrumbItem href="/opportunities" separator="arrow">Opportunities</BreadcrumbItem>
  <BreadcrumbItem separator="arrow" current={true}>Details</BreadcrumbItem>
</Breadcrumbs>
```

### Without Home Link

```tsx
<Breadcrumbs showHome={false}>
  <BreadcrumbItem href="/settings">Settings</BreadcrumbItem>
  <BreadcrumbItem current={true}>Profile</BreadcrumbItem>
</Breadcrumbs>
```

### Custom Home URL

```tsx
<Breadcrumbs homeHref="/dashboard">
  <BreadcrumbItem href="/financial">Financial</BreadcrumbItem>
  <BreadcrumbItem current={true}>Invoices</BreadcrumbItem>
</Breadcrumbs>
```

### Non-Link Current Item

For the current page, you can omit the `href` to render a non-interactive span:

```tsx
<Breadcrumbs>
  <BreadcrumbItem href="/compliance">Compliance</BreadcrumbItem>
  <BreadcrumbItem current={true}>Current Page</BreadcrumbItem>
</Breadcrumbs>
```

## Accessibility

- Uses semantic HTML (`<nav>`, `<ol>`, `<li>`)
- Includes `aria-label="Breadcrumb"` on navigation
- Marks current page with `aria-current="page"`
- Home icon includes `<span class="sr-only">Home</span>` for screen readers
- All separators have `aria-hidden="true"` to avoid clutter

## Styling

The component uses Tailwind CSS classes and includes dark mode support:

- Light mode: Gray scale colors
- Dark mode: Adjusted colors with `dark:` variants
- Hover states on all interactive elements
- Proper text sizing and spacing

## Integration with React Router

The component uses the `Link` component from `@/components/catalyst/link`, which automatically handles React Router integration for internal links.

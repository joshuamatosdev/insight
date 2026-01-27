# ButtonGroup Component

A compound component for creating groups of related buttons with seamless styling.

## Components

- `ButtonGroup` - Container component for grouping buttons
- `ButtonGroupItem` - Individual button within a group

## Features

- **Automatic corner rounding** - First/last buttons get appropriate rounded corners
- **Variant support** - `solid` (default) or `outline` styles
- **Size options** - `sm`, `md` (default), or `lg`
- **Icon support** - Buttons can contain icons with or without text
- **Disabled state** - Individual buttons can be disabled
- **Accessible** - Uses `role="group"` and supports `aria-label`
- **TypeScript** - Fully typed with colocated type definitions
- **Dark mode** - Built-in dark mode support

## Usage

### Basic Usage

```tsx
import { ButtonGroup, ButtonGroupItem } from '@/components/catalyst/button-group'

<ButtonGroup aria-label="Select time period">
  <ButtonGroupItem>Years</ButtonGroupItem>
  <ButtonGroupItem>Months</ButtonGroupItem>
  <ButtonGroupItem>Days</ButtonGroupItem>
</ButtonGroup>
```

### Outline Variant

```tsx
<ButtonGroup variant="outline">
  <ButtonGroupItem>Option 1</ButtonGroupItem>
  <ButtonGroupItem>Option 2</ButtonGroupItem>
  <ButtonGroupItem>Option 3</ButtonGroupItem>
</ButtonGroup>
```

### Different Sizes

```tsx
// Small
<ButtonGroup size="sm">
  <ButtonGroupItem>Small 1</ButtonGroupItem>
  <ButtonGroupItem>Small 2</ButtonGroupItem>
</ButtonGroup>

// Medium (default)
<ButtonGroup size="md">
  <ButtonGroupItem>Medium 1</ButtonGroupItem>
  <ButtonGroupItem>Medium 2</ButtonGroupItem>
</ButtonGroup>

// Large
<ButtonGroup size="lg">
  <ButtonGroupItem>Large 1</ButtonGroupItem>
  <ButtonGroupItem>Large 2</ButtonGroupItem>
</ButtonGroup>
```

### With Icons

```tsx
import { ListBulletIcon, Squares2X2Icon } from '@heroicons/react/20/solid'

// Icon only
<ButtonGroup variant="outline" size="sm">
  <ButtonGroupItem icon={<ListBulletIcon className="size-4" />} aria-label="List view" />
  <ButtonGroupItem icon={<Squares2X2Icon className="size-4" />} aria-label="Grid view" />
</ButtonGroup>

// Icon with text
<ButtonGroup>
  <ButtonGroupItem icon={<ChevronLeftIcon className="size-4" />}>
    Previous
  </ButtonGroupItem>
  <ButtonGroupItem icon={<ChevronRightIcon className="size-4" />}>
    Next
  </ButtonGroupItem>
</ButtonGroup>
```

### With Disabled Button

```tsx
<ButtonGroup>
  <ButtonGroupItem>Enabled</ButtonGroupItem>
  <ButtonGroupItem disabled>Disabled</ButtonGroupItem>
  <ButtonGroupItem>Enabled</ButtonGroupItem>
</ButtonGroup>
```

### With Click Handlers

```tsx
<ButtonGroup variant="outline">
  <ButtonGroupItem onClick={() => handleFilter('all')}>All</ButtonGroupItem>
  <ButtonGroupItem onClick={() => handleFilter('active')}>Active</ButtonGroupItem>
  <ButtonGroupItem onClick={() => handleFilter('completed')}>Completed</ButtonGroupItem>
</ButtonGroup>
```

### Pagination Example

```tsx
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'

<ButtonGroup variant="outline">
  <ButtonGroupItem
    icon={<ChevronLeftIcon className="size-4" />}
    onClick={handlePrevious}
    disabled={currentPage === 1}
  >
    Previous
  </ButtonGroupItem>
  <ButtonGroupItem onClick={() => handlePage(1)}>1</ButtonGroupItem>
  <ButtonGroupItem onClick={() => handlePage(2)}>2</ButtonGroupItem>
  <ButtonGroupItem onClick={() => handlePage(3)}>3</ButtonGroupItem>
  <ButtonGroupItem
    icon={<ChevronRightIcon className="size-4" />}
    onClick={handleNext}
    disabled={currentPage === totalPages}
  >
    Next
  </ButtonGroupItem>
</ButtonGroup>
```

## API Reference

### ButtonGroup Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'solid' \| 'outline'` | `'solid'` | Visual style variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size of buttons in group |
| `className` | `string` | - | Additional CSS classes |
| `aria-label` | `string` | - | Accessible label for the group |
| `children` | `React.ReactNode` | - | ButtonGroupItem components |

### ButtonGroupItem Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `disabled` | `boolean` | `false` | Whether button is disabled |
| `icon` | `React.ReactNode` | - | Icon element to display |
| `className` | `string` | - | Additional CSS classes |
| `onClick` | `() => void` | - | Click handler |
| `aria-label` | `string` | - | Accessible label (required for icon-only buttons) |
| `children` | `React.ReactNode` | - | Button content |

## Styling Details

### Corner Rounding Logic

- **First button**: `rounded-l-lg rounded-r-none`
- **Middle buttons**: `rounded-none`
- **Last button**: `rounded-r-lg rounded-l-none`
- **Only button**: `rounded-lg`

### Border Overlap

Middle and last buttons use `-ml-px` (negative left margin) to create seamless borders between buttons.

### Variant Styles

**Solid (default)**:
- Dark background with subtle border
- Hover/active overlays
- Dark mode support

**Outline**:
- Transparent background with visible border
- Hover/active background tint
- Dark mode support

## Accessibility

- Container uses `role="group"`
- Support for `aria-label` on container
- Each button is keyboard accessible
- Icon-only buttons require `aria-label`
- Disabled state properly communicated to screen readers

## Pattern

This component follows the Catalyst UI Kit compound component pattern:

- Related components in one file
- TypeScript types colocated
- Uses `clsx` for conditional class composition
- Built on `@headlessui/react` for accessibility

## Testing

Comprehensive test coverage includes:

- Rendering multiple buttons
- Corner rounding logic (first/middle/last)
- Variant styling
- Size options
- Disabled state
- Icon support
- Custom className
- Click handlers
- Accessibility attributes

Run tests:

```bash
npm test -- button-group
```

## See Also

- [button.tsx](./button.tsx) - Individual Button component
- [notification.tsx](./notification.tsx) - Example compound component pattern
- [Catalyst UI Kit Documentation](https://tailwindui.com/templates/catalyst)

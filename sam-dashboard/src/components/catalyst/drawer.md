# Drawer Component

A slide-out panel component built with Headless UI Dialog, following Catalyst UI patterns.

## Features

- Slide-in animation from left or right
- Multiple size options (sm, md, lg, xl, 2xl)
- Backdrop with blur effect
- Keyboard accessible (ESC to close)
- Click outside to close
- Dark mode support
- Compound components (DrawerHeader, DrawerBody, DrawerFooter)
- Type-safe with TypeScript

## Usage

### Basic Example

```tsx
import { useState } from 'react'
import { Drawer, DrawerHeader, DrawerBody, DrawerFooter, Button } from '@/components/catalyst'

function MyComponent() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Settings</Button>
      <Drawer open={open} onClose={setOpen}>
        <DrawerHeader>Settings</DrawerHeader>
        <DrawerBody>
          <p>Drawer content goes here.</p>
        </DrawerBody>
        <DrawerFooter>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DrawerFooter>
      </Drawer>
    </>
  )
}
```

### Position Options

```tsx
// Left side (default)
<Drawer open={open} onClose={setOpen} position="left">
  ...
</Drawer>

// Right side
<Drawer open={open} onClose={setOpen} position="right">
  ...
</Drawer>
```

### Size Options

```tsx
// Small
<Drawer open={open} onClose={setOpen} size="sm">
  ...
</Drawer>

// Medium (default)
<Drawer open={open} onClose={setOpen} size="md">
  ...
</Drawer>

// Large
<Drawer open={open} onClose={setOpen} size="lg">
  ...
</Drawer>

// Extra Large
<Drawer open={open} onClose={setOpen} size="xl">
  ...
</Drawer>

// 2XL
<Drawer open={open} onClose={setOpen} size="2xl">
  ...
</Drawer>
```

### With Header, Body, and Footer

```tsx
<Drawer open={open} onClose={setOpen}>
  <DrawerHeader>Edit Profile</DrawerHeader>
  <DrawerBody>
    <form>
      <div className="space-y-4">
        <div>
          <label htmlFor="name">Name</label>
          <input id="name" type="text" />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" />
        </div>
      </div>
    </form>
  </DrawerBody>
  <DrawerFooter>
    <Button outline onClick={() => setOpen(false)}>Cancel</Button>
    <Button onClick={handleSave}>Save</Button>
  </DrawerFooter>
</Drawer>
```

### Custom Styling

```tsx
<Drawer
  open={open}
  onClose={setOpen}
  className="custom-drawer-class"
>
  <DrawerHeader className="bg-indigo-50 dark:bg-indigo-950">
    Custom Styled Header
  </DrawerHeader>
  <DrawerBody className="bg-gray-50 dark:bg-gray-950">
    Custom styled body
  </DrawerBody>
  <DrawerFooter className="bg-gray-100 dark:bg-gray-900">
    Custom styled footer
  </DrawerFooter>
</Drawer>
```

## API Reference

### Drawer

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | Required | Controls drawer visibility |
| `onClose` | `(value: boolean) => void` | Required | Called when drawer should close |
| `position` | `'left' \| 'right'` | `'left'` | Side of screen to slide in from |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl'` | `'md'` | Maximum width of drawer |
| `className` | `string` | - | Additional CSS classes |
| `children` | `React.ReactNode` | Required | Drawer content |

### DrawerHeader

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS classes |
| `children` | `React.ReactNode` | Required | Header content |

### DrawerBody

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS classes |
| `children` | `React.ReactNode` | Required | Body content |

### DrawerFooter

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS classes |
| `children` | `React.ReactNode` | Required | Footer content (typically buttons) |

## Accessibility

- Uses Headless UI Dialog for proper ARIA attributes
- Automatically sets `role="dialog"` and `aria-modal="true"`
- Keyboard accessible:
  - `ESC` key closes the drawer
  - Focus trap keeps focus within drawer when open
- Click outside (on backdrop) closes the drawer
- Screen reader friendly with proper semantic structure

## Implementation Details

- Built with `@headlessui/react` Dialog component
- Uses `clsx` for conditional class composition
- Follows Catalyst UI patterns and styling
- Supports dark mode via Tailwind CSS dark mode classes
- Animated transitions using Headless UI transition utilities
- Backdrop blur effect for better focus
- Position-aware slide animations

## Testing

The component includes comprehensive test coverage:
- Opens and closes with `open` prop
- Renders content correctly when open
- Supports left and right positions
- Calls `onClose` on overlay click
- Calls `onClose` on escape key press
- Has proper ARIA attributes
- Supports custom className on all compound components
- Renders header, body, and footer sections correctly
- Supports all size options

## Related Components

- Dialog - Modal dialog component
- Button - Button component for drawer actions
- Heading - Typography for drawer headers
- Text - Typography for drawer content

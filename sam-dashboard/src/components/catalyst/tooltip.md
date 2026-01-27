# Tooltip Component

A lightweight, accessible tooltip component for the Catalyst UI library.

## Features

- ✅ Shows on hover and focus (keyboard accessible)
- ✅ Supports 4 positions: top, bottom, left, right
- ✅ Configurable delay
- ✅ ARIA compliant (role="tooltip", aria-describedby)
- ✅ Dark mode support
- ✅ Custom className support
- ✅ Visual arrow indicator
- ✅ Smooth transitions

## Usage

### Basic Tooltip

```tsx
import { Tooltip } from '@/components/catalyst/tooltip'
import { Button } from '@/components/catalyst/button'

function Example() {
  return (
    <Tooltip content="Delete this item">
      <Button color="red">Delete</Button>
    </Tooltip>
  )
}
```

### Positioned Tooltips

```tsx
<Tooltip content="Appears above" position="top">
  <Button>Top</Button>
</Tooltip>

<Tooltip content="Appears below" position="bottom">
  <Button>Bottom</Button>
</Tooltip>

<Tooltip content="Appears to the left" position="left">
  <Button>Left</Button>
</Tooltip>

<Tooltip content="Appears to the right" position="right">
  <Button>Right</Button>
</Tooltip>
```

### With Icon

```tsx
import { InformationCircleIcon } from '@heroicons/react/24/outline'

<Tooltip content="More information about this field">
  <InformationCircleIcon className="size-5 text-zinc-500 cursor-help" />
</Tooltip>
```

### Delayed Tooltip

```tsx
<Tooltip content="Appears after 500ms" delay={500}>
  <Button>Hover me</Button>
</Tooltip>
```

### Custom Styling

```tsx
<Tooltip
  content="Custom styled tooltip"
  className="!bg-blue-600 !text-white"
>
  <Button>Custom</Button>
</Tooltip>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string` | required | The text to display in the tooltip |
| `position` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | Position of the tooltip relative to trigger |
| `delay` | `number` | `0` | Delay in milliseconds before showing tooltip |
| `className` | `string` | `undefined` | Additional CSS classes for the tooltip |
| `children` | `React.ReactElement` | required | Single child element that triggers the tooltip |

## Accessibility

The Tooltip component follows WCAG 2.1 AA guidelines:

- ✅ Uses `role="tooltip"` for screen readers
- ✅ Sets `aria-describedby` on trigger element when tooltip is visible
- ✅ Shows on both hover and keyboard focus
- ✅ Unique ID generated for each tooltip using React's `useId()`

## Implementation Details

- Built with native React hooks (useState, useRef, useId, useEffect)
- No external positioning libraries required
- Uses Tailwind CSS for styling
- Clones and enhances child element with event handlers
- Automatic cleanup of timers on unmount
- Supports dark mode via Tailwind's `dark:` prefix

## Limitations

- Only accepts a single child element
- Tooltip content must be a string (not JSX)
- Uses CSS positioning (not floating-ui) so may clip at viewport edges
- `whitespace-nowrap` prevents wrapping (by design for concise tooltips)

## Future Enhancements

If needed, consider:
- Integration with @floating-ui/react for smart positioning
- Support for JSX content
- Max-width with text wrapping option
- Click to show/hide option
- Portal rendering to avoid z-index issues

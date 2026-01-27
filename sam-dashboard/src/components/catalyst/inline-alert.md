# InlineAlert Component

A flexible alert component for displaying inline notifications and feedback messages, built following Catalyst UI patterns.

## Features

- 4 color variants: `info`, `success`, `warning`, `error`
- Optional icon support
- Dismissible with callback
- Compound components for composability
- Full dark mode support
- Accessible with ARIA roles

## Usage

### Basic Alert

```tsx
import { InlineAlert, InlineAlertTitle, InlineAlertDescription } from '@/components/catalyst'
import { InformationCircleIcon } from '@heroicons/react/20/solid'

<InlineAlert color="info" icon={InformationCircleIcon}>
  <InlineAlertTitle>Information</InlineAlertTitle>
  <InlineAlertDescription>
    This is an informational message.
  </InlineAlertDescription>
</InlineAlert>
```

### Dismissible Alert

```tsx
const [visible, setVisible] = useState(true)

{visible && (
  <InlineAlert
    color="success"
    icon={CheckCircleIcon}
    onDismiss={() => setVisible(false)}
  >
    <InlineAlertTitle>Success</InlineAlertTitle>
    <InlineAlertDescription>
      Operation completed successfully.
    </InlineAlertDescription>
  </InlineAlert>
)}
```

### Alert with Actions

```tsx
<InlineAlert color="warning" icon={ExclamationTriangleIcon}>
  <InlineAlertTitle>Warning</InlineAlertTitle>
  <InlineAlertDescription>
    Please review the following items.
  </InlineAlertDescription>
  <InlineAlertActions>
    <button type="button">View Details</button>
    <button type="button">Dismiss</button>
  </InlineAlertActions>
</InlineAlert>
```

### Alert with List

```tsx
<InlineAlert color="error" icon={XCircleIcon}>
  <InlineAlertTitle>There were 2 errors with your submission</InlineAlertTitle>
  <InlineAlertDescription>
    <ul role="list" className="list-disc space-y-1 pl-5">
      <li>Your password must be at least 8 characters</li>
      <li>Your password must include at least one special character</li>
    </ul>
  </InlineAlertDescription>
</InlineAlert>
```

## API

### InlineAlert

Main container component.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `color` | `'info' \| 'success' \| 'warning' \| 'error'` | `'info'` | Color variant |
| `icon` | `React.ComponentType` | - | Icon component to display |
| `onDismiss` | `() => void` | - | Callback when dismiss button is clicked |
| `className` | `string` | - | Additional CSS classes |
| `children` | `React.ReactNode` | - | Alert content |

### InlineAlertTitle

Alert title component.

| Prop | Type | Description |
|------|------|-------------|
| `className` | `string` | Additional CSS classes |
| `children` | `React.ReactNode` | Title content |

### InlineAlertDescription

Alert description component.

| Prop | Type | Description |
|------|------|-------------|
| `className` | `string` | Additional CSS classes |
| `children` | `React.ReactNode` | Description content |

### InlineAlertActions

Container for action buttons.

| Prop | Type | Description |
|------|------|-------------|
| `className` | `string` | Additional CSS classes |
| `children` | `React.ReactNode` | Action buttons |

## Color Variants

- **info**: Blue color scheme for informational messages
- **success**: Green color scheme for success notifications
- **warning**: Yellow color scheme for warnings
- **error**: Red color scheme for errors

## Accessibility

- Uses `role="alert"` for screen readers
- Dismiss button has `sr-only` label
- Icons have `aria-hidden` attribute
- Focus visible states on interactive elements

## Dark Mode

All color variants include dark mode support with adjusted colors and outlines for better visibility.

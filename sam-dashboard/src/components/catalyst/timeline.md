# Timeline Component

A vertical timeline component for displaying chronological events with icons, dates, and status indicators.

## Features

- Vertical layout with connecting lines
- Support for three status states: `completed`, `current`, `pending`
- Optional icon display for each timeline item
- Optional date/time display
- Compound component pattern (Timeline + TimelineItem)
- Full TypeScript support with colocated types
- Semantic color tokens for status indicators
- Dark mode support

## Usage

### Basic Timeline

```tsx
import { Timeline, TimelineItem } from '@/components/catalyst/timeline'
import { CheckIcon, ClockIcon } from '@heroicons/react/20/solid'

<Timeline>
  <TimelineItem
    icon={CheckIcon}
    date="Jan 15, 2026"
    status="completed"
  >
    Contract signed
  </TimelineItem>
  <TimelineItem
    icon={ClockIcon}
    date="Feb 1, 2026"
    status="pending"
  >
    Final review
  </TimelineItem>
</Timeline>
```

### Detailed Timeline with Rich Content

```tsx
<Timeline>
  <TimelineItem status="completed" date="Jan 15, 2026" icon={CheckIcon}>
    <div>
      <h3 className="font-semibold text-sm">Contract signed</h3>
      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
        All parties have signed the agreement.
      </p>
    </div>
  </TimelineItem>
  <TimelineItem status="current" date="Jan 20, 2026">
    <div>
      <h3 className="font-semibold text-sm">Deliverable submitted</h3>
      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
        Working on milestone 1.
      </p>
    </div>
  </TimelineItem>
</Timeline>
```

### Simple Timeline (No Icons)

```tsx
<Timeline>
  <TimelineItem status="completed" date="Jan 15, 2026">
    Contract signed
  </TimelineItem>
  <TimelineItem status="current" date="Jan 20, 2026">
    Deliverable submitted
  </TimelineItem>
  <TimelineItem status="pending" date="Feb 1, 2026">
    Final review
  </TimelineItem>
</Timeline>
```

## API

### Timeline Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS classes |
| `children` | `ReactNode` | - | TimelineItem components |
| `...props` | `React.ComponentPropsWithoutRef<'ul'>` | - | Additional props spread to ul element |

### TimelineItem Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `React.ComponentType<React.SVGProps<SVGSVGElement>>` | - | Optional icon component |
| `date` | `string` | - | Optional date/time string |
| `status` | `'completed' \| 'current' \| 'pending'` | `'pending'` | Status indicator |
| `className` | `string` | - | Additional CSS classes |
| `children` | `ReactNode` | - | Item content |
| `...props` | `React.ComponentPropsWithoutRef<'li'>` | - | Additional props spread to li element |

## Status States

### Completed
- Green success colors (semantic tokens)
- Check icon or filled dot
- Muted text styling

### Current
- Blue primary colors
- Pulsing ring effect
- Bold text styling

### Pending
- Gray neutral colors
- Clock icon or hollow dot
- Lighter text styling

## Accessibility

- Uses semantic HTML (`<ul>` and `<li>`)
- Supports keyboard navigation
- ARIA role attributes included
- Icons have `aria-hidden="true"` to avoid duplication

## Examples

See `timeline.example.tsx` for complete working examples.

## Testing

Comprehensive test coverage in `timeline.test.tsx`:
- Rendering timeline items
- Status state styling
- Icon and date display
- Connecting line visual
- Custom className support
- Prop spreading

## Related Components

- Badge - For status indicators
- Card - Container for timelines
- EmptyState - Fallback when no timeline items

# PageHeading Component

A flexible, responsive page heading component system for Catalyst UI. Provides a consistent pattern for page headers with title, description, metadata, and action buttons.

## Components

### `PageHeading`
Main container that handles responsive layout (stacked on mobile, inline on desktop).

### `PageHeadingTitle`
Large, bold heading text with responsive sizing. Renders as `<h1>`.

### `PageHeadingDescription`
Secondary descriptive text below the title. Optional subtitle or context.

### `PageHeadingSection`
Wrapper for title, description, and metadata. Provides flex-grow for layout.

### `PageHeadingActions`
Container for action buttons. Aligns right on desktop, stacks on mobile.

### `PageHeadingMeta`
Container for metadata items (status, dates, badges, etc.).

### `PageHeadingMetaItem`
Individual metadata item with optional icon support.

## Basic Usage

```tsx
import {
  PageHeading,
  PageHeadingTitle,
  PageHeadingSection,
} from '@/components/catalyst'

export function MyPage() {
  return (
    <PageHeading>
      <PageHeadingSection>
        <PageHeadingTitle>Contract Details</PageHeadingTitle>
      </PageHeadingSection>
    </PageHeading>
  )
}
```

## With Description and Actions

```tsx
import {
  PageHeading,
  PageHeadingTitle,
  PageHeadingDescription,
  PageHeadingSection,
  PageHeadingActions,
  Button,
} from '@/components/catalyst'

export function ContractPage() {
  return (
    <PageHeading>
      <PageHeadingSection>
        <PageHeadingTitle>Contract ABC-123</PageHeadingTitle>
        <PageHeadingDescription>
          Federal IT services contract with DoD
        </PageHeadingDescription>
      </PageHeadingSection>
      <PageHeadingActions>
        <Button outline>Edit</Button>
        <Button color="indigo">Save</Button>
      </PageHeadingActions>
    </PageHeading>
  )
}
```

## With Metadata

```tsx
import {
  PageHeading,
  PageHeadingTitle,
  PageHeadingMeta,
  PageHeadingMetaItem,
  PageHeadingSection,
} from '@/components/catalyst'
import { CalendarIcon, CurrencyDollarIcon } from '@heroicons/react/20/solid'

export function OpportunityPage() {
  return (
    <PageHeading>
      <PageHeadingSection>
        <PageHeadingTitle>Cloud Migration Services</PageHeadingTitle>
        <PageHeadingMeta>
          <PageHeadingMetaItem icon={CurrencyDollarIcon}>
            $2.5M
          </PageHeadingMetaItem>
          <PageHeadingMetaItem icon={CalendarIcon}>
            Due: Jan 30, 2026
          </PageHeadingMetaItem>
        </PageHeadingMeta>
      </PageHeadingSection>
    </PageHeading>
  )
}
```

## Complete Example

```tsx
import {
  PageHeading,
  PageHeadingTitle,
  PageHeadingDescription,
  PageHeadingMeta,
  PageHeadingMetaItem,
  PageHeadingSection,
  PageHeadingActions,
  Button,
} from '@/components/catalyst'
import {
  BriefcaseIcon,
  CalendarIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/20/solid'

export function CompleteExample() {
  return (
    <PageHeading>
      <PageHeadingSection>
        <PageHeadingTitle>
          Cloud Infrastructure Modernization
        </PageHeadingTitle>
        <PageHeadingDescription>
          Multi-year contract for cloud migration services
        </PageHeadingDescription>
        <PageHeadingMeta>
          <PageHeadingMetaItem icon={BriefcaseIcon}>
            Prime Contract
          </PageHeadingMetaItem>
          <PageHeadingMetaItem icon={CurrencyDollarIcon}>
            $5.2M Base + $2.1M Options
          </PageHeadingMetaItem>
          <PageHeadingMetaItem icon={CalendarIcon}>
            Jan 2026 - Dec 2028
          </PageHeadingMetaItem>
        </PageHeadingMeta>
      </PageHeadingSection>
      <PageHeadingActions>
        <Button outline>Export PDF</Button>
        <Button color="indigo">Edit Contract</Button>
      </PageHeadingActions>
    </PageHeading>
  )
}
```

## Features

- **Responsive Layout**: Stacks vertically on mobile, inline on desktop
- **Dark Mode**: Full dark mode support with appropriate color tokens
- **Accessible**: Proper semantic HTML (h1 for title, aria-hidden for icons)
- **Flexible**: Compose components as needed, omit optional sections
- **Icon Support**: Optional icons in metadata items
- **Custom Styling**: All components accept `className` prop for customization
- **TypeScript**: Full type safety with proper prop types

## Props

All components accept:
- `className?: string` - Additional CSS classes
- `children: React.ReactNode` - Component content
- All standard HTML div/h1/p attributes via spread props

### `PageHeadingMetaItem` Additional Props
- `icon?: React.ComponentType<React.ComponentPropsWithoutRef<'svg'>>` - Optional icon component

## Styling

Components use Catalyst's design tokens:
- **Text Colors**: `text-zinc-900` / `dark:text-white` for titles
- **Secondary Text**: `text-zinc-500` / `dark:text-zinc-400`
- **Icon Colors**: `text-zinc-400` / `dark:text-zinc-500`
- **Responsive Sizing**: Larger text on desktop (`sm:text-3xl`)
- **Spacing**: Consistent margin and gap utilities

## Layout Structure

```
<PageHeading>                     // lg:flex lg:justify-between
  <PageHeadingSection>            // min-w-0 flex-1
    <PageHeadingTitle />          // h1
    <PageHeadingDescription />    // p (optional)
    <PageHeadingMeta>             // flex (optional)
      <PageHeadingMetaItem />     // flex items-center
      <PageHeadingMetaItem />
    </PageHeadingMeta>
  </PageHeadingSection>
  <PageHeadingActions>            // flex gap-3
    <Button />
    <Button />
  </PageHeadingActions>
</PageHeading>
```

## Best Practices

1. **Always use PageHeadingSection** to wrap title/description/meta for proper flex layout
2. **Use semantic HTML** - PageHeadingTitle renders as h1, use it once per page
3. **Icons should be 20px solid** - Import from `@heroicons/react/20/solid`
4. **Keep titles concise** - They truncate on mobile, so front-load important info
5. **Group related actions** - Use multiple buttons in PageHeadingActions, primary action last
6. **Metadata is optional** - Only include if you have relevant status/context to show

## Accessibility

- Title renders as `<h1>` for proper heading hierarchy
- Icons use `aria-hidden="true"` (decorative only)
- Responsive layout maintains reading order on mobile
- Color contrast meets WCAG AA standards
- All interactive elements (buttons) are keyboard accessible

## Testing

See `page-heading.test.tsx` for comprehensive behavioral tests.
See `page-heading.examples.tsx` for additional usage examples.

## Files

- `page-heading.tsx` - Component implementation
- `page-heading.test.tsx` - Test suite
- `page-heading.examples.tsx` - Usage examples
- `page-heading.README.md` - This documentation

# InputGroup

A compound component for creating input fields with leading and/or trailing addons. Perfect for currency inputs, URLs, measurements, and other inputs that need contextual labels or controls.

## Features

- Leading and trailing addons
- Support for text, icons, and select dropdowns as addons
- Unified focus ring around entire group
- Fully accessible
- Dark mode support
- TypeScript types

## Usage

### Basic Examples

```tsx
import { InputGroup, InputAddon, InputGroupInput } from '@/components/catalyst'

// Currency input
<InputGroup>
  <InputAddon>$</InputAddon>
  <InputGroupInput type="number" placeholder="0.00" />
</InputGroup>

// URL input
<InputGroup>
  <InputAddon>https://</InputAddon>
  <InputGroupInput type="url" placeholder="www.example.com" />
</InputGroup>

// Trailing addon
<InputGroup>
  <InputGroupInput type="number" placeholder="0" />
  <InputAddon>%</InputAddon>
</InputGroup>

// Both sides
<InputGroup>
  <InputAddon>$</InputAddon>
  <InputGroupInput type="number" placeholder="0.00" />
  <InputAddon>USD</InputAddon>
</InputGroup>
```

### With Select Dropdown

```tsx
<InputGroup>
  <InputGroupInput type="number" placeholder="0.00" />
  <InputAddon>
    <select>
      <option>USD</option>
      <option>EUR</option>
      <option>GBP</option>
    </select>
  </InputAddon>
</InputGroup>
```

### With Icon

```tsx
import { MagnifyingGlassIcon } from '@heroicons/react/20/solid'

<InputGroup>
  <InputAddon>
    <MagnifyingGlassIcon />
  </InputAddon>
  <InputGroupInput type="search" placeholder="Search..." />
</InputGroup>
```

## Components

### InputGroup

The container component that wraps the input and addons.

**Props:**
- `className?: string` - Additional CSS classes
- `children: React.ReactNode` - InputAddon and InputGroupInput components
- Extends `React.ComponentPropsWithoutRef<'div'>`

### InputAddon

An addon element (text, icon, or select) that appears before or after the input.

**Props:**
- `className?: string` - Additional CSS classes
- `children: React.ReactNode` - Content (text, icon, or select element)
- Extends `React.ComponentPropsWithoutRef<'div'>`

**Behavior:**
- Automatically rounds corners based on position (first/last)
- Removes borders between adjacent elements
- Styles select elements to match the design system

### InputGroupInput

The input field within the group.

**Props:**
- `className?: string` - Additional CSS classes
- `type?: 'email' | 'number' | 'password' | 'search' | 'tel' | 'text' | 'url'` - Input type
- Extends Headless UI `InputProps`

**Features:**
- Automatically adjusts border radius based on position
- Removes borders adjacent to addons
- Supports all standard input attributes (disabled, placeholder, etc.)
- Forward ref support

## Common Patterns

### Currency Input

```tsx
<InputGroup>
  <InputAddon>$</InputAddon>
  <InputGroupInput type="number" placeholder="0.00" step="0.01" />
  <InputAddon>
    <select>
      <option>USD</option>
      <option>EUR</option>
    </select>
  </InputAddon>
</InputGroup>
```

### Phone Number

```tsx
<InputGroup>
  <InputAddon>
    <select>
      <option>+1</option>
      <option>+44</option>
      <option>+81</option>
    </select>
  </InputAddon>
  <InputGroupInput type="tel" placeholder="(555) 123-4567" />
</InputGroup>
```

### Email with Domain

```tsx
<InputGroup>
  <InputGroupInput type="text" placeholder="username" />
  <InputAddon>@company.com</InputAddon>
</InputGroup>
```

### Weight/Measurement

```tsx
<InputGroup>
  <InputGroupInput type="number" placeholder="0" />
  <InputAddon>
    <select>
      <option>lbs</option>
      <option>kg</option>
    </select>
  </InputAddon>
</InputGroup>
```

## Accessibility

- Input maintains all standard ARIA attributes
- Select dropdowns are fully keyboard accessible
- Focus ring applies to entire group for visual clarity
- Proper labeling should be provided via `<label>` elements

## Styling

The component uses semantic color tokens for dark mode support:

- `text-zinc-950 / dark:text-white` - Input text
- `bg-zinc-50 / dark:bg-zinc-800/50` - Addon background
- `border-zinc-950/10 / dark:border-white/10` - Borders
- `ring-blue-500` - Focus ring

## Integration with Forms

Works seamlessly with Catalyst's `Field`, `Label`, and form components:

```tsx
import { Field, Label } from '@/components/catalyst'

<Field>
  <Label>Price</Label>
  <InputGroup>
    <InputAddon>$</InputAddon>
    <InputGroupInput type="number" placeholder="0.00" />
    <InputAddon>USD</InputAddon>
  </InputGroup>
</Field>
```

## TypeScript

All components are fully typed with TypeScript. The `InputGroupInput` component forwards refs correctly:

```tsx
const inputRef = React.useRef<HTMLInputElement>(null)

<InputGroup>
  <InputAddon>$</InputAddon>
  <InputGroupInput ref={inputRef} type="number" />
</InputGroup>
```

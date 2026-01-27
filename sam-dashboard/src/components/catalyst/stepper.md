# Stepper Component

A Catalyst UI component for displaying multi-step processes with visual progress indicators.

## Features

- **Multiple Orientations**: Horizontal and vertical layouts
- **Visual States**: Completed (checkmark), current (highlighted), and pending states
- **Connecting Lines**: Visual connectors between steps showing progress
- **Flexible Content**: Support for labels and optional descriptions
- **Accessibility**: Full WCAG 2.1 AA compliant with proper ARIA attributes
- **Custom Styling**: Supports custom className overrides
- **Semantic Colors**: Uses Catalyst design tokens for consistent theming

## Basic Usage

```tsx
import { Stepper, Step } from '@/components/catalyst'

function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1)

  return (
    <Stepper currentStep={currentStep}>
      <Step label="Account" description="Create your account" />
      <Step label="Profile" description="Complete your profile" />
      <Step label="Review" description="Review and submit" />
    </Stepper>
  )
}
```

## Props

### Stepper

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `currentStep` | `number` | Required | The currently active step (1-indexed) |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout direction |
| `className` | `string` | - | Custom CSS classes |
| `children` | `React.ReactNode` | Required | Step components |

### Step

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | Required | The step label text |
| `description` | `string` | - | Optional description text |
| `className` | `string` | - | Custom CSS classes |

## Examples

### Horizontal Stepper

```tsx
<Stepper currentStep={2} orientation="horizontal">
  <Step label="Account" description="Create your account" />
  <Step label="Profile" description="Complete your profile" />
  <Step label="Review" description="Review and submit" />
</Stepper>
```

### Vertical Stepper

```tsx
<Stepper currentStep={2} orientation="vertical">
  <Step label="Account" description="Create your account" />
  <Step label="Profile" description="Complete your profile" />
  <Step label="Review" description="Review and submit" />
</Stepper>
```

### Without Descriptions

```tsx
<Stepper currentStep={1}>
  <Step label="Step 1" />
  <Step label="Step 2" />
  <Step label="Step 3" />
</Stepper>
```

### Custom Styling

```tsx
<Stepper currentStep={2} className="max-w-2xl mx-auto">
  <Step label="Account" description="Create your account" />
  <Step label="Profile" description="Complete your profile" />
  <Step label="Review" description="Review and submit" />
</Stepper>
```

## Visual States

The component automatically manages three visual states based on the `currentStep` prop:

1. **Completed** (step < currentStep)
   - Primary colored background
   - White checkmark icon
   - Normal text color

2. **Current** (step === currentStep)
   - Primary colored background
   - White step number
   - Primary colored text

3. **Pending** (step > currentStep)
   - Gray background
   - Gray step number
   - Muted text color

## Accessibility

The Stepper component follows WCAG 2.1 AA guidelines:

- Uses semantic `<nav>` element with `aria-label="Progress"`
- Current step marked with `aria-current="step"`
- Completed steps have accessible "Completed" label
- Proper color contrast ratios
- Keyboard navigation support through native HTML elements

## Design Tokens

The component uses Catalyst semantic color tokens:

- `bg-primary`: For active/completed step indicators
- `text-primary`: For current step labels
- `text-on-surface`: For completed step labels
- `text-on-surface-variant`: For descriptions and pending steps

## Best Practices

1. **Use 1-indexed steps**: The `currentStep` prop is 1-indexed (first step = 1)
2. **Keep labels concise**: Use short, clear labels (1-2 words)
3. **Add descriptions for clarity**: Descriptions help users understand each step
4. **Horizontal for few steps**: Use horizontal layout for 3-5 steps
5. **Vertical for many steps**: Use vertical layout for 6+ steps or mobile views
6. **Validate before advancing**: Only advance to the next step after validation

## Common Patterns

### Form Wizard

```tsx
function FormWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({})

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => prev + 1)
    }
  }

  return (
    <div>
      <Stepper currentStep={currentStep}>
        <Step label="Personal" description="Basic information" />
        <Step label="Contact" description="Contact details" />
        <Step label="Review" description="Confirm submission" />
      </Stepper>

      {currentStep === 1 && <PersonalInfoForm />}
      {currentStep === 2 && <ContactForm />}
      {currentStep === 3 && <ReviewForm />}
    </div>
  )
}
```

### Onboarding Flow

```tsx
function OnboardingFlow() {
  const [step, setStep] = useState(1)

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Stepper currentStep={step} className="mb-8">
        <Step label="Welcome" description="Get started" />
        <Step label="Setup" description="Configure your account" />
        <Step label="Invite" description="Add team members" />
        <Step label="Complete" description="You're all set!" />
      </Stepper>

      <OnboardingContent step={step} onNext={() => setStep(s => s + 1)} />
    </div>
  )
}
```

### Order Tracking

```tsx
function OrderTracking({ order }) {
  const getStepFromStatus = (status) => {
    const steps = ['placed', 'confirmed', 'shipped', 'delivered']
    return steps.indexOf(status) + 1
  }

  return (
    <Stepper currentStep={getStepFromStatus(order.status)} orientation="vertical">
      <Step label="Order Placed" description={order.placedDate} />
      <Step label="Confirmed" description={order.confirmedDate} />
      <Step label="Shipped" description={order.shippedDate} />
      <Step label="Delivered" description={order.deliveredDate} />
    </Stepper>
  )
}
```

## Testing

The component is fully tested with behavioral tests:

```tsx
import { render, screen } from '@testing-library/react'
import { Stepper, Step } from './stepper'

it('renders all steps', () => {
  render(
    <Stepper currentStep={1}>
      <Step label="Account" />
      <Step label="Profile" />
      <Step label="Review" />
    </Stepper>
  )

  expect(screen.getByText('Account')).toBeDefined()
  expect(screen.getByText('Profile')).toBeDefined()
  expect(screen.getByText('Review')).toBeDefined()
})
```

## Related Components

- **Progress**: For simple linear progress bars
- **Tabs**: For switching between views (not sequential)
- **Breadcrumbs**: For hierarchical navigation
- **Timeline**: For chronological event display

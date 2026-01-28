// Tailwind Plus UI Blocks - Containers
// Source: https://tailwindcss.com/plus/ui-blocks/application-ui/layout/containers
// Format: React JSX (v4.1)
// Downloaded automatically

// =============================================================================
// 1. Full-width on mobile, constrained with padded content above
// =============================================================================
export default function Example() {
  return <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">{/* Content goes here */}</div>
}


// =============================================================================
// 2. Constrained with padded content
// =============================================================================
export default function Example() {
  return <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{/* Content goes here */}</div>
}


// =============================================================================
// 3. Full-width on mobile, constrained to breakpoint with padded content above mobile
// =============================================================================
export default function Example() {
  return <div className="container mx-auto sm:px-6 lg:px-8">{/* Content goes here */}</div>
}


// =============================================================================
// 4. Constrained to breakpoint with padded content
// =============================================================================
export default function Example() {
  return <div className="container mx-auto px-4 sm:px-6 lg:px-8">{/* Content goes here */}</div>
}


// =============================================================================
// 5. Narrow constrained with padded content
// =============================================================================
export default function Example() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* We've used 3xl here, but feel free to try other max-widths based on your needs */}
      <div className="mx-auto max-w-3xl">{/* Content goes here */}</div>
    </div>
  )
}



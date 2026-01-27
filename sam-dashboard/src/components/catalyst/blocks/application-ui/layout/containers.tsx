// Tailwind Plus UI Blocks - Containers
// Source: https://tailwindcss.com/plus/ui-blocks/application-ui/layout/containers
// Format: React JSX (v4.1)
// Downloaded automatically

import type { ReactNode } from 'react';

// Note: Containers are typically simple wrappers that don't benefit from abstraction
// into layout components. They define specific max-width and padding constraints.

// =============================================================================
// 1. Full-width on mobile, constrained with padded content above
// =============================================================================
export function ContainerFullWidthMobile({ children }: { children?: ReactNode }) {
  return <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">{children}</div>;
}


// =============================================================================
// 2. Constrained with padded content
// =============================================================================
export function ContainerConstrained({ children }: { children?: ReactNode }) {
  return <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>;
}


// =============================================================================
// 3. Full-width on mobile, constrained to breakpoint with padded content above mobile
// =============================================================================
export function ContainerBreakpointFullWidthMobile({ children }: { children?: ReactNode }) {
  return <div className="container mx-auto sm:px-6 lg:px-8">{children}</div>;
}


// =============================================================================
// 4. Constrained to breakpoint with padded content
// =============================================================================
export function ContainerBreakpoint({ children }: { children?: ReactNode }) {
  return <div className="container mx-auto px-4 sm:px-6 lg:px-8">{children}</div>;
}


// =============================================================================
// 5. Narrow constrained with padded content
// =============================================================================
export function ContainerNarrow({ children }: { children?: ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* We've used 3xl here, but feel free to try other max-widths based on your needs */}
      <div className="mx-auto max-w-3xl">{children}</div>
    </div>
  );
}


// Default export for backwards compatibility
export default ContainerConstrained;

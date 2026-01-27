/**
 * Spinner Component
 *
 * A simple loading spinner with size and color variants.
 *
 * @example
 * <Spinner />
 * <Spinner size="lg" color="white" />
 * <Spinner label="Processing..." />
 */

import clsx from 'clsx'

// =============================================================================
// Types
// =============================================================================

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type SpinnerColor = 'primary' | 'white' | 'current' | 'muted'

export interface SpinnerProps {
  size?: SpinnerSize
  color?: SpinnerColor
  label?: string
  className?: string
}

// =============================================================================
// Styles
// =============================================================================

const sizeClasses: Record<SpinnerSize, string> = {
  xs: 'size-3',
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-6',
  xl: 'size-8',
}

const colorClasses: Record<SpinnerColor, string> = {
  primary: 'text-indigo-600 dark:text-indigo-400',
  white: 'text-white',
  current: 'text-current',
  muted: 'text-zinc-400 dark:text-zinc-500',
}

// =============================================================================
// Spinner Component
// =============================================================================

export function Spinner({
  size = 'md',
  color = 'primary',
  label = 'Loading...',
  className,
}: SpinnerProps) {
  return (
    <svg
      role="status"
      aria-live="polite"
      className={clsx(
        'animate-spin',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
      <span className="sr-only">{label}</span>
    </svg>
  )
}

/**
 * Skeleton Component
 *
 * Loading placeholder components with animation.
 *
 * @example
 * <Skeleton width="200px" height="20px" />
 * <SkeletonText lines={3} />
 * <SkeletonCircle size="lg" />
 */

import clsx from 'clsx'

// =============================================================================
// Types
// =============================================================================

export interface SkeletonProps {
  width?: string | 'full'
  height?: string
  className?: string
}

export interface SkeletonTextProps {
  lines?: number
  spacing?: 'sm' | 'md' | 'lg'
  className?: string
}

export type SkeletonCircleSize = 'sm' | 'md' | 'lg' | 'xl'

export interface SkeletonCircleProps {
  size?: SkeletonCircleSize
  className?: string
}

// =============================================================================
// Styles
// =============================================================================

const circleSize: Record<SkeletonCircleSize, string> = {
  sm: 'size-8',
  md: 'size-10',
  lg: 'size-12',
  xl: 'size-16',
}

const textSpacing: Record<NonNullable<SkeletonTextProps['spacing']>, string> = {
  sm: 'space-y-1',
  md: 'space-y-2',
  lg: 'space-y-3',
}

// =============================================================================
// Skeleton Component
// =============================================================================

export function Skeleton({ width, height, className }: SkeletonProps) {
  const isFullWidth = width === 'full'

  return (
    <div
      className={clsx(
        'animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-700',
        isFullWidth && 'w-full',
        className
      )}
      style={{
        width: isFullWidth ? undefined : width,
        height,
      }}
    />
  )
}

// =============================================================================
// SkeletonText Component
// =============================================================================

export function SkeletonText({
  lines = 1,
  spacing = 'md',
  className,
}: SkeletonTextProps) {
  if (lines === 1) {
    return (
      <div className={clsx('animate-pulse', className)}>
        <div className="h-4 rounded-md bg-zinc-200 dark:bg-zinc-700" />
      </div>
    )
  }

  return (
    <div className={clsx(textSpacing[spacing], className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={clsx(
            'h-4 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-700',
            // Make last line shorter
            index === lines - 1 && 'w-3/4'
          )}
        />
      ))}
    </div>
  )
}

// =============================================================================
// SkeletonCircle Component
// =============================================================================

export function SkeletonCircle({ size = 'md', className }: SkeletonCircleProps) {
  return (
    <div
      className={clsx(
        'animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700',
        circleSize[size],
        className
      )}
    />
  )
}

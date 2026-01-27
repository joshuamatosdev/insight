import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
import React, { forwardRef } from 'react'

// Type definitions
type StatGroupColumns = 1 | 2 | 3 | 4

type StatGroupProps = {
  columns?: StatGroupColumns
  className?: string
  children: React.ReactNode
}

type StatProps = React.ComponentPropsWithoutRef<'div'>

type StatLabelProps = React.ComponentPropsWithoutRef<'dt'>

type StatValueProps = React.ComponentPropsWithoutRef<'dd'>

type StatChangeProps = {
  trend?: 'up' | 'down' | 'neutral'
  className?: string
  children: React.ReactNode
} & React.ComponentPropsWithoutRef<'dd'>

type StatIconProps = React.ComponentPropsWithoutRef<'div'>

/**
 * StatGroup - Container for multiple stats with Tailwind UI dashboard pattern
 * Uses top/bottom borders and grid layout with vertical dividers between items
 */
export function StatGroup({ columns = 4, className, children }: StatGroupProps) {
  return (
    <div
      className={clsx(
        'border-b border-border lg:border-t',
        className
      )}
    >
      <dl
        className={clsx(
          'grid grid-cols-1 sm:grid-cols-2',
          columns === 3 && 'lg:grid-cols-3',
          columns === 4 && 'lg:grid-cols-4',
          'lg:px-2 xl:px-0'
        )}
      >
        {children}
      </dl>
    </div>
  )
}

/**
 * Stat - Individual stat container (grid item with dividers)
 */
export const Stat = forwardRef<HTMLDivElement, StatProps>(function Stat({ className, children, ...props }, ref) {
  return (
    <div
      ref={ref}
      {...props}
      className={clsx(
        'flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2',
        'border-t border-border',
        'px-4 py-10 sm:px-6 lg:border-t-0 xl:px-8',
        // Add left border for visual dividers between columns
        '[&:not(:first-child)]:sm:border-l [&:not(:first-child)]:sm:border-border',
        className
      )}
    >
      {children}
    </div>
  )
})

/**
 * StatLabel - Label/name for the stat (dt element)
 */
export const StatLabel = forwardRef<HTMLElement, StatLabelProps>(function StatLabel(
  { className, children, ...props },
  ref
) {
  return (
    <dt ref={ref} {...props} className={clsx('text-sm/6 font-medium text-on-surface-muted', className)}>
      {children}
    </dt>
  )
})

/**
 * StatValue - Main value for the stat (dd element)
 */
export const StatValue = forwardRef<HTMLElement, StatValueProps>(function StatValue(
  { className, children, ...props },
  ref
) {
  return (
    <dd
      ref={ref}
      {...props}
      className={clsx(
        'w-full flex-none text-3xl/10 font-medium tracking-tight',
        'text-on-surface',
        className
      )}
    >
      {children}
    </dd>
  )
})

/**
 * StatChange - Change indicator with trend arrow and color
 */
export const StatChange = forwardRef<HTMLElement, StatChangeProps>(function StatChange(
  { trend = 'neutral', className, children, ...props },
  ref
) {
  const TrendIcon = trend === 'up' ? ArrowUpIcon : trend === 'down' ? ArrowDownIcon : null

  return (
    <dd
      ref={ref}
      {...props}
      className={clsx(
        'flex items-center gap-x-1 text-xs font-medium',
        trend === 'up' && 'text-success',
        trend === 'down' && 'text-danger',
        trend === 'neutral' && 'text-on-surface-muted',
        className
      )}
    >
      {TrendIcon !== null && (
        <>
          <TrendIcon aria-hidden="true" className="size-4 shrink-0" />
          <span className="sr-only">{trend === 'up' ? 'Increased' : 'Decreased'} by </span>
        </>
      )}
      {children}
    </dd>
  )
})

/**
 * StatIcon - Optional icon container for stats
 */
export const StatIcon = forwardRef<HTMLDivElement, StatIconProps>(function StatIcon(
  { className, children, ...props },
  ref
) {
  return (
    <div ref={ref} {...props} className={clsx('flex items-center justify-center', className)}>
      {children}
    </div>
  )
})

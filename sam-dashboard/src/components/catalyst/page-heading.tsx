import clsx from 'clsx'
import React from 'react'

/**
 * PageHeading - Main container for page heading section
 *
 * Provides responsive layout with title, description, actions, and metadata.
 * Stacks vertically on mobile, arranges inline on desktop.
 *
 * @example
 * ```tsx
 * <PageHeading>
 *   <div>
 *     <PageHeadingTitle>Contract Details</PageHeadingTitle>
 *     <PageHeadingDescription>View and manage contract information</PageHeadingDescription>
 *     <PageHeadingMeta>
 *       <Badge>Active</Badge>
 *       <span>Last updated: Jan 15, 2026</span>
 *     </PageHeadingMeta>
 *   </div>
 *   <PageHeadingActions>
 *     <Button>Edit</Button>
 *     <Button color="indigo">Save</Button>
 *   </PageHeadingActions>
 * </PageHeading>
 * ```
 */
export function PageHeading({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      {...props}
      className={clsx(
        className,
        'lg:flex lg:items-center lg:justify-between'
      )}
    >
      {children}
    </div>
  )
}

/**
 * PageHeadingTitle - Main title for the page
 *
 * Large, bold heading text that truncates on overflow.
 * Responsive sizing: larger on desktop, smaller on mobile.
 */
export function PageHeadingTitle({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<'h1'>) {
  return (
    <h1
      {...props}
      className={clsx(
        className,
        'text-2xl/7 font-bold text-zinc-900 sm:truncate sm:text-3xl sm:tracking-tight',
        'dark:text-white'
      )}
    >
      {children}
    </h1>
  )
}

/**
 * PageHeadingDescription - Subtitle or description text
 *
 * Secondary text that provides context about the page.
 * Appears below the title with appropriate spacing.
 */
export function PageHeadingDescription({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<'p'>) {
  return (
    <p
      {...props}
      className={clsx(
        className,
        'mt-2 text-sm text-zinc-500',
        'dark:text-zinc-400'
      )}
    >
      {children}
    </p>
  )
}

/**
 * PageHeadingActions - Container for action buttons
 *
 * Aligns buttons to the right on desktop, stacks on mobile.
 * Provides consistent spacing between multiple buttons.
 */
export function PageHeadingActions({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      {...props}
      className={clsx(
        className,
        'mt-5 flex gap-3 lg:mt-0 lg:ml-4'
      )}
    >
      {children}
    </div>
  )
}

/**
 * PageHeadingMeta - Container for metadata items
 *
 * Displays badges, dates, status indicators, or other metadata.
 * Items are arranged horizontally with proper spacing.
 * Responsive: stacks vertically on mobile, horizontal on tablet+.
 *
 * @example
 * ```tsx
 * <PageHeadingMeta>
 *   <PageHeadingMetaItem icon={BriefcaseIcon}>Full-time</PageHeadingMetaItem>
 *   <PageHeadingMetaItem icon={MapPinIcon}>Remote</PageHeadingMetaItem>
 *   <PageHeadingMetaItem icon={CalendarIcon}>Due: Jan 30</PageHeadingMetaItem>
 * </PageHeadingMeta>
 * ```
 */
export function PageHeadingMeta({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      {...props}
      className={clsx(
        className,
        'mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6'
      )}
    >
      {children}
    </div>
  )
}

/**
 * PageHeadingMetaItem - Individual metadata item with optional icon
 *
 * Displays a single piece of metadata with an optional leading icon.
 * Icons are automatically sized and colored appropriately.
 */
export function PageHeadingMetaItem({
  className,
  icon: Icon,
  children,
  ...props
}: React.ComponentPropsWithoutRef<'div'> & {
  icon?: React.ComponentType<React.ComponentPropsWithoutRef<'svg'>>
}) {
  return (
    <div
      {...props}
      className={clsx(
        className,
        'mt-2 flex items-center text-sm text-zinc-500',
        'dark:text-zinc-400'
      )}
    >
      {Icon !== undefined && Icon !== null && (
        <Icon
          aria-hidden="true"
          className={clsx(
            'mr-1.5 size-5 shrink-0 text-zinc-400',
            'dark:text-zinc-500'
          )}
        />
      )}
      {children}
    </div>
  )
}

/**
 * PageHeadingSection - Content section wrapper
 *
 * Used to group title, description, and metadata together.
 * Provides flex-grow to allow actions to align right.
 */
export function PageHeadingSection({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      {...props}
      className={clsx(
        className,
        'min-w-0 flex-1'
      )}
    >
      {children}
    </div>
  )
}

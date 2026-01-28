import clsx from 'clsx'
import React from 'react'

export function EmptyState({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      {...props}
      className={clsx(
        className,
        'text-center'
      )}
    >
      {children}
    </div>
  )
}

export function EmptyStateIcon({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      {...props}
      className={clsx(
        className,
        'mx-auto size-12 text-gray-400 dark:text-gray-500'
      )}
    >
      {children}
    </div>
  )
}

export function EmptyStateTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'h3'>) {
  return (
    <h3
      {...props}
      className={clsx(
        className,
        'mt-2 text-sm font-semibold text-gray-900 dark:text-white'
      )}
    />
  )
}

export function EmptyStateDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'p'>) {
  return (
    <p
      {...props}
      className={clsx(
        className,
        'mt-1 text-sm text-gray-500 dark:text-gray-400'
      )}
    />
  )
}

export function EmptyStateActions({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      {...props}
      className={clsx(
        className,
        'mt-6'
      )}
    >
      {children}
    </div>
  )
}

export function EmptyStateDashed({
  className,
  children,
  as: Component = 'div',
  ...props
}: {
  as?: 'div' | 'button'
  className?: string
  children: React.ReactNode
} & (
  | React.ComponentPropsWithoutRef<'div'>
  | React.ComponentPropsWithoutRef<'button'>
)) {
  return (
    <Component
      {...props}
      className={clsx(
        className,
        'relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center',
        'dark:border-white/15',
        Component === 'button' && 'hover:border-gray-400 focus:outline-2 focus:outline-offset-2 focus:outline-indigo-600 dark:hover:border-white/25 dark:focus:outline-indigo-500'
      )}
    >
      {children}
    </Component>
  )
}

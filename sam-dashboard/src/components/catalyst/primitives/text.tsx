import clsx from 'clsx'
import React from 'react'
import { Link } from './link'

// Text variant classes
const variantClasses: Record<string, string> = {
  heading1: 'text-4xl font-bold text-zinc-950 dark:text-white',
  heading2: 'text-3xl font-bold text-zinc-950 dark:text-white',
  heading3: 'text-2xl font-semibold text-zinc-950 dark:text-white',
  heading4: 'text-xl font-semibold text-zinc-950 dark:text-white',
  heading5: 'text-lg font-semibold text-zinc-950 dark:text-white',
  heading6: 'text-base font-semibold text-zinc-950 dark:text-white',
  body: 'text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400',
  bodySmall: 'text-sm text-zinc-500 dark:text-zinc-400',
  bodyLarge: 'text-lg text-zinc-500 dark:text-zinc-400',
  caption: 'text-xs text-zinc-500 dark:text-zinc-400',
  label: 'text-sm font-medium text-zinc-950 dark:text-white',
}

// Color classes
const colorClasses: Record<string, string> = {
  primary: 'text-zinc-950 dark:text-white',
  secondary: 'text-zinc-500 dark:text-zinc-400',
  muted: 'text-zinc-400 dark:text-zinc-500',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-amber-600 dark:text-amber-400',
  danger: 'text-red-600 dark:text-red-400',
  error: 'text-red-600 dark:text-red-400',
  info: 'text-blue-600 dark:text-blue-400',
  white: 'text-white',
}

// Weight classes
const weightClasses: Record<string, string> = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
}

type TextElement = 'p' | 'span' | 'div' | 'label' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

export interface TextProps extends Omit<React.HTMLAttributes<HTMLElement>, 'color'> {
  as?: TextElement
  variant?: keyof typeof variantClasses
  color?: keyof typeof colorClasses
  weight?: keyof typeof weightClasses
  /** For label elements - associates label with form element */
  htmlFor?: string
}

export function Text({ as: Component = 'p', className, variant, color, weight, ...props }: TextProps) {
  return (
    <Component
      data-slot="text"
      {...props}
      className={clsx(
        variant !== undefined ? variantClasses[variant] : 'text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400',
        color !== undefined && colorClasses[color],
        weight !== undefined && weightClasses[weight],
        className
      )}
    />
  )
}

export function TextLink({ className, ...props }: React.ComponentPropsWithoutRef<typeof Link>) {
  return (
    <Link
      {...props}
      className={clsx(
        className,
        'text-zinc-950 underline decoration-zinc-950/50 data-hover:decoration-zinc-950 dark:text-white dark:decoration-white/50 dark:data-hover:decoration-white'
      )}
    />
  )
}

export function Strong({ className, ...props }: React.ComponentPropsWithoutRef<'strong'>) {
  return <strong {...props} className={clsx(className, 'font-medium text-zinc-950 dark:text-white')} />
}

export function Code({ className, ...props }: React.ComponentPropsWithoutRef<'code'>) {
  return (
    <code
      {...props}
      className={clsx(
        className,
        'rounded-sm border border-zinc-950/10 bg-zinc-950/2.5 px-0.5 text-sm font-medium text-zinc-950 sm:text-[0.8125rem] dark:border-white/20 dark:bg-white/5 dark:text-white'
      )}
    />
  )
}

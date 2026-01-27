import * as Headless from '@headlessui/react'
import clsx from 'clsx'
import React, { Children, cloneElement, isValidElement } from 'react'

type ButtonGroupVariant = 'solid' | 'outline'
type ButtonGroupSize = 'sm' | 'md' | 'lg'

const variantStyles = {
  solid: [
    'border-transparent bg-zinc-900',
    'dark:bg-zinc-600',
    'before:absolute before:inset-0 before:-z-10 before:bg-zinc-900',
    'before:shadow-sm',
    'dark:before:hidden',
    'dark:border-white/5',
    'after:absolute after:inset-0 after:-z-10',
    'after:shadow-[inset_0_1px_theme(colors.white/15%)]',
    'data-active:after:bg-white/10 data-hover:after:bg-white/10',
    'dark:after:-inset-px',
    'data-disabled:before:shadow-none data-disabled:after:shadow-none',
  ],
  outline: [
    'border-zinc-950/10 text-zinc-950 data-active:bg-zinc-950/2.5 data-hover:bg-zinc-950/2.5',
    'dark:border-white/15 dark:text-white dark:data-active:bg-white/5 dark:data-hover:bg-white/5',
  ],
}

const sizeStyles = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
}

const baseStyles = [
  'relative inline-flex items-center justify-center gap-x-2 border font-semibold',
  'focus:outline-hidden data-focus:outline-2 data-focus:outline-offset-2 data-focus:outline-blue-500',
  'data-disabled:opacity-50',
  'transition-colors',
]

export function ButtonGroup({
  variant = 'solid',
  size = 'md',
  className,
  children,
  'aria-label': ariaLabel,
  ...props
}: {
  variant?: ButtonGroupVariant
  size?: ButtonGroupSize
  className?: string
  children: React.ReactNode
  'aria-label'?: string
}) {
  const childrenArray = Children.toArray(children)
  const childCount = childrenArray.length

  return (
    <span
      role="group"
      aria-label={ariaLabel}
      className={clsx(className, 'isolate inline-flex')}
      {...props}
    >
      {Children.map(children, (child, index) => {
        if (isValidElement(child) && child.type === ButtonGroupItem) {
          const isFirst = index === 0
          const isLast = index === childCount - 1
          const isOnly = childCount === 1

          return cloneElement(child, {
            ...child.props,
            'data-position': isFirst ? 'first' : isLast ? 'last' : 'middle',
            'data-is-only': isOnly,
            variant,
            size,
          } as ButtonGroupItemProps)
        }
        return child
      })}
    </span>
  )
}

type ButtonGroupItemProps = {
  variant?: ButtonGroupVariant
  size?: ButtonGroupSize
  className?: string
  disabled?: boolean
  icon?: React.ReactNode
  children?: React.ReactNode
  onClick?: () => void
  'aria-label'?: string
  'data-position'?: 'first' | 'middle' | 'last'
  'data-is-only'?: boolean
} & Omit<Headless.ButtonProps, 'as' | 'className'>

export function ButtonGroupItem({
  variant = 'solid',
  size = 'md',
  className,
  disabled = false,
  icon,
  children,
  onClick,
  'aria-label': ariaLabel,
  'data-position': dataPosition,
  'data-is-only': dataIsOnly,
  ...props
}: ButtonGroupItemProps) {
  const roundedStyles = dataIsOnly === true
    ? 'rounded-lg'
    : dataPosition === 'first'
      ? 'rounded-l-lg rounded-r-none'
      : dataPosition === 'last'
        ? 'rounded-r-lg rounded-l-none'
        : 'rounded-none'

  const borderStyles = dataPosition === 'middle' || dataPosition === 'last'
    ? '-ml-px'
    : ''

  const classes = clsx(
    className,
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    roundedStyles,
    borderStyles
  )

  return (
    <Headless.Button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className={classes}
      {...props}
    >
      {icon !== undefined && icon !== null && (
        <span className="shrink-0" aria-hidden="true">
          {icon}
        </span>
      )}
      {children !== undefined && children !== null && children}
    </Headless.Button>
  )
}

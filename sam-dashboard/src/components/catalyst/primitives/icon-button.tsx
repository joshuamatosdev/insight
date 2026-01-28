import clsx from 'clsx'
import React, { forwardRef } from 'react'
import { Button } from './button'

type ButtonColor = 'dark/zinc' | 'light' | 'dark/white' | 'dark' | 'white' | 'zinc' | 'indigo' | 'cyan' | 'red' | 'orange' | 'amber' | 'yellow' | 'lime' | 'green' | 'emerald' | 'teal' | 'sky' | 'blue' | 'violet' | 'purple' | 'fuchsia' | 'pink' | 'rose'

type IconButtonProps = {
  icon: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  color?: ButtonColor
  outline?: boolean
  plain?: boolean
  disabled?: boolean
  'aria-label': string
} & Omit<React.ComponentPropsWithoutRef<'button'>, 'children' | 'color'>

const sizeClasses = {
  sm: 'p-1 *:data-[slot=icon]:size-4',
  md: 'p-1.5 *:data-[slot=icon]:size-5',
  lg: 'p-2 *:data-[slot=icon]:size-6',
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'md', className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        {...props}
        className={clsx(
          '!px-0 !py-0 aspect-square',
          sizeClasses[size],
          className
        )}
      >
        <span data-slot="icon">{icon}</span>
      </Button>
    )
  }
)

IconButton.displayName = 'IconButton'

export default IconButton

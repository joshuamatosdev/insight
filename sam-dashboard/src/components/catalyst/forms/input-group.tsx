import * as Headless from '@headlessui/react'
import clsx from 'clsx'
import React, {forwardRef} from 'react'

// Type definitions
type InputGroupProps = {
    className?: string
    children: React.ReactNode
} & React.ComponentPropsWithoutRef<'div'>

type InputAddonProps = {
    className?: string
    children: React.ReactNode
} & React.ComponentPropsWithoutRef<'div'>

type InputGroupInputProps = {
    className?: string
    type?: 'email' | 'number' | 'password' | 'search' | 'tel' | 'text' | 'url'
} & Omit<Headless.InputProps, 'as' | 'className'>

// InputGroup - Container for input with addons
export function InputGroup({className, children, ...props}: InputGroupProps) {
    return (
        <div
            data-slot="input-group"
            {...props}
            className={clsx(
                className,
                // Basic layout - flex container
                'relative flex items-stretch',
                // Focus ring applied to entire group
                'rounded-lg',
                // Focus-within creates ring around entire group
                'has-[:focus]:ring-2 has-[:focus]:ring-blue-500 has-[:focus]:ring-inset'
            )}
        >
            {children}
        </div>
    )
}

// InputAddon - Leading or trailing addon
export function InputAddon({className, children, ...props}: InputAddonProps) {
    return (
        <div
            data-slot="input-addon"
            {...props}
            className={clsx(
                className,
                // Layout
                'flex items-center',
                // Padding
                'px-3',
                // Typography
                'text-base/6 text-zinc-700 sm:text-sm/6 dark:text-zinc-300',
                // Border - matches input borders
                'border border-zinc-950/10 dark:border-white/10',
                // Background
                'bg-zinc-50 dark:bg-zinc-800/50',
                // First child - rounded left
                'first:rounded-l-lg first:border-r-0',
                // Last child - rounded right
                'last:rounded-r-lg last:border-l-0',
                // Middle children (between input and other addon)
                'not-first:not-last:border-x-0',
                // Select elements inside addon
                '[&_select]:border-0 [&_select]:bg-transparent [&_select]:pr-8 [&_select]:text-zinc-950 dark:[&_select]:text-white',
                '[&_select]:focus:outline-hidden [&_select]:focus:ring-0',
                // Icon styling
                '[&_svg]:size-5 [&_svg]:text-zinc-500 dark:[&_svg]:text-zinc-400'
            )}
        >
            {children}
        </div>
    )
}

// InputGroupInput - The input field within the group
export const InputGroupInput = forwardRef(function InputGroupInput(
    {className, ...props}: InputGroupInputProps,
    ref: React.ForwardedRef<HTMLInputElement>
) {
    return (
        <Headless.Input
            ref={ref}
            {...props}
            className={clsx(
                className,
                // Basic layout
                'relative flex-1 block w-full appearance-none',
                // Remove individual border radius - group handles it
                'rounded-none',
                // First input - rounded left
                'first:rounded-l-lg',
                // Last input - rounded right
                'last:rounded-r-lg',
                // Only child - rounded both sides
                'only:rounded-lg',
                // Padding
                'px-[calc(--spacing(3.5)-1px)] py-[calc(--spacing(2.5)-1px)] sm:px-[calc(--spacing(3)-1px)] sm:py-[calc(--spacing(1.5)-1px)]',
                // Typography
                'text-base/6 text-zinc-950 placeholder:text-zinc-500 sm:text-sm/6 dark:text-white',
                // Border
                'border border-zinc-950/10 data-hover:border-zinc-950/20 dark:border-white/10 dark:data-hover:border-white/20',
                // Adjacent to addon - remove border on addon side
                'has-[~[data-slot=input-addon]]:border-r-0',
                '[data-slot=input-addon]~&:border-l-0',
                // Background color
                'bg-white dark:bg-white/5',
                // Hide default focus styles (group handles focus ring)
                'focus:outline-hidden focus:ring-0',
                // Invalid state
                'data-invalid:border-red-500 data-invalid:data-hover:border-red-500 dark:data-invalid:border-red-600 dark:data-invalid:data-hover:border-red-600',
                // Disabled state
                'data-disabled:opacity-50 data-disabled:bg-zinc-950/5 dark:data-disabled:bg-white/2.5 data-disabled:border-zinc-950/20 dark:data-disabled:border-white/15'
            )}
        />
    )
})

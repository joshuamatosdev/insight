/**
 * Card Component - Catalyst UI Kit
 *
 * A flexible card component with multiple variants and compound components for building
 * structured content layouts.
 *
 * @example
 * ```tsx
 * <Card variant="elevated" padding="none">
 *   <CardHeader divider>
 *     <CardTitle>Card Title</CardTitle>
 *     <CardDescription>Card description</CardDescription>
 *   </CardHeader>
 *   <CardBody>Main content</CardBody>
 *   <CardFooter>Footer content</CardFooter>
 * </Card>
 * ```
 *
 * Variants:
 * - `elevated`: White background with shadow (default)
 * - `outlined`: White background with border
 * - `filled`: Gray background, no shadow/border
 *
 * Features:
 * - Responsive padding options (none, sm, md, lg)
 * - Edge-to-edge mobile mode (no rounded corners on mobile)
 * - Compound components for header, title, description, body, footer
 * - Optional dividers between sections
 * - Gray variant for body and footer sections
 * - Full dark mode support
 */

import clsx from 'clsx'
import type React from 'react'
import {forwardRef} from 'react'

type CardVariant = 'elevated' | 'outlined' | 'filled'
type CardPadding = 'none' | 'sm' | 'md' | 'lg'

interface CardProps extends React.ComponentPropsWithoutRef<'div'> {
    variant?: CardVariant
    padding?: CardPadding
    edgeToEdgeMobile?: boolean
}

const paddingClasses: Record<CardPadding, string> = {
    none: '',
    sm: 'px-4 py-4 sm:p-4',
    md: 'px-4 py-5 sm:p-6',
    lg: 'px-4 py-6 sm:p-8',
}

const variantClasses: Record<CardVariant, string> = {
    elevated:
        'bg-white shadow-sm dark:bg-gray-800/50 dark:shadow-none dark:outline dark:-outline-offset-1 dark:outline-white/10',
    outlined: 'bg-white border border-gray-200 dark:bg-gray-800/50 dark:border-white/10',
    filled: 'bg-gray-50 dark:bg-gray-800/50',
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
    ({variant = 'elevated', padding = 'md', edgeToEdgeMobile = false, className, children, ...props}, ref) => {
        return (
            <div
                ref={ref}
                {...props}
                className={clsx(
                    'overflow-hidden',
                    edgeToEdgeMobile ? 'sm:rounded-lg' : 'rounded-lg',
                    variantClasses[variant],
                    paddingClasses[padding],
                    className
                )}
            >
                {children}
            </div>
        )
    }
)

Card.displayName = 'Card'

interface CardHeaderProps extends React.ComponentPropsWithoutRef<'div'> {
    divider?: boolean
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
    ({divider = false, className, children, ...props}, ref) => {
        return (
            <div
                ref={ref}
                {...props}
                className={clsx(
                    'px-4 py-5 sm:px-6',
                    divider && 'border-b border-gray-200 dark:border-white/10',
                    className
                )}
            >
                {children}
            </div>
        )
    }
)

CardHeader.displayName = 'CardHeader'

export const CardTitle = forwardRef<HTMLHeadingElement, React.ComponentPropsWithoutRef<'h3'>>(
    ({className, ...props}, ref) => {
        return (
            <h3
                ref={ref}
                {...props}
                className={clsx('text-lg/6 font-semibold text-zinc-950 sm:text-base/6 dark:text-white', className)}
            />
        )
    }
)

CardTitle.displayName = 'CardTitle'

export const CardDescription = forwardRef<HTMLParagraphElement, React.ComponentPropsWithoutRef<'p'>>(
    ({className, ...props}, ref) => {
        return (
            <p
                ref={ref}
                {...props}
                className={clsx('mt-1 text-sm/6 text-zinc-500 dark:text-zinc-400', className)}
            />
        )
    }
)

CardDescription.displayName = 'CardDescription'

interface CardBodyProps extends React.ComponentPropsWithoutRef<'div'> {
    divider?: boolean
    variant?: 'default' | 'gray'
}

export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
    ({divider = false, variant = 'default', className, children, ...props}, ref) => {
        return (
            <div
                ref={ref}
                {...props}
                className={clsx(
                    'px-4 py-5 sm:p-6',
                    divider && 'border-t border-gray-200 dark:border-white/10',
                    variant === 'gray' && 'bg-gray-50 dark:bg-gray-800/50',
                    className
                )}
            >
                {children}
            </div>
        )
    }
)

CardBody.displayName = 'CardBody'

interface CardFooterProps extends React.ComponentPropsWithoutRef<'div'> {
    divider?: boolean
    variant?: 'default' | 'gray'
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
    ({divider = false, variant = 'default', className, children, ...props}, ref) => {
        return (
            <div
                ref={ref}
                {...props}
                className={clsx(
                    'px-4 py-4 sm:px-6',
                    divider && 'border-t border-gray-200 dark:border-white/10',
                    variant === 'gray' && 'bg-gray-50 dark:bg-gray-800/50',
                    className
                )}
            >
                {children}
            </div>
        )
    }
)

CardFooter.displayName = 'CardFooter'

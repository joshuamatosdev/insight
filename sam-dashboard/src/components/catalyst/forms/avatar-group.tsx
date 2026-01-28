import clsx from 'clsx'
import React from 'react'

type AvatarGroupSize = 'sm' | 'md' | 'lg' | 'xl'

type AvatarGroupProps = {
    max?: number
    size?: AvatarGroupSize
    className?: string
    children?: React.ReactNode
}

const sizeClasses: Record<AvatarGroupSize, { avatar: string; overflow: string; wrapper: string }> = {
    sm: {
        avatar: 'size-8',
        overflow: 'size-8 text-xs',
        wrapper: '[&>[data-slot="avatar"]]:size-8',
    },
    md: {
        avatar: 'size-10',
        overflow: 'size-10 text-sm',
        wrapper: '[&>[data-slot="avatar"]]:size-10',
    },
    lg: {
        avatar: 'size-12',
        overflow: 'size-12 text-base',
        wrapper: '[&>[data-slot="avatar"]]:size-12',
    },
    xl: {
        avatar: 'size-14',
        overflow: 'size-14 text-lg',
        wrapper: '[&>[data-slot="avatar"]]:size-14',
    },
}

export function AvatarGroup({
                                max,
                                size = 'md',
                                className,
                                children,
                                ...props
                            }: AvatarGroupProps & React.ComponentPropsWithoutRef<'div'>) {
    const childArray = React.Children.toArray(children)
    const total = childArray.length
    const displayLimit = max !== undefined && max !== null ? max : total
    const hasOverflow = total > displayLimit
    const overflowCount = total - displayLimit

    const visibleChildren = childArray.slice(0, displayLimit)

    const {wrapper, overflow} = sizeClasses[size]

    return (
        <div
            {...props}
            className={clsx(
                className,
                'flex -space-x-2',
                wrapper,
                // Add ring to all avatars for separation
                '[&>[data-slot="avatar"]]:ring-2 [&>[data-slot="avatar"]]:ring-white dark:[&>[data-slot="avatar"]]:ring-zinc-900'
            )}
        >
            {visibleChildren.map((child, index) =>
                React.cloneElement(child as React.ReactElement, {
                    key: index,
                })
            )}
            {hasOverflow && overflowCount > 0 && (
                <span
                    className={clsx(
                        'inline-flex items-center justify-center rounded-full bg-zinc-100 font-medium text-zinc-700 ring-2 ring-white dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-900',
                        overflow
                    )}
                    aria-label={`${overflowCount} more users`}
                >
          +{overflowCount}
        </span>
            )}
        </div>
    )
}

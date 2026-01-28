import clsx from 'clsx'
import React from 'react'

// Types
type TimelineStatus = 'completed' | 'current' | 'pending'

type TimelineProps = {
    className?: string
    children: React.ReactNode
} & React.ComponentPropsWithoutRef<'ul'>

type TimelineItemProps = {
    icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
    date?: string
    status?: TimelineStatus
    className?: string
    children: React.ReactNode
} & React.ComponentPropsWithoutRef<'li'>

// Timeline container component
export function Timeline({className, children, ...props}: TimelineProps) {
    return (
        <ul
            role="list"
            {...props}
            className={clsx(
                className,
                'space-y-6'
            )}
        >
            {children}
        </ul>
    )
}

// TimelineItem component
export function TimelineItem({
                                 icon: Icon,
                                 date,
                                 status = 'pending',
                                 className,
                                 children,
                                 ...props
                             }: TimelineItemProps) {
    return (
        <li
            {...props}
            className={clsx(
                className,
                'relative flex gap-x-4'
            )}
        >
            {/* Connecting line */}
            <div
                className={clsx(
                    'absolute left-0 top-0 flex w-6 justify-center -bottom-6',
                )}
            >
                <div
                    data-slot="timeline-line"
                    className="w-px bg-zinc-950/10 dark:bg-white/10"
                />
            </div>

            {/* Icon container */}
            <div
                className={clsx(
                    'relative flex size-6 shrink-0 items-center justify-center rounded-full',
                    // Status-based styling
                    status === 'completed' &&
                    'bg-success-bg ring-success-outline ring-1 text-success-text',
                    status === 'current' &&
                    'bg-blue-500/10 ring-blue-500/30 ring-2 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
                    status === 'pending' &&
                    'bg-zinc-100 ring-zinc-300 ring-1 text-zinc-500 dark:bg-zinc-800 dark:ring-zinc-700 dark:text-zinc-400'
                )}
            >
                {Icon !== undefined && Icon !== null ? (
                    <Icon className="size-3.5" aria-hidden="true"/>
                ) : (
                    <div
                        className={clsx(
                            'size-1.5 rounded-full',
                            status === 'completed' && 'bg-success-text',
                            status === 'current' && 'bg-blue-600 dark:bg-blue-400',
                            status === 'pending' && 'bg-zinc-500 dark:bg-zinc-400'
                        )}
                    />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                {date !== undefined && date !== null && date !== '' && (
                    <time
                        className={clsx(
                            'text-xs leading-5',
                            status === 'completed' && 'text-zinc-500 dark:text-zinc-400',
                            status === 'current' && 'text-blue-600 font-medium dark:text-blue-400',
                            status === 'pending' && 'text-zinc-400 dark:text-zinc-500'
                        )}
                    >
                        {date}
                    </time>
                )}
                <div
                    className={clsx(
                        'text-sm leading-6',
                        status === 'completed' && 'text-zinc-700 dark:text-zinc-300',
                        status === 'current' && 'text-zinc-900 font-medium dark:text-white',
                        status === 'pending' && 'text-zinc-600 dark:text-zinc-400'
                    )}
                >
                    {children}
                </div>
            </div>
        </li>
    )
}

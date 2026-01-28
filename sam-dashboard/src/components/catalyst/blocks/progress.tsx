import clsx from 'clsx'
import React, {forwardRef} from 'react'

const colors = {
    blue: 'bg-blue-600 dark:bg-blue-500',
    indigo: 'bg-indigo-600 dark:bg-indigo-500',
    green: 'bg-green-600 dark:bg-green-500',
    emerald: 'bg-success',
    red: 'bg-danger',
    rose: 'bg-rose-600 dark:bg-rose-500',
    yellow: 'bg-yellow-600 dark:bg-yellow-500',
    amber: 'bg-warning',
    zinc: 'bg-zinc-600 dark:bg-zinc-500',
}

const sizes = {
    xs: 'h-1',
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-2.5',
    xl: 'h-3',
}

type ProgressBarProps = {
    value?: number
    max?: number
    color?: keyof typeof colors
    size?: keyof typeof sizes
    className?: string
}

export const Progress = forwardRef<HTMLDivElement, ProgressBarProps>(function Progress(
    {value, max = 100, color = 'indigo', size = 'md', className, ...props},
    ref
) {
    const percentage = value !== undefined && value !== null ? Math.min(Math.max((value / max) * 100, 0), 100) : 0
    const isIndeterminate = value === undefined || value === null

    return (
        <div
            ref={ref}
            role="progressbar"
            aria-valuenow={isIndeterminate ? undefined : value}
            aria-valuemin={0}
            aria-valuemax={max}
            className={clsx('overflow-hidden rounded-full bg-zinc-200 dark:bg-white/10', sizes[size], className)}
            {...props}
        >
            <div
                className={clsx(
                    'h-full rounded-full transition-all duration-300 ease-in-out',
                    colors[color],
                    isIndeterminate && 'animate-pulse'
                )}
                style={{width: isIndeterminate ? '100%' : `${percentage}%`}}
            />
        </div>
    )
})

type ProgressLabelProps = {
    className?: string
    children: React.ReactNode
}

export function ProgressLabel({className, children, ...props}: ProgressLabelProps) {
    return (
        <p className={clsx('text-sm font-medium text-zinc-900 dark:text-white', className)} {...props}>
            {children}
        </p>
    )
}

type ProgressWithLabelProps = {
    value?: number
    max?: number
    color?: keyof typeof colors
    size?: keyof typeof sizes
    label?: string
    showValue?: boolean
    className?: string
}

export function ProgressWithLabel({
                                      value,
                                      max = 100,
                                      color = 'indigo',
                                      size = 'md',
                                      label,
                                      showValue = false,
                                      className,
                                      ...props
                                  }: ProgressWithLabelProps) {
    const percentage = value !== undefined && value !== null ? Math.min(Math.max((value / max) * 100, 0), 100) : 0
    const isIndeterminate = value === undefined || value === null

    return (
        <div className={className} {...props}>
            {(label !== undefined && label !== null) || showValue ? (
                <div className="mb-2 flex items-center justify-between">
                    {label !== undefined && label !== null ? <ProgressLabel>{label}</ProgressLabel> : null}
                    {showValue && isIndeterminate === false ? (
                        <span
                            className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{Math.round(percentage)}%</span>
                    ) : null}
                </div>
            ) : null}
            <Progress value={value} max={max} color={color} size={size}/>
        </div>
    )
}

import clsx from 'clsx'
import React, {forwardRef} from 'react'
import {XMarkIcon} from '@heroicons/react/20/solid'

// Color variant patterns using semantic tokens (dark mode built-in)
const colors = {
    info: {
        container: 'bg-info-bg',
        icon: 'text-info',
        title: 'text-info-text',
        description: 'text-info-text/80',
        dismissButton:
            'text-info hover:bg-info/10 focus-visible:ring-info focus-visible:ring-offset-info-bg',
    },
    success: {
        container: 'bg-success-bg',
        icon: 'text-success',
        title: 'text-success-text',
        description: 'text-success-text/80',
        dismissButton:
            'text-success hover:bg-success/10 focus-visible:ring-success focus-visible:ring-offset-success-bg',
    },
    warning: {
        container: 'bg-warning-bg',
        icon: 'text-warning',
        title: 'text-warning-text',
        description: 'text-warning-text/80',
        dismissButton:
            'text-warning hover:bg-warning/10 focus-visible:ring-warning focus-visible:ring-offset-warning-bg',
    },
    error: {
        container: 'bg-danger-bg',
        icon: 'text-danger',
        title: 'text-danger-text',
        description: 'text-danger-text/80',
        dismissButton:
            'text-danger hover:bg-danger/10 focus-visible:ring-danger focus-visible:ring-offset-danger-bg',
    },
}

type InlineAlertColor = keyof typeof colors

interface InlineAlertContextValue {
    color: InlineAlertColor
}

const InlineAlertContext = React.createContext<InlineAlertContextValue | null>(null)

function useInlineAlertContext() {
    const context = React.useContext(InlineAlertContext)
    if (context === null) {
        throw new Error('InlineAlert compound components must be used within InlineAlert')
    }
    return context
}

export interface InlineAlertProps {
    color?: InlineAlertColor
    icon?: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
    onDismiss?: () => void
    className?: string
    children: React.ReactNode
}

export const InlineAlert = forwardRef<HTMLDivElement, InlineAlertProps>(function InlineAlert(
    {color = 'info', icon: Icon, onDismiss, className, children, ...props},
    ref
) {
    const colorScheme = colors[color]

    return (
        <InlineAlertContext.Provider value={{color}}>
            <div
                ref={ref}
                role="alert"
                className={clsx('rounded-md p-4', colorScheme.container, className)}
                {...props}
            >
                <div className="flex">
                    {Icon !== undefined && (
                        <div className="shrink-0">
                            <Icon aria-hidden className={clsx('size-5', colorScheme.icon)}/>
                        </div>
                    )}
                    <div className={clsx(Icon !== undefined && 'ml-3', 'flex-1')}>{children}</div>
                    {onDismiss !== undefined && (
                        <div className="ml-auto pl-3">
                            <div className="-mx-1.5 -my-1.5">
                                <button
                                    type="button"
                                    onClick={onDismiss}
                                    className={clsx(
                                        'inline-flex rounded-md p-1.5',
                                        'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden',
                                        colorScheme.dismissButton
                                    )}
                                >
                                    <span className="sr-only">Dismiss</span>
                                    <XMarkIcon aria-hidden className="size-5"/>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </InlineAlertContext.Provider>
    )
})

export interface InlineAlertTitleProps {
    className?: string
    children: React.ReactNode
}

export const InlineAlertTitle = forwardRef<HTMLHeadingElement, InlineAlertTitleProps>(
    function InlineAlertTitle({className, children, ...props}, ref) {
        const {color} = useInlineAlertContext()
        const colorScheme = colors[color]

        return (
            <h3 ref={ref} className={clsx('text-sm font-medium', colorScheme.title, className)} {...props}>
                {children}
            </h3>
        )
    }
)

export interface InlineAlertDescriptionProps {
    className?: string
    children: React.ReactNode
}

export const InlineAlertDescription = forwardRef<HTMLDivElement, InlineAlertDescriptionProps>(
    function InlineAlertDescription({className, children, ...props}, ref) {
        const {color} = useInlineAlertContext()
        const colorScheme = colors[color]

        return (
            <div ref={ref} className={clsx('mt-2 text-sm', colorScheme.description, className)} {...props}>
                {children}
            </div>
        )
    }
)

export interface InlineAlertActionsProps {
    className?: string
    children: React.ReactNode
}

export const InlineAlertActions = forwardRef<HTMLDivElement, InlineAlertActionsProps>(
    function InlineAlertActions({className, children, ...props}, ref) {
        return (
            <div ref={ref} className={clsx('mt-4', className)} {...props}>
                <div className="-mx-2 -my-1.5 flex">{children}</div>
            </div>
        )
    }
)

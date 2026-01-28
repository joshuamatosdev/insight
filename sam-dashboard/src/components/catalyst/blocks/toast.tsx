/**
 * Toast Component
 *
 * A simple toast notification system with auto-dismiss functionality.
 * Use ToastProvider at the app root and useToast hook to show toasts.
 *
 * @example
 * // In your app root
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 *
 * // In any component
 * const toast = useToast()
 * toast.success('Changes saved!')
 * toast.error('Failed to save')
 * toast.warning('Session expiring')
 * toast.info('New update available')
 */

import {Transition} from '@headlessui/react'
import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    XCircleIcon,
    XMarkIcon,
} from '@heroicons/react/20/solid'
import clsx from 'clsx'
import {createContext, type ReactNode, useCallback, useContext, useMemo, useState,} from 'react'

// =============================================================================
// Types
// =============================================================================

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastData {
    id: string
    type: ToastType
    message?: string
    title?: string
    description?: string
    duration?: number
}

export interface ToastProps {
    id: string
    type: ToastType
    message?: string
    title?: string
    description?: string
    onDismiss: (id: string) => void
    className?: string
}

export interface ToastProviderProps {
    children: ReactNode
    duration?: number
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
    maxToasts?: number
}

export interface ToastContextValue {
    success: (message: string, options?: Partial<ToastData>) => string
    error: (message: string, options?: Partial<ToastData>) => string
    warning: (message: string, options?: Partial<ToastData>) => string
    info: (message: string, options?: Partial<ToastData>) => string
    custom: (options: Omit<ToastData, 'id'>) => string
    dismiss: (id: string) => void
    dismissAll: () => void
}

// =============================================================================
// Context
// =============================================================================

const ToastContext = createContext<ToastContextValue | null>(null)

// =============================================================================
// Icons
// =============================================================================

const icons: Record<ToastType, typeof CheckCircleIcon> = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon,
}

const iconColors: Record<ToastType, string> = {
    success: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-amber-400',
    info: 'text-blue-400',
}

// =============================================================================
// Toast Component
// =============================================================================

export function Toast({
                          id,
                          type,
                          message,
                          title,
                          description,
                          onDismiss,
                          className,
                      }: ToastProps) {
    const Icon = icons[type]
    const iconColor = iconColors[type]

    // Use message as title if no title provided
    const displayTitle = title ?? message
    const displayDescription = title !== undefined ? description ?? message : description

    return (
        <div
            role="alert"
            className={clsx(
                'pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black/5 dark:bg-zinc-800 dark:ring-white/10',
                className
            )}
        >
            <div className="p-4">
                <div className="flex items-start">
                    <div className="shrink-0">
                        <Icon aria-hidden="true" className={clsx('size-5', iconColor)}/>
                    </div>
                    <div className="ml-3 w-0 flex-1 pt-0.5">
                        {displayTitle !== undefined && (
                            <p className="text-sm font-medium text-zinc-900 dark:text-white">
                                {displayTitle}
                            </p>
                        )}
                        {displayDescription !== undefined && (
                            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                                {displayDescription}
                            </p>
                        )}
                    </div>
                    <div className="ml-4 flex shrink-0">
                        <button
                            type="button"
                            onClick={() => onDismiss(id)}
                            className="inline-flex rounded-md bg-white text-zinc-400 hover:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-400"
                        >
                            <span className="sr-only">Dismiss</span>
                            <XMarkIcon aria-hidden="true" className="size-5"/>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// =============================================================================
// ToastContainer Component
// =============================================================================

interface ToastContainerProps {
    toasts: ToastData[]
    onDismiss: (id: string) => void
    position: ToastProviderProps['position']
}

function ToastContainer({toasts, onDismiss, position = 'top-right'}: ToastContainerProps) {
    const positionClasses: Record<NonNullable<ToastProviderProps['position']>, string> = {
        'top-right': 'top-0 right-0',
        'top-left': 'top-0 left-0',
        'bottom-right': 'bottom-0 right-0',
        'bottom-left': 'bottom-0 left-0',
        'top-center': 'top-0 left-1/2 -translate-x-1/2',
        'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2',
    }

    return (
        <div
            aria-live="assertive"
            className={clsx(
                'pointer-events-none fixed z-50 flex flex-col gap-2 p-4',
                positionClasses[position]
            )}
        >
            {toasts.map((toast) => (
                <Transition
                    key={toast.id}
                    show={true}
                    appear={true}
                    enter="transform ease-out duration-300 transition"
                    enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
                    enterTo="translate-y-0 opacity-100 sm:translate-x-0"
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <Toast
                        id={toast.id}
                        type={toast.type}
                        message={toast.message}
                        title={toast.title}
                        description={toast.description}
                        onDismiss={onDismiss}
                    />
                </Transition>
            ))}
        </div>
    )
}

// =============================================================================
// ToastProvider Component
// =============================================================================

let toastCounter = 0

function generateId(): string {
    toastCounter += 1
    return `toast-${toastCounter}-${Date.now()}`
}

export function ToastProvider({
                                  children,
                                  duration = 5000,
                                  position = 'top-right',
                                  maxToasts = 5,
                              }: ToastProviderProps) {
    const [toasts, setToasts] = useState<ToastData[]>([])

    const dismiss = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    const dismissAll = useCallback(() => {
        setToasts([])
    }, [])

    const addToast = useCallback(
        (toast: Omit<ToastData, 'id'>) => {
            const id = generateId()
            const toastDuration = toast.duration ?? duration

            setToasts((prev) => {
                const newToasts = [...prev, {...toast, id}]
                // Keep only the most recent maxToasts
                if (newToasts.length > maxToasts) {
                    return newToasts.slice(-maxToasts)
                }
                return newToasts
            })

            // Auto-dismiss after duration
            if (toastDuration > 0) {
                setTimeout(() => {
                    dismiss(id)
                }, toastDuration)
            }

            return id
        },
        [duration, maxToasts, dismiss]
    )

    const success = useCallback(
        (message: string, options?: Partial<ToastData>) => {
            return addToast({type: 'success', message, ...options})
        },
        [addToast]
    )

    const error = useCallback(
        (message: string, options?: Partial<ToastData>) => {
            return addToast({type: 'error', message, ...options})
        },
        [addToast]
    )

    const warning = useCallback(
        (message: string, options?: Partial<ToastData>) => {
            return addToast({type: 'warning', message, ...options})
        },
        [addToast]
    )

    const info = useCallback(
        (message: string, options?: Partial<ToastData>) => {
            return addToast({type: 'info', message, ...options})
        },
        [addToast]
    )

    const custom = useCallback(
        (options: Omit<ToastData, 'id'>) => {
            return addToast(options)
        },
        [addToast]
    )

    const contextValue = useMemo<ToastContextValue>(
        () => ({
            success,
            error,
            warning,
            info,
            custom,
            dismiss,
            dismissAll,
        }),
        [success, error, warning, info, custom, dismiss, dismissAll]
    )

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={dismiss} position={position}/>
        </ToastContext.Provider>
    )
}

// =============================================================================
// useToast Hook
// =============================================================================

export function useToast(): ToastContextValue {
    const context = useContext(ToastContext)
    if (context === null) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}

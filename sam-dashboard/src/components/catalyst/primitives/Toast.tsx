import {useCallback, useEffect, useState} from 'react';
import clsx from 'clsx';
import {Box, Flex, Stack} from '../layout';
import {Text} from './text';
import {Button} from './button';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
}

interface ToastProps {
    toast: ToastMessage;
    onDismiss: (id: string) => void;
}

/** Map of toast type to Tailwind class configurations */
const toastTypeConfig: Record<ToastType, {
    bgClass: string;
    borderClass: string;
    iconBgClass: string;
    icon: string
}> = {
    success: {
        bgClass: 'bg-emerald-50',
        borderClass: 'border-l-emerald-500',
        iconBgClass: 'bg-emerald-500',
        icon: '✓',
    },
    error: {
        bgClass: 'bg-red-50',
        borderClass: 'border-l-red-500',
        iconBgClass: 'bg-red-500',
        icon: '✕',
    },
    warning: {
        bgClass: 'bg-amber-50',
        borderClass: 'border-l-amber-500',
        iconBgClass: 'bg-amber-500',
        icon: '⚠',
    },
    info: {
        bgClass: 'bg-blue-50',
        borderClass: 'border-l-blue-600',
        iconBgClass: 'bg-blue-600',
        icon: 'ℹ',
    },
};

/**
 * Individual toast notification component.
 */
function Toast({toast, onDismiss}: ToastProps): React.ReactElement {
    useEffect(() => {
        const duration = toast.duration ?? 5000;
        if (duration > 0) {
            const timer = setTimeout(() => {
                onDismiss(toast.id);
            }, duration);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [toast.id, toast.duration, onDismiss]);

    const config = toastTypeConfig[toast.type];

    return (
        <Box
            className={clsx(
                config.bgClass,
                'border-l-4',
                config.borderClass,
                'rounded p-3 shadow-md min-w-[300px] max-w-[400px] animate-slide-in'
            )}
        >
            <Flex gap="sm" align="start">
                <Box
                    className={clsx(
                        config.iconBgClass,
                        'w-6 h-6 rounded-full text-white flex items-center justify-center text-sm font-semibold shrink-0'
                    )}
                >
                    {config.icon}
                </Box>
                <Stack spacing="0" className="flex-1">
                    <Text variant="body" className="font-semibold">
                        {toast.title}
                    </Text>
                    {toast.message !== undefined && (
                        <Text variant="caption" color="muted">
                            {toast.message}
                        </Text>
                    )}
                    {toast.action !== undefined && (
                        <Button
                            variant="link"
                            size="sm"
                            onClick={toast.action.onClick}
                            className="mt-1 p-0"
                        >
                            {toast.action.label}
                        </Button>
                    )}
                </Stack>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDismiss(toast.id)}
                    className="p-1"
                    aria-label="Dismiss"
                >
                    ✕
                </Button>
            </Flex>
        </Box>
    );
}

interface ToastContainerProps {
    toasts: ToastMessage[];
    onDismiss: (id: string) => void;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

/**
 * Container for toast notifications.
 */
export function ToastContainer({
                                   toasts,
                                   onDismiss,
                                   position = 'top-right',
                               }: ToastContainerProps): React.ReactElement {
    const getPositionStyles = (): React.CSSProperties => {
        const base: React.CSSProperties = {
            position: 'fixed',
            zIndex: 9999,
            padding: '1rem',
        };

        switch (position) {
            case 'top-right':
                return {...base, top: 0, right: 0};
            case 'top-left':
                return {...base, top: 0, left: 0};
            case 'bottom-right':
                return {...base, bottom: 0, right: 0};
            case 'bottom-left':
                return {...base, bottom: 0, left: 0};
        }
    };

    return (
        <Stack spacing="sm" style={getPositionStyles()}>
            {toasts.map((toast) => (
                <Toast key={toast.id} toast={toast} onDismiss={onDismiss}/>
            ))}
        </Stack>
    );
}

/**
 * Hook for managing toast notifications.
 */
export function useToast(): {
    toasts: ToastMessage[];
    addToast: (toast: Omit<ToastMessage, 'id'>) => void;
    removeToast: (id: string) => void;
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
} {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, {...toast, id}]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const success = useCallback(
        (title: string, message?: string) => {
            addToast({type: 'success', title, message});
        },
        [addToast]
    );

    const error = useCallback(
        (title: string, message?: string) => {
            addToast({type: 'error', title, message});
        },
        [addToast]
    );

    const warning = useCallback(
        (title: string, message?: string) => {
            addToast({type: 'warning', title, message});
        },
        [addToast]
    );

    const info = useCallback(
        (title: string, message?: string) => {
            addToast({type: 'info', title, message});
        },
        [addToast]
    );

    return {toasts, addToast, removeToast, success, error, warning, info};
}

export default ToastContainer;

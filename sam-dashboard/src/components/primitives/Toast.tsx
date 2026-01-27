import { useState, useEffect, useCallback } from 'react';
import { Flex, Box, Stack } from '../layout';
import { Text, Button } from '../primitives';

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

/**
 * Individual toast notification component.
 */
function Toast({ toast, onDismiss }: ToastProps): React.ReactElement {
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

  const getTypeStyles = (): { bg: string; border: string; icon: string } => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'var(--color-success-50)',
          border: 'var(--color-success)',
          icon: '✓',
        };
      case 'error':
        return {
          bg: 'var(--color-danger-50)',
          border: 'var(--color-danger)',
          icon: '✕',
        };
      case 'warning':
        return {
          bg: 'var(--color-warning-50)',
          border: 'var(--color-warning)',
          icon: '⚠',
        };
      case 'info':
        return {
          bg: 'var(--color-primary-50)',
          border: 'var(--color-primary)',
          icon: 'ℹ',
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <Box
      style={{
        backgroundColor: styles.bg,
        borderLeft: `4px solid ${styles.border}`,
        borderRadius: '4px',
        padding: 'var(--spacing-3)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        minWidth: '300px',
        maxWidth: '400px',
        animation: 'slideIn 0.3s ease-out',
      }}
    >
      <Flex gap="sm" align="flex-start">
        <Box
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: styles.border,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {styles.icon}
        </Box>
        <Stack spacing="0" style={{ flex: 1 }}>
          <Text variant="body" style={{ fontWeight: 600 }}>
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
              style={{ marginTop: 'var(--spacing-1)', padding: 0 }}
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
      padding: 'var(--spacing-4)',
    };

    switch (position) {
      case 'top-right':
        return { ...base, top: 0, right: 0 };
      case 'top-left':
        return { ...base, top: 0, left: 0 };
      case 'bottom-right':
        return { ...base, bottom: 0, right: 0 };
      case 'bottom-left':
        return { ...base, bottom: 0, left: 0 };
    }
  };

  return (
    <Stack spacing="var(--spacing-2)" style={getPositionStyles()}>
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
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
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback(
    (title: string, message?: string) => {
      addToast({ type: 'success', title, message });
    },
    [addToast]
  );

  const error = useCallback(
    (title: string, message?: string) => {
      addToast({ type: 'error', title, message });
    },
    [addToast]
  );

  const warning = useCallback(
    (title: string, message?: string) => {
      addToast({ type: 'warning', title, message });
    },
    [addToast]
  );

  const info = useCallback(
    (title: string, message?: string) => {
      addToast({ type: 'info', title, message });
    },
    [addToast]
  );

  return { toasts, addToast, removeToast, success, error, warning, info };
}

export default ToastContainer;

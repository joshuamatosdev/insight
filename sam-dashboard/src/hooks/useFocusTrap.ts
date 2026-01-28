import {RefObject, useCallback, useEffect, useRef} from 'react';

export interface UseFocusTrapOptions {
  /** Whether the focus trap is active */
  isActive?: boolean;
  /** Whether to auto-focus the first focusable element when trap activates */
  autoFocus?: boolean;
  /** Whether to restore focus to the previously focused element when trap deactivates */
  restoreFocus?: boolean;
  /** Callback when Escape key is pressed */
  onEscape?: () => void;
  /** Custom selector for focusable elements */
  focusableSelector?: string;
  /** Element to focus initially (overrides autoFocus to first element) */
  initialFocusRef?: RefObject<HTMLElement>;
}

export interface UseFocusTrapReturn {
  /** Ref to attach to the container element */
  containerRef: RefObject<HTMLDivElement | null>;
  /** Manually focus the first focusable element */
  focusFirst: () => void;
  /** Manually focus the last focusable element */
  focusLast: () => void;
}

const DEFAULT_FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
].join(', ');

/**
 * Hook for trapping focus within a container element.
 * Useful for modals, dialogs, and dropdown menus.
 */
export function useFocusTrap(options: UseFocusTrapOptions = {}): UseFocusTrapReturn {
  const {
    isActive = true,
    autoFocus = true,
    restoreFocus = true,
    onEscape,
    focusableSelector = DEFAULT_FOCUSABLE_SELECTOR,
    initialFocusRef,
  } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (containerRef.current === null) {
      return [];
    }
    return Array.from(containerRef.current.querySelectorAll<HTMLElement>(focusableSelector)).filter(
      (el) => {
        // Filter out elements that are not visible
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
      }
    );
  }, [focusableSelector]);

  const focusFirst = useCallback(() => {
    const elements = getFocusableElements();
    const firstElement = elements.at(0);
    if (firstElement !== undefined) {
      firstElement.focus();
    }
  }, [getFocusableElements]);

  const focusLast = useCallback(() => {
    const elements = getFocusableElements();
    const lastElement = elements.at(-1);
    if (lastElement !== undefined) {
      lastElement.focus();
    }
  }, [getFocusableElements]);

  // Handle focus trap logic
  useEffect(() => {
    if (isActive === false) {
      return undefined;
    }

    // Store the currently focused element
    previousActiveElementRef.current = document.activeElement as HTMLElement;

    // Auto-focus on initial focus ref or first focusable element
    if (autoFocus) {
      if (initialFocusRef?.current !== undefined && initialFocusRef.current !== null) {
        initialFocusRef.current.focus();
      } else {
        // Use a small delay to ensure the container is mounted
        const timeoutId = setTimeout(() => {
          focusFirst();
        }, 0);
        return () => clearTimeout(timeoutId);
      }
    }

    return undefined;
  }, [isActive, autoFocus, initialFocusRef, focusFirst]);

  // Restore focus when trap deactivates
  useEffect(() => {
    return () => {
      if (restoreFocus && previousActiveElementRef.current !== null) {
        previousActiveElementRef.current.focus();
      }
    };
  }, [restoreFocus]);

  // Handle keyboard events for focus trapping
  useEffect(() => {
    if (isActive === false) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onEscape !== undefined) {
        event.preventDefault();
        onEscape();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements.at(0);
      const lastElement = focusableElements.at(-1);
      const activeElement = document.activeElement;

      // Shift+Tab from first element -> focus last
      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
        return;
      }

      // Tab from last element -> focus first
      if (event.shiftKey === false && activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
        return;
      }

      // If focus is outside the container, trap it
      if (containerRef.current !== null && containerRef.current.contains(activeElement) === false) {
        event.preventDefault();
        if (event.shiftKey) {
          lastElement?.focus();
        } else {
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, getFocusableElements, onEscape]);

  return {
    containerRef,
    focusFirst,
    focusLast,
  };
}

export default useFocusTrap;

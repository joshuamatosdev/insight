import {useCallback, useEffect, useRef} from 'react';

export type AnnouncePoliteness = 'polite' | 'assertive';

export interface UseAnnounceOptions {
  /** Default politeness level (default: 'polite') */
  defaultPoliteness?: AnnouncePoliteness;
  /** Delay in ms before clearing the announcement (default: 1000) */
  clearDelay?: number;
}

export interface UseAnnounceReturn {
  /** Announce a message to screen readers */
  announce: (message: string, politeness?: AnnouncePoliteness) => void;
  /** Clear the current announcement */
  clear: () => void;
}

// Singleton containers for live regions (shared across all hooks)
let politeContainer: HTMLDivElement | null = null;
let assertiveContainer: HTMLDivElement | null = null;
let instanceCount = 0;

/**
 * Creates or returns the singleton live region container for the given politeness level.
 */
function getOrCreateContainer(politeness: AnnouncePoliteness): HTMLDivElement {
  const isPolite = politeness === 'polite';
  const existingContainer = isPolite ? politeContainer : assertiveContainer;

  if (existingContainer !== null) {
    return existingContainer;
  }

  const container = document.createElement('div');
  container.setAttribute('role', 'status');
  container.setAttribute('aria-live', politeness);
  container.setAttribute('aria-atomic', 'true');
  container.setAttribute('aria-relevant', 'additions text');

  // Visually hidden styles
  container.style.cssText = `
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  `;

  container.id = `sr-announcer-${politeness}`;
  document.body.appendChild(container);

  if (isPolite) {
    politeContainer = container;
  } else {
    assertiveContainer = container;
  }

  return container;
}

/**
 * Cleans up the live region containers when no more hooks are using them.
 */
function cleanupContainers(): void {
  if (politeContainer !== null) {
    politeContainer.remove();
    politeContainer = null;
  }
  if (assertiveContainer !== null) {
    assertiveContainer.remove();
    assertiveContainer = null;
  }
}

/**
 * Hook for announcing messages to screen readers using ARIA live regions.
 *
 * @param options - Configuration options
 * @returns Object with announce and clear functions
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { announce } = useAnnounce();
 *
 *   const handleSave = async () => {
 *     await saveData();
 *     announce('Changes saved successfully');
 *   };
 *
 *   const handleError = () => {
 *     announce('An error occurred. Please try again.', 'assertive');
 *   };
 *
 *   return <button onClick={handleSave}>Save</button>;
 * }
 * ```
 */
export function useAnnounce(options: UseAnnounceOptions = {}): UseAnnounceReturn {
  const { defaultPoliteness = 'polite', clearDelay = 1000 } = options;
  const timeoutRef = useRef<number | null>(null);

  // Track instance count for cleanup
  useEffect(() => {
    instanceCount += 1;

    return () => {
      instanceCount -= 1;
      if (instanceCount === 0) {
        cleanupContainers();
      }
    };
  }, []);

  const clear = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (politeContainer !== null) {
      politeContainer.textContent = '';
    }
    if (assertiveContainer !== null) {
      assertiveContainer.textContent = '';
    }
  }, []);

  const announce = useCallback(
    (message: string, politeness: AnnouncePoliteness = defaultPoliteness) => {
      // Clear any pending timeout
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }

      const container = getOrCreateContainer(politeness);

      // Clear the container first, then set the new message
      // This ensures the screen reader announces the new message even if it's the same
      container.textContent = '';

      // Use requestAnimationFrame to ensure the DOM update is processed
      requestAnimationFrame(() => {
        container.textContent = message;
      });

      // Set timeout to clear the announcement
      timeoutRef.current = window.setTimeout(() => {
        container.textContent = '';
        timeoutRef.current = null;
      }, clearDelay);
    },
    [defaultPoliteness, clearDelay]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { announce, clear };
}

export default useAnnounce;

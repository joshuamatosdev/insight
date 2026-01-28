/**
 * Performance utilities for the frontend application.
 */

/**
 * Debounce function - delays execution until after wait ms have elapsed
 * since the last call.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Throttle function - limits execution to once per wait ms.
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    const remaining = wait - (now - lastCall);

    if (remaining <= 0) {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastCall = now;
      func(...args);
    } else if (timeoutId === null) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;
        func(...args);
      }, remaining);
    }
  };
}

/**
 * Memoize function with simple cache.
 */
export function memoize<T extends (...args: unknown[]) => unknown>(
  func: T,
  resolver?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = resolver !== undefined ? resolver(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key) as ReturnType<T>;
    }
    
    const result = func(...args) as ReturnType<T>;
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Request idle callback polyfill for non-supporting browsers.
 */
export function requestIdleCallbackPolyfill(
  callback: (deadline: { didTimeout: boolean; timeRemaining: () => number }) => void,
  options?: { timeout: number }
): number {
  if ('requestIdleCallback' in window) {
    return (window as Window & typeof globalThis & { requestIdleCallback: typeof requestIdleCallback }).requestIdleCallback(callback, options);
  }

  const start = Date.now();
  return globalThis.setTimeout(() => {
    callback({
      didTimeout: false,
      timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
    });
  }, 1);
}

/**
 * Lazy initialization helper - creates value only when first accessed.
 */
export function lazy<T>(factory: () => T): () => T {
  let value: T | undefined;
  let initialized = false;

  return () => {
    if (initialized === false) {
      value = factory();
      initialized = true;
    }
    return value as T;
  };
}

/**
 * Measure execution time of an async function.
 */
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    return await fn();
  } finally {
    const duration = performance.now() - start;
    if (process.env['NODE_ENV'] === 'development') {
      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
    }
  }
}

/**
 * Image lazy loading observer.
 */
export function createImageObserver(
  onIntersect: (entries: IntersectionObserverEntry[]) => void
): IntersectionObserver {
  return new IntersectionObserver(onIntersect, {
    rootMargin: '50px',
    threshold: 0.1,
  });
}

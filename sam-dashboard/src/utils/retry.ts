/**
 * Retry utilities for handling transient failures.
 */

export interface RetryOptions {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier: number;
  maxDelayMs: number;
  retryableErrors?: (error: unknown) => boolean;
  onRetry?: (attempt: number, error: unknown) => void;
}

const DEFAULT_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
  maxDelayMs: 10000,
};

/**
 * Execute a function with automatic retry on failure.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts: RetryOptions = { ...DEFAULT_OPTIONS, ...options };
  let lastError: unknown;
  let delay = opts.delayMs;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if error is retryable
      if (opts.retryableErrors !== undefined && opts.retryableErrors(error) === false) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === opts.maxAttempts) {
        break;
      }

      // Call onRetry callback
      if (opts.onRetry !== undefined) {
        opts.onRetry(attempt, error);
      }

      // Wait before next attempt
      await sleep(delay);

      // Calculate next delay with exponential backoff
      delay = Math.min(delay * opts.backoffMultiplier, opts.maxDelayMs);
    }
  }

  throw lastError;
}

/**
 * Check if an error is a network error (retryable).
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return true;
  }
  
  if (error instanceof Error && error.name === 'AbortError') {
    return false; // Intentional abort, don't retry
  }

  // Check for HTTP status codes that indicate transient errors
  if (isHttpError(error)) {
    const status = getHttpStatus(error);
    return status === 408 || status === 429 || status === 502 || status === 503 || status === 504;
  }

  return false;
}

/**
 * Check if an error is an HTTP error.
 */
export function isHttpError(error: unknown): boolean {
  return (
    error !== null &&
    typeof error === 'object' &&
    'status' in error &&
    typeof (error as { status: unknown }).status === 'number'
  );
}

/**
 * Get HTTP status from an error.
 */
export function getHttpStatus(error: unknown): number | null {
  if (isHttpError(error)) {
    return (error as { status: number }).status;
  }
  return null;
}

/**
 * Sleep for a given number of milliseconds.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a fetch request with exponential backoff.
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryOptions: Partial<RetryOptions> = {}
): Promise<Response> {
  return withRetry(
    async () => {
      const response = await fetch(url, options);
      
      // Throw for server errors to trigger retry
      if (response.status >= 500) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        (error as unknown as { status: number }).status = response.status;
        throw error;
      }
      
      return response;
    },
    {
      ...retryOptions,
      retryableErrors: isNetworkError,
    }
  );
}

/**
 * Create a retry wrapper for an API function.
 */
export function createRetryableApi<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  options: Partial<RetryOptions> = {}
): T {
  return ((...args: Parameters<T>) =>
    withRetry(() => fn(...args), options)) as T;
}

import type { ApiError } from './ApiError.types';

/**
 * Result type for API calls
 */
export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError };

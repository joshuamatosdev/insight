import type {PermissionItem} from './PermissionItem.types';

/**
 * Permission data grouped by category
 */
export interface PermissionsByCategory {
  [category: string]: PermissionItem[];
}

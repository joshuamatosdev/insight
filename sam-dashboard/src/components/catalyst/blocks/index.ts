/**
 * Tailwind UI Blocks
 *
 * This directory contains UI block examples from Tailwind Plus.
 * These are reference implementations - copy and adapt as needed.
 *
 * Categories:
 * - application-ui/ - Dashboard, forms, navigation, etc.
 * - marketing/ - Landing pages, heroes, CTAs, etc.
 * - ecommerce/ - Product pages, carts, checkout, etc.
 */

// Re-export categories for easy access
export const BLOCK_CATEGORIES = ['application-ui', 'marketing', 'ecommerce'] as const;
export type BlockCategory = typeof BLOCK_CATEGORIES[number];

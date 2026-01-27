import { CSSProperties, createElement } from 'react';
import { ScreenReaderOnlyProps } from './ScreenReaderOnly.types';

/**
 * CSS styles that hide content visually but keep it accessible to screen readers.
 * Uses the clip pattern which is widely supported and recommended.
 */
const srOnlyStyles: CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

/**
 * Styles to show the element when focused (for skip links and focusable hidden content).
 */
const focusableStyles: CSSProperties = {
  ...srOnlyStyles,
};

/**
 * ScreenReaderOnly component renders content that is visually hidden
 * but accessible to screen readers.
 *
 * Use cases:
 * - Providing additional context for icons or images
 * - Skip links that become visible on focus
 * - Extra instructions for screen reader users
 * - Announcing state changes
 *
 * @example
 * ```tsx
 * // Hide text visually but keep accessible
 * <ScreenReaderOnly>
 *   Opens in a new window
 * </ScreenReaderOnly>
 *
 * // Focusable skip link
 * <ScreenReaderOnly as="a" focusable>
 *   Skip to main content
 * </ScreenReaderOnly>
 * ```
 */
export function ScreenReaderOnly({
  children,
  as = 'span',
  focusable = false,
  style,
  className,
  ...rest
}: ScreenReaderOnlyProps) {
  const baseStyles = focusable ? focusableStyles : srOnlyStyles;

  // For focusable elements, we need to handle the focus/blur styling
  // This is done via onFocus/onBlur handlers
  const handleFocus = focusable
    ? (e: React.FocusEvent<HTMLElement>) => {
        e.currentTarget.style.position = 'static';
        e.currentTarget.style.width = 'auto';
        e.currentTarget.style.height = 'auto';
        e.currentTarget.style.margin = '0';
        e.currentTarget.style.clip = 'auto';
        e.currentTarget.style.whiteSpace = 'normal';
        e.currentTarget.style.overflow = 'visible';
      }
    : undefined;

  const handleBlur = focusable
    ? (e: React.FocusEvent<HTMLElement>) => {
        e.currentTarget.style.position = 'absolute';
        e.currentTarget.style.width = '1px';
        e.currentTarget.style.height = '1px';
        e.currentTarget.style.margin = '-1px';
        e.currentTarget.style.clip = 'rect(0, 0, 0, 0)';
        e.currentTarget.style.whiteSpace = 'nowrap';
        e.currentTarget.style.overflow = 'hidden';
      }
    : undefined;

  return createElement(
    as,
    {
      className,
      style: { ...baseStyles, ...style },
      tabIndex: focusable ? 0 : undefined,
      onFocus: handleFocus,
      onBlur: handleBlur,
      ...rest,
    },
    children
  );
}

export default ScreenReaderOnly;

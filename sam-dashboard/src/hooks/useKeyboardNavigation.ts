import {KeyboardEvent, RefObject, useCallback, useRef} from 'react';

export interface UseKeyboardNavigationOptions {
  /** The orientation of the list (vertical = up/down arrows, horizontal = left/right) */
  orientation?: 'vertical' | 'horizontal' | 'both';
  /** Whether navigation should wrap around at the ends */
  wrap?: boolean;
  /** Callback when an item is selected (Enter/Space) */
  onSelect?: (index: number) => void;
  /** Callback when focus changes */
  onFocusChange?: (index: number) => void;
  /** Custom selector for focusable items (default: '[tabindex]:not([tabindex="-1"]), button, a, input') */
  itemSelector?: string;
}

export interface UseKeyboardNavigationReturn {
  /** Handler to attach to the container's onKeyDown */
  handleKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  /** Ref to attach to the container element */
  containerRef: RefObject<HTMLElement>;
  /** Focus a specific item by index */
  focusItem: (index: number) => void;
  /** Get the currently focused item index */
  getFocusedIndex: () => number;
}

const DEFAULT_ITEM_SELECTOR =
  '[tabindex]:not([tabindex="-1"]), button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])';

/**
 * Hook for keyboard navigation within lists and menus.
 * Supports arrow key navigation, Home/End, and selection with Enter/Space.
 */
export function useKeyboardNavigation(
  options: UseKeyboardNavigationOptions = {}
): UseKeyboardNavigationReturn {
  const {
    orientation = 'vertical',
    wrap = true,
    onSelect,
    onFocusChange,
    itemSelector = DEFAULT_ITEM_SELECTOR,
  } = options;

  const containerRef = useRef<HTMLElement>(null);

  const getFocusableItems = useCallback((): HTMLElement[] => {
    if (containerRef.current === null) {
      return [];
    }
    return Array.from(containerRef.current.querySelectorAll<HTMLElement>(itemSelector));
  }, [itemSelector]);

  const getFocusedIndex = useCallback((): number => {
    const items = getFocusableItems();
    const activeElement = document.activeElement;
    return items.findIndex((item) => item === activeElement || item.contains(activeElement as Node));
  }, [getFocusableItems]);

  const focusItem = useCallback(
    (index: number) => {
      const items = getFocusableItems();
      if (items.length === 0) {
        return;
      }

      let targetIndex = index;
      if (wrap) {
        targetIndex = ((index % items.length) + items.length) % items.length;
      } else {
        targetIndex = Math.max(0, Math.min(index, items.length - 1));
      }

      const targetItem = items.at(targetIndex);
      if (targetItem !== undefined) {
        targetItem.focus();
        onFocusChange?.(targetIndex);
      }
    },
    [getFocusableItems, wrap, onFocusChange]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      const currentIndex = getFocusedIndex();
      const items = getFocusableItems();

      if (items.length === 0) {
        return;
      }

      const isVertical = orientation === 'vertical' || orientation === 'both';
      const isHorizontal = orientation === 'horizontal' || orientation === 'both';

      switch (event.key) {
        case 'ArrowDown':
          if (isVertical) {
            event.preventDefault();
            focusItem(currentIndex + 1);
          }
          break;

        case 'ArrowUp':
          if (isVertical) {
            event.preventDefault();
            focusItem(currentIndex - 1);
          }
          break;

        case 'ArrowRight':
          if (isHorizontal) {
            event.preventDefault();
            focusItem(currentIndex + 1);
          }
          break;

        case 'ArrowLeft':
          if (isHorizontal) {
            event.preventDefault();
            focusItem(currentIndex - 1);
          }
          break;

        case 'Home':
          event.preventDefault();
          focusItem(0);
          break;

        case 'End':
          event.preventDefault();
          focusItem(items.length - 1);
          break;

        case 'Enter':
        case ' ':
          if (currentIndex >= 0) {
            event.preventDefault();
            onSelect?.(currentIndex);
          }
          break;

        default:
          break;
      }
    },
    [orientation, getFocusedIndex, getFocusableItems, focusItem, onSelect]
  );

  return {
    handleKeyDown,
    containerRef: containerRef as RefObject<HTMLElement>,
    focusItem,
    getFocusedIndex,
  };
}

export default useKeyboardNavigation;

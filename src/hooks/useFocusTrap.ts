import { useEffect, useRef, RefObject } from 'react';

interface UseFocusTrapOptions {
  /** Element to return focus to when deactivated (defaults to previously focused element) */
  returnFocusTo?: RefObject<HTMLElement | null>;
  /** Disable auto-focus on first element when activated */
  disableAutoFocus?: boolean;
}

/**
 * Focus trap hook for modals and dialogs
 * Traps keyboard focus within the container when active
 *
 * @param isActive - Whether the focus trap should be active
 * @param options - Optional configuration
 * @returns A ref to attach to the container element
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(
  isActive: boolean,
  options: UseFocusTrapOptions = {}
): RefObject<T | null> {
  const { returnFocusTo, disableAutoFocus = false } = options;
  const containerRef = useRef<T>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Store the previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Capture returnFocusTo.current at effect start to avoid stale ref in cleanup
    const returnFocusToElement = returnFocusTo?.current;

    // Get all focusable elements within the container
    const getFocusableElements = () => {
      if (!containerRef.current) return [];
      const focusableSelectors = [
        'button:not([disabled])',
        'a[href]',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ].join(', ');

      return Array.from(
        containerRef.current.querySelectorAll<HTMLElement>(focusableSelectors)
      ).filter((el) => el.offsetParent !== null); // Filter out hidden elements
    };

    // Focus the first focusable element (unless disabled)
    if (!disableAutoFocus) {
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        // Try to focus the first non-close button, or fall back to first element
        const firstNonCloseButton = focusableElements.find(
          (el) => !el.getAttribute('aria-label')?.includes('關閉')
        );
        (firstNonCloseButton || focusableElements[0]).focus();
      }
    }

    // Handle Tab key to trap focus
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Shift + Tab: if on first element, go to last
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
        return;
      }

      // Tab: if on last element, go to first
      if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      // Restore focus: prefer returnFocusTo, then previousActiveElement
      const elementToFocus = returnFocusToElement || previousActiveElement.current;
      if (elementToFocus && elementToFocus.focus) {
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          elementToFocus.focus();
        });
      }
    };
  }, [isActive, returnFocusTo, disableAutoFocus]);

  return containerRef;
}

import { useEffect, useRef, type RefObject } from 'react';

export interface UseFocusTrapOptions {
  active: boolean;
  containerRef: RefObject<HTMLElement | null>;
  onEscape?: () => void;
  initialFocusRef?: RefObject<HTMLElement | null>;
  restoreFocus?: boolean;
  fallbackFocusRef?: RefObject<HTMLElement | null>;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[contenteditable="true"]',
  '[tabindex]',
].join(', ');

function isElementVisible(element: HTMLElement): boolean {
  if (element.closest('[hidden], [inert]')) {
    return false;
  }

  if (typeof window !== 'undefined' && typeof window.getComputedStyle === 'function') {
    const styles = window.getComputedStyle(element);
    if (styles.display === 'none' || styles.visibility === 'hidden') {
      return false;
    }
  }

  return true;
}

export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const candidates = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  );

  return candidates.filter((element) => {
    if (element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true') {
      return false;
    }

    const rawTabIndex = element.getAttribute('tabindex');
    if (rawTabIndex !== null && Number.parseInt(rawTabIndex, 10) < 0) {
      return false;
    }

    if (element.tabIndex < 0) {
      return false;
    }

    return isElementVisible(element);
  });
}

export function useFocusTrap({
  active,
  containerRef,
  onEscape,
  initialFocusRef,
  restoreFocus = true,
  fallbackFocusRef,
}: UseFocusTrapOptions): void {
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onEscapeRef = useRef<(() => void) | undefined>(onEscape);

  useEffect(() => {
    onEscapeRef.current = onEscape;
  }, [onEscape]);

  useEffect(() => {
    if (!active) {
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    const fallbackElement = fallbackFocusRef?.current ?? null;
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const focusables = getFocusableElements(container);
    const initialTarget = initialFocusRef?.current;

    if (initialTarget && container.contains(initialTarget) && isElementVisible(initialTarget)) {
      initialTarget.focus();
    } else if (focusables.length > 0) {
      focusables[0]?.focus();
    } else {
      if (container.getAttribute('tabindex') === null) {
        container.setAttribute('tabindex', '-1');
      }
      container.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (onEscapeRef.current) {
          event.preventDefault();
          event.stopPropagation();
          onEscapeRef.current();
        }
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const currentContainer = containerRef.current;
      if (!currentContainer) {
        return;
      }

      const currentFocusables = getFocusableElements(currentContainer);
      if (currentFocusables.length === 0) {
        event.preventDefault();
        currentContainer.focus();
        return;
      }

      const first = currentFocusables[0];
      const last = currentFocusables[currentFocusables.length - 1];
      const activeElement = document.activeElement;

      if (!first || !last) {
        return;
      }

      if (event.shiftKey) {
        if (activeElement === first || !currentContainer.contains(activeElement)) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (activeElement === last || !currentContainer.contains(activeElement)) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      if (restoreFocus) {
        const previousElement = previousFocusRef.current;
        if (
          previousElement &&
          previousElement.isConnected &&
          previousElement !== document.body &&
          previousElement !== document.documentElement
        ) {
          previousElement.focus();
        } else if (fallbackElement?.isConnected) {
          if (
            fallbackElement.getAttribute('tabindex') === null &&
            fallbackElement.tabIndex < 0
          ) {
            fallbackElement.setAttribute('tabindex', '-1');
          }
          fallbackElement.focus({ preventScroll: true });
        }
      }
      previousFocusRef.current = null;
    };
  }, [active, containerRef, fallbackFocusRef, initialFocusRef, restoreFocus]);
}

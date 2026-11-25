export interface ScrollNavigationOptions {
  prefersReducedMotion: boolean;
  focusTarget?: boolean;
  updateHash?: boolean;
}

export function scrollToSection(
  targetId: string,
  {
    prefersReducedMotion,
    focusTarget = false,
    updateHash = true,
  }: ScrollNavigationOptions,
): boolean {
  if (typeof document === 'undefined') {
    return false;
  }

  const behavior: ScrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';
  const target = document.getElementById(targetId);

  if (updateHash && typeof window !== 'undefined' && window.history?.replaceState) {
    const nextHash = `#${targetId}`;
    if (window.location.hash !== nextHash) {
      window.history.replaceState(null, '', nextHash);
    }
  }

  if (!target) {
    if (targetId === 'hero' && typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, behavior });
    }
    return false;
  }

  if (focusTarget) {
    if (target.getAttribute('tabindex') === null) {
      target.setAttribute('tabindex', '-1');
    }
    target.focus({ preventScroll: true });
  }

  if (typeof target.scrollIntoView === 'function') {
    target.scrollIntoView({ behavior, block: 'start' });
  }

  return true;
}

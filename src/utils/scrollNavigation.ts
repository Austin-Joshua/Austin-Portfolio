import { buildSectionUrl, isSectionId } from '@/data/sections';

export interface ScrollNavigationOptions {
  prefersReducedMotion: boolean;
  focusTarget?: boolean;
  updateHash?: boolean;
  historyMode?: 'push' | 'replace' | 'none';
}

function nextSectionState(existing: unknown, sectionId: string): unknown {
  if (existing !== null && typeof existing === 'object' && !Array.isArray(existing)) {
    return { ...(existing as Record<string, unknown>), sectionId };
  }
  return existing ?? { sectionId };
}

export function scrollToSection(
  targetId: string,
  {
    prefersReducedMotion,
    focusTarget = false,
    updateHash = true,
    historyMode,
  }: ScrollNavigationOptions,
): boolean {
  if (typeof document === 'undefined') {
    return false;
  }

  const behavior: ScrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';
  const target = document.getElementById(targetId);

  const resolvedMode = historyMode ?? (updateHash ? 'push' : 'none');

  if (resolvedMode !== 'none' && typeof window !== 'undefined' && window.history) {
    const nextUrl = isSectionId(targetId)
      ? buildSectionUrl(targetId)
      : `${window.location.pathname}${window.location.search}#${targetId}`;
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    if (currentUrl !== nextUrl) {
      if (resolvedMode === 'push' && typeof window.history.pushState === 'function') {
        window.history.pushState(
          nextSectionState(window.history.state, targetId),
          '',
          nextUrl,
        );
      } else if (typeof window.history.replaceState === 'function') {
        window.history.replaceState(window.history.state, '', nextUrl);
      }
    }
  }

  if (!target) {
    if (
      targetId === 'hero' &&
      typeof window !== 'undefined' &&
      typeof window.scrollTo === 'function'
    ) {
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

  if (
    targetId === 'hero' &&
    typeof window !== 'undefined' &&
    typeof window.scrollTo === 'function'
  ) {
    window.scrollTo({ top: 0, behavior });
  } else if (typeof target.scrollIntoView === 'function') {
    target.scrollIntoView({ behavior, block: 'start' });
  }

  return true;
}

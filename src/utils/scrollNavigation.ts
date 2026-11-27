import { isSectionId } from '@/data/sections';
import { buildRouteTitle, buildSectionUrl } from '@/routes/routes';

export interface ScrollNavigationOptions {
  prefersReducedMotion: boolean;
  focusTarget?: boolean;
  updateRoute?: boolean;
  /** Legacy alias for updateRoute preserved for existing callers. */
  updateHash?: boolean;
  historyMode?: 'push' | 'replace' | 'none';
}

function nextSectionState(existing: unknown, sectionId: string): unknown {
  if (existing !== null && typeof existing === 'object' && !Array.isArray(existing)) {
    return { ...(existing as Record<string, unknown>), sectionId, projectSlug: null };
  }
  return existing ?? { sectionId, projectSlug: null };
}

export function scrollToSection(
  targetId: string,
  {
    prefersReducedMotion,
    focusTarget = false,
    updateRoute,
    updateHash = true,
    historyMode,
  }: ScrollNavigationOptions,
): boolean {
  if (typeof document === 'undefined') {
    return false;
  }

  const behavior: ScrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';
  const target = document.getElementById(targetId);

  const shouldUpdateRoute = updateRoute ?? updateHash;
  const resolvedMode = historyMode ?? (shouldUpdateRoute ? 'push' : 'none');

  if (
    resolvedMode !== 'none' &&
    typeof window !== 'undefined' &&
    window.history &&
    isSectionId(targetId)
  ) {
    const nextUrl = buildSectionUrl(targetId);
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    if (currentUrl !== nextUrl) {
      if (resolvedMode === 'push' && typeof window.history.pushState === 'function') {
        window.history.pushState(
          nextSectionState(window.history.state, targetId),
          '',
          nextUrl,
        );
      } else if (typeof window.history.replaceState === 'function') {
        window.history.replaceState(
          nextSectionState(window.history.state, targetId),
          '',
          nextUrl,
        );
      }
    }

    document.title = buildRouteTitle(targetId);
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

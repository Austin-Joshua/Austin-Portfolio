import { useEffect, useMemo, useState } from 'react';
import { PORTFOLIO_SECTIONS } from '@/data/sections';
import { resolveLocationRoute } from '@/routes/routes';

export interface UseActiveSectionOptions {
  sectionIds?: readonly string[];
  defaultSection?: string;
  rootMargin?: string;
  threshold?: number | number[];
}

interface ObservedSectionState {
  isIntersecting: boolean;
  ratio: number;
}

const DEFAULT_SECTION_IDS = PORTFOLIO_SECTIONS.map((section) => section.id);
const DEFAULT_THRESHOLD = [0, 0.15, 0.35, 0.6];

function pickMostActiveSection(
  orderedIds: readonly string[],
  states: Map<string, ObservedSectionState>,
): string | null {
  let bestId: string | null = null;
  let bestRatio = -1;

  for (const id of orderedIds) {
    const state = states.get(id);
    if (!state || !state.isIntersecting) {
      continue;
    }

    if (state.ratio > bestRatio) {
      bestRatio = state.ratio;
      bestId = id;
    }
  }

  return bestId;
}

export function useActiveSection(options: UseActiveSectionOptions = {}): string {
  const {
    sectionIds = DEFAULT_SECTION_IDS,
    defaultSection = 'hero',
    rootMargin = '-20% 0px -55% 0px',
    threshold = DEFAULT_THRESHOLD,
  } = options;

  const idsKey = sectionIds.join('|');
  const stableSectionIds = useMemo(
    () => (idsKey.length > 0 ? idsKey.split('|') : []),
    [idsKey],
  );

  const [activeSection, setActiveSection] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const fromRoute = resolveLocationRoute().sectionId;
      if (fromRoute && sectionIds.includes(fromRoute)) {
        return fromRoute;
      }
    }
    return defaultSection;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || stableSectionIds.length === 0) {
      return;
    }

    const syncFromLocation = () => {
      const parsed = resolveLocationRoute().sectionId;
      if (parsed && stableSectionIds.includes(parsed)) {
        setActiveSection(parsed);
      } else {
        setActiveSection(defaultSection);
      }
    };

    window.addEventListener('hashchange', syncFromLocation);
    window.addEventListener('popstate', syncFromLocation);
    return () => {
      window.removeEventListener('hashchange', syncFromLocation);
      window.removeEventListener('popstate', syncFromLocation);
    };
  }, [stableSectionIds, defaultSection]);

  useEffect(() => {
    if (
      typeof document === 'undefined' ||
      typeof IntersectionObserver === 'undefined' ||
      stableSectionIds.length === 0
    ) {
      return;
    }

    const targets = stableSectionIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    if (targets.length === 0) {
      return;
    }

    const observedStates = new Map<string, ObservedSectionState>();
    let lastKnownY = window.scrollY;
    let rafSyncId = 0;

    const resolveSectionFromViewport = (isScrollingUp: boolean): string | null => {
      const doc = document.documentElement;
      const scrollHeight = doc.scrollHeight;
      const innerHeight = window.innerHeight;
      const currentY = window.scrollY;

      const hasLayout = targets.some((el) => el.getBoundingClientRect().height > 0);
      if (!hasLayout) return null;

      if (scrollHeight > innerHeight + 120) {
        const lastId = stableSectionIds[stableSectionIds.length - 1];
        const lastEl = lastId ? document.getElementById(lastId) : null;
        const lastRect = lastEl?.getBoundingClientRect();
        const isLastPrimary =
          Boolean(lastRect) &&
          (lastRect?.height ?? 0) > 0 &&
          (lastRect?.top ?? Infinity) <= innerHeight * 0.42;

        if (currentY <= 80) {
          return defaultSection;
        }
        if (
          lastId &&
          !isScrollingUp &&
          (currentY + innerHeight >= scrollHeight - 110 || isLastPrimary)
        ) {
          return lastId;
        }
      }

      const probeY = innerHeight * (isScrollingUp ? 0.34 : 0.4);
      let bestId: string | null = null;
      let bestDist = Infinity;

      for (const id of stableSectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.height <= 0) continue;

        if (rect.top <= probeY && rect.bottom >= probeY) {
          bestId = id;
          break;
        }
        const dist = Math.min(
          Math.abs(rect.top - probeY),
          Math.abs(rect.bottom - probeY),
        );
        if (dist < bestDist) {
          bestDist = dist;
          bestId = id;
        }
      }

      return bestId;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const targetId = entry.target.id;
          if (!targetId) {
            continue;
          }

          const visibleHeight = entry.intersectionRect?.height ?? 0;
          observedStates.set(targetId, {
            isIntersecting: entry.isIntersecting,
            ratio: visibleHeight > 0 ? visibleHeight : entry.intersectionRatio,
          });
        }

        const currentY = window.scrollY;
        const isScrollingUp = currentY < lastKnownY;
        const measuredActive = resolveSectionFromViewport(isScrollingUp);
        if (measuredActive !== null) {
          setActiveSection((prev) => (prev === measuredActive ? prev : measuredActive));
          return;
        }

        const nextActive = pickMostActiveSection(stableSectionIds, observedStates);
        if (nextActive !== null) {
          setActiveSection((prev) => (prev === nextActive ? prev : nextActive));
        }
      },
      { rootMargin, threshold },
    );

    for (const element of targets) {
      observer.observe(element);
    }

    const syncScrollDirectionSection = () => {
      rafSyncId = 0;
      const currentY = window.scrollY;
      const isScrollingUp = currentY < lastKnownY;
      lastKnownY = currentY;

      const measuredActive = resolveSectionFromViewport(isScrollingUp);
      if (measuredActive !== null) {
        setActiveSection((prev) => (prev === measuredActive ? prev : measuredActive));
      }
    };

    const handleEdgeScroll = () => {
      if (rafSyncId === 0 && typeof window.requestAnimationFrame === 'function') {
        rafSyncId = window.requestAnimationFrame(syncScrollDirectionSection);
      } else if (rafSyncId === 0) {
        syncScrollDirectionSection();
      }
    };

    window.addEventListener('scroll', handleEdgeScroll, { passive: true });

    return () => {
      observer.disconnect();
      if (rafSyncId !== 0 && typeof window.cancelAnimationFrame === 'function') {
        window.cancelAnimationFrame(rafSyncId);
      }
      window.removeEventListener('scroll', handleEdgeScroll);
    };
  }, [stableSectionIds, rootMargin, threshold, defaultSection]);

  return activeSection;
}

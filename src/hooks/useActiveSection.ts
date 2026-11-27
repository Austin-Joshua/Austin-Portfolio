import { useEffect, useMemo, useState } from 'react';
import { PORTFOLIO_SECTIONS, parseSectionHash } from '@/data/sections';

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
      const fromHash = parseSectionHash(window.location.hash);
      if (fromHash && sectionIds.includes(fromHash)) {
        return fromHash;
      }
    }
    return defaultSection;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || stableSectionIds.length === 0) {
      return;
    }

    const syncFromLocation = () => {
      const parsed = parseSectionHash(window.location.hash);
      if (parsed && stableSectionIds.includes(parsed)) {
        setActiveSection(parsed);
      } else if (window.location.hash === '') {
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

        const doc = document.documentElement;
        const lastId = stableSectionIds[stableSectionIds.length - 1];
        const lastEl = lastId ? document.getElementById(lastId) : null;
        const lastRect = lastEl?.getBoundingClientRect();
        const isLastPrimary =
          Boolean(lastRect) &&
          (lastRect?.height ?? 0) > 0 &&
          (lastRect?.top ?? Infinity) <= window.innerHeight * 0.42;
        if (
          lastId &&
          window.scrollY > 36 &&
          doc.scrollHeight > window.innerHeight + 120 &&
          (window.scrollY + window.innerHeight >= doc.scrollHeight - 110 ||
            isLastPrimary)
        ) {
          setActiveSection((prev) => (prev === lastId ? prev : lastId));
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

    const handleEdgeScroll = () => {
      const doc = document.documentElement;
      const scrollHeight = doc.scrollHeight;
      const innerHeight = window.innerHeight;
      if (scrollHeight > innerHeight + 120) {
        const lastId = stableSectionIds[stableSectionIds.length - 1];
        const lastEl = lastId ? document.getElementById(lastId) : null;
        const lastRect = lastEl?.getBoundingClientRect();
        const isLastPrimary =
          Boolean(lastRect) &&
          (lastRect?.height ?? 0) > 0 &&
          (lastRect?.top ?? Infinity) <= innerHeight * 0.42;
        if (window.scrollY <= 36) {
          setActiveSection(defaultSection);
        } else if (
          lastId &&
          (window.scrollY + innerHeight >= scrollHeight - 110 ||
            isLastPrimary)
        ) {
          setActiveSection(lastId);
        }
      }
    };

    window.addEventListener('scroll', handleEdgeScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleEdgeScroll);
    };
  }, [stableSectionIds, rootMargin, threshold, defaultSection]);

  return activeSection;
}

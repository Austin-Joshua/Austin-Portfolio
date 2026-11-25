import type { RefObject } from 'react';
import type gsapType from 'gsap';
import type { ScrollTrigger as ScrollTriggerType } from 'gsap/ScrollTrigger';

export interface GsapScrollModules {
  gsap: typeof gsapType;
  ScrollTrigger: typeof ScrollTriggerType;
}

let cachedPromise: Promise<GsapScrollModules> | null = null;
let pluginRegistered = false;

export function loadGsapScrollTrigger(): Promise<GsapScrollModules> {
  if (!cachedPromise) {
    cachedPromise = Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ]).then(([gsapModule, scrollTriggerModule]) => {
      const gsap = gsapModule.default;
      const { ScrollTrigger } = scrollTriggerModule;

      if (!pluginRegistered) {
        gsap.registerPlugin(ScrollTrigger);
        pluginRegistered = true;
      }

      return { gsap, ScrollTrigger };
    });
  }

  return cachedPromise;
}

export function resetGsapLoaderForTests(): void {
  cachedPromise = null;
  pluginRegistered = false;
}

export type ScopedScrollSetup = (
  modules: GsapScrollModules,
  mm: gsap.MatchMedia,
) => void;

export function setupScopedScrollAnimation(
  scopeRef: RefObject<HTMLElement | null>,
  prefersReducedMotion: boolean,
  onSetup: ScopedScrollSetup,
  onReducedMotionFallback?: () => void,
): () => void {
  if (
    prefersReducedMotion ||
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    onReducedMotionFallback?.();
    return () => {};
  }

  let cancelled = false;
  let revertContext: (() => void) | undefined;

  void loadGsapScrollTrigger()
    .then((modules) => {
      if (cancelled || !scopeRef.current) {
        return;
      }

      let mm: gsap.MatchMedia | undefined;
      const ctx = modules.gsap.context(() => {
        mm = modules.gsap.matchMedia();
        mm.add('(prefers-reduced-motion: reduce)', () => {
          onReducedMotionFallback?.();
        });
        onSetup(modules, mm);
      }, scopeRef);

      revertContext = () => {
        mm?.revert();
        ctx.revert();
      };
    })
    .catch(() => {
      onReducedMotionFallback?.();
    });

  return () => {
    cancelled = true;
    revertContext?.();
  };
}

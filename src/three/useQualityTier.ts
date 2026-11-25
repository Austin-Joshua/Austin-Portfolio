import { useEffect, useMemo, useState } from 'react';

export type QualityTierName =
  | 'desktop-high'
  | 'tablet-balanced'
  | 'mobile-conserving'
  | 'static';

export interface QualityTierConfig {
  readonly tier: QualityTierName;
  readonly dpr: readonly [number, number];
  readonly particleCount: number;
  readonly ringSegments: number;
  readonly enablePointerParallax: boolean;
  readonly driftSpeed: number;
  readonly frameloop: 'always' | 'demand';
  readonly focalOffset: readonly [number, number, number];
}

export interface QualityTierInput {
  readonly viewportWidth: number;
  readonly prefersReducedMotion: boolean;
  readonly hardwareConcurrency?: number;
  readonly saveData?: boolean;
}

interface NetworkInfoLike {
  saveData?: boolean;
}

function readNavigatorHints(): {
  viewportWidth: number;
  hardwareConcurrency?: number;
  saveData: boolean;
} {
  if (typeof window === 'undefined') {
    return { viewportWidth: 1024, hardwareConcurrency: undefined, saveData: false };
  }

  const nav = navigator as Navigator & { connection?: NetworkInfoLike };
  return {
    viewportWidth: window.innerWidth,
    hardwareConcurrency: nav.hardwareConcurrency,
    saveData: Boolean(nav.connection?.saveData),
  };
}

export function resolveQualityTier({
  viewportWidth,
  prefersReducedMotion,
  hardwareConcurrency,
  saveData = false,
}: QualityTierInput): QualityTierConfig {
  const isMobileWidth = viewportWidth < 768;
  // Centered inside the dedicated Hero 3D visual stage on both desktop and mobile
  const focalOffset: readonly [number, number, number] = [0, 0, 0];

  if (prefersReducedMotion) {
    return {
      tier: 'static',
      dpr: [1, 1.5],
      particleCount: 600,
      ringSegments: 56,
      enablePointerParallax: false,
      driftSpeed: 0,
      frameloop: 'demand',
      focalOffset,
    };
  }

  const isConstrainedHardware =
    saveData || (typeof hardwareConcurrency === 'number' && hardwareConcurrency <= 4);

  if (isMobileWidth || isConstrainedHardware) {
    return {
      tier: 'mobile-conserving',
      dpr: [1, 1.5],
      particleCount: 700,
      ringSegments: 56,
      enablePointerParallax: false,
      driftSpeed: 0.018,
      frameloop: 'always',
      focalOffset,
    };
  }

  if (viewportWidth < 1024) {
    return {
      tier: 'tablet-balanced',
      dpr: [1, 1.5],
      particleCount: 1200,
      ringSegments: 80,
      enablePointerParallax: false,
      driftSpeed: 0.024,
      frameloop: 'always',
      focalOffset,
    };
  }

  return {
    tier: 'desktop-high',
    dpr: [1, 2],
    particleCount: 2200,
    ringSegments: 112,
    enablePointerParallax: true,
    driftSpeed: 0.032,
    frameloop: 'always',
    focalOffset,
  };
}

export function useQualityTier(prefersReducedMotion: boolean): QualityTierConfig {
  const [viewportWidth, setViewportWidth] = useState<number>(() =>
    readNavigatorHints().viewportWidth,
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return useMemo(() => {
    const { hardwareConcurrency, saveData } = readNavigatorHints();
    return resolveQualityTier({
      viewportWidth,
      prefersReducedMotion,
      hardwareConcurrency,
      saveData,
    });
  }, [viewportWidth, prefersReducedMotion]);
}

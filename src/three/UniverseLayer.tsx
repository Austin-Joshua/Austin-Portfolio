import { Suspense, lazy, useEffect, useState, type RefObject } from 'react';
import { useMotionPreference } from '@/context/MotionPreferenceContext';
import { useTheme } from '@/context/ThemeContext';
import { useWebGLSupport } from '@/hooks/useWebGLSupport';
import { UniverseFallback } from '@/three/UniverseFallback';
import { useQualityTier } from '@/three/useQualityTier';
import { WebGLErrorBoundary } from '@/three/WebGLErrorBoundary';

const LazyUniverseCanvas = lazy(() => import('@/three/UniverseCanvas'));

export interface UniverseLayerProps {
  scrollProgressRef?: RefObject<number>;
}

export function UniverseLayer({ scrollProgressRef }: UniverseLayerProps) {
  const { theme } = useTheme();
  const { prefersReducedMotion } = useMotionPreference();
  const webgl = useWebGLSupport();
  const qualityTier = useQualityTier(prefersReducedMotion);
  const [shouldLoadCanvas, setShouldLoadCanvas] = useState(false);

  useEffect(() => {
    if (!webgl.supported) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      setShouldLoadCanvas(true);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [webgl.supported]);

  const fallback = <UniverseFallback theme={theme} />;

  if (!webgl.supported || !shouldLoadCanvas) {
    return fallback;
  }

  return (
    <WebGLErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <LazyUniverseCanvas
          theme={theme}
          qualityTier={qualityTier}
          prefersReducedMotion={prefersReducedMotion}
          scrollProgressRef={scrollProgressRef}
        />
      </Suspense>
    </WebGLErrorBoundary>
  );
}

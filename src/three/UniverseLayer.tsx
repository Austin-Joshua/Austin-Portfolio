import { Suspense, lazy, useEffect, useState } from 'react';
import { useMotionPreference } from '@/context/MotionPreferenceContext';
import { useUniverseNavigation } from '@/context/UniverseNavigationContext';
import { useWebGLSupport } from '@/hooks/useWebGLSupport';
import { UniverseFallback } from '@/three/UniverseFallback';
import { useQualityTier } from '@/three/useQualityTier';
import { WebGLErrorBoundary } from '@/three/WebGLErrorBoundary';

const LazyUniverseCanvas = lazy(() => import('@/three/UniverseCanvas'));

/**
 * Persistent full-viewport 3D solar-system background layer spanning all seven
 * sections with automatic non-blocking mount and deterministic fallback.
 */
export function UniverseLayer() {
  const { prefersReducedMotion } = useMotionPreference();
  const webgl = useWebGLSupport();
  const qualityTier = useQualityTier(prefersReducedMotion);
  const {
    activeSection,
    navigationMode,
    hoveredPlanet,
    setHoveredPlanet,
    selectedPlanet,
    navigateToPlanet,
    pointerRef,
    scrollVelocityRef,
    orbitControlRef,
    isGyroActiveRef,
    planetPulseRef,
    liveOrbitTimeRef,
  } = useUniverseNavigation();
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

  const fallback = <UniverseFallback />;

  if (!webgl.supported || !shouldLoadCanvas) {
    return fallback;
  }

  return (
    <WebGLErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <LazyUniverseCanvas
          qualityTier={qualityTier}
          prefersReducedMotion={prefersReducedMotion}
          activeSection={activeSection}
          navigationMode={navigationMode}
          hoveredPlanet={hoveredPlanet}
          selectedPlanet={selectedPlanet}
          pointerRef={pointerRef}
          scrollVelocityRef={scrollVelocityRef}
          orbitControlRef={orbitControlRef}
          isGyroActiveRef={isGyroActiveRef}
          planetPulseRef={planetPulseRef}
          liveOrbitTimeRef={liveOrbitTimeRef}
          onHoverPlanet={setHoveredPlanet}
          onSelectPlanet={navigateToPlanet}
        />
      </Suspense>
    </WebGLErrorBoundary>
  );
}

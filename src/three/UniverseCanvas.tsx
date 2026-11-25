import {
  createRoot,
  extend,
  type ReconcilerRoot,
  type ThreeElement,
} from '@react-three/fiber';
import { useEffect, useRef, useState, type RefObject } from 'react';
import {
  Group,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  Points,
  PointsMaterial,
  TorusGeometry,
} from 'three';
import {
  DigitalUniverseScene,
  type PointerVector,
} from '@/three/DigitalUniverseScene';
import { UniverseFallback } from '@/three/UniverseFallback';
import type { QualityTierConfig } from '@/three/useQualityTier';
import type { Theme } from '@/utils/themeStorage';

// Register only the Three.js primitives used by DigitalUniverseScene so Rollup can tree-shake unused modules
extend({
  Group: Group as unknown as new () => ThreeElement<typeof Group>,
  Points: Points as unknown as new () => ThreeElement<typeof Points>,
  PointsMaterial: PointsMaterial as unknown as new () => ThreeElement<
    typeof PointsMaterial
  >,
  Mesh: Mesh as unknown as new () => ThreeElement<typeof Mesh>,
  TorusGeometry: TorusGeometry as unknown as new () => ThreeElement<
    typeof TorusGeometry
  >,
  IcosahedronGeometry: IcosahedronGeometry as unknown as new () => ThreeElement<
    typeof IcosahedronGeometry
  >,
  MeshBasicMaterial: MeshBasicMaterial as unknown as new () => ThreeElement<
    typeof MeshBasicMaterial
  >,
});

export interface UniverseCanvasProps {
  theme: Theme;
  qualityTier: QualityTierConfig;
  prefersReducedMotion: boolean;
  scrollProgressRef?: RefObject<number>;
}

export function UniverseCanvas({
  theme,
  qualityTier,
  prefersReducedMotion,
  scrollProgressRef,
}: UniverseCanvasProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<ReconcilerRoot<HTMLCanvasElement> | null>(null);
  const pointerRef = useRef<PointerVector>({ x: 0, y: 0 });

  const [size, setSize] = useState<{ width: number; height: number }>(() =>
    typeof window === 'undefined'
      ? { width: 1280, height: 800 }
      : { width: window.innerWidth, height: window.innerHeight },
  );
  const [isReady, setIsReady] = useState(false);
  const [contextLost, setContextLost] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);
  const [isDocumentVisible, setIsDocumentVisible] = useState(() =>
    typeof document === 'undefined' ? true : document.visibilityState !== 'hidden',
  );
  const [isHeroVisible, setIsHeroVisible] = useState(true);

  if (initError) {
    throw initError;
  }

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect && rect.width > 0 && rect.height > 0) {
        setSize({ width: rect.width, height: rect.height });
      }
    });

    observer.observe(wrapper);
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const handleVisibilityChange = () => {
      setIsDocumentVisible(document.visibilityState !== 'hidden');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    const target = document.getElementById('hero') ?? wrapperRef.current;
    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          setIsHeroVisible(entry.isIntersecting);
        }
      },
      { threshold: 0.05 },
    );

    observer.observe(target);
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      setContextLost(true);
    };

    const handleContextRestored = () => {
      setContextLost(false);
    };

    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, []);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      prefersReducedMotion ||
      !qualityTier.enablePointerParallax
    ) {
      pointerRef.current = { x: 0, y: 0 };
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (window.innerWidth === 0 || window.innerHeight === 0) {
        return;
      }

      pointerRef.current = {
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: (event.clientY / window.innerHeight) * 2 - 1,
      };
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, [prefersReducedMotion, qualityTier.enablePointerParallax]);

  const effectiveFrameloop: 'always' | 'demand' =
    !prefersReducedMotion &&
    qualityTier.frameloop === 'always' &&
    isDocumentVisible &&
    isHeroVisible &&
    !contextLost
      ? 'always'
      : 'demand';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || size.width <= 0 || size.height <= 0 || contextLost) {
      return;
    }

    let cancelled = false;

    if (!rootRef.current) {
      rootRef.current = createRoot(canvas);
    }

    const root = rootRef.current;

    void root
      .configure({
        gl: {
          antialias: qualityTier.tier !== 'mobile-conserving',
          alpha: true,
          powerPreference: 'high-performance',
        },
        camera: { position: [0, 0, 6.2], fov: 46, near: 0.1, far: 40 },
        dpr: [qualityTier.dpr[0], qualityTier.dpr[1]],
        frameloop: effectiveFrameloop,
        size: {
          width: size.width,
          height: size.height,
          top: 0,
          left: 0,
        },
        onCreated: ({ gl }) => {
          gl.domElement.setAttribute('aria-hidden', 'true');
          gl.domElement.setAttribute('tabindex', '-1');
          if (!cancelled) {
            setIsReady(true);
          }
        },
      })
      .then(() => {
        if (cancelled || rootRef.current !== root) {
          return;
        }
        root.render(
          <DigitalUniverseScene
            theme={theme}
            qualityTier={qualityTier}
            prefersReducedMotion={prefersReducedMotion}
            pointerRef={pointerRef}
            scrollProgressRef={scrollProgressRef}
          />,
        );
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setInitError(
            error instanceof Error
              ? error
              : new Error('WebGL renderer initialization failed.'),
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    size.width,
    size.height,
    theme,
    qualityTier,
    prefersReducedMotion,
    scrollProgressRef,
    effectiveFrameloop,
    contextLost,
  ]);

  useEffect(() => {
    return () => {
      rootRef.current?.unmount();
      rootRef.current = null;
    };
  }, []);

  if (contextLost) {
    return <UniverseFallback theme={theme} />;
  }

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      data-testid="universe-canvas-wrapper"
      data-quality-tier={qualityTier.tier}
      data-frameloop={effectiveFrameloop}
      className={[
        'pointer-events-none select-none fixed inset-0 z-0 overflow-hidden',
        'bg-[var(--surface-canvas)]',
        prefersReducedMotion
          ? 'opacity-100 transition-none'
          : `transition-opacity duration-500 ${isReady ? 'opacity-100' : 'opacity-0'}`,
      ].join(' ')}
    >
      <canvas
        ref={canvasRef}
        data-testid="r3f-webgl-canvas"
        aria-hidden="true"
        tabIndex={-1}
        className="block h-full w-full"
      />
    </div>
  );
}

export default UniverseCanvas;

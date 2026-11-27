import {
  createRoot,
  events as r3fEvents,
  extend,
  type ReconcilerRoot,
  type RootState,
  type ThreeElement,
} from '@react-three/fiber';
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';
import {
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  Color,
  DirectionalLight,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PointLight,
  Points,
  PointsMaterial,
  RingGeometry,
  ShaderMaterial,
  SphereGeometry,
  TorusGeometry,
} from 'three';
import type {
  OrbitControlVector,
  UniverseNavigationMode,
  UniversePointerVector,
} from '@/context/UniverseNavigationContext';
import type { SectionId } from '@/data/sections';
import { SolarSystemScene } from '@/three/SolarSystemScene';
import type { PlanetId } from '@/three/universeConfig';
import { UniverseFallback } from '@/three/UniverseFallback';
import type { QualityTierConfig } from '@/three/useQualityTier';

// Register only the Three.js primitives required by the AJ Cosmic Universe solar system
extend({
  AmbientLight: AmbientLight as unknown as new () => ThreeElement<typeof AmbientLight>,
  BufferAttribute: BufferAttribute as unknown as new () => ThreeElement<typeof BufferAttribute>,
  BufferGeometry: BufferGeometry as unknown as new () => ThreeElement<typeof BufferGeometry>,
  Color: Color as unknown as new () => ThreeElement<typeof Color>,
  DirectionalLight: DirectionalLight as unknown as new () => ThreeElement<typeof DirectionalLight>,
  Group: Group as unknown as new () => ThreeElement<typeof Group>,
  Mesh: Mesh as unknown as new () => ThreeElement<typeof Mesh>,
  MeshBasicMaterial: MeshBasicMaterial as unknown as new () => ThreeElement<typeof MeshBasicMaterial>,
  MeshStandardMaterial: MeshStandardMaterial as unknown as new () => ThreeElement<typeof MeshStandardMaterial>,
  PointLight: PointLight as unknown as new () => ThreeElement<typeof PointLight>,
  Points: Points as unknown as new () => ThreeElement<typeof Points>,
  PointsMaterial: PointsMaterial as unknown as new () => ThreeElement<typeof PointsMaterial>,
  RingGeometry: RingGeometry as unknown as new () => ThreeElement<typeof RingGeometry>,
  ShaderMaterial: ShaderMaterial as unknown as new () => ThreeElement<typeof ShaderMaterial>,
  SphereGeometry: SphereGeometry as unknown as new () => ThreeElement<typeof SphereGeometry>,
  TorusGeometry: TorusGeometry as unknown as new () => ThreeElement<typeof TorusGeometry>,
});

export interface UniverseCanvasProps {
  qualityTier: QualityTierConfig;
  prefersReducedMotion: boolean;
  activeSection: SectionId;
  navigationMode: UniverseNavigationMode;
  hoveredPlanet: PlanetId | null;
  selectedPlanet: PlanetId | null;
  pointerRef: RefObject<UniversePointerVector>;
  scrollVelocityRef: RefObject<number>;
  orbitControlRef: RefObject<OrbitControlVector>;
  onHoverPlanet: (id: PlanetId | null) => void;
  onSelectPlanet: (id: PlanetId) => void;
}

export function UniverseCanvas({
  qualityTier,
  prefersReducedMotion,
  activeSection,
  navigationMode,
  hoveredPlanet,
  selectedPlanet,
  pointerRef,
  scrollVelocityRef,
  orbitControlRef,
  onHoverPlanet,
  onSelectPlanet,
}: UniverseCanvasProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<ReconcilerRoot<HTMLCanvasElement> | null>(null);
  const rootStateRef = useRef<RootState | null>(null);
  const dragStateRef = useRef<{ active: boolean; lastX: number; lastY: number }>({
    active: false,
    lastX: 0,
    lastY: 0,
  });

  const [size, setSize] = useState<{ width: number; height: number }>(() =>
    typeof window !== 'undefined'
      ? { width: window.innerWidth || 1280, height: window.innerHeight || 720 }
      : { width: 1280, height: 720 },
  );
  const [isConfigured, setIsConfigured] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [contextLost, setContextLost] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);
  const [isDocumentVisible, setIsDocumentVisible] = useState(() =>
    typeof document === 'undefined' ? true : document.visibilityState !== 'hidden',
  );

  if (initError) {
    throw initError;
  }

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const measureNow = () => {
      const rect = wrapper.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setSize({ width: rect.width, height: rect.height });
      }
    };

    measureNow();

    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect && rect.width > 0 && rect.height > 0) {
        setSize({ width: rect.width, height: rect.height });
      }
    });

    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      setIsDocumentVisible(document.visibilityState !== 'hidden');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      setIsConfigured(false);
      setIsReady(false);
      setContextLost(true);
    };
    const handleContextRestored = () => setContextLost(false);

    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, []);

  // Controlled desktop drag-orbit in Explore mode without stealing clicks (< 5px movement)
  const dragOriginRef = useRef<{ x: number; y: number; moved: boolean }>({
    x: 0,
    y: 0,
    moved: false,
  });

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (
      hoveredPlanet !== null ||
      prefersReducedMotion ||
      event.pointerType === 'touch' ||
      navigationMode !== 'explore'
    ) {
      return;
    }
    dragOriginRef.current = { x: event.clientX, y: event.clientY, moved: false };
    dragStateRef.current = {
      active: true,
      lastX: event.clientX,
      lastY: event.clientY,
    };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current.active) return;
    if (!dragOriginRef.current.moved) {
      const dist = Math.hypot(
        event.clientX - dragOriginRef.current.x,
        event.clientY - dragOriginRef.current.y,
      );
      if (dist < 5) return;
      dragOriginRef.current.moved = true;
    }
    const dx = event.clientX - dragStateRef.current.lastX;
    const dy = event.clientY - dragStateRef.current.lastY;
    dragStateRef.current.lastX = event.clientX;
    dragStateRef.current.lastY = event.clientY;

    const currentOrbit = orbitControlRef.current;
    if (currentOrbit) {
      currentOrbit.yaw = Math.max(-1.2, Math.min(1.2, currentOrbit.yaw - dx * 0.004));
      currentOrbit.pitch = Math.max(-0.45, Math.min(0.65, currentOrbit.pitch + dy * 0.0035));
    }
  };

  const handlePointerUpOrCancel = () => {
    dragStateRef.current.active = false;
  };

  const effectiveFrameloop: 'always' | 'demand' =
    !prefersReducedMotion &&
    qualityTier.frameloop === 'always' &&
    isDocumentVisible &&
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
          alpha: false,
          powerPreference: 'high-performance',
        },
        events: r3fEvents,
        camera: { position: [-2.0, 4.6, 15.6], fov: 46, near: 0.1, far: 120 },
        dpr: [qualityTier.dpr[0], qualityTier.dpr[1]],
        frameloop: effectiveFrameloop,
        size: {
          width: size.width,
          height: size.height,
          top: 0,
          left: 0,
        },
        onCreated: (state) => {
          rootStateRef.current = state;
          state.gl.domElement.setAttribute('aria-hidden', 'true');
          state.gl.domElement.setAttribute('tabindex', '-1');
          const eventTarget = wrapperRef.current ?? state.gl.domElement;
          state.events?.connect?.(eventTarget);
          state.setEvents?.({
            compute: (event, rootState) => {
              const x = 'clientX' in event ? event.clientX : 0;
              const y = 'clientY' in event ? event.clientY : 0;
              rootState.pointer.set(
                (x / Math.max(rootState.size.width, 1)) * 2 - 1,
                -(y / Math.max(rootState.size.height, 1)) * 2 + 1,
              );
              rootState.raycaster.setFromCamera(rootState.pointer, rootState.camera);
            },
          });
          if (!cancelled) {
            setIsReady(true);
          }
        },
      })
      .then(() => {
        if (!cancelled && rootRef.current === root) {
          setIsConfigured(true);
        }
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
  }, [size.width, size.height, qualityTier, effectiveFrameloop, contextLost]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !isConfigured || contextLost) {
      return;
    }

    root.render(
      <SolarSystemScene
        qualityTier={qualityTier}
        prefersReducedMotion={prefersReducedMotion}
        activeSection={activeSection}
        navigationMode={navigationMode}
        hoveredPlanet={hoveredPlanet}
        selectedPlanet={selectedPlanet}
        pointerRef={pointerRef}
        scrollVelocityRef={scrollVelocityRef}
        orbitControlRef={orbitControlRef}
        onHoverPlanet={onHoverPlanet}
        onSelectPlanet={onSelectPlanet}
      />,
    );
  }, [
    isConfigured,
    contextLost,
    qualityTier,
    prefersReducedMotion,
    activeSection,
    navigationMode,
    hoveredPlanet,
    selectedPlanet,
    pointerRef,
    scrollVelocityRef,
    orbitControlRef,
    onHoverPlanet,
    onSelectPlanet,
  ]);

  useEffect(() => {
    return () => {
      rootStateRef.current?.events?.disconnect?.();
      rootStateRef.current = null;
      rootRef.current?.unmount();
      rootRef.current = null;
    };
  }, []);

  if (contextLost) {
    return <UniverseFallback />;
  }

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      data-testid="universe-canvas-wrapper"
      data-quality-tier={qualityTier.tier}
      data-frameloop={effectiveFrameloop}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUpOrCancel}
      onPointerLeave={handlePointerUpOrCancel}
      className={[
        'fixed inset-0 z-0 h-full w-full overflow-hidden select-none pointer-events-auto',
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

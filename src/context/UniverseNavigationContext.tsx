import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { useOptionalMotionPreference } from '@/context/MotionPreferenceContext';
import type { SectionId } from '@/data/sections';
import { useActiveSection } from '@/hooks/useActiveSection';
import type { PlanetId } from '@/three/universeConfig';
import { scrollToSection } from '@/utils/scrollNavigation';

export type UniverseNavigationMode = 'explore' | 'guided';

export interface OrbitControlVector {
  yaw: number;
  pitch: number;
  zoom: number;
}

export interface UniversePointerVector {
  x: number;
  y: number;
}

export interface UniverseNavigationContextValue {
  activeSection: SectionId;
  navigationMode: UniverseNavigationMode;
  setNavigationMode: (mode: UniverseNavigationMode) => void;
  hoveredPlanet: PlanetId | null;
  setHoveredPlanet: (planet: PlanetId | null) => void;
  selectedPlanet: PlanetId | null;
  navigateToPlanet: (planet: PlanetId) => void;
  resetSolarOverview: () => void;
  pointerRef: RefObject<UniversePointerVector>;
  scrollVelocityRef: RefObject<number>;
  scrollProgressRef: RefObject<number>;
  orbitControlRef: RefObject<OrbitControlVector>;
}

const UniverseNavigationContext = createContext<
  UniverseNavigationContextValue | undefined
>(undefined);

function toSectionId(value: string): SectionId {
  switch (value) {
    case 'about':
    case 'skills':
    case 'projects':
    case 'experience':
    case 'achievements':
    case 'contact':
      return value;
    default:
      return 'hero';
  }
}

export function UniverseNavigationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const observedSection = toSectionId(useActiveSection());
  const { prefersReducedMotion } = useOptionalMotionPreference();
  const [navSectionOverride, setNavSectionOverride] =
    useState<SectionId | null>(null);
  const [navigationMode, setNavigationMode] =
    useState<UniverseNavigationMode>('explore');
  const [hoveredPlanet, setHoveredPlanet] = useState<PlanetId | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetId | null>('sun');
  const lockTimerRef = useRef<number | null>(null);

  const activeSection: SectionId = navSectionOverride ?? observedSection;

  const resolvedNavigationMode: UniverseNavigationMode =
    activeSection === 'hero' ? navigationMode : 'guided';
  const resolvedSelectedPlanet: PlanetId | null =
    activeSection === 'hero'
      ? navigationMode === 'explore'
        ? 'sun'
        : selectedPlanet
      : activeSection;

  useEffect(() => {
    return () => {
      if (lockTimerRef.current !== null) {
        window.clearTimeout(lockTimerRef.current);
      }
    };
  }, []);

  const pointerRef = useRef<UniversePointerVector>({ x: 0, y: 0 });
  const scrollVelocityRef = useRef<number>(0);
  const scrollProgressRef = useRef<number>(0);
  const orbitControlRef = useRef<OrbitControlVector>({
    yaw: 0,
    pitch: 0,
    zoom: 1,
  });

  // Passive pointer and scroll-velocity tracking via refs (zero React re-renders per frame)
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    let lastScrollY = window.scrollY;
    let lastTime = performance.now();
    let decayTimer = 0;

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') {
        return;
      }
      const nx = (event.clientX / Math.max(window.innerWidth, 1)) * 2 - 1;
      const ny = (event.clientY / Math.max(window.innerHeight, 1)) * 2 - 1;
      pointerRef.current.x = Math.max(-1, Math.min(1, nx));
      pointerRef.current.y = Math.max(-1, Math.min(1, ny));
    };

    const handleScroll = () => {
      const now = performance.now();
      const dt = Math.max(8, now - lastTime);
      const currentY = window.scrollY;
      const dy = currentY - lastScrollY;
      const instantVelocity = Math.max(-3.5, Math.min(3.5, (dy / dt) * 1.4));

      scrollVelocityRef.current = instantVelocity;
      lastScrollY = currentY;
      lastTime = now;

      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      scrollProgressRef.current =
        docHeight > 0 ? Math.max(0, Math.min(1, currentY / docHeight)) : 0;

      window.clearTimeout(decayTimer);
      decayTimer = window.setTimeout(() => {
        scrollVelocityRef.current *= 0.25;
      }, 90);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.clearTimeout(decayTimer);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navigateToPlanet = useCallback(
    (planet: PlanetId) => {
      const targetSection: SectionId = planet === 'sun' ? 'hero' : planet;
      setSelectedPlanet(planet);
      setHoveredPlanet(null);
      setNavigationMode(planet === 'sun' ? 'explore' : 'guided');
      setNavSectionOverride(targetSection);

      if (lockTimerRef.current !== null) {
        window.clearTimeout(lockTimerRef.current);
      }
      lockTimerRef.current = window.setTimeout(() => {
        setNavSectionOverride(null);
        lockTimerRef.current = null;
      }, prefersReducedMotion ? 120 : 900);

      scrollToSection(targetSection, {
        prefersReducedMotion,
        focusTarget: false,
        updateHash: true,
      });
    },
    [prefersReducedMotion],
  );

  const resetSolarOverview = useCallback(() => {
    orbitControlRef.current.yaw = 0;
    orbitControlRef.current.pitch = 0;
    orbitControlRef.current.zoom = 1;
    setNavigationMode('explore');
    setSelectedPlanet('sun');
    setHoveredPlanet(null);
    setNavSectionOverride('hero');

    if (lockTimerRef.current !== null) {
      window.clearTimeout(lockTimerRef.current);
    }
    lockTimerRef.current = window.setTimeout(() => {
      setNavSectionOverride(null);
      lockTimerRef.current = null;
    }, prefersReducedMotion ? 120 : 900);

    scrollToSection('hero', {
      prefersReducedMotion,
      focusTarget: false,
      updateHash: true,
    });
  }, [prefersReducedMotion]);

  const value = useMemo<UniverseNavigationContextValue>(
    () => ({
      activeSection,
      navigationMode: resolvedNavigationMode,
      setNavigationMode,
      hoveredPlanet,
      setHoveredPlanet,
      selectedPlanet: resolvedSelectedPlanet,
      navigateToPlanet,
      resetSolarOverview,
      pointerRef,
      scrollVelocityRef,
      scrollProgressRef,
      orbitControlRef,
    }),
    [
      activeSection,
      hoveredPlanet,
      navigateToPlanet,
      resetSolarOverview,
      resolvedNavigationMode,
      resolvedSelectedPlanet,
    ],
  );

  return (
    <UniverseNavigationContext.Provider value={value}>
      {children}
    </UniverseNavigationContext.Provider>
  );
}

export function useUniverseNavigation(): UniverseNavigationContextValue {
  const ctx = useContext(UniverseNavigationContext);
  if (!ctx) {
    throw new Error(
      'useUniverseNavigation must be used within UniverseNavigationProvider.',
    );
  }
  return ctx;
}

export function useOptionalUniverseNavigation(): UniverseNavigationContextValue | null {
  return useContext(UniverseNavigationContext) ?? null;
}

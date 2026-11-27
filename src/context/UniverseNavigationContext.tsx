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
import { resolveLocationRoute } from '@/routes/routes';
import type { PlanetId } from '@/three/universeConfig';
import { computeGyroTilt, subscribeDeviceOrientation } from '@/utils/gyroParallax';
import { scrollToSection } from '@/utils/scrollNavigation';
import { playPlanetSound } from '@/utils/soundEffects';

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

export interface PlanetActivity {
  readonly planetId: PlanetId;
  readonly label: string;
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
  isGyroActiveRef: RefObject<boolean>;
  planetPulseRef: RefObject<Record<PlanetId, number>>;
  liveOrbitTimeRef: RefObject<number>;
  planetActivity: PlanetActivity | null;
  pulsePlanet: (planetId: PlanetId, intensity?: number, activityLabel?: string) => void;
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
    useState<SectionId | null>(() => {
      if (typeof window === 'undefined') return null;
      const initialSection = resolveLocationRoute().sectionId;
      return initialSection && initialSection !== 'hero' ? initialSection : null;
    });
  const [navigationMode, setNavigationMode] =
    useState<UniverseNavigationMode>('explore');
  const [hoveredPlanet, setHoveredPlanet] = useState<PlanetId | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetId | null>('sun');
  const [planetActivity, setPlanetActivity] = useState<PlanetActivity | null>(null);
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

  const scheduleOverrideClear = useCallback(
    (delayMs: number) => {
      if (typeof window === 'undefined') return;
      if (lockTimerRef.current !== null) {
        window.clearTimeout(lockTimerRef.current);
      }
      lockTimerRef.current = window.setTimeout(() => {
        lockTimerRef.current = null;
        setNavSectionOverride(null);
      }, delayMs);
    },
    [],
  );

  useEffect(() => {
    if (navSectionOverride !== null && lockTimerRef.current === null) {
      scheduleOverrideClear(prefersReducedMotion ? 150 : 600);
    }
  }, [navSectionOverride, prefersReducedMotion, scheduleOverrideClear]);

  useEffect(() => {
    return () => {
      if (lockTimerRef.current !== null) {
        window.clearTimeout(lockTimerRef.current);
        lockTimerRef.current = null;
      }
    };
  }, []);

  const pointerRef = useRef<UniversePointerVector>({ x: 0, y: 0 });
  const scrollVelocityRef = useRef<number>(0);
  const scrollProgressRef = useRef<number>(0);
  const isGyroActiveRef = useRef<boolean>(false);
  const liveOrbitTimeRef = useRef<number>(0);
  const planetPulseRef = useRef<Record<PlanetId, number>>({
    sun: 0,
    about: 0,
    skills: 0,
    projects: 0,
    experience: 0,
    achievements: 0,
    contact: 0,
  });
  const prevSectionRef = useRef<SectionId>(activeSection);

  const pulsePlanet = useCallback(
    (planetId: PlanetId, intensity = 0.85, activityLabel?: string) => {
      const boostOffsetMs = Math.max(-220, Math.min(240, (intensity - 0.85) * 260));
      planetPulseRef.current[planetId] = performance.now() + boostOffsetMs;
      if (planetId !== 'sun' && intensity >= 0.8 && activityLabel) {
        setNavSectionOverride((prev) => (prev === planetId ? prev : planetId));
        scheduleOverrideClear(prefersReducedMotion ? 150 : 1400);
      }
      if (activityLabel !== undefined) {
        if (activityLabel === '') {
          setPlanetActivity((prev) =>
            prev?.planetId === planetId ? null : prev,
          );
        } else {
          setPlanetActivity((prev) =>
            prev?.planetId === planetId && prev.label === activityLabel
              ? prev
              : { planetId, label: activityLabel },
          );
        }
      }
    },
    [prefersReducedMotion, scheduleOverrideClear],
  );

  // Sync section transitions cleanly in both upward and downward scroll directions
  useEffect(() => {
    if (prevSectionRef.current === activeSection) return;
    prevSectionRef.current = activeSection;
    const targetPlanet: PlanetId = activeSection === 'hero' ? 'sun' : activeSection;
    planetPulseRef.current[targetPlanet] = performance.now();
    setHoveredPlanet(null);
    setPlanetActivity((prev) =>
      prev && prev.planetId !== targetPlanet ? null : prev,
    );
  }, [activeSection]);

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

    const cleanupOrientation = prefersReducedMotion
      ? () => {}
      : subscribeDeviceOrientation((event) => {
          if (event.beta == null && event.gamma == null) return;
          isGyroActiveRef.current = true;
          const tilt = computeGyroTilt(event.gamma, event.beta, 14);
          pointerRef.current.x = Math.max(-1, Math.min(1, tilt.px * 2));
          pointerRef.current.y = Math.max(-1, Math.min(1, tilt.py * 2));
        });

    return () => {
      window.clearTimeout(decayTimer);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('scroll', handleScroll);
      cleanupOrientation();
    };
  }, [prefersReducedMotion]);

  const navigateToPlanet = useCallback(
    (planet: PlanetId) => {
      playPlanetSound(planet);
      planetPulseRef.current[planet] = performance.now() + 90;
      const targetSection: SectionId = planet === 'sun' ? 'hero' : planet;
      setSelectedPlanet(planet);
      setHoveredPlanet(null);
      setNavigationMode(planet === 'sun' ? 'explore' : 'guided');
      setNavSectionOverride(targetSection);
      scheduleOverrideClear(prefersReducedMotion ? 120 : 1150);

      scrollToSection(targetSection, {
        prefersReducedMotion,
        focusTarget: false,
        updateHash: true,
      });
    },
    [prefersReducedMotion, scheduleOverrideClear],
  );

  const resetSolarOverview = useCallback(() => {
    playPlanetSound('sun');
    planetPulseRef.current.sun = performance.now() + 90;
    orbitControlRef.current.yaw = 0;
    orbitControlRef.current.pitch = 0;
    orbitControlRef.current.zoom = 1;
    setNavigationMode('explore');
    setSelectedPlanet('sun');
    setHoveredPlanet(null);
    setPlanetActivity(null);
    setNavSectionOverride('hero');
    scheduleOverrideClear(prefersReducedMotion ? 120 : 1150);

    scrollToSection('hero', {
      prefersReducedMotion,
      focusTarget: false,
      updateHash: true,
    });
  }, [prefersReducedMotion, scheduleOverrideClear]);

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
      isGyroActiveRef,
      planetPulseRef,
      liveOrbitTimeRef,
      planetActivity,
      pulsePlanet,
    }),
    [
      activeSection,
      hoveredPlanet,
      navigateToPlanet,
      planetActivity,
      pulsePlanet,
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

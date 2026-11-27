import { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { useMotionPreference } from '@/context/MotionPreferenceContext';
import { useOptionalUniverseNavigation } from '@/context/UniverseNavigationContext';
import { playPlanetSound } from '@/utils/soundEffects';
import {
  SOLAR_SYSTEM_PLANETS,
  getPlanetWorldPosition,
  type PlanetId,
} from '@/three/universeConfig';

/**
 * Live 3D planet hover readout and guided-section orbital telemetry dock.
 */
export function SolarSystemHud() {
  const nav = useOptionalUniverseNavigation();
  const { prefersReducedMotion } = useMotionPreference();
  const angleReadoutRef = useRef<HTMLSpanElement>(null);
  const hoverDegRef = useRef<HTMLSpanElement>(null);

  const activeSection = nav?.activeSection ?? 'hero';
  const navigationMode = nav?.navigationMode ?? 'explore';
  const hoveredPlanet = nav?.hoveredPlanet ?? null;
  const setHoveredPlanet = nav?.setHoveredPlanet;
  const navigateToPlanet = nav?.navigateToPlanet;
  const resetSolarOverview = nav?.resetSolarOverview;
  const pulsePlanet = nav?.pulsePlanet;
  const liveOrbitTimeRef = nav?.liveOrbitTimeRef;
  const planetActivity = nav?.planetActivity ?? null;

  const isExploreHero = navigationMode === 'explore' && activeSection === 'hero';
  const activeHoveredMeta =
    hoveredPlanet && hoveredPlanet !== 'sun'
      ? SOLAR_SYSTEM_PLANETS.find((p) => p.id === hoveredPlanet)
      : null;

  const currentSectionPlanet =
    activeSection !== 'hero'
      ? SOLAR_SYSTEM_PLANETS.find((p) => p.sectionId === activeSection) ?? null
      : null;

  const activePlanetIdx = currentSectionPlanet
    ? SOLAR_SYSTEM_PLANETS.findIndex((p) => p.id === currentSectionPlanet.id)
    : -1;
  const prevPlanet =
    activePlanetIdx > 0 ? SOLAR_SYSTEM_PLANETS[activePlanetIdx - 1] : null;
  const nextPlanet =
    activePlanetIdx >= 0 && activePlanetIdx < SOLAR_SYSTEM_PLANETS.length - 1
      ? SOLAR_SYSTEM_PLANETS[activePlanetIdx + 1]
      : null;

  // Lightweight DOM-only orbital angle updater (~5Hz) so planetary longitude ticks live with zero React re-renders
  useEffect(() => {
    const computeDeg = (planetId: Exclude<PlanetId, 'sun'>): number => {
      const def = SOLAR_SYSTEM_PLANETS.find((p) => p.id === planetId);
      if (!def) return 0;
      const t = liveOrbitTimeRef?.current ?? 0;
      const [px, , pz] = getPlanetWorldPosition(def, t, 1);
      return Math.round((((Math.atan2(pz, px) * 180) / Math.PI) + 360) % 360);
    };

    const syncReadout = () => {
      if (angleReadoutRef.current && currentSectionPlanet) {
        angleReadoutRef.current.textContent = `${computeDeg(currentSectionPlanet.id)}°`;
      }
      if (hoverDegRef.current && activeHoveredMeta) {
        hoverDegRef.current.textContent = ` · ${computeDeg(activeHoveredMeta.id)}°`;
      } else if (hoverDegRef.current) {
        hoverDegRef.current.textContent = '';
      }
    };

    syncReadout();
    if (prefersReducedMotion) return;

    const timer = window.setInterval(syncReadout, 200);
    return () => {
      window.clearInterval(timer);
    };
  }, [activeHoveredMeta, currentSectionPlanet, liveOrbitTimeRef, prefersReducedMotion]);

  if (!nav) return null;

  const handleSelect = (id: PlanetId) => {
    navigateToPlanet?.(id);
  };

  return (
    <>
      {/* Subtle interactive badge when hovering any 3D planet or Sun */}
      {(activeHoveredMeta || hoveredPlanet === 'sun') && (
        <div
          aria-live="polite"
          data-testid="planet-hover-toast"
          className="pointer-events-none fixed bottom-20 left-1/2 z-30 -translate-x-1/2 md:bottom-6 rounded-full border border-[var(--border-glass)] bg-[var(--surface-glass-strong)] px-4 py-1.5 backdrop-blur-md shadow-[var(--shadow-glass)]"
        >
          <p className="font-mono text-xs whitespace-nowrap text-[var(--text-primary)] flex items-center gap-2">
            <span
              aria-hidden="true"
              className="size-2 rounded-full"
              style={{
                backgroundColor: activeHoveredMeta
                  ? activeHoveredMeta.color
                  : 'var(--planet-sun)',
                boxShadow: `0 0 8px ${activeHoveredMeta ? activeHoveredMeta.color : 'var(--planet-sun)'}`,
              }}
            />
            <span>
              {activeHoveredMeta
                ? `${activeHoveredMeta.label} · Click to orbit`
                : 'Sun · Click for Overview'}
            </span>
            {activeHoveredMeta && (
              <span
                ref={hoverDegRef}
                aria-hidden="true"
                className="tabular-nums text-[var(--text-muted)]"
              />
            )}
          </p>
        </div>
      )}

      {/* Live interactive planet orbital telemetry dock during guided section exploration (md+) */}
      {!isExploreHero && currentSectionPlanet && (
        <div
          data-testid="live-planet-telemetry"
          className="hidden md:inline-flex fixed bottom-5 right-6 z-20 items-center gap-1 rounded-full border border-[var(--border-glass)] bg-[var(--surface-glass-strong)] px-2 py-1 backdrop-blur-md shadow-[var(--shadow-glass)]"
        >
          <button
            type="button"
            disabled={!prevPlanet}
            onClick={() => prevPlanet && handleSelect(prevPlanet.id)}
            aria-label={
              prevPlanet
                ? `Previous planet: ${prevPlanet.label}`
                : 'No previous planet'
            }
            className="inline-flex min-h-[32px] min-w-[32px] items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-30 cursor-pointer disabled:cursor-default transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[2px]"
          >
            <ChevronLeft className="size-3.5 shrink-0" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => {
              playPlanetSound(currentSectionPlanet.id);
              pulsePlanet?.(currentSectionPlanet.id, 1.1);
            }}
            onMouseEnter={() => setHoveredPlanet?.(currentSectionPlanet.id)}
            onMouseLeave={() => setHoveredPlanet?.(null)}
            aria-label={`Pulse live ${currentSectionPlanet.label} planet`}
            className="inline-flex min-h-[32px] items-center gap-2 px-2 py-0.5 rounded-full font-mono text-[11px] text-[var(--text-primary)] hover:bg-white/6 active:scale-95 cursor-pointer transition-[background-color,transform] duration-150 focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[2px]"
          >
            <span
              aria-hidden="true"
              className="size-2 rounded-full shrink-0"
              style={{
                backgroundColor: currentSectionPlanet.color,
                boxShadow: `0 0 10px ${currentSectionPlanet.color}`,
              }}
            />
            <span className="font-semibold">{currentSectionPlanet.label}</span>
            <span className="text-[var(--text-muted)]">
              {planetActivity?.planetId === currentSectionPlanet.id
                ? `· ${planetActivity.label}`
                : `· ${currentSectionPlanet.cosmicTitle}`}
            </span>
            <span
              ref={angleReadoutRef}
              aria-hidden="true"
              className="tabular-nums text-[10px] text-[var(--text-muted)] min-w-[2.4ch] text-right"
            >
              0°
            </span>
          </button>

          <button
            type="button"
            disabled={!nextPlanet}
            onClick={() => nextPlanet && handleSelect(nextPlanet.id)}
            aria-label={
              nextPlanet ? `Next planet: ${nextPlanet.label}` : 'No next planet'
            }
            className="inline-flex min-h-[32px] min-w-[32px] items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-30 cursor-pointer disabled:cursor-default transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[2px]"
          >
            <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={resetSolarOverview}
            aria-label="Return to Sun overview"
            title="Solar System Overview"
            className="inline-flex min-h-[32px] min-w-[32px] items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[2px]"
          >
            <RotateCcw className="size-3.5 shrink-0" aria-hidden="true" />
          </button>
        </div>
      )}
    </>
  );
}

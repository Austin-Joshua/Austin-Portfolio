import { RotateCcw } from 'lucide-react';
import { useOptionalUniverseNavigation } from '@/context/UniverseNavigationContext';
import { SOLAR_SYSTEM_PLANETS, type PlanetId } from '@/three/universeConfig';

export interface SolarSystemHudProps {
  className?: string;
}

/**
 * Minimal orbital planet waypoint bar scoped to Hero overview.
 * Leaves Hero open without bulky UI chrome and fades away during section reading.
 */
export function SolarSystemHud({ className = '' }: SolarSystemHudProps) {
  const nav = useOptionalUniverseNavigation();
  if (!nav) return null;

  const {
    activeSection,
    navigationMode,
    hoveredPlanet,
    selectedPlanet,
    navigateToPlanet,
    resetSolarOverview,
    setHoveredPlanet,
  } = nav;

  const isExploreHero = navigationMode === 'explore' && activeSection === 'hero';
  const activeHoveredMeta =
    hoveredPlanet && hoveredPlanet !== 'sun'
      ? SOLAR_SYSTEM_PLANETS.find((p) => p.id === hoveredPlanet)
      : null;

  const handleSelect = (id: PlanetId) => {
    navigateToPlanet(id);
  };

  return (
    <>
      {/* Subtle interactive badge when hovering any 3D planet while reading another section */}
      {!isExploreHero && (activeHoveredMeta || hoveredPlanet === 'sun') && (
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
                backgroundColor: activeHoveredMeta ? activeHoveredMeta.color : 'var(--planet-sun)',
                boxShadow: `0 0 8px ${activeHoveredMeta ? activeHoveredMeta.color : 'var(--planet-sun)'}`,
              }}
            />
            <span>
              {activeHoveredMeta
                ? `${activeHoveredMeta.label} · Click to orbit`
                : 'Sun · Click for Overview'}
            </span>
          </p>
        </div>
      )}

      <div
        data-testid="solar-system-hud"
        className={[
          'flex flex-col items-center gap-1.5 transition-opacity duration-200',
          isExploreHero
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0 focus-within:pointer-events-auto focus-within:opacity-100',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div
          role="group"
          aria-label="Solar System Planet Destinations"
          className="inline-flex flex-wrap items-center justify-center gap-1"
        >
          <button
            type="button"
            data-testid="planet-nav-sun"
            aria-pressed={activeSection === 'hero' && selectedPlanet === 'sun'}
            aria-label="Sun · Overview — Austin Joshua Solar System"
            onMouseEnter={() => setHoveredPlanet('sun')}
            onMouseLeave={() => setHoveredPlanet(null)}
            onFocus={() => setHoveredPlanet('sun')}
            onBlur={() => setHoveredPlanet(null)}
            onClick={() => handleSelect('sun')}
            className={[
              'inline-flex min-h-[38px] items-center gap-1.5 px-2.5 py-1 rounded-full',
              'font-mono text-[11px] cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95',
              'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[2px]',
              activeSection === 'hero'
                ? 'text-[var(--planet-sun)] font-semibold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
            ].join(' ')}
          >
            <span
              aria-hidden="true"
              className="size-2 rounded-full shrink-0"
              style={{
                backgroundColor: 'var(--planet-sun)',
                boxShadow: '0 0 8px var(--planet-sun)',
              }}
            />
            <span>Sun</span>
          </button>

          {SOLAR_SYSTEM_PLANETS.map((planet) => {
            const isCurrent = activeSection === planet.sectionId;
            const isHovered = hoveredPlanet === planet.id;
            return (
              <button
                key={planet.id}
                type="button"
                data-testid={`planet-nav-${planet.id}`}
                aria-pressed={isCurrent}
                aria-label={`Navigate to ${planet.label} planet (${planet.subtitle})`}
                onMouseEnter={() => setHoveredPlanet(planet.id)}
                onMouseLeave={() => setHoveredPlanet(null)}
                onFocus={() => setHoveredPlanet(planet.id)}
                onBlur={() => setHoveredPlanet(null)}
                onClick={() => handleSelect(planet.id)}
                className={[
                  'inline-flex min-h-[38px] items-center gap-1.5 px-2.5 py-1 rounded-full',
                  'font-mono text-[11px] cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95',
                  'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[2px]',
                  isCurrent || isHovered
                    ? 'text-[var(--text-primary)] font-semibold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
                ].join(' ')}
              >
                <span
                  aria-hidden="true"
                  className="size-2 rounded-full shrink-0 transition-transform duration-200"
                  style={{
                    backgroundColor: planet.color,
                    boxShadow: isCurrent || isHovered ? `0 0 10px ${planet.color}` : 'none',
                  }}
                />
                <span>{planet.label}</span>
              </button>
            );
          })}

          <button
            type="button"
            data-testid="reset-solar-overview"
            onClick={resetSolarOverview}
            aria-label="Reset Orbit — Return to Solar System Overview"
            title="Reset Orbit"
            className="inline-flex min-h-[38px] min-w-[38px] items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:rotate-[-30deg] cursor-pointer transition-all duration-200 focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[2px]"
          >
            <RotateCcw className="size-3.5 shrink-0" aria-hidden="true" />
          </button>
        </div>

        <p
          aria-live="polite"
          className="type-meta text-[11px] min-h-[1.125rem] text-[var(--planet-sun)] text-center"
        >
          {activeHoveredMeta
            ? `${activeHoveredMeta.cosmicTitle} · ${activeHoveredMeta.subtitle}`
            : '\u00A0'}
        </p>
      </div>
    </>
  );
}

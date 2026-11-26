import { Compass, RotateCcw } from 'lucide-react';
import { useOptionalUniverseNavigation } from '@/context/UniverseNavigationContext';
import { SOLAR_SYSTEM_PLANETS, type PlanetId } from '@/three/universeConfig';

export interface SolarSystemHudProps {
  className?: string;
}

/**
 * Semantic DOM companion control for the 3D Solar System so all planet
 * destinations, hover telemetry, and Explore/Guided orbit controls remain
 * 100% keyboard- and screen-reader-accessible alongside WebGL raycasting.
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

  const activeHoveredMeta =
    hoveredPlanet && hoveredPlanet !== 'sun'
      ? SOLAR_SYSTEM_PLANETS.find((p) => p.id === hoveredPlanet)
      : null;

  const handleSelect = (id: PlanetId) => {
    navigateToPlanet(id);
  };

  return (
    <div
      data-testid="solar-system-hud"
      className={[
        'pointer-events-auto flex flex-col gap-2.5',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Interactive Planet Navigation Strip */}
      <div
        role="group"
        aria-label="Solar System Planet Destinations"
        className="glass-surface inline-flex flex-wrap items-center gap-1.5 px-2.5 py-2 rounded-[var(--radius-card)]"
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
            'inline-flex min-h-[44px] items-center gap-2 px-3 py-1.5 rounded-[var(--radius-control)]',
            'font-mono text-xs font-medium cursor-pointer transition-colors duration-200',
            'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[2px]',
            activeSection === 'hero'
              ? 'bg-white/10 text-[var(--text-primary)] border border-[var(--planet-sun)]/60'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 border border-transparent',
          ].join(' ')}
        >
          <span
            aria-hidden="true"
            className="size-2.5 rounded-full shrink-0"
            style={{
              backgroundColor: 'var(--planet-sun)',
              boxShadow: '0 0 10px var(--planet-sun)',
            }}
          />
          <span>Sun · Overview</span>
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
                'inline-flex min-h-[44px] items-center gap-2 px-3 py-1.5 rounded-[var(--radius-control)]',
                'font-mono text-xs cursor-pointer transition-colors duration-200',
                'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[2px]',
                isCurrent || isHovered
                  ? 'bg-white/10 text-[var(--text-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5',
              ].join(' ')}
              style={{
                border: isCurrent
                  ? `1px solid ${planet.color}`
                  : '1px solid transparent',
              }}
            >
              <span
                aria-hidden="true"
                className="size-2.5 rounded-full shrink-0"
                style={{
                  backgroundColor: planet.color,
                  boxShadow: isCurrent || isHovered ? `0 0 8px ${planet.color}` : 'none',
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
          aria-label={
            navigationMode === 'explore'
              ? 'Reset Orbit — Return to Solar System Overview'
              : 'Explore System — Return to Solar System Overview'
          }
          title="Reset Solar System Overview"
          className="inline-flex min-h-[44px] items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-control)] font-mono text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 cursor-pointer transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[2px]"
        >
          {navigationMode === 'explore' ? (
            <RotateCcw className="size-3.5 shrink-0" aria-hidden="true" />
          ) : (
            <Compass className="size-3.5 shrink-0" aria-hidden="true" />
          )}
          <span className="hidden sm:inline">
            {navigationMode === 'explore' ? 'Reset Orbit' : 'Explore System'}
          </span>
        </button>
      </div>

      {/* Subtle contextual readout when inspecting any celestial destination */}
      <p
        aria-live="polite"
        className="type-meta text-xs text-[var(--text-muted)] min-h-[1.25rem]"
      >
        {hoveredPlanet === 'sun'
          ? 'CORE // SUN — Austin Joshua · Drag open space to orbit or choose a destination planet.'
          : activeHoveredMeta
            ? `ORBIT // ${activeHoveredMeta.cosmicTitle} — ${activeHoveredMeta.subtitle}`
            : 'Drag open cosmic backdrop on desktop or select any planet orbit to travel.'}
      </p>
    </div>
  );
}

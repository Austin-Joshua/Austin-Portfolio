import type { ReactNode } from 'react';
import { SideReveal } from '@/components/ui/SideReveal';
import { useOptionalUniverseNavigation } from '@/context/UniverseNavigationContext';
import type { SectionId } from '@/data/sections';
import { SOLAR_SYSTEM_PLANETS } from '@/three/universeConfig';
import { playPlanetSound } from '@/utils/soundEffects';

export interface SectionShellProps {
  id: SectionId | (string & {});
  index?: string;
  title?: string;
  labelledbyId?: string;
  description?: string;
  headingLevel?: 1 | 2;
  fullBleed?: boolean;
  withDivider?: boolean;
  className?: string;
  children?: ReactNode;
}

export function SectionShell({
  id,
  title,
  labelledbyId,
  description,
  headingLevel = 2,
  fullBleed = false,
  withDivider = false,
  className = '',
  children,
}: SectionShellProps) {
  const universeNav = useOptionalUniverseNavigation();
  const headingId = `${id}-heading`;
  const resolvedLabelledBy = title ? headingId : labelledbyId;
  const planet = SOLAR_SYSTEM_PLANETS.find((p) => p.sectionId === id);
  const activeBadge =
    planet && universeNav?.planetActivity?.planetId === planet.id
      ? universeNav.planetActivity.label
      : null;

  const headerContent = title ? (
    <SideReveal direction="left" className="pointer-events-none mb-8 md:mb-10">
      <div className="pointer-events-auto w-fit max-w-[78ch]">
        {planet && (
          <div className="mb-2.5">
            <button
              type="button"
              onClick={() => {
                playPlanetSound(planet.id);
                universeNav?.pulsePlanet(planet.id, 1.1);
              }}
              onMouseEnter={() => universeNav?.pulsePlanet(planet.id, 0.55)}
              aria-label={`Pulse ${planet.label} sphere`}
              className="inline-flex min-h-[32px] items-center gap-2.5 rounded-full px-2 -ml-2 py-1 cursor-pointer transition-colors duration-150 hover:bg-white/6 active:scale-95 focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[2px]"
            >
              <span
                aria-hidden="true"
                className="size-2.5 rounded-full shrink-0"
                style={{
                  backgroundColor: planet.color,
                  boxShadow: `0 0 8px ${planet.color}`,
                }}
              />
              <span className="type-meta text-xs sm:text-sm" style={{ color: planet.color }}>
                {planet.cosmicTitle}
              </span>
              {activeBadge && (
                <span className="font-mono text-[11px] text-[var(--text-muted)]">
                  · {activeBadge}
                </span>
              )}
            </button>
          </div>
        )}
        {title &&
          (headingLevel === 1 ? (
            <h1
              id={headingId}
              className="type-hero text-[var(--text-primary)] [text-shadow:0_4px_24px_rgba(2,3,7,0.92)]"
            >
              {title}
            </h1>
          ) : (
            <h2
              id={headingId}
              className="type-h2 text-[var(--text-primary)] [text-shadow:0_4px_24px_rgba(2,3,7,0.92)]"
            >
              {title}
            </h2>
          ))}
        {planet && (
          <div
            aria-hidden="true"
            className="mt-3.5 h-[2px] w-28 rounded-full"
            style={{
              background: `linear-gradient(90deg, ${planet.color} 0%, transparent 100%)`,
            }}
          />
        )}
        {description && (
          <p className="type-lead text-[var(--text-secondary)] max-w-[68ch] mt-4 [text-shadow:0_2px_18px_rgba(2,3,7,0.92)]">
            {description}
          </p>
        )}
      </div>
    </SideReveal>
  ) : null;

  return (
    <section
      id={id}
      aria-labelledby={resolvedLabelledBy}
      className={[
        'pointer-events-none scroll-mt-[var(--nav-offset)] section-rhythm overflow-x-clip',
        withDivider ? 'border-t border-[var(--border-subtle)]' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {fullBleed ? (
        <>
          {headerContent && (
            <div className="container-portfolio pointer-events-none">{headerContent}</div>
          )}
          {children}
        </>
      ) : (
        <div className="container-portfolio pointer-events-none">
          {headerContent}
          {children}
        </div>
      )}
    </section>
  );
}

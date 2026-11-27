import type { MouseEvent } from 'react';
import { PORTFOLIO_SECTIONS, type SectionId } from '@/data/sections';
import { SOLAR_SYSTEM_PLANETS } from '@/three/universeConfig';

export interface DesktopSectionRailProps {
  activeSection: string;
  onSectionSelect?: (
    event: MouseEvent<HTMLAnchorElement>,
    targetId: SectionId,
  ) => void;
}

function getRailColor(sectionId: SectionId): string {
  if (sectionId === 'hero') return 'var(--planet-sun)';
  return (
    SOLAR_SYSTEM_PLANETS.find((p) => p.sectionId === sectionId)?.color ??
    'var(--accent-primary)'
  );
}

export function DesktopSectionRail({
  activeSection,
  onSectionSelect,
}: DesktopSectionRailProps) {
  return (
    <nav
      aria-label="Section index"
      data-testid="desktop-section-rail"
      className="section-rail fixed right-1 xl:right-3 top-1/2 -translate-y-1/2 z-30 pointer-events-auto"
    >
      <ol className="flex flex-col items-end gap-1 m-0 p-0 list-none">
        {PORTFOLIO_SECTIONS.map((section) => {
          const isActive = activeSection === section.id;
          const color = getRailColor(section.id);

          return (
            <li key={section.id}>
              <a
                href={section.route}
                onClick={(event) => onSectionSelect?.(event, section.id)}
                aria-current={isActive ? 'location' : undefined}
                aria-label={section.label}
                title={section.label}
                className={[
                  'group inline-flex min-h-[28px] min-w-[28px] items-center justify-end gap-1',
                  'px-1 py-0.5 rounded-[var(--radius-control)]',
                  'font-mono text-[11px] leading-none tracking-[var(--tracking-meta)]',
                  'transition-colors duration-200',
                  'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
                  isActive
                    ? 'font-semibold text-[var(--text-primary)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
                ].join(' ')}
              >
                <span
                  aria-hidden="true"
                  className={[
                    'block rounded-full transition-[width,background-color] duration-200',
                    isActive ? 'h-[2px] w-3' : 'h-px w-1.5 group-hover:w-2.5',
                  ].join(' ')}
                  style={{
                    backgroundColor: isActive ? color : undefined,
                  }}
                />
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

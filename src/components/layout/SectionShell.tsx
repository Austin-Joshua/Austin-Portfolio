import type { ReactNode } from 'react';
import type { SectionId } from '@/data/sections';
import { SOLAR_SYSTEM_PLANETS } from '@/three/universeConfig';

export interface SectionShellProps {
  id: SectionId | (string & {});
  index: string;
  indexLabel?: string;
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
  index,
  indexLabel,
  title,
  labelledbyId,
  description,
  headingLevel = 2,
  fullBleed = false,
  withDivider = true,
  className = '',
  children,
}: SectionShellProps) {
  const headingId = `${id}-heading`;
  const resolvedLabelledBy = title ? headingId : labelledbyId;
  const planet = SOLAR_SYSTEM_PLANETS.find((p) => p.sectionId === id);

  const headerContent = title ? (
    <div className="pointer-events-auto mb-10 md:mb-14 max-w-[68ch]">
      {planet && (
        <div className="inline-flex items-center gap-2 mb-3">
          <span
            aria-hidden="true"
            className="size-2 rounded-full"
            style={{
              backgroundColor: planet.color,
              boxShadow: `0 0 10px ${planet.color}`,
            }}
          />
          <p className="type-meta uppercase tracking-[0.14em]" style={{ color: planet.color }}>
            {index} {'//'} {planet.cosmicTitle}
          </p>
        </div>
      )}
      {!planet && indexLabel && (
        <p className="type-meta uppercase tracking-[0.14em] text-[var(--text-muted)] mb-3">
          {index} {'//'} {indexLabel}
        </p>
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
      {description && (
        <p className="type-lead text-[var(--text-secondary)] max-w-[68ch] mt-4 rounded-[var(--radius-card)] bg-[#020307]/72 px-4 py-2.5 backdrop-blur-sm border border-white/[0.06]">
          {description}
        </p>
      )}
    </div>
  ) : null;

  return (
    <section
      id={id}
      aria-labelledby={resolvedLabelledBy}
      className={[
        'scroll-mt-[var(--nav-offset)] section-rhythm',
        withDivider ? 'border-t border-[var(--border-subtle)]' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {fullBleed ? (
        <>
          {headerContent && (
            <div className="container-portfolio">{headerContent}</div>
          )}
          {children}
        </>
      ) : (
        <div className="container-portfolio">
          {headerContent}
          {children}
        </div>
      )}
    </section>
  );
}

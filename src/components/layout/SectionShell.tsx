import type { ReactNode } from 'react';
import type { SectionId } from '@/data/sections';
import { SOLAR_SYSTEM_PLANETS } from '@/three/universeConfig';

export interface SectionShellProps {
  id: SectionId | (string & {});
  index?: string;
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
    <div className="pointer-events-auto mb-6 md:mb-8 max-w-[68ch]">
      {planet && (
        <div className="inline-flex items-center gap-2 mb-2.5">
          <span
            aria-hidden="true"
            className="size-2 rounded-full"
            style={{
              backgroundColor: planet.color,
              boxShadow: `0 0 10px ${planet.color}`,
            }}
          />
          <p className="type-meta uppercase tracking-[0.14em]" style={{ color: planet.color }}>
            {planet.cosmicTitle}
          </p>
        </div>
      )}
      {!planet && indexLabel && (
        <p className="type-meta uppercase tracking-[0.14em] text-[var(--text-muted)] mb-2.5">
          {indexLabel}
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
        <p className="type-lead text-[var(--text-secondary)] max-w-[65ch] mt-3 [text-shadow:0_2px_18px_rgba(2,3,7,0.92)]">
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
        'scroll-mt-[var(--nav-offset)] section-rhythm overflow-x-clip',
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

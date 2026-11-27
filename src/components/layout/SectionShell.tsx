import type { ReactNode } from 'react';
import { SideReveal } from '@/components/ui/SideReveal';
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
  withDivider = false,
  className = '',
  children,
}: SectionShellProps) {
  const headingId = `${id}-heading`;
  const resolvedLabelledBy = title ? headingId : labelledbyId;
  const planet = SOLAR_SYSTEM_PLANETS.find((p) => p.sectionId === id);

  const headerContent = title ? (
    <SideReveal direction="left" className="pointer-events-none mb-10 md:mb-12">
      <div className="pointer-events-auto w-fit max-w-[78ch]">
        {planet && (
          <div className="inline-flex items-center gap-3 mb-3.5">
            <span
              aria-hidden="true"
              className="size-3 rounded-full"
              style={{
                backgroundColor: planet.color,
                boxShadow: `0 0 14px ${planet.color}`,
              }}
            />
            <p className="type-meta uppercase tracking-[0.18em] text-xs sm:text-sm" style={{ color: planet.color }}>
              {planet.cosmicTitle}
            </p>
          </div>
        )}
        {!planet && indexLabel && (
          <p className="type-meta uppercase tracking-[0.16em] text-[var(--text-muted)] mb-3">
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

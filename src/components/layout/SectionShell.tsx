import type { ReactNode } from 'react';
import type { SectionId } from '@/data/sections';

export interface SectionShellProps {
  id: SectionId | (string & {});
  index: string;
  indexLabel?: string;
  title?: string;
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
  description,
  headingLevel = 2,
  fullBleed = false,
  withDivider = true,
  className = '',
  children,
}: SectionShellProps) {
  const headingId = `${id}-heading`;
  const indexId = `${id}-index`;
  const resolvedIndexLabel = (indexLabel ?? title ?? id).toUpperCase();

  const headerContent = (
    <div className="mb-8 md:mb-12">
      <p id={indexId} className="type-meta uppercase text-[var(--text-muted)]">
        {index} {'//'} {resolvedIndexLabel}
      </p>
      {title &&
        (headingLevel === 1 ? (
          <h1 id={headingId} className="type-hero text-[var(--text-primary)] mt-3">
            {title}
          </h1>
        ) : (
          <h2 id={headingId} className="type-h2 text-[var(--text-primary)] mt-3">
            {title}
          </h2>
        ))}
      {description && (
        <p className="type-lead text-[var(--text-secondary)] max-w-[68ch] mt-4">
          {description}
        </p>
      )}
    </div>
  );

  return (
    <section
      id={id}
      aria-labelledby={title ? headingId : indexId}
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
          <div className="container-portfolio">{headerContent}</div>
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

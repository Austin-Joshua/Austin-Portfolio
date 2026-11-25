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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  index: _index,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  indexLabel: _indexLabel,
  title,
  description,
  headingLevel = 2,
  fullBleed = false,
  withDivider = true,
  className = '',
  children,
}: SectionShellProps) {
  const headingId = `${id}-heading`;

  const headerContent = title ? (
    <div className="mb-10 md:mb-14">
      {title &&
        (headingLevel === 1 ? (
          <h1 id={headingId} className="type-hero text-[var(--text-primary)]">
            {title}
          </h1>
        ) : (
          <h2 id={headingId} className="type-h2 text-[var(--text-primary)]">
            {title}
          </h2>
        ))}
      {description && (
        <p className="type-lead text-[var(--text-secondary)] max-w-[68ch] mt-4">
          {description}
        </p>
      )}
    </div>
  ) : null;

  return (
    <section
      id={id}
      aria-labelledby={title ? headingId : undefined}
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

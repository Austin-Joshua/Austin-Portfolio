import { ArrowUpRight, X } from 'lucide-react';
import { AnimatePresence, m, useIsPresent } from 'motion/react';
import { useEffect, useId, useRef, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { TagChip } from '@/components/ui/TagChip';
import { useOptionalMotionPreference } from '@/context/MotionPreferenceContext';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { backdropVariants, createModalDialogVariants } from '@/motion/variants';
import type { ProjectItem, ProjectMediaItem } from '@/types/portfolio';
import {
  hasNonEmptyText,
  isValidHttpUrl,
  isValidLocalOrHttpAssetUrl,
} from '@/utils/dataGuards';

export interface ProjectDetailModalProps {
  project: ProjectItem | null;
  onClose: () => void;
  fallbackFocusRef?: RefObject<HTMLElement | null>;
}

function ProjectMediaFigure({ media }: { media: ProjectMediaItem }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const canRenderImage =
    isValidLocalOrHttpAssetUrl(media.src) &&
    hasNonEmptyText(media.alt) &&
    failedSrc !== media.src;

  return (
    <figure className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--surface-card)]">
      {canRenderImage ? (
        <img
          src={media.src}
          alt={media.alt}
          width={media.width}
          height={media.height}
          loading="lazy"
          decoding="async"
          onError={() => setFailedSrc(media.src)}
          className="aspect-[16/10] w-full object-cover"
        />
      ) : (
        <div
          data-testid="project-media-fallback"
          className="aspect-[16/10] w-full flex flex-col items-center justify-center p-4 text-center"
        >
          <p className="type-meta uppercase text-[var(--text-muted)]">
            MEDIA // ASSET_UNAVAILABLE
          </p>
          {hasNonEmptyText(media.alt) && (
            <p className="type-body text-xs text-[var(--text-secondary)] mt-1">
              {media.alt}
            </p>
          )}
        </div>
      )}
    </figure>
  );
}

interface ProjectDetailDialogInnerProps {
  project: ProjectItem;
  onClose: () => void;
  fallbackFocusRef?: RefObject<HTMLElement | null>;
  prefersReducedMotion: boolean;
}

function ProjectDetailDialogInner({
  project,
  onClose,
  fallbackFocusRef,
  prefersReducedMotion,
}: ProjectDetailDialogInnerProps) {
  const isPresent = useIsPresent();
  const titleId = useId();
  const summaryId = useId();
  const backdropRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const bodyScrollRef = useRef<HTMLDivElement>(null);

  const isMobileViewport =
    typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  const dialogVariants = createModalDialogVariants(
    isMobileViewport,
    prefersReducedMotion,
  );

  // Immediately release trap and restore focus when AnimatePresence begins exiting
  useFocusTrap({
    active: isPresent,
    containerRef: dialogRef,
    initialFocusRef: closeButtonRef,
    onEscape: onClose,
    fallbackFocusRef,
  });

  useEffect(() => {
    if (!isPresent || typeof document === 'undefined') {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    if (scrollbarWidth > 0) {
      const currentPadding =
        Number.parseFloat(window.getComputedStyle(document.body).paddingRight) || 0;
      document.body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
    }
    document.body.style.overflow = 'hidden';

    const backdropNode = backdropRef.current;
    const savedSiblings: Array<{
      element: HTMLElement;
      hadAriaHidden: string | null;
      hadInert: boolean;
    }> = [];

    for (const child of Array.from(document.body.children)) {
      if (
        !(child instanceof HTMLElement) ||
        child === backdropNode ||
        child.tagName === 'SCRIPT' ||
        child.tagName === 'STYLE'
      ) {
        continue;
      }

      const htmlChild = child as HTMLElement & { inert?: boolean };
      savedSiblings.push({
        element: child,
        hadAriaHidden: child.getAttribute('aria-hidden'),
        hadInert: Boolean(htmlChild.inert),
      });

      child.setAttribute('aria-hidden', 'true');
      if ('inert' in htmlChild) {
        htmlChild.inert = true;
      }
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;

      for (const entry of savedSiblings) {
        if (entry.hadAriaHidden === null) {
          entry.element.removeAttribute('aria-hidden');
        } else {
          entry.element.setAttribute('aria-hidden', entry.hadAriaHidden);
        }

        const htmlElement = entry.element as HTMLElement & { inert?: boolean };
        if ('inert' in htmlElement) {
          htmlElement.inert = entry.hadInert;
        }
      }
    };
  }, [isPresent]);

  useEffect(() => {
    if (bodyScrollRef.current) {
      bodyScrollRef.current.scrollTop = 0;
    }
  }, [project.slug]);

  const validOutcomes = (project.outcomes ?? []).filter((outcome) =>
    hasNonEmptyText(outcome),
  );
  const validStack = project.stack.filter((tech) => hasNonEmptyText(tech));
  const validMedia = (project.media ?? []).filter((item) =>
    hasNonEmptyText(item.src),
  );
  const hasGithub = isValidHttpUrl(project.links.github);
  const hasLive = isValidHttpUrl(project.links.live);

  return (
    <m.div
      ref={backdropRef}
      data-testid="project-modal-backdrop"
      role="presentation"
      variants={backdropVariants}
      initial={prefersReducedMotion ? false : 'hidden'}
      animate="visible"
      exit="exit"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      className={[
        'fixed inset-0 z-50 flex items-end md:items-center justify-center',
        'p-0 md:p-6 bg-[var(--surface-scrim)]',
        !isPresent ? 'pointer-events-none' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <m.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={summaryId}
        data-reduced-motion={prefersReducedMotion ? 'true' : 'false'}
        variants={dialogVariants}
        initial={prefersReducedMotion ? false : 'hidden'}
        animate="visible"
        exit="exit"
        className={[
          'glass-surface-strong relative flex w-full flex-col',
          'max-h-[90dvh] md:max-h-[85vh] md:max-w-[880px]',
          'rounded-t-[var(--radius-modal)] rounded-b-none md:rounded-[var(--radius-modal)]',
          'overflow-hidden text-[var(--text-primary)] shadow-[var(--shadow-elevated)]',
        ].join(' ')}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-5 py-4 md:px-7 md:py-5">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="type-meta text-[var(--text-muted)]">
                {project.indexCode}
              </span>
              {hasNonEmptyText(project.categoryLabel) && (
                <TagChip variant="accent">{project.categoryLabel}</TagChip>
              )}
            </div>
            <h2
              id={titleId}
              className="type-h3 md:type-h2 text-[var(--text-primary)] break-words"
            >
              {project.title}
            </h2>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close project details"
            className={[
              'glass-surface inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center',
              'rounded-[var(--radius-control)] text-[var(--text-primary)] cursor-pointer',
              'hover:border-[var(--accent-primary)] hover:bg-[var(--surface-card)]',
              'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
            ].join(' ')}
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div
          ref={bodyScrollRef}
          className="overflow-y-auto px-5 py-5 md:px-7 md:py-6 space-y-6 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
        >
          <p id={summaryId} className="type-lead text-[var(--text-secondary)]">
            {project.summary}
          </p>

          {hasNonEmptyText(project.role) && project.role && (
            <div className="space-y-1.5">
              <h3 className="type-meta uppercase text-[var(--accent-primary)]">
                ROLE & CONTRIBUTION
              </h3>
              <p className="type-body text-[var(--text-primary)]">{project.role}</p>
            </div>
          )}

          {hasNonEmptyText(project.problem) && (
            <div className="space-y-1.5">
              <h3 className="type-meta uppercase text-[var(--text-muted)]">
                PROBLEM STATEMENT
              </h3>
              <p className="type-body text-[var(--text-secondary)] max-w-[68ch]">
                {project.problem}
              </p>
            </div>
          )}

          {hasNonEmptyText(project.approach) && (
            <div className="space-y-1.5">
              <h3 className="type-meta uppercase text-[var(--text-muted)]">
                TECHNICAL APPROACH
              </h3>
              <p className="type-body text-[var(--text-secondary)] max-w-[68ch]">
                {project.approach}
              </p>
            </div>
          )}

          {validOutcomes.length > 0 && (
            <div className="space-y-2">
              <h3 className="type-meta uppercase text-[var(--accent-gold)]">
                VERIFIED OUTCOMES
              </h3>
              <ul className="space-y-1.5 pl-5 list-disc text-[var(--text-secondary)]">
                {validOutcomes.map((outcome, idx) => (
                  <li key={`${project.slug}-outcome-${idx}`} className="type-body">
                    {outcome}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {validStack.length > 0 && (
            <div className="space-y-2">
              <h3 className="type-meta uppercase text-[var(--text-muted)]">
                TECHNOLOGY STACK
              </h3>
              <div className="flex flex-wrap gap-2">
                {validStack.map((tech) => (
                  <TagChip key={`${project.slug}-${tech}`}>{tech}</TagChip>
                ))}
              </div>
            </div>
          )}

          {validMedia.length > 0 && (
            <div className="space-y-3">
              <h3 className="type-meta uppercase text-[var(--text-muted)]">
                MEDIA
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {validMedia.map((item, idx) => (
                  <ProjectMediaFigure
                    key={`${project.slug}-media-${idx}-${item.src}`}
                    media={item}
                  />
                ))}
              </div>
            </div>
          )}

          {(hasGithub || hasLive) && (
            <div className="flex flex-wrap items-center gap-3 border-t border-[var(--border-subtle)] pt-5">
              {hasGithub && project.links.github && (
                <a
                  href={project.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={[
                    'glass-surface inline-flex min-h-[44px] items-center gap-2 px-4 py-2.5',
                    'rounded-[var(--radius-control)] font-mono text-xs font-medium text-[var(--text-primary)]',
                    'hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]',
                    'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
                  ].join(' ')}
                >
                  <span>GitHub Repository</span>
                  <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
                </a>
              )}
              {hasLive && project.links.live && (
                <a
                  href={project.links.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={[
                    'inline-flex min-h-[44px] items-center gap-2 px-4 py-2.5',
                    'rounded-[var(--radius-control)] bg-[var(--accent-primary)] text-[var(--text-on-accent)]',
                    'font-mono text-xs font-semibold hover:brightness-110',
                    'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
                  ].join(' ')}
                >
                  <span>Live Demo</span>
                  <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
                </a>
              )}
            </div>
          )}
        </div>
      </m.div>
    </m.div>
  );
}

export function ProjectDetailModal({
  project,
  onClose,
  fallbackFocusRef,
}: ProjectDetailModalProps) {
  const { prefersReducedMotion } = useOptionalMotionPreference();

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {project ? (
        <ProjectDetailDialogInner
          key="project-detail-dialog"
          project={project}
          onClose={onClose}
          fallbackFocusRef={fallbackFocusRef}
          prefersReducedMotion={prefersReducedMotion}
        />
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

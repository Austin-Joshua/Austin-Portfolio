import { useState } from 'react';
import type { PortraitAsset } from '@/types/portfolio';
import { hasNonEmptyText, isValidLocalOrHttpAssetUrl } from '@/utils/dataGuards';

export interface PortraitSlotProps {
  portrait: PortraitAsset | null;
  className?: string;
}

export function PortraitSlot({ portrait, className = '' }: PortraitSlotProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const hasValidPortrait =
    portrait !== null &&
    isValidLocalOrHttpAssetUrl(portrait.src) &&
    hasNonEmptyText(portrait.alt) &&
    failedSrc !== portrait.src;

  return (
    <div
      className={[
        'glass-surface relative aspect-[3/4] w-full max-w-[360px] mx-auto lg:ml-auto lg:mr-0',
        'p-3 overflow-hidden',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Swiss corner registration ticks */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-2 left-2 z-10 h-3 w-3 border-t border-l border-[var(--accent-chrome)]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-2 right-2 z-10 h-3 w-3 border-t border-r border-[var(--accent-chrome)]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-2 left-2 z-10 h-3 w-3 border-b border-l border-[var(--accent-chrome)]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-2 right-2 z-10 h-3 w-3 border-b border-r border-[var(--accent-chrome)]"
      />

      {hasValidPortrait && portrait ? (
        <img
          src={portrait.src}
          alt={portrait.alt}
          width={portrait.width ?? 800}
          height={portrait.height ?? 1067}
          loading="lazy"
          decoding="async"
          onError={() => setFailedSrc(portrait.src)}
          className="h-full w-full rounded-[var(--radius-control)] object-cover"
        />
      ) : (
        <div
          data-testid="portrait-fallback"
          className="relative flex h-full w-full flex-col items-center justify-between rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 text-center"
        >
          <span className="type-meta uppercase text-[var(--text-muted)] self-start">
            02 // FRAME
          </span>

          <div className="relative flex flex-col items-center justify-center">
            <svg
              aria-hidden="true"
              viewBox="0 0 160 160"
              className="h-36 w-36 text-[var(--accent-chrome-muted)]"
              fill="none"
            >
              <circle
                cx="80"
                cy="80"
                r="68"
                stroke="currentColor"
                strokeOpacity="0.35"
                strokeDasharray="4 4"
              />
              <circle
                cx="80"
                cy="80"
                r="46"
                stroke="var(--accent-primary)"
                strokeOpacity="0.45"
              />
              <line
                x1="8"
                y1="80"
                x2="152"
                y2="80"
                stroke="currentColor"
                strokeOpacity="0.25"
              />
              <line
                x1="80"
                y1="8"
                x2="80"
                y2="152"
                stroke="currentColor"
                strokeOpacity="0.25"
              />
            </svg>
            <span
              aria-hidden="true"
              className="absolute font-display text-3xl font-bold tracking-tight text-[var(--text-primary)]"
            >
              AJ
            </span>
          </div>

          <p className="type-meta text-[var(--text-muted)]">
            PORTRAIT // ASSET_PENDING
          </p>
        </div>
      )}
    </div>
  );
}

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
        'portrait-frame relative aspect-[3/4] w-full max-w-[380px] mx-auto lg:ml-auto lg:mr-0',
        'overflow-hidden',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Atmospheric glow overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background: 'linear-gradient(to top, var(--surface-canvas) 0%, transparent 35%)',
        }}
      />

      {/* Swiss corner registration ticks */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-3 left-3 z-20 h-4 w-4 border-t-2 border-l-2 border-[var(--accent-primary)] opacity-60"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-3 right-3 z-20 h-4 w-4 border-t-2 border-r-2 border-[var(--accent-primary)] opacity-60"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-3 left-3 z-20 h-4 w-4 border-b-2 border-l-2 border-[var(--accent-primary)] opacity-60"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-3 right-3 z-20 h-4 w-4 border-b-2 border-r-2 border-[var(--accent-primary)] opacity-60"
      />

      {hasValidPortrait && portrait ? (
        <img
          src={portrait.src}
          alt={portrait.alt}
          width={portrait.width ?? 760}
          height={portrait.height ?? 1013}
          loading="lazy"
          decoding="async"
          onError={() => setFailedSrc(portrait.src)}
          className="h-full w-full object-cover object-top"
          style={{ objectPosition: 'center 15%' }}
        />
      ) : (
        <div
          data-testid="portrait-fallback"
          className="relative flex h-full w-full flex-col items-center justify-center bg-[var(--surface-card)]"
        >
          {/* Hidden label for tests and SR */}
          <span className="sr-only">PORTRAIT // ASSET_PENDING</span>
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
            className="absolute font-display text-4xl font-bold tracking-tight text-[var(--text-primary)]"
          >
            AJ
          </span>
        </div>
      )}
    </div>
  );
}

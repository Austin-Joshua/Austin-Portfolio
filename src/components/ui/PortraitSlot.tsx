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
        'overflow-hidden bg-[var(--surface-card)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Theme-aware studio backdrop behind transparent cutout */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(circle 72% at 50% 38%, var(--accent-primary-glow) 0%, var(--surface-elevated) 62%, var(--surface-card) 100%)',
        }}
      />

      {/* Subtle architectural coordinate hairlines */}
      <svg
        aria-hidden="true"
        viewBox="0 0 300 400"
        className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-35"
        fill="none"
      >
        <circle cx="150" cy="170" r="108" stroke="var(--accent-primary)" strokeWidth="0.8" strokeDasharray="3 7" />
        <line x1="20" y1="170" x2="280" y2="170" stroke="var(--border-subtle)" strokeWidth="1" />
        <line x1="150" y1="20" x2="150" y2="380" stroke="var(--border-subtle)" strokeWidth="1" />
      </svg>

      {/* Bottom ambient fade */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20"
        style={{
          background: 'linear-gradient(to top, var(--surface-canvas) 0%, transparent 28%)',
        }}
      />

      {/* Swiss corner registration ticks */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-3 left-3 z-20 h-4 w-4 border-t-2 border-l-2 border-[var(--accent-primary)] opacity-75"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-3 right-3 z-20 h-4 w-4 border-t-2 border-r-2 border-[var(--accent-primary)] opacity-75"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-3 left-3 z-20 h-4 w-4 border-b-2 border-l-2 border-[var(--accent-primary)] opacity-75"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-3 right-3 z-20 h-4 w-4 border-b-2 border-r-2 border-[var(--accent-primary)] opacity-75"
      />

      {hasValidPortrait && portrait ? (
        <img
          src={portrait.src}
          alt={portrait.alt}
          width={portrait.width ?? 604}
          height={portrait.height ?? 806}
          loading="lazy"
          decoding="async"
          onError={() => setFailedSrc(portrait.src)}
          className="relative z-10 h-full w-full object-contain object-bottom pt-4"
          style={{
            filter: 'drop-shadow(0 12px 28px rgba(7, 10, 24, 0.38))',
          }}
        />
      ) : (
        <div
          data-testid="portrait-fallback"
          className="relative z-10 flex h-full w-full flex-col items-center justify-center bg-[var(--surface-card)]"
        >
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
              strokeOpacity="0.55"
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

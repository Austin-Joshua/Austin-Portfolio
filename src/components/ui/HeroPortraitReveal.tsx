import { Eye, EyeOff } from 'lucide-react';
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import type { PortraitAsset } from '@/types/portfolio';
import { hasNonEmptyText, isValidLocalOrHttpAssetUrl } from '@/utils/dataGuards';

export interface HeroPortraitRevealProps {
  portrait: PortraitAsset | null;
  prefersReducedMotion: boolean;
}

export function HeroPortraitReveal({
  portrait,
  prefersReducedMotion,
}: HeroPortraitRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastInputModalityRef = useRef<'keyboard' | 'pointer'>('keyboard');
  const [isHovered, setIsHovered] = useState(false);
  const [isFocusedWithin, setIsFocusedWithin] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [spotlight, setSpotlight] = useState<{ x: number; y: number }>({ x: 50, y: 38 });

  useEffect(() => {
    const handleKeyDown = () => {
      lastInputModalityRef.current = 'keyboard';
    };
    const handlePointerDown = () => {
      lastInputModalityRef.current = 'pointer';
    };

    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('mousedown', handlePointerDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('mousedown', handlePointerDown, true);
    };
  }, []);

  const hasValidPortrait =
    portrait !== null &&
    isValidLocalOrHttpAssetUrl(portrait.src) &&
    hasNonEmptyText(portrait.alt) &&
    failedSrc !== portrait.src;

  if (!hasValidPortrait || !portrait) {
    return null;
  }

  const isRevealed = isHovered || isFocusedWithin || isPinned;

  const handleTogglePin = () => {
    setIsPinned((prev) => !prev);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || event.pointerType === 'touch') {
      return;
    }
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const x = Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((event.clientY - rect.top) / rect.height) * 100));
    setSpotlight({ x, y });
  };

  return (
    <figure
      ref={containerRef}
      data-testid="hero-portrait-figure"
      data-portrait-revealed={isRevealed ? 'true' : 'false'}
      data-reduced-motion={prefersReducedMotion ? 'true' : 'false'}
      onPointerDownCapture={() => {
        lastInputModalityRef.current = 'pointer';
      }}
      onPointerEnter={(event) => {
        if (event.pointerType !== 'touch') {
          setIsHovered(true);
        }
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== 'touch') {
          setIsHovered(false);
        }
      }}
      onPointerMove={handlePointerMove}
      onFocusCapture={() => {
        if (lastInputModalityRef.current === 'keyboard') {
          setIsFocusedWithin(true);
        }
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsFocusedWithin(false);
        }
      }}
      className="relative z-10 m-0 flex h-full w-full items-end justify-center lg:justify-end select-none"
    >
      {/* Seamless soft atmospheric halo around silhouette (never clipped inside a box frame) */}
      <div
        aria-hidden="true"
        className={[
          'pointer-events-none absolute inset-0 z-0',
          prefersReducedMotion ? 'transition-none' : 'transition-opacity duration-300',
          isRevealed ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
        style={{
          background: `radial-gradient(closest-side at ${spotlight.x}% ${spotlight.y}%, rgba(255, 210, 125, 0.1) 0%, rgba(56, 189, 248, 0.04) 48%, transparent 100%)`,
        }}
      />

      {/* Transparent cutout subject — shared element transitioning smoothly from shadow to full colour with seamless bottom feather */}
      <img
        src={portrait.src}
        alt={portrait.alt}
        width={portrait.width ?? 604}
        height={portrait.height ?? 806}
        loading="eager"
        decoding="async"
        onError={() => setFailedSrc(portrait.src)}
        className={[
          'relative z-10 h-auto max-h-[96%] w-auto max-w-full object-contain object-bottom',
          '[mask-image:linear-gradient(to_bottom,black_82%,transparent_100%)]',
          '[-webkit-mask-image:linear-gradient(to_bottom,black_82%,transparent_100%)]',
          'portrait-cutout-img',
          prefersReducedMotion ? 'portrait-cutout-reduced' : '',
          isRevealed ? 'portrait-cutout-revealed' : 'portrait-cutout-shadow',
        ]
          .filter(Boolean)
          .join(' ')}
      />

      {/* Accessible keyboard & touch toggle control */}
      <button
        type="button"
        data-testid="portrait-reveal-toggle"
        aria-pressed={isPinned}
        onClick={handleTogglePin}
        className={[
          'glass-surface-strong absolute bottom-3 right-3 z-30',
          'inline-flex min-h-[44px] items-center gap-2 px-3.5 py-2',
          'rounded-[var(--radius-control)] font-mono text-xs font-medium text-[var(--text-primary)]',
          'cursor-pointer transition-[border-color,background-color] duration-200',
          'hover:border-[var(--accent-primary)] focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
        ].join(' ')}
      >
        {isPinned ? (
          <>
            <Eye className="size-4 shrink-0 text-[var(--accent-primary)]" aria-hidden="true" />
            <span>Pinned · Colour</span>
            <span className="sr-only"> — Unpin full-colour portrait preview</span>
          </>
        ) : isRevealed ? (
          <>
            <Eye className="size-4 shrink-0 text-[var(--accent-primary)]" aria-hidden="true" />
            <span>Full Colour</span>
            <span className="sr-only"> — Pin full-colour portrait preview</span>
          </>
        ) : (
          <>
            <EyeOff className="size-4 shrink-0 text-[var(--accent-primary)]" aria-hidden="true" />
            <span>Hover or Tap Portrait</span>
            <span className="sr-only"> — Pin full-colour portrait preview</span>
          </>
        )}
      </button>
    </figure>
  );
}

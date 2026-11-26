import { useEffect, useRef, useState, type PointerEvent } from 'react';
import type { PortraitAsset } from '@/types/portfolio';
import { hasNonEmptyText, isValidLocalOrHttpAssetUrl } from '@/utils/dataGuards';

export interface HeroPortraitRevealProps {
  portrait: PortraitAsset | null;
  prefersReducedMotion: boolean;
  pointerOffset?: { x: number; y: number };
}

export function HeroPortraitReveal({
  portrait,
  prefersReducedMotion,
  pointerOffset,
}: HeroPortraitRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastInputModalityRef = useRef<'keyboard' | 'pointer'>('keyboard');
  const [isHovered, setIsHovered] = useState(false);
  const [isFocusedWithin, setIsFocusedWithin] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [localTilt, setLocalTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
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
    const normX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const normY = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    setLocalTilt({
      x: Math.max(-1, Math.min(1, normX)),
      y: Math.max(-1, Math.min(1, normY)),
    });
    const sx = Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100));
    const sy = Math.min(100, Math.max(0, ((event.clientY - rect.top) / rect.height) * 100));
    setSpotlight({ x: sx, y: sy });
  };

  const tiltX = isHovered ? localTilt.x : (pointerOffset?.x ?? 0) * 0.45;
  const tiltY = isHovered ? localTilt.y : (pointerOffset?.y ?? 0) * 0.45;
  const portrait3DTransform = prefersReducedMotion
    ? undefined
    : `perspective(1100px) rotateX(${(-tiltY * 1.4).toFixed(2)}deg) rotateY(${(tiltX * 5.5).toFixed(2)}deg) translate3d(${(tiltX * 6).toFixed(1)}px, 0px, 0px)`;

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
          setLocalTilt({ x: 0, y: 0 });
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
      className="pointer-events-auto relative z-10 m-0 inline-flex h-full items-end justify-center select-none"
    >
      {/* Seamless soft solar halo behind the 3D portrait */}
      <div
        aria-hidden="true"
        className={[
          'pointer-events-none absolute -inset-6 z-0 rounded-full',
          prefersReducedMotion ? 'transition-none' : 'transition-opacity duration-300',
          isRevealed ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
        style={{
          background: `radial-gradient(closest-side at ${spotlight.x}% ${spotlight.y}%, rgba(255, 210, 125, 0.16) 0%, rgba(56, 189, 248, 0.05) 52%, transparent 100%)`,
        }}
      />

      {/* 3D Interactive Shadow->Colour Portrait Cutout (No rectangular toggle capsule) */}
      <img
        src={portrait.src}
        alt={portrait.alt}
        width={portrait.width ?? 604}
        height={portrait.height ?? 806}
        loading="eager"
        decoding="async"
        onError={() => setFailedSrc(portrait.src)}
        style={{ transform: portrait3DTransform, transformOrigin: 'center center' }}
        className={[
          'relative z-10 h-auto max-h-[96%] w-auto max-w-full object-contain object-bottom will-change-transform',
          '[mask-image:linear-gradient(to_bottom,black_84%,transparent_100%)]',
          '[-webkit-mask-image:linear-gradient(to_bottom,black_84%,transparent_100%)]',
          'portrait-cutout-img',
          prefersReducedMotion ? 'portrait-cutout-reduced' : '',
          isRevealed ? 'portrait-cutout-revealed' : 'portrait-cutout-shadow',
        ]
          .filter(Boolean)
          .join(' ')}
      />

      {/* Direct invisible accessible trigger wrapping the portrait silhouette (zero visual button box) */}
      <button
        type="button"
        data-testid="portrait-reveal-toggle"
        aria-pressed={isPinned}
        aria-label={
          isPinned
            ? 'Unpin full-colour portrait preview'
            : 'Reveal or pin full-colour portrait preview'
        }
        onClick={handleTogglePin}
        className="absolute inset-0 z-20 cursor-pointer rounded-[var(--radius-portrait)] bg-transparent border-0 focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[4px]"
      >
        <span className="sr-only">
          {isPinned
            ? 'Pinned full colour portrait'
            : isRevealed
              ? 'Full colour portrait revealed'
              : 'Hover or tap portrait to reveal colour'}
        </span>
      </button>
    </figure>
  );
}

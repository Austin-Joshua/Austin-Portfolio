import { useEffect, useRef, useState, type PointerEvent } from 'react';
import type { PortraitAsset } from '@/types/portfolio';
import { hasNonEmptyText, isValidLocalOrHttpAssetUrl } from '@/utils/dataGuards';
import {
  computeGyroTilt,
  computePointerTilt,
  requestIosGyroPermission,
  subscribeDeviceOrientation,
} from '@/utils/gyroParallax';
import { playClick } from '@/utils/soundEffects';

export interface HeroPortraitRevealProps {
  portrait: PortraitAsset | null;
  prefersReducedMotion: boolean;
  pointerOffset?: { x: number; y: number };
}

/**
 * Interactive Hero portrait stage supporting default cosmic shadow silhouette,
 * hover/focus/tap full-colour reveal, real-time gyroscope + pointer 3D parallax,
 * holographic specular sheen, and accessible pin state.
 */
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
  const [gyroActive, setGyroActive] = useState(false);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [tilt, setTilt] = useState<{
    rotateX: number;
    rotateY: number;
    shiftX: number;
    glareX: number;
    glareY: number;
  }>({
    rotateX: 0,
    rotateY: 0,
    shiftX: 0,
    glareX: 50,
    glareY: 38,
  });

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

  // Device Gyroscope orientation tracking matching Infinitus Gyro-Parallax
  useEffect(() => {
    if (prefersReducedMotion || typeof window === 'undefined') return;

    return subscribeDeviceOrientation((event) => {
      if (event.beta == null && event.gamma == null) return;
      const g = computeGyroTilt(event.gamma, event.beta, 9);
      setGyroActive(true);
      setTilt({
        rotateX: g.rotateX,
        rotateY: g.rotateY,
        shiftX: g.px * 12,
        glareX: g.glareX,
        glareY: g.glareY,
      });
    });
  }, [prefersReducedMotion]);

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
    playClick();
    void requestIosGyroPermission();
    setIsPinned((prev) => !prev);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || event.pointerType === 'touch') {
      return;
    }
    const el = containerRef.current;
    if (!el) return;
    const next = computePointerTilt(
      event.clientX,
      event.clientY,
      el.getBoundingClientRect(),
      8.5,
    );
    setTilt({
      rotateX: next.rotateX,
      rotateY: next.rotateY,
      shiftX: next.px * 12,
      glareX: next.glareX,
      glareY: next.glareY,
    });
  };

  const activeRotateX =
    isHovered || gyroActive
      ? tilt.rotateX
      : -(pointerOffset?.y ?? 0) * 1.4;
  const activeRotateY =
    isHovered || gyroActive
      ? tilt.rotateY
      : (pointerOffset?.x ?? 0) * 4.5;
  const activeShiftX =
    isHovered || gyroActive ? tilt.shiftX : (pointerOffset?.x ?? 0) * 5;

  const portrait3DTransform = prefersReducedMotion
    ? undefined
    : `perspective(1100px) rotateX(${activeRotateX.toFixed(2)}deg) rotateY(${activeRotateY.toFixed(2)}deg) translate3d(${activeShiftX.toFixed(1)}px, 0px, 0px)`;

  return (
    <figure
      ref={containerRef}
      data-testid="hero-portrait-figure"
      data-portrait-revealed={isRevealed ? 'true' : 'false'}
      data-gyro-active={gyroActive ? 'true' : 'false'}
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
          if (!gyroActive) {
            setTilt((prev) => ({ ...prev, rotateX: 0, rotateY: 0, shiftX: 0 }));
          }
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
          background: `radial-gradient(closest-side at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 210, 125, 0.18) 0%, rgba(56, 189, 248, 0.06) 52%, transparent 100%)`,
        }}
      />

      {/* Holographic Gyro-Parallax specular sheen matching Infinitus */}
      <div
        aria-hidden="true"
        data-testid="gyro-specular-glare"
        className={[
          'pointer-events-none absolute inset-0 z-15 rounded-[var(--radius-portrait)]',
          prefersReducedMotion ? 'transition-none' : 'transition-opacity duration-300',
          isRevealed || gyroActive ? 'opacity-65' : 'opacity-0',
        ].join(' ')}
        style={{
          background: `radial-gradient(circle 220px at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 255, 255, 0.14) 0%, transparent 72%)`,
          mixBlendMode: 'screen',
        }}
      />

      {/* Full-height 3D Shadow->Colour Interactive Portrait Cutout flush to stage bottom */}
      <img
        src={portrait.src}
        alt={portrait.alt}
        width={portrait.width ?? 604}
        height={portrait.height ?? 806}
        loading="eager"
        decoding="async"
        onError={() => setFailedSrc(portrait.src)}
        style={{ transform: portrait3DTransform, transformOrigin: 'center bottom' }}
        className={[
          'relative z-10 h-full max-h-full w-auto max-w-full object-contain object-bottom will-change-transform',
          '[mask-image:linear-gradient(to_bottom,black_94%,transparent_100%)]',
          '[-webkit-mask-image:linear-gradient(to_bottom,black_94%,transparent_100%)]',
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

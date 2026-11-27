import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react';
import type { PortraitAsset } from '@/types/portfolio';
import { hasNonEmptyText, isValidLocalOrHttpAssetUrl } from '@/utils/dataGuards';
import {
  computeGyroTilt,
  requestIosGyroPermission,
  subscribeDeviceOrientation,
} from '@/utils/gyroParallax';
import { playClick } from '@/utils/soundEffects';

export interface HeroPortraitRevealProps {
  portrait: PortraitAsset | null;
  prefersReducedMotion: boolean;
}

const DEFAULT_SPOT = { x: 52, y: 24 };

/**
 * Interactive flat Hero portrait cutout rendering a dark silhouette at rest,
 * subtle localized hover reveal (zero sparkles), and click-to-toggle between
 * full-colour portrait mode and shadow mode—zero 3D tilt and zero box frames.
 */
export function HeroPortraitReveal({
  portrait,
  prefersReducedMotion,
}: HeroPortraitRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastInputModalityRef = useRef<'keyboard' | 'pointer'>('keyboard');
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchActive, setIsTouchActive] = useState(false);
  const [isFocusedWithin, setIsFocusedWithin] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [shadowLockedUntilLeave, setShadowLockedUntilLeave] = useState(false);
  const [gyroActive, setGyroActive] = useState(false);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [spot, setSpot] = useState<{ x: number; y: number }>(DEFAULT_SPOT);
  const [glare, setGlare] = useState<{ x: number; y: number }>({ x: 50, y: 38 });

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

  // Subtle 2D specular light shift on device orientation without tilting the portrait in 3D
  useEffect(() => {
    if (prefersReducedMotion || typeof window === 'undefined') return;

    return subscribeDeviceOrientation((event) => {
      if (event.beta == null && event.gamma == null) return;
      const g = computeGyroTilt(event.gamma, event.beta, 9);
      setGyroActive(true);
      setGlare({ x: g.glareX, y: g.glareY });
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

  const isHoverOrTouchActive =
    !shadowLockedUntilLeave && (isHovered || isTouchActive);
  const isRevealed = isPinned || isHoverOrTouchActive || isFocusedWithin;
  const isSpotlightOnly = !isPinned && (isHoverOrTouchActive || isFocusedWithin);

  const updateSpotFromClient = (clientX: number, clientY: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const xPct = Math.max(4, Math.min(96, ((clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(4, Math.min(96, ((clientY - rect.top) / rect.height) * 100));
    setSpot({ x: xPct, y: yPct });
    if (!gyroActive) {
      setGlare({ x: xPct, y: yPct });
    }
  };

  const handleTogglePin = (event: MouseEvent<HTMLButtonElement>) => {
    playClick();
    void requestIosGyroPermission();
    if (event.clientX > 0 || event.clientY > 0) {
      updateSpotFromClient(event.clientX, event.clientY);
    } else {
      setSpot(DEFAULT_SPOT);
    }
    const nextPinned = !isPinned;
    setIsPinned(nextPinned);
    // Second pointer click immediately returns portrait to shadow mode even while cursor stays inside
    setShadowLockedUntilLeave(
      !nextPinned && lastInputModalityRef.current === 'pointer',
    );
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    updateSpotFromClient(event.clientX, event.clientY);
  };

  const cutoutMaskStyle = {
    WebkitMaskImage: `url(${portrait.src})`,
    maskImage: `url(${portrait.src})`,
    WebkitMaskSize: 'contain',
    maskSize: 'contain',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center bottom',
    maskPosition: 'center bottom',
  } as const;

  const torchRadiusPx = isFocusedWithin && !isHovered && !isTouchActive ? 130 : 108;
  const torchMaskGradient = `radial-gradient(circle ${torchRadiusPx}px at ${spot.x.toFixed(1)}% ${spot.y.toFixed(1)}%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.88) 40%, rgba(0,0,0,0.28) 72%, rgba(0,0,0,0) 100%)`;

  return (
    <figure
      ref={containerRef}
      data-testid="hero-portrait-figure"
      data-portrait-revealed={isRevealed ? 'true' : 'false'}
      data-portrait-full={isPinned ? 'true' : 'false'}
      data-gyro-active={gyroActive ? 'true' : 'false'}
      data-reduced-motion={prefersReducedMotion ? 'true' : 'false'}
      onPointerDownCapture={(event) => {
        lastInputModalityRef.current = 'pointer';
        updateSpotFromClient(event.clientX, event.clientY);
        if (event.pointerType === 'touch') {
          if (!isPinned) {
            setShadowLockedUntilLeave(false);
          }
          setIsTouchActive(true);
        }
      }}
      onPointerUpCapture={(event) => {
        if (event.pointerType === 'touch') {
          setIsTouchActive(false);
        }
      }}
      onPointerCancelCapture={() => setIsTouchActive(false)}
      onPointerEnter={(event) => {
        if (event.pointerType !== 'touch') {
          setShadowLockedUntilLeave(false);
          updateSpotFromClient(event.clientX, event.clientY);
          setIsHovered(true);
        }
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== 'touch') {
          setIsHovered(false);
          setShadowLockedUntilLeave(false);
        }
      }}
      onPointerMove={handlePointerMove}
      onFocusCapture={() => {
        if (lastInputModalityRef.current === 'keyboard') {
          setSpot(DEFAULT_SPOT);
          setShadowLockedUntilLeave(false);
          setIsFocusedWithin(true);
        }
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsFocusedWithin(false);
        }
      }}
      className="pointer-events-none relative z-10 m-0 inline-flex h-full items-end justify-center select-none"
    >
      {/* Cutout-masked specular glare shimmer (zero rectangular boundary, zero 3D transform) */}
      <div
        aria-hidden="true"
        data-testid="gyro-specular-glare"
        className={[
          'pointer-events-none absolute inset-0 z-15',
          prefersReducedMotion ? 'transition-none' : 'transition-opacity duration-300',
          isRevealed || gyroActive ? 'opacity-65' : 'opacity-0',
        ].join(' ')}
        style={{
          ...cutoutMaskStyle,
          background: `radial-gradient(circle 200px at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, 0.22) 0%, transparent 72%)`,
          mixBlendMode: 'screen',
        }}
      />

      {/* Base pure subject cutout: dark shadow mode at rest, full-colour photo when clicked */}
      <img
        src={portrait.src}
        alt={portrait.alt}
        width={portrait.width ?? 376}
        height={portrait.height ?? 732}
        loading="eager"
        decoding="async"
        onError={() => setFailedSrc(portrait.src)}
        className={[
          'relative z-10 h-full max-h-full w-auto max-w-full object-contain object-bottom',
          'portrait-cutout-img',
          isPinned ? 'portrait-cutout-revealed' : 'portrait-cutout-shadow',
          prefersReducedMotion ? 'portrait-cutout-reduced' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      />

      {/* Clean localized hover/focus spotlight layer (zero sparkles, hidden when full image is active) */}
      <div
        aria-hidden="true"
        className={[
          'pointer-events-none absolute inset-0 z-20',
          prefersReducedMotion ? 'transition-none' : 'transition-opacity duration-200',
          isSpotlightOnly ? 'opacity-100 portrait-cutout-revealed' : 'opacity-0',
        ].join(' ')}
        style={{
          backgroundImage: `url(${portrait.src})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center bottom',
          WebkitMaskImage: torchMaskGradient,
          maskImage: torchMaskGradient,
        }}
      />

      {/* Tight accessible hit target hugging only Austin's silhouette (zero empty side margins) */}
      <button
        type="button"
        data-testid="portrait-reveal-toggle"
        aria-pressed={isPinned}
        aria-label={
          isPinned
            ? 'Return portrait to shadow mode'
            : 'Click portrait to reveal full image'
        }
        onClick={handleTogglePin}
        style={{ touchAction: 'pan-y' }}
        className="pointer-events-auto absolute inset-y-[2%] inset-x-[4%] z-30 cursor-pointer rounded-full bg-transparent border-0 focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[4px]"
      >
        <span className="sr-only">
          {isPinned
            ? 'Full portrait revealed; click again for shadow mode'
            : isSpotlightOnly
              ? 'Portrait spotlight preview; click for full image'
              : 'Shadow mode active; click to reveal full portrait'}
        </span>
      </button>
    </figure>
  );
}

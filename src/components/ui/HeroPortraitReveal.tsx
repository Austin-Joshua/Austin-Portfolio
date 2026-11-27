import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react';
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

const TORCH_SPARKLES = [
  { dx: -6, dy: -7, size: 10, delay: '0ms', color: '#FFF8E2' },
  { dx: 8, dy: -5, size: 8, delay: '260ms', color: '#FFD27A' },
  { dx: -9, dy: 2, size: 7, delay: '510ms', color: '#E2EFFF' },
  { dx: 9, dy: 4, size: 9, delay: '160ms', color: '#FFE4A3' },
  { dx: -4, dy: 8, size: 7, delay: '720ms', color: '#FFF8E2' },
  { dx: 2, dy: -10, size: 8, delay: '380ms', color: '#A5D8FF' },
  { dx: 5, dy: 9, size: 7, delay: '600ms', color: '#FFD27A' },
] as const;

const DEFAULT_SPOT = { x: 52, y: 24 };

/**
 * Interactive Hero portrait cutout showing a pure silhouetted form at rest,
 * revealing ONLY the touched/hovered portion via localized warm torchlight
 * and masked cosmic sparkles with zero rectangular frame boundaries.
 */
export function HeroPortraitReveal({
  portrait,
  prefersReducedMotion,
  pointerOffset,
}: HeroPortraitRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastInputModalityRef = useRef<'keyboard' | 'pointer'>('keyboard');
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchActive, setIsTouchActive] = useState(false);
  const [isFocusedWithin, setIsFocusedWithin] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [gyroActive, setGyroActive] = useState(false);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [spot, setSpot] = useState<{ x: number; y: number }>(DEFAULT_SPOT);
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

  // Device Gyroscope orientation tracking
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

  const isRevealed = isHovered || isTouchActive || isFocusedWithin || isPinned;

  const updateSpotFromClient = (clientX: number, clientY: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const xPct = Math.max(4, Math.min(96, ((clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(4, Math.min(96, ((clientY - rect.top) / rect.height) * 100));
    setSpot({ x: xPct, y: yPct });
  };

  const handleTogglePin = (event: MouseEvent<HTMLButtonElement>) => {
    playClick();
    void requestIosGyroPermission();
    if (event.clientX > 0 || event.clientY > 0) {
      updateSpotFromClient(event.clientX, event.clientY);
    } else {
      setSpot(DEFAULT_SPOT);
    }
    setIsPinned((prev) => !prev);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    updateSpotFromClient(event.clientX, event.clientY);
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
      data-gyro-active={gyroActive ? 'true' : 'false'}
      data-reduced-motion={prefersReducedMotion ? 'true' : 'false'}
      onPointerDownCapture={(event) => {
        lastInputModalityRef.current = 'pointer';
        updateSpotFromClient(event.clientX, event.clientY);
        if (event.pointerType === 'touch') {
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
          updateSpotFromClient(event.clientX, event.clientY);
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
          setSpot(DEFAULT_SPOT);
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
      {/* Cutout-masked Gyro-Parallax specular sheen (strictly inside subject pixels — zero rectangular box) */}
      <div
        aria-hidden="true"
        data-testid="gyro-specular-glare"
        className={[
          'pointer-events-none absolute inset-0 z-15 will-change-transform',
          prefersReducedMotion ? 'transition-none' : 'transition-opacity duration-300',
          isRevealed || gyroActive ? 'opacity-65' : 'opacity-0',
        ].join(' ')}
        style={{
          transform: portrait3DTransform,
          transformOrigin: 'center bottom',
          ...cutoutMaskStyle,
          background: `radial-gradient(circle 200px at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 255, 255, 0.22) 0%, transparent 72%)`,
          mixBlendMode: 'screen',
        }}
      />

      {/* Base pure subject silhouette cutout flush to Hero bottom edge */}
      <img
        src={portrait.src}
        alt={portrait.alt}
        width={portrait.width ?? 376}
        height={portrait.height ?? 732}
        loading="eager"
        decoding="async"
        onError={() => setFailedSrc(portrait.src)}
        style={{ transform: portrait3DTransform, transformOrigin: 'center bottom' }}
        className={[
          'relative z-10 h-full max-h-full w-auto max-w-full object-contain object-bottom will-change-transform',
          'portrait-cutout-img portrait-cutout-shadow',
          prefersReducedMotion ? 'portrait-cutout-reduced' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      />

      {/* Localized Torchlight Full-Colour Reveal Layer (only the hovered/touched circle shows real photo) */}
      <div
        aria-hidden="true"
        className={[
          'pointer-events-none absolute inset-0 z-20 will-change-transform',
          prefersReducedMotion ? 'transition-none' : 'transition-opacity duration-200',
          isRevealed ? 'opacity-100 portrait-cutout-revealed' : 'opacity-0',
        ].join(' ')}
        style={{
          transform: portrait3DTransform,
          transformOrigin: 'center bottom',
          backgroundImage: `url(${portrait.src})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center bottom',
          WebkitMaskImage: torchMaskGradient,
          maskImage: torchMaskGradient,
        }}
      />

      {/* Masked Torchlight Glow & Sparkling Starlight Effect clipped strictly to Austin's silhouette */}
      <div
        aria-hidden="true"
        className={[
          'pointer-events-none absolute inset-0 z-25 overflow-hidden will-change-transform',
          prefersReducedMotion ? 'transition-none' : 'transition-opacity duration-200',
          isRevealed ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
        style={{
          transform: portrait3DTransform,
          transformOrigin: 'center bottom',
          ...cutoutMaskStyle,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle 126px at ${spot.x.toFixed(1)}% ${spot.y.toFixed(1)}%, rgba(255, 224, 152, 0.32) 0%, rgba(255, 179, 71, 0.12) 48%, transparent 82%)`,
            mixBlendMode: 'screen',
          }}
        />
        {TORCH_SPARKLES.map((spark, idx) => (
          <span
            key={idx}
            className="cosmic-sparkle absolute pointer-events-none"
            style={{
              left: `${Math.max(4, Math.min(96, spot.x + spark.dx))}%`,
              top: `${Math.max(4, Math.min(96, spot.y + spark.dy))}%`,
              width: `${spark.size}px`,
              height: `${spark.size}px`,
              backgroundColor: spark.color,
              boxShadow: `0 0 8px ${spark.color}`,
              animationDelay: spark.delay,
            }}
          />
        ))}
      </div>

      {/* Tight accessible hit target hugging only Austin's silhouette (zero empty side margins) */}
      <button
        type="button"
        data-testid="portrait-reveal-toggle"
        aria-pressed={isPinned}
        aria-label={
          isPinned
            ? 'Unpin torchlight portrait preview'
            : 'Touch or hover portrait to illuminate with torchlight'
        }
        onClick={handleTogglePin}
        style={{ touchAction: 'pan-y' }}
        className="pointer-events-auto absolute inset-y-[2%] inset-x-[4%] z-30 cursor-pointer rounded-full bg-transparent border-0 focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[4px]"
      >
        <span className="sr-only">
          {isPinned
            ? 'Torchlight portrait spotlight pinned'
            : isRevealed
              ? 'Torchlight portrait portion revealed'
              : 'Hover or touch portrait to reveal spotlight'}
        </span>
      </button>
    </figure>
  );
}

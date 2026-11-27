import { m } from 'motion/react';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { useMotionPreference } from '@/context/MotionPreferenceContext';

type IntroPhase = 'holding' | 'splitting' | 'done';

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export interface CosmicIntroLoaderProps {
  onComplete?: () => void;
}

/**
 * Full-screen entrance curtain modeled on Austin-Joshua/infinitus IntroCurtain:
 * replays cleanly on each refresh unless reduced motion is active; click or Escape skips.
 */
export function CosmicIntroLoader({ onComplete }: CosmicIntroLoaderProps) {
  const { prefersReducedMotion } = useMotionPreference();
  const [phase, setPhase] = useState<IntroPhase>(() =>
    prefersReducedMotion ? 'done' : 'holding',
  );

  const finishIntro = useCallback(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('aj-intro-pending');
      document.documentElement.classList.add('aj-intro-seen');
    }
    setPhase('done');
    onComplete?.();
  }, [onComplete]);

  useIsomorphicLayoutEffect(() => {
    if (prefersReducedMotion) {
      finishIntro();
      return undefined;
    }

    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('aj-intro-pending');
      document.documentElement.classList.add('aj-intro-seen');
    }

    const openTimer = window.setTimeout(() => {
      setPhase((prev) => (prev === 'done' ? 'done' : 'splitting'));
    }, 800);

    const doneTimer = window.setTimeout(() => {
      finishIntro();
    }, 1400);

    return () => {
      window.clearTimeout(openTimer);
      window.clearTimeout(doneTimer);
    };
  }, [finishIntro, prefersReducedMotion]);

  useEffect(() => {
    if (phase === 'done') {
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        finishIntro();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [finishIntro, phase]);

  if (phase === 'done') {
    return null;
  }

  const isSplitting = phase === 'splitting';

  return (
    <div
      data-testid="cosmic-intro-loader"
      data-phase={phase}
      onClick={finishIntro}
      role="presentation"
      aria-hidden="true"
      className="fixed inset-0 z-[100] cursor-pointer overflow-hidden select-none"
    >
      {/* Left curtain panel — seamless obsidian overlay parting left along vertical seam */}
      <m.div
        data-testid="intro-curtain-left"
        initial={{ x: '0%' }}
        animate={{ x: isSplitting ? '-100%' : '0%' }}
        transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
        className="absolute inset-y-0 left-0 z-10 w-[calc(50%+1px)] bg-[#020307] will-change-transform"
      />

      {/* Right curtain panel — seamless obsidian overlay parting right along vertical seam */}
      <m.div
        data-testid="intro-curtain-right"
        initial={{ x: '0%' }}
        animate={{ x: isSplitting ? '100%' : '0%' }}
        transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
        className="absolute inset-y-0 right-0 z-10 w-[calc(50%+1px)] bg-[#020307] will-change-transform"
      />

      {/* Center Seal Medallion: spins 360° clockwise briskly on unseal, then dives as curtains part */}
      <m.div
        initial={{ opacity: 0, scale: 0.85, rotate: 0 }}
        animate={
          isSplitting
            ? { opacity: 0, scale: 0.35, rotate: 360 }
            : { opacity: 1, scale: 1, rotate: 360 }
        }
        transition={
          isSplitting
            ? {
                opacity: { duration: 0.22, ease: 'easeInOut' },
                scale: { duration: 0.25, ease: 'easeInOut' },
              }
            : {
                rotate: { duration: 0.62, ease: [0.16, 1, 0.3, 1] },
                scale: { duration: 0.45, ease: 'easeOut' },
                opacity: { duration: 0.2, ease: 'easeOut' },
              }
        }
        className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center will-change-transform"
      >
        <div className="relative flex items-center justify-center">
          {/* Luminous ambient cosmic solar backlight behind the lifted circular seal */}
          <div
            data-testid="intro-cosmic-aura"
            aria-hidden="true"
            className="absolute -inset-4 rounded-full blur-2xl"
            style={{
              background:
                'radial-gradient(circle, rgba(255, 179, 71, 0.32) 0%, rgba(220, 228, 240, 0.14) 52%, transparent 78%)',
            }}
          />

          {/* Lifted circular seal medallion with solar rim & opaque obsidian core */}
          <div className="relative flex items-center justify-center rounded-full border-2 sm:border-[3px] border-[#FFB347]/85 bg-[#020307] shadow-[0_16px_40px_rgba(0,0,0,0.75),0_0_26px_rgba(255,179,71,0.45)]">
            <img
              src="/assets/brand/aj-emblem.png"
              alt="AJ metallic circular emblem"
              width={200}
              height={200}
              className="h-40 w-40 sm:h-44 sm:w-44 rounded-full object-contain"
            />
          </div>
        </div>
      </m.div>
    </div>
  );
}

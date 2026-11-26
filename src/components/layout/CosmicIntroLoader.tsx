import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { useMotionPreference } from '@/context/MotionPreferenceContext';
import {
  markCosmicIntroSeen,
  shouldPlayCosmicIntroOnMount,
} from '@/utils/introStorage';

type IntroPhase = 'holding' | 'splitting' | 'done';

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const STAR_SPARKS = [
  { x: '18%', y: '22%', size: 3, delay: '0s' },
  { x: '78%', y: '18%', size: 4, delay: '0.2s' },
  { x: '26%', y: '74%', size: 3, delay: '0.35s' },
  { x: '82%', y: '68%', size: 3, delay: '0.15s' },
  { x: '50%', y: '12%', size: 2, delay: '0.45s' },
  { x: '12%', y: '52%', size: 2, delay: '0.25s' },
  { x: '88%', y: '48%', size: 2, delay: '0.3s' },
  { x: '44%', y: '86%', size: 3, delay: '0.1s' },
] as const;

export interface CosmicIntroLoaderProps {
  onComplete?: () => void;
}

/**
 * First-visit cinematic AJ emblem curtain loader inspired by Infinitus IntroCurtain,
 * adapted to a horizontal left/right curtain split with a separate cosmic aura layer
 * behind the static metallic AJ emblem.
 */
export function CosmicIntroLoader({ onComplete }: CosmicIntroLoaderProps) {
  const { prefersReducedMotion } = useMotionPreference();
  const [phase, setPhase] = useState<IntroPhase>(() =>
    shouldPlayCosmicIntroOnMount(prefersReducedMotion) ? 'holding' : 'done',
  );

  const finishIntro = useCallback(() => {
    markCosmicIntroSeen();
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
      return;
    }

    if (phase === 'done') {
      markCosmicIntroSeen();
      if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('aj-intro-pending');
        document.documentElement.classList.add('aj-intro-seen');
      }
      return;
    }

    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('aj-intro-pending');
      document.documentElement.classList.add('aj-intro-seen');
    }

    if (phase === 'holding') {
      const splitTimer = window.setTimeout(() => {
        setPhase('splitting');
      }, 850);
      return () => window.clearTimeout(splitTimer);
    }

    if (phase === 'splitting') {
      const doneTimer = window.setTimeout(() => {
        finishIntro();
      }, 770);
      return () => window.clearTimeout(doneTimer);
    }

    return;
  }, [finishIntro, prefersReducedMotion, phase]);

  useEffect(() => {
    if (phase === 'done') {
      return;
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
      role="region"
      aria-label="AJ Cosmic Universe Introduction"
      className="fixed inset-0 z-[100] overflow-hidden select-none"
    >
      {/* Left half curtain separating horizontally left */}
      <div
        data-testid="intro-curtain-left"
        aria-hidden="true"
        className="absolute inset-y-0 left-0 z-10 w-[calc(50%+2px)] bg-[#020307] border-r border-white/15 will-change-transform transition-transform duration-[820ms] ease-[cubic-bezier(0.76,0,0.24,1)]"
        style={{
          transform: isSplitting ? 'translate3d(-104%, 0, 0)' : 'translate3d(0%, 0, 0)',
        }}
      />

      {/* Right half curtain separating horizontally right */}
      <div
        data-testid="intro-curtain-right"
        aria-hidden="true"
        className="absolute inset-y-0 right-0 z-10 w-[calc(50%+2px)] bg-[#020307] border-l border-white/15 will-change-transform transition-transform duration-[820ms] ease-[cubic-bezier(0.76,0,0.24,1)]"
        style={{
          transform: isSplitting ? 'translate3d(104%, 0, 0)' : 'translate3d(0%, 0, 0)',
        }}
      />

      {/* Separate cosmic animation layer behind the static AJ emblem */}
      <div
        data-testid="intro-cosmic-aura"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[15] flex items-center justify-center transition-[opacity,transform] duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          opacity: isSplitting ? 0 : 1,
          transform: isSplitting ? 'scale(1.42)' : 'scale(1.04)',
        }}
      >
        <div className="relative h-72 w-72 sm:h-96 sm:w-96 flex items-center justify-center">
          {/* Solar corona radial mist */}
          <div
            className="cosmic-aura-pulse absolute inset-4 rounded-full blur-2xl"
            style={{
              background:
                'radial-gradient(circle, rgba(220,228,240,0.28) 0%, rgba(56,189,248,0.18) 38%, rgba(255,179,71,0.12) 64%, transparent 78%)',
            }}
          />
          {/* Spinning orbital particle ring behind logo */}
          <svg
            viewBox="0 0 240 240"
            className="cosmic-aura-spin h-full w-full opacity-85"
            fill="none"
          >
            <circle
              cx="120"
              cy="120"
              r="98"
              stroke="rgba(220,228,240,0.42)"
              strokeWidth="1"
              strokeDasharray="4 8"
            />
            <circle
              cx="120"
              cy="120"
              r="112"
              stroke="rgba(255,179,71,0.38)"
              strokeWidth="0.8"
              strokeDasharray="2 12"
            />
            <circle cx="120" cy="22" r="2.8" fill="#38BDF8" />
            <circle cx="218" cy="120" r="2.4" fill="#FFB347" />
            <circle cx="120" cy="218" r="2.4" fill="#DCE4F0" />
          </svg>
          {/* Controlled sparkling particle layer */}
          {STAR_SPARKS.map((star, idx) => (
            <span
              key={idx}
              className="cosmic-aura-pulse absolute rounded-full bg-white/90"
              style={{
                left: star.x,
                top: star.y,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animationDelay: star.delay,
                boxShadow: '0 0 8px rgba(220, 228, 240, 0.9)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Static foreground circular metallic AJ emblem */}
      <div
        className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          opacity: isSplitting ? 0 : 1,
          transform: isSplitting ? 'scale(0.68)' : 'scale(1)',
        }}
      >
        <div className="relative h-36 w-36 sm:h-44 sm:w-44 rounded-full shadow-[0_16px_48px_rgba(0,0,0,0.92)]">
          <img
            src="/assets/brand/aj-emblem.png"
            alt="AJ metallic circular emblem"
            width={512}
            height={512}
            className="h-full w-full rounded-full object-contain"
          />
        </div>
      </div>

      {/* Keyboard-accessible skip control */}
      <div className="absolute bottom-6 inset-x-0 z-30 flex justify-center">
        <button
          type="button"
          data-testid="intro-skip-button"
          onClick={finishIntro}
          className="glass-surface-strong inline-flex min-h-[44px] items-center gap-2 px-5 py-2 rounded-full font-mono text-xs uppercase tracking-[0.14em] text-[var(--text-primary)] cursor-pointer hover:border-[var(--accent-chrome)] focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]"
        >
          <span>Skip Intro</span>
        </button>
      </div>
    </div>
  );
}

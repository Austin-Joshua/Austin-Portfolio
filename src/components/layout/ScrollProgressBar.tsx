import { useEffect, useRef, type RefObject } from 'react';
import { useMotionPreference } from '@/context/MotionPreferenceContext';
import { setupScopedScrollAnimation } from '@/motion/gsapConfig';

export interface ScrollProgressBarProps {
  scrollProgressRef?: RefObject<number>;
}

export function ScrollProgressBar({ scrollProgressRef }: ScrollProgressBarProps) {
  const { prefersReducedMotion } = useMotionPreference();
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const fill = fillRef.current;
    if (!track || !fill) {
      return;
    }

    let resizeObserver: ResizeObserver | undefined;

    const cleanup = setupScopedScrollAnimation(
      trackRef,
      prefersReducedMotion,
      ({ ScrollTrigger }) => {
        const updateIndicator = (progress: number) => {
          const clamped = Number.isFinite(progress)
            ? Math.min(1, Math.max(0, progress))
            : 0;
          fill.style.transform = `scaleX(${clamped})`;
          track.setAttribute('aria-valuenow', String(Math.round(clamped * 100)));
          if (scrollProgressRef) {
            scrollProgressRef.current = clamped;
          }
        };

        const trigger = ScrollTrigger.create({
          start: 0,
          end: 'max',
          onUpdate: (self) => {
            updateIndicator(self.progress);
          },
          onRefresh: (self) => {
            updateIndicator(self.progress);
          },
        });

        updateIndicator(trigger.progress);

        if (typeof ResizeObserver !== 'undefined') {
          resizeObserver = new ResizeObserver(() => {
            // Recompute progress directly on resize without calling ScrollTrigger.refresh(),
            // avoiding temporary scrollTo(0) measurements that collide with smooth scrolling.
            const maxScroll = Math.max(
              0,
              document.documentElement.scrollHeight - window.innerHeight,
            );
            updateIndicator(maxScroll > 0 ? window.scrollY / maxScroll : 0);
          });
          resizeObserver.observe(document.documentElement);
        }
      },
      () => {
        fill.style.transform = 'scaleX(0)';
        track.setAttribute('aria-valuenow', '0');
        if (scrollProgressRef) {
          scrollProgressRef.current = 0;
        }
      },
    );

    return () => {
      resizeObserver?.disconnect();
      cleanup();
    };
  }, [prefersReducedMotion, scrollProgressRef]);

  return (
    <div
      ref={trackRef}
      role="progressbar"
      aria-label="Page scroll progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
      data-testid="scroll-progress-bar"
      data-reduced-motion={prefersReducedMotion ? 'true' : 'false'}
      className={[
        'hidden md:block absolute inset-x-0 bottom-0 h-[2px]',
        'overflow-hidden rounded-b-[var(--radius-card)] bg-[var(--border-subtle)] pointer-events-none',
      ].join(' ')}
    >
      <div
        ref={fillRef}
        data-testid="scroll-progress-fill"
        className={[
          'h-full w-full origin-left bg-[var(--accent-primary)]',
          prefersReducedMotion ? 'transition-none' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  );
}

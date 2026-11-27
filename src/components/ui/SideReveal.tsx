import { m } from 'motion/react';
import type { ReactNode } from 'react';
import { useOptionalMotionPreference } from '@/context/MotionPreferenceContext';

export interface SideRevealProps {
  direction?: 'left' | 'right';
  delay?: number;
  className?: string;
  children: ReactNode;
}

/**
 * Bidirectional scroll-discovery container: starts hidden off-axis, glides in from the
 * left or right as the section enters view, disappears when scrolled past, and re-enters on scroll up.
 */
export function SideReveal({
  direction = 'left',
  delay = 0,
  className = '',
  children,
}: SideRevealProps) {
  const { prefersReducedMotion } = useOptionalMotionPreference();
  const canObserveViewport =
    !prefersReducedMotion && typeof IntersectionObserver !== 'undefined';

  if (!canObserveViewport) {
    return <div className={className}>{children}</div>;
  }

  const offset = direction === 'left' ? -52 : 52;

  return (
    <m.div
      data-testid="side-reveal"
      data-direction={direction}
      initial={{ opacity: 0, x: offset }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: false, amount: 0.08 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </m.div>
  );
}

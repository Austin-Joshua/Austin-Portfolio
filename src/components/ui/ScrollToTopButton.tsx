import { ArrowUp } from 'lucide-react';
import { AnimatePresence, m } from 'motion/react';
import { useEffect, useState } from 'react';
import { useOptionalMotionPreference } from '@/context/MotionPreferenceContext';
import { useOptionalUniverseNavigation } from '@/context/UniverseNavigationContext';
import { scrollToSection } from '@/utils/scrollNavigation';

/**
 * Floating accessible Scroll-to-Top action that appears only after scrolling
 * past the Hero fold and returns smoothly to the Sun Overview (#hero).
 */
export function ScrollToTopButton() {
  const { prefersReducedMotion } = useOptionalMotionPreference();
  const nav = useOptionalUniverseNavigation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      setVisible(window.scrollY > 360);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollTop = () => {
    if (nav) {
      nav.resetSolarOverview();
      return;
    }
    scrollToSection('hero', {
      prefersReducedMotion,
      focusTarget: false,
      updateHash: true,
    });
  };

  return (
    <AnimatePresence>
      {visible && (
        <m.div
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: prefersReducedMotion ? 0.05 : 0.22 }}
          className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-30 pointer-events-auto"
        >
          <button
            type="button"
            data-testid="scroll-to-top-button"
            onClick={handleScrollTop}
            aria-label="Scroll back to top Hero Overview"
            title="Back to top"
            className={[
              'glass-surface-strong inline-flex h-11 w-11 items-center justify-center rounded-full',
              'text-[var(--text-primary)] hover:text-[var(--planet-sun)] hover:border-[var(--planet-sun)]/60',
              'cursor-pointer shadow-[var(--shadow-elevated)] transition-colors duration-200',
              'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
            ].join(' ')}
          >
            <ArrowUp className="size-4 shrink-0" aria-hidden="true" />
          </button>
        </m.div>
      )}
    </AnimatePresence>
  );
}

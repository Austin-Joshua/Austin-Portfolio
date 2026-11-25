import { ArrowUp } from 'lucide-react';
import type { MouseEvent } from 'react';
import { useMotionPreference } from '@/context/MotionPreferenceContext';
import { scrollToSection } from '@/utils/scrollNavigation';

export function Footer() {
  const { prefersReducedMotion } = useMotionPreference();
  const currentYear = new Date().getFullYear();

  const handleBackToTop = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    scrollToSection('hero', {
      prefersReducedMotion,
      focusTarget: false,
      updateHash: true,
    });
  };

  return (
    <footer className="relative z-10 border-t border-[var(--border-subtle)] bg-[var(--surface-canvas)] pt-8 pb-28 md:py-10">
      <div className="container-portfolio flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="font-display text-base font-semibold text-[var(--text-primary)]">
            Austin Joshua
          </p>
          <p className="type-meta text-[var(--text-muted)]">
            © {currentYear} Austin Joshua · Engineering Portfolio
          </p>
        </div>

        <a
          href="#hero"
          onClick={handleBackToTop}
          className={[
            'glass-surface inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 self-start sm:self-auto',
            'px-4 py-2 text-xs font-mono font-medium text-[var(--text-primary)]',
            'rounded-[var(--radius-control)]',
            'transition-[background-color,border-color,color] duration-[var(--transition-theme)]',
            'hover:border-[var(--accent-primary)] hover:bg-[var(--surface-card)]',
            'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
          ].join(' ')}
        >
          <span>Back to Top</span>
          <ArrowUp className="size-4 shrink-0" aria-hidden="true" />
        </a>
      </div>
    </footer>
  );
}

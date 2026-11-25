import type { MouseEvent } from 'react';
import { useMotionPreference } from '@/context/MotionPreferenceContext';
import { scrollToSection } from '@/utils/scrollNavigation';

export interface SkipLinkProps {
  targetId?: string;
  label?: string;
}

export function SkipLink({
  targetId = 'main-content',
  label = 'Skip to main content',
}: SkipLinkProps) {
  const { prefersReducedMotion } = useMotionPreference();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    scrollToSection(targetId, {
      prefersReducedMotion,
      focusTarget: true,
      updateHash: false,
    });
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className={[
        'sr-only focus:not-sr-only',
        'focus:fixed focus:top-3 focus:left-3 focus:z-[60]',
        'focus:inline-flex focus:min-h-[44px] focus:items-center focus:px-4 focus:py-2.5',
        'focus:rounded-[var(--radius-control)] focus:border-2 focus:border-[var(--focus-ring)]',
        'focus:bg-[var(--surface-elevated)] focus:text-[var(--text-primary)]',
        'focus:text-sm focus:font-semibold focus:shadow-[var(--shadow-elevated)]',
        'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
      ].join(' ')}
    >
      {label}
    </a>
  );
}

import { ExternalLink, Mail } from 'lucide-react';
import type { MouseEvent } from 'react';
import { useMotionPreference } from '@/context/MotionPreferenceContext';
import { contactData } from '@/data/contact';
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

  const github = contactData.socialLinks.find((l) => l.platform === 'github');
  const linkedin = contactData.socialLinks.find((l) => l.platform === 'linkedin');
  const email = contactData.email;

  return (
    <footer className="relative z-10 border-t border-[var(--border-subtle)] bg-[var(--surface-canvas)] pt-10 pb-28 md:py-12">
      <div className="container-portfolio">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          {/* Identity */}
          <div className="space-y-2">
            <p className="font-display text-lg font-bold text-[var(--text-primary)] tracking-tight">
              Austin Joshua
            </p>
            <p className="type-meta text-[var(--text-muted)]">
              Software Engineer &amp; AI Systems Developer
            </p>
            <p className="type-meta text-[var(--text-muted)]">
              © {currentYear} Austin Joshua · All rights reserved
            </p>
          </div>

          {/* Social + back to top */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Social links */}
            <div className="flex items-center gap-2">
              {github && (
                <a
                  href={github.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Austin Joshua on GitHub"
                  className={[
                    'inline-flex min-h-[40px] items-center gap-2 px-3 py-2',
                    'rounded-[var(--radius-control)] border border-[var(--border-subtle)]',
                    'text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)]',
                    'font-mono text-xs font-medium transition-[color,border-color] duration-200',
                    'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
                  ].join(' ')}
                >
                  <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
                  <span>GitHub</span>
                </a>
              )}
              {linkedin && (
                <a
                  href={linkedin.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Austin Joshua on LinkedIn"
                  className={[
                    'inline-flex min-h-[40px] min-w-[40px] items-center justify-center',
                    'rounded-[var(--radius-control)] border border-[var(--border-subtle)]',
                    'text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)]',
                    'transition-[color,border-color] duration-200',
                    'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
                  ].join(' ')}
                >
                  <ExternalLink className="size-4 shrink-0" aria-hidden="true" />
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}`}
                  aria-label={`Email Austin at ${email}`}
                  className={[
                    'inline-flex min-h-[40px] min-w-[40px] items-center justify-center',
                    'rounded-[var(--radius-control)] border border-[var(--border-subtle)]',
                    'text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)]',
                    'transition-[color,border-color] duration-200',
                    'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
                  ].join(' ')}
                >
                  <Mail className="size-4 shrink-0" aria-hidden="true" />
                </a>
              )}
            </div>

            {/* Back to top */}
            <a
              href="#hero"
              aria-label="Back to Top"
              onClick={handleBackToTop}
              className={[
                'glass-surface inline-flex min-h-[40px] items-center justify-center gap-2',
                'px-5 py-2 text-xs font-mono font-medium text-[var(--text-secondary)]',
                'rounded-[var(--radius-control)]',
                'transition-[background-color,border-color,color] duration-200',
                'hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]',
                'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
              ].join(' ')}
            >
              ↑ Back to top
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

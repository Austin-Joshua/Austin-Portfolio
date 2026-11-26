import type { MouseEvent } from 'react';
import { GitHubIcon, LinkedInIcon, MailIcon } from '@/components/icons/SocialIcons';
import { useMotionPreference } from '@/context/MotionPreferenceContext';
import { useOptionalUniverseNavigation } from '@/context/UniverseNavigationContext';
import { contactData } from '@/data/contact';
import { scrollToSection } from '@/utils/scrollNavigation';

export function Footer() {
  const { prefersReducedMotion } = useMotionPreference();
  const universeNav = useOptionalUniverseNavigation();
  const currentYear = new Date().getFullYear();

  const handleBackToTop = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (universeNav) {
      universeNav.resetSolarOverview();
      return;
    }
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
    <footer className="relative z-10 pointer-events-auto border-t border-[var(--border-subtle)] bg-[var(--surface-canvas)]/90 backdrop-blur-md pt-10 pb-28 md:py-12">
      <div className="container-portfolio">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          {/* Canonical metallic AJ identity */}
          <div className="flex items-center gap-4">
            <img
              src="/assets/brand/aj-emblem.png"
              alt="AJ Metallic Emblem"
              width={48}
              height={48}
              className="h-11 w-11 rounded-full object-contain shrink-0"
            />
            <div className="space-y-1">
              <p className="font-display text-lg font-bold text-[var(--text-primary)] tracking-tight">
                Austin Joshua
              </p>
              <p className="type-meta text-[var(--text-muted)]">
                Computer Science Engineering Student · Software &amp; AI Developer
              </p>
              <p className="type-meta text-[var(--text-muted)]">
                © {currentYear} Austin Joshua · AJ Cosmic Universe
              </p>
            </div>
          </div>

          {/* Social + back to top */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              {github && (
                <a
                  href={github.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Austin Joshua on GitHub"
                  className={[
                    'inline-flex min-h-[44px] items-center gap-2 px-3 py-2',
                    'rounded-[var(--radius-control)] border border-[var(--border-subtle)]',
                    'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)]',
                    'font-mono text-xs font-medium transition-[color,border-color] duration-200',
                    'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
                  ].join(' ')}
                >
                  <GitHubIcon className="size-4 shrink-0" />
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
                    'inline-flex min-h-[44px] items-center gap-2 px-3 py-2',
                    'rounded-[var(--radius-control)] border border-[var(--border-subtle)]',
                    'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)]',
                    'font-mono text-xs font-medium transition-[color,border-color] duration-200',
                    'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
                  ].join(' ')}
                >
                  <LinkedInIcon className="size-4 shrink-0" />
                  <span>LinkedIn</span>
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}`}
                  aria-label={`Email Austin Joshua at ${email}`}
                  className={[
                    'inline-flex min-h-[44px] min-w-[44px] items-center justify-center',
                    'rounded-[var(--radius-control)] border border-[var(--border-subtle)]',
                    'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)]',
                    'transition-[color,border-color] duration-200',
                    'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
                  ].join(' ')}
                >
                  <MailIcon className="size-4 shrink-0" />
                </a>
              )}
            </div>

            <a
              href="#hero"
              aria-label="Back to Top"
              onClick={handleBackToTop}
              className={[
                'glass-surface inline-flex min-h-[44px] items-center justify-center gap-2',
                'px-5 py-2 text-xs font-mono font-medium text-[var(--text-secondary)]',
                'rounded-[var(--radius-control)]',
                'transition-[background-color,border-color,color] duration-200',
                'hover:border-[var(--planet-sun)] hover:text-[var(--text-primary)]',
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

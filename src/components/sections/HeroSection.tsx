import { ArrowDownRight, Download, Mail } from 'lucide-react';

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.207 11.387.6.113.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
import type { MouseEvent } from 'react';
import { SectionShell } from '@/components/layout/SectionShell';
import { useMotionPreference } from '@/context/MotionPreferenceContext';
import { profileData } from '@/data/profile';
import { contactData } from '@/data/contact';
import type { ProfileData } from '@/types/portfolio';
import { hasNonEmptyText, isValidLocalOrHttpAssetUrl } from '@/utils/dataGuards';
import { scrollToSection } from '@/utils/scrollNavigation';

export interface HeroSectionProps {
  profile?: ProfileData;
}

export function HeroSection({ profile = profileData }: HeroSectionProps) {
  const { prefersReducedMotion } = useMotionPreference();

  const handleJump = (event: MouseEvent<HTMLAnchorElement>, targetId: string) => {
    event.preventDefault();
    scrollToSection(targetId, {
      prefersReducedMotion,
      focusTarget: false,
      updateHash: true,
    });
  };

  const hasRole = hasNonEmptyText(profile.roleLabel);
  const hasTagline = hasNonEmptyText(profile.heroTagline);
  const hasResume =
    profile.resume !== null && isValidLocalOrHttpAssetUrl(profile.resume.url);

  const github = contactData.socialLinks.find((l) => l.platform === 'github');
  const linkedin = contactData.socialLinks.find((l) => l.platform === 'linkedin');
  const email = contactData.email;

  return (
    <SectionShell
      id="hero"
      index="01"
      indexLabel="HERO"
      title={undefined}
      headingLevel={1}
      withDivider={false}
      className="relative min-h-[calc(100dvh-0rem)] flex flex-col justify-center overflow-hidden pt-28 pb-24 md:pt-36 md:pb-32"
    >
      {/* Atmospheric background layer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: 'var(--grad-hero-radial)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 swiss-grid items-center">
        {/* Left column — identity & CTAs */}
        <div className="col-span-4 md:col-span-8 lg:col-span-7 space-y-8">
          {/* Role label */}
          {hasRole && profile.roleLabel && (
            <p className="eyebrow-label">{profile.roleLabel}</p>
          )}

          {/* Name — primary hero heading */}
          <h1 className="type-hero text-[var(--text-primary)]">
            <span className="block">{profile.name}</span>
          </h1>

          {/* Accent hairline */}
          <div
            aria-hidden="true"
            className="accent-hairline w-24"
          />

          {/* Tagline */}
          {hasTagline && profile.heroTagline && (
            <p className="type-lead text-[var(--text-secondary)] max-w-[52ch]">
              {profile.heroTagline}
            </p>
          )}

          {/* CTA group */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 pt-2">
            {/* Primary CTA */}
            <a
              href="#projects"
              onClick={(event) => handleJump(event, 'projects')}
              className={[
                'inline-flex min-h-[48px] sm:min-h-[52px] items-center justify-center gap-2',
                'px-7 py-3 rounded-[var(--radius-control)]',
                'bg-[var(--accent-primary)] text-[var(--text-on-accent)] font-semibold text-base',
                'shadow-[var(--shadow-glass)] transition-[filter,box-shadow,transform] duration-200',
                'hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0',
                'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
              ].join(' ')}
            >
              <span>View Projects</span>
              <ArrowDownRight className="size-4 shrink-0" aria-hidden="true" />
            </a>

            {/* Secondary CTA */}
            <a
              href="#contact"
              onClick={(event) => handleJump(event, 'contact')}
              className={[
                'glass-surface inline-flex min-h-[48px] sm:min-h-[52px] items-center justify-center gap-2',
                'px-7 py-3 rounded-[var(--radius-control)]',
                'text-[var(--text-primary)] font-medium text-base',
                'transition-[background-color,border-color,transform] duration-200',
                'hover:border-[var(--accent-primary)] hover:bg-[var(--surface-card)] hover:-translate-y-0.5 active:translate-y-0',
                'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
              ].join(' ')}
            >
              <Mail className="size-4 shrink-0" aria-hidden="true" />
              <span>Contact Me</span>
            </a>

            {/* Resume download */}
            {hasResume && profile.resume && (
              <a
                href={profile.resume.url}
                download
                rel="noopener noreferrer"
                className={[
                  'glass-surface inline-flex min-h-[48px] sm:min-h-[52px] items-center justify-center gap-2',
                  'px-6 py-3 rounded-[var(--radius-control)]',
                  'font-mono text-sm font-medium text-[var(--text-secondary)]',
                  'transition-[border-color,color,transform] duration-200',
                  'hover:border-[var(--accent-primary)] hover:text-[var(--text-primary)] hover:-translate-y-0.5 active:translate-y-0',
                  'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
                ].join(' ')}
              >
                <Download className="size-4 shrink-0" aria-hidden="true" />
                <span>Résumé</span>
              </a>
            )}
          </div>

          {/* Social row */}
          {(github || linkedin || email) && (
            <div className="flex items-center gap-3 pt-1">
              {github && (
                <a
                  href={github.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Austin Joshua on GitHub"
                  className={[
                    'inline-flex min-h-[40px] min-w-[40px] items-center justify-center',
                    'rounded-[var(--radius-control)] border border-[var(--border-subtle)]',
                    'text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)]',
                    'transition-[color,border-color] duration-200',
                    'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
                  ].join(' ')}
                >
                  <GitHubIcon className="size-4 shrink-0" />
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
                  <LinkedInIcon className="size-4 shrink-0" />
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}`}
                  aria-label={`Email Austin Joshua at ${email}`}
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
              <span aria-hidden="true" className="type-meta text-[var(--text-muted)] select-none">
                —
              </span>
              <span className="type-meta text-[var(--text-muted)]">
                Based in India
              </span>
            </div>
          )}
        </div>

        {/* Right column — decorative 3D hint on desktop (3D canvas is behind full page) */}
        <div
          aria-hidden="true"
          className="hidden lg:flex col-span-5 items-center justify-center relative h-[480px] pointer-events-none"
        >
          {/* Atmospheric glow ring */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background: 'radial-gradient(circle 240px at 50% 50%, var(--accent-primary-glow) 0%, transparent 70%)',
            }}
          />
          {/* Orbital annotation labels — purely decorative */}
          <div className="relative w-[320px] h-[320px]">
            <span
              className="absolute top-[18%] right-[-8%] type-meta text-[var(--accent-chrome-muted)] opacity-40 whitespace-nowrap"
              style={{ transform: 'rotate(12deg)' }}
            >
              orbit / 7.4 AU
            </span>
            <span
              className="absolute bottom-[20%] left-[-12%] type-meta text-[var(--accent-chrome-muted)] opacity-30 whitespace-nowrap"
              style={{ transform: 'rotate(-8deg)' }}
            >
              core / 0.68 r
            </span>
            <span
              className="absolute top-[55%] right-[0%] type-meta text-[var(--accent-gold)] opacity-25 whitespace-nowrap"
              style={{ transform: 'rotate(5deg)' }}
            >
              Δ velocity
            </span>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div
        aria-hidden="true"
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-30"
      >
        <span className="type-meta text-[var(--text-muted)]">scroll</span>
        <div className="w-px h-8 bg-[var(--accent-primary)] opacity-50" />
      </div>
    </SectionShell>
  );
}

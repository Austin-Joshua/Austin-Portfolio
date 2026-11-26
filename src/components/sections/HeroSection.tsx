import { ArrowDownRight, Download } from 'lucide-react';
import type { MouseEvent, RefObject } from 'react';
import { GitHubIcon, LinkedInIcon, MailIcon } from '@/components/icons/SocialIcons';
import { SectionShell } from '@/components/layout/SectionShell';
import { HeroPortraitReveal } from '@/components/ui/HeroPortraitReveal';
import { useMotionPreference } from '@/context/MotionPreferenceContext';
import { contactData } from '@/data/contact';
import { profileData } from '@/data/profile';
import { UniverseLayer } from '@/three/UniverseLayer';
import type { ProfileData } from '@/types/portfolio';
import { hasNonEmptyText, isValidLocalOrHttpAssetUrl } from '@/utils/dataGuards';
import { scrollToSection } from '@/utils/scrollNavigation';

export interface HeroSectionProps {
  profile?: ProfileData;
  scrollProgressRef?: RefObject<number>;
}

export function HeroSection({
  profile = profileData,
  scrollProgressRef,
}: HeroSectionProps) {
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
      labelledbyId="hero-heading"
      headingLevel={1}
      withDivider={false}
      className="relative min-h-[calc(100dvh-0rem)] flex flex-col justify-center overflow-hidden pt-24 pb-24 md:pt-28 md:pb-24"
    >
      {/* Atmospheric background layer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: 'var(--grad-hero-radial)',
        }}
      />

      {/* Content + Real 3D Hero Stage + Foreground Portrait */}
      <div className="relative z-10 swiss-grid items-center gap-y-8">
        {/* Left column — identity & CTAs */}
        <div className="col-span-4 md:col-span-4 lg:col-span-6 space-y-6 md:space-y-7">
          {hasRole && profile.roleLabel && (
            <p className="eyebrow-label">{profile.roleLabel}</p>
          )}

          <h1 id="hero-heading" className="type-hero text-[var(--text-primary)]">
            <span className="block">{profile.name}</span>
          </h1>

          <div aria-hidden="true" className="accent-hairline w-24" />

          {hasTagline && profile.heroTagline && (
            <p className="type-lead text-[var(--text-secondary)] max-w-[50ch]">
              {profile.heroTagline}
            </p>
          )}

          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 pt-1">
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
              <MailIcon className="size-4 shrink-0" />
              <span>Contact Me</span>
            </a>

            {hasResume && profile.resume && (
              <a
                href={profile.resume.url}
                download="Austin_Joshua_Resume.pdf"
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

          {(github || linkedin || email) && (
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {github && (
                <a
                  href={github.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Austin Joshua on GitHub"
                  className={[
                    'inline-flex min-h-[44px] min-w-[44px] items-center justify-center',
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
                    'inline-flex min-h-[44px] min-w-[44px] items-center justify-center',
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
                    'inline-flex min-h-[44px] min-w-[44px] items-center justify-center',
                    'rounded-[var(--radius-control)] border border-[var(--border-subtle)]',
                    'text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)]',
                    'transition-[color,border-color] duration-200',
                    'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
                  ].join(' ')}
                >
                  <MailIcon className="size-4 shrink-0" />
                </a>
              )}
              <span aria-hidden="true" className="type-meta text-[var(--text-muted)] select-none">
                —
              </span>
              <span className="type-meta text-[var(--text-muted)]">
                Chennai, India
              </span>
            </div>
          )}
        </div>

        {/* Right / below Hero visual stage: single 3D Universe backdrop + foreground shadow-to-reveal portrait */}
        <div
          data-testid="hero-3d-stage"
          className="relative col-span-4 md:col-span-4 lg:col-span-6 h-[340px] sm:h-[420px] md:h-[460px] lg:h-[560px] w-full overflow-hidden rounded-[var(--radius-portrait)]"
        >
          <UniverseLayer scrollProgressRef={scrollProgressRef} />
          <HeroPortraitReveal
            portrait={profile.portrait}
            prefersReducedMotion={prefersReducedMotion}
          />
        </div>
      </div>

      {/* Scroll cue */}
      <div
        aria-hidden="true"
        className="hidden lg:flex absolute bottom-6 left-1/2 -translate-x-1/2 flex-col items-center gap-1 opacity-45"
      >
        <span className="type-meta text-[var(--text-muted)]">scroll</span>
        <div className="w-px h-7 bg-[var(--accent-primary)]" />
      </div>
    </SectionShell>
  );
}

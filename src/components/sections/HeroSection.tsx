import { ArrowDownRight, Download } from 'lucide-react';
import type { MouseEvent } from 'react';
import { GitHubIcon, LinkedInIcon, MailIcon } from '@/components/icons/SocialIcons';
import { SectionShell } from '@/components/layout/SectionShell';
import { HeroPortraitReveal } from '@/components/ui/HeroPortraitReveal';
import { SolarSystemHud } from '@/components/ui/SolarSystemHud';
import { useMotionPreference } from '@/context/MotionPreferenceContext';
import { useOptionalUniverseNavigation } from '@/context/UniverseNavigationContext';
import { contactData } from '@/data/contact';
import { profileData } from '@/data/profile';
import type { ProfileData } from '@/types/portfolio';
import { hasNonEmptyText, isValidLocalOrHttpAssetUrl } from '@/utils/dataGuards';
import { scrollToSection } from '@/utils/scrollNavigation';

export interface HeroSectionProps {
  profile?: ProfileData;
}

export function HeroSection({ profile = profileData }: HeroSectionProps) {
  const { prefersReducedMotion } = useMotionPreference();
  const universeNav = useOptionalUniverseNavigation();

  const handleJump = (
    event: MouseEvent<HTMLAnchorElement>,
    targetId: 'projects' | 'contact',
  ) => {
    event.preventDefault();
    if (universeNav) {
      universeNav.navigateToPlanet(targetId);
      return;
    }
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
      indexLabel="SUN // CORE IDENTITY"
      title={undefined}
      labelledbyId="hero-heading"
      headingLevel={1}
      withDivider={false}
      className="relative min-h-[calc(100dvh-4.5rem)] md:min-h-[100dvh] flex flex-col justify-center overflow-hidden pt-4 pb-24 sm:pt-6 md:pt-24 md:pb-16"
    >
      {/* Atmospheric solar corona radial aura */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: 'var(--grad-hero-radial)',
        }}
      />

      {/* Content + Open Solar-System Stage + Layered Dimensional Name + Foreground Portrait */}
      <div className="relative z-10 swiss-grid items-center gap-y-8">
        {/* Left column — identity, CTAs & social beacon links */}
        <div className="pointer-events-auto col-span-4 md:col-span-4 lg:col-span-6 space-y-6 md:space-y-7">
          <div className="inline-flex items-center gap-2.5">
            <img
              src="/assets/brand/aj-emblem.png"
              alt="AJ Solar Identity Emblem"
              width={28}
              height={28}
              className="h-7 w-7 rounded-full object-contain shrink-0"
            />
            <span className="type-meta uppercase tracking-[0.16em] text-[var(--planet-sun)]">
              AJ COSMIC UNIVERSE · CORE SYSTEM
            </span>
          </div>

          {hasRole && profile.roleLabel && (
            <p className="eyebrow-label text-[var(--text-secondary)]">{profile.roleLabel}</p>
          )}

          <h1 id="hero-heading" className="type-hero text-[var(--text-primary)]">
            <span className="block">{profile.name}</span>
          </h1>

          <div aria-hidden="true" className="accent-hairline w-28" />

          {hasTagline && profile.heroTagline && (
            <p className="type-lead text-[var(--text-secondary)] max-w-[50ch] rounded-[var(--radius-card)] bg-[#020307]/72 px-3.5 py-2.5 backdrop-blur-sm border border-white/[0.06] md:rounded-none md:bg-transparent md:p-0 md:backdrop-blur-none md:border-0">
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
                'bg-[var(--accent-chrome)] text-[var(--text-on-accent)] font-semibold text-base',
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
                'hover:border-[var(--planet-contact)] hover:bg-white/5 hover:-translate-y-0.5 active:translate-y-0',
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
                  'hover:border-[var(--accent-chrome)] hover:text-[var(--text-primary)] hover:-translate-y-0.5 active:translate-y-0',
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
                    'rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)]/70',
                    'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--accent-chrome)]',
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
                    'rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)]/70',
                    'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--accent-chrome)]',
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
                    'rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--surface-elevated)]/70',
                    'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--accent-chrome)]',
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

        {/* Right / below Hero visual stage: open to persistent 3D Solar System + layered dimensional name + cutout portrait */}
        <div
          data-testid="hero-3d-stage"
          className="pointer-events-none relative col-span-4 md:col-span-4 lg:col-span-6 h-[340px] sm:h-[420px] md:h-[460px] lg:h-[540px] w-full overflow-hidden rounded-[var(--radius-portrait)]"
        >
          {/* Dimensional layered name watermark behind silhouette portrait */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center select-none overflow-hidden"
          >
            <span className="font-display text-[clamp(3.2rem,8vw,6.8rem)] font-bold uppercase tracking-[-0.04em] leading-[0.86] text-[var(--accent-chrome)] opacity-[0.07] text-center">
              Austin
              <br />
              Joshua
            </span>
          </div>

          <div className="pointer-events-auto relative z-10 h-full w-full">
            <HeroPortraitReveal
              portrait={profile.portrait}
              prefersReducedMotion={prefersReducedMotion}
            />
          </div>
        </div>
      </div>

      {/* Interactive Solar System Planet Destination HUD */}
      <div className="relative z-10 mt-8 md:mt-10">
        <SolarSystemHud />
      </div>
    </SectionShell>
  );
}

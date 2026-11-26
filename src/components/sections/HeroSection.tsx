import { ArrowDownRight, Download, Mail, MapPin } from 'lucide-react';
import type { MouseEvent } from 'react';
import { SectionShell } from '@/components/layout/SectionShell';
import { HeroPortraitReveal } from '@/components/ui/HeroPortraitReveal';
import { SolarSystemHud } from '@/components/ui/SolarSystemHud';
import { useMotionPreference } from '@/context/MotionPreferenceContext';
import { useOptionalUniverseNavigation } from '@/context/UniverseNavigationContext';
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

  return (
    <SectionShell
      id="hero"
      index="01"
      indexLabel="SUN // CORE IDENTITY"
      title={undefined}
      labelledbyId="hero-heading"
      headingLevel={1}
      withDivider={false}
      className="relative flex flex-col justify-center overflow-x-clip pt-2 pb-6 sm:pt-6 sm:pb-10 md:pt-24 md:pb-8 lg:min-h-[min(860px,100dvh)]"
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
      <div className="relative z-10 swiss-grid items-center gap-y-4 sm:gap-y-6 md:gap-y-8">
        {/* Left column — identity & primary actions (social links consolidated strictly in Contact) */}
        <div className="pointer-events-auto col-span-4 md:col-span-4 lg:col-span-6 space-y-3.5 sm:space-y-5 md:space-y-6">
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

          <h1
            id="hero-heading"
            className="type-hero text-[var(--text-primary)] [text-shadow:0_6px_28px_rgba(2,3,7,0.92)]"
          >
            <span className="block">{profile.name}</span>
          </h1>

          <div aria-hidden="true" className="accent-hairline w-28" />

          {hasTagline && profile.heroTagline && (
            <p className="type-lead text-[var(--text-secondary)] max-w-[48ch] [text-shadow:0_2px_18px_rgba(2,3,7,0.9)]">
              {profile.heroTagline}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1">
            <a
              href="#projects"
              onClick={(event) => handleJump(event, 'projects')}
              className={[
                'w-full sm:w-auto inline-flex min-h-[46px] sm:min-h-[50px] items-center justify-center gap-2 whitespace-nowrap',
                'px-6 py-2.5 sm:py-3 rounded-[var(--radius-control)]',
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
                'glass-surface flex-1 sm:flex-none inline-flex min-h-[46px] sm:min-h-[50px] items-center justify-center gap-2 whitespace-nowrap',
                'px-4 sm:px-6 py-2.5 sm:py-3 rounded-[var(--radius-control)]',
                'text-[var(--text-primary)] font-medium text-sm sm:text-base',
                'transition-[background-color,border-color,transform] duration-200',
                'hover:border-[var(--planet-contact)] hover:bg-white/5 hover:-translate-y-0.5 active:translate-y-0',
                'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
              ].join(' ')}
            >
              <Mail className="size-4 shrink-0" aria-hidden="true" />
              <span>Contact Me</span>
            </a>

            {hasResume && profile.resume && (
              <a
                href={profile.resume.url}
                download="Austin_Joshua_Resume.pdf"
                className={[
                  'glass-surface flex-1 sm:flex-none inline-flex min-h-[46px] sm:min-h-[50px] items-center justify-center gap-2 whitespace-nowrap',
                  'px-4 sm:px-5 py-2.5 sm:py-3 rounded-[var(--radius-control)]',
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

          <p className="inline-flex items-center gap-2 pt-0.5 type-meta text-[var(--text-muted)]">
            <MapPin className="size-3.5 text-[var(--planet-sun)] shrink-0" aria-hidden="true" />
            <span>Chennai, India</span>
          </p>
        </div>

        {/* Right / below Hero visual stage: open unboxed 3D universe + centered unclipped watermark + cutout portrait */}
        <div
          data-testid="hero-3d-stage"
          className="pointer-events-none relative col-span-4 md:col-span-4 lg:col-span-6 h-[250px] sm:h-[380px] md:h-[450px] lg:h-[500px] w-full flex items-end justify-center lg:justify-end lg:pr-4"
        >
          {/* Dimensional unclipped name watermark floating softly behind/beside the portrait silhouette */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-[6%] bottom-[24%] z-0 flex flex-col items-center lg:items-start lg:pl-6 justify-center select-none overflow-visible"
          >
            <span className="font-display text-[clamp(2.2rem,4.3vw,4rem)] font-bold uppercase tracking-[0.06em] leading-[0.9] text-[var(--accent-chrome)] opacity-[0.09] text-center lg:text-left">
              Austin
              <br />
              Joshua
            </span>
          </div>

          <div className="pointer-events-auto relative z-10 h-full w-full flex justify-center lg:justify-end">
            <HeroPortraitReveal
              portrait={profile.portrait}
              prefersReducedMotion={prefersReducedMotion}
            />
          </div>
        </div>
      </div>

      {/* Interactive Solar System Orbital Waypoint Strip */}
      <div className="relative z-10 mt-5 md:mt-7">
        <SolarSystemHud />
      </div>
    </SectionShell>
  );
}

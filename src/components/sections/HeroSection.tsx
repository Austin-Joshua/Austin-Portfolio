import { Compass, Download, FolderGit2, Mail } from 'lucide-react';
import { useState, type MouseEvent, type PointerEvent } from 'react';
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
  const [parallax, setParallax] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

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

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || event.pointerType === 'touch') return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    setParallax({
      x: Math.max(-1, Math.min(1, nx)),
      y: Math.max(-1, Math.min(1, ny)),
    });
  };

  const hasRole = hasNonEmptyText(profile.roleLabel);
  const hasTagline = hasNonEmptyText(profile.heroTagline);
  const hasResume =
    profile.resume !== null && isValidLocalOrHttpAssetUrl(profile.resume.url);

  const nameParts = profile.name.trim().split(/\s+/);
  const firstName = nameParts[0] ?? 'Austin';
  const lastName = nameParts.slice(1).join(' ') || 'Joshua';

  return (
    <SectionShell
      id="hero"
      indexLabel="SUN"
      title={undefined}
      labelledbyId="hero-heading"
      headingLevel={1}
      withDivider={false}
      className="relative flex flex-col justify-between overflow-x-clip pt-2 pb-24 sm:pt-4 sm:pb-24 md:pt-20 md:pb-6 min-h-[calc(100dvh-4rem)] md:min-h-[100dvh]"
    >
      {/* Atmospheric solar corona radial aura */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: 'var(--grad-hero-radial)',
        }}
      />

      {/* Centered Solar Core Composition (Desktop-Wide 3D Sculpted Name directly behind Shadow->Colour Portrait) */}
      <div
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setParallax({ x: 0, y: 0 })}
        className="pointer-events-none relative z-10 my-auto flex flex-col items-center justify-center text-center gap-2.5 sm:gap-3.5 lg:gap-4"
      >
        <div
          data-testid="hero-3d-stage"
          className="pointer-events-none relative mx-auto flex h-[clamp(215px,36dvh,335px)] sm:h-[clamp(270px,43dvh,435px)] lg:h-[clamp(330px,51dvh,515px)] w-full max-w-[92rem] items-end justify-center"
        >
          {/* Monumental Wide 3D Sculptural Name directly behind Austin's portrait cutout */}
          <div
            className="pointer-events-none absolute inset-x-0 top-[4%] sm:top-[6%] z-0 flex flex-col items-center justify-center select-none overflow-visible"
            style={{
              transform: prefersReducedMotion
                ? undefined
                : `perspective(1000px) translate3d(${(-parallax.x * 16).toFixed(1)}px, ${(-parallax.y * 12).toFixed(1)}px, -45px) rotateX(${(parallax.y * 4.5).toFixed(2)}deg) rotateY(${(-parallax.x * 5.5).toFixed(2)}deg)`,
              transition: prefersReducedMotion ? 'none' : 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <h1
              id="hero-heading"
              className="font-display text-[clamp(2.85rem,14.5vw,13.25rem)] md:text-[clamp(5.2rem,15vw,13.75rem)] font-bold uppercase tracking-[0.06em] sm:tracking-[0.09em] lg:tracking-[0.13em] leading-[0.82] text-[#eef3fb]/92 select-none"
              style={{
                textShadow:
                  '0 2px 0 rgba(190,202,222,0.52), 0 5px 0 rgba(132,146,172,0.44), 0 11px 0 rgba(74,86,108,0.36), 0 24px 50px rgba(2,3,7,0.94)',
              }}
            >
              {firstName} <br /> {lastName}
            </h1>
          </div>

          {/* 3D Shadow->Colour Interactive Portrait Foreground */}
          <div className="pointer-events-none relative z-10 h-full flex items-end justify-center">
            <HeroPortraitReveal
              portrait={profile.portrait}
              prefersReducedMotion={prefersReducedMotion}
              pointerOffset={parallax}
            />
          </div>
        </div>

        {/* Enlarged Crisp Identity Readout + Minimal Circular Icon Actions */}
        <div className="pointer-events-auto relative z-20 flex flex-col items-center gap-2 sm:gap-2.5 max-w-[78ch] px-2">
          {hasRole && profile.roleLabel && (
            <p className="eyebrow-label !mb-0 !text-[11px] sm:!text-xs md:!text-sm lg:!text-[15px] !tracking-[0.15em] md:whitespace-nowrap !text-[var(--planet-sun)]/95 [text-shadow:0_2px_12px_rgba(2,3,7,0.9)]">
              {profile.roleLabel}
            </p>
          )}

          {hasTagline && profile.heroTagline && (
            <p className="type-lead text-sm sm:text-base md:text-lg lg:text-xl text-[var(--text-secondary)] max-w-[60ch] [text-shadow:0_2px_16px_rgba(2,3,7,0.92)]">
              {profile.heroTagline}
            </p>
          )}

          {/* Minimal Circular Cosmic Icon Actions ("Use Minimal Icons & Stuffs") */}
          <div className="flex items-center justify-center gap-4 sm:gap-5 pt-1.5">
            <a
              href="#projects"
              onClick={(event) => handleJump(event, 'projects')}
              aria-label="View Projects"
              title="Projects"
              className="group inline-flex min-h-[44px] min-w-[44px] md:h-12 md:w-12 items-center justify-center rounded-full border border-[var(--border-glass)] bg-[var(--surface-elevated)]/80 text-[var(--text-secondary)] hover:text-[var(--planet-projects)] hover:border-[var(--planet-projects)] hover:scale-110 active:scale-95 transition-[color,border-color,transform] duration-200 focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]"
            >
              <FolderGit2 className="size-4 md:size-[18px] shrink-0" aria-hidden="true" />
            </a>

            <a
              href="#contact"
              onClick={(event) => handleJump(event, 'contact')}
              aria-label="Contact Me"
              title="Contact"
              className="group inline-flex min-h-[44px] min-w-[44px] md:h-12 md:w-12 items-center justify-center rounded-full border border-[var(--border-glass)] bg-[var(--surface-elevated)]/80 text-[var(--text-secondary)] hover:text-[var(--planet-contact)] hover:border-[var(--planet-contact)] hover:scale-110 active:scale-95 transition-[color,border-color,transform] duration-200 focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]"
            >
              <Mail className="size-4 md:size-[18px] shrink-0" aria-hidden="true" />
            </a>

            {hasResume && profile.resume && (
              <a
                href={profile.resume.url}
                download="Austin_Joshua_Resume.pdf"
                aria-label="Résumé"
                title="Download Résumé (PDF)"
                className="group inline-flex min-h-[44px] min-w-[44px] md:h-12 md:w-12 items-center justify-center rounded-full border border-[var(--border-glass)] bg-[var(--surface-elevated)]/80 text-[var(--text-secondary)] hover:text-[var(--planet-sun)] hover:border-[var(--planet-sun)] hover:scale-110 active:scale-95 transition-[color,border-color,transform] duration-200 focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]"
              >
                <Download className="size-4 md:size-[18px] shrink-0" aria-hidden="true" />
              </a>
            )}

            <a
              href="#about"
              onClick={(event) => {
                event.preventDefault();
                if (universeNav) {
                  universeNav.navigateToPlanet('about');
                } else {
                  scrollToSection('about', {
                    prefersReducedMotion,
                    focusTarget: false,
                    updateHash: true,
                  });
                }
              }}
              aria-label="Explore About Planet"
              title="Explore Planets"
              className="group inline-flex min-h-[44px] min-w-[44px] md:h-12 md:w-12 items-center justify-center rounded-full border border-[var(--border-glass)] bg-[var(--surface-elevated)]/80 text-[var(--text-secondary)] hover:text-[var(--planet-about)] hover:border-[var(--planet-about)] hover:scale-110 active:scale-95 transition-[color,border-color,transform] duration-200 focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]"
            >
              <Compass className="size-4 md:size-[18px] shrink-0" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      {/* Ultra-minimal Orbital Planet Waypoint Dots */}
      <div className="pointer-events-none relative z-10 mt-3 md:mt-4 flex justify-center">
        <SolarSystemHud />
      </div>
    </SectionShell>
  );
}

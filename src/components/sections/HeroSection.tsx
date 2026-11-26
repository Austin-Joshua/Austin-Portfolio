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
      className="relative flex flex-col justify-center overflow-x-clip pt-2 pb-4 sm:pt-4 sm:pb-6 md:pt-20 md:pb-6 min-h-[calc(100dvh-4.5rem)] md:min-h-[min(860px,100dvh)]"
    >
      {/* Atmospheric solar corona radial aura */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: 'var(--grad-hero-radial)',
        }}
      />

      {/* Centered Solar Core Composition (Handwritten Desktop & Mobile Layout):
          3D Name directly behind 3D-tilted Shadow->Colour Portrait, open space for interactive planets */}
      <div
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setParallax({ x: 0, y: 0 })}
        className="relative z-10 flex flex-col items-center justify-center text-center gap-4 sm:gap-5"
      >
        <div
          data-testid="hero-3d-stage"
          className="pointer-events-none relative mx-auto flex h-[340px] sm:h-[420px] md:h-[470px] lg:h-[510px] w-full max-w-4xl items-end justify-center"
        >
          {/* 3D Sculptural Name directly behind Austin's portrait on both Desktop & Mobile */}
          <div
            className="pointer-events-none absolute inset-x-0 top-[8%] sm:top-[10%] z-0 flex flex-col items-center justify-center select-none overflow-visible"
            style={{
              transform: prefersReducedMotion
                ? undefined
                : `perspective(900px) translate3d(${(-parallax.x * 14).toFixed(1)}px, ${(-parallax.y * 10).toFixed(1)}px, -40px) rotateX(${(parallax.y * 4).toFixed(2)}deg) rotateY(${(-parallax.x * 5).toFixed(2)}deg)`,
              transition: prefersReducedMotion ? 'none' : 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <h1
              id="hero-heading"
              className="font-display text-[clamp(2.25rem,11vw,7.4rem)] font-bold uppercase tracking-[0.04em] leading-[0.88] text-[#eef3fb]/90 select-none"
              style={{
                textShadow:
                  '0 2px 0 rgba(168,180,200,0.45), 0 4px 0 rgba(120,132,155,0.38), 0 8px 0 rgba(70,80,100,0.32), 0 18px 38px rgba(2,3,7,0.92)',
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

        {/* Minimal Role & Tagline + Pure Icon Links (No generic View Projects / Resume / Contact boxes) */}
        <div className="pointer-events-auto relative z-20 flex flex-col items-center gap-3 max-w-[54ch] px-2">
          {hasRole && profile.roleLabel && (
            <p className="eyebrow-label text-[var(--text-secondary)]">
              {profile.roleLabel}
            </p>
          )}

          {hasTagline && profile.heroTagline && (
            <p className="type-body text-sm sm:text-base text-[var(--text-muted)] max-w-[48ch] [text-shadow:0_2px_14px_rgba(2,3,7,0.9)]">
              {profile.heroTagline}
            </p>
          )}

          {/* Minimal Circular Cosmic Icon Actions ("Use Minimal Icons & Stuffs") */}
          <div className="flex items-center justify-center gap-4 pt-1">
            <a
              href="#projects"
              onClick={(event) => handleJump(event, 'projects')}
              aria-label="View Projects"
              title="Projects"
              className="group inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-[var(--border-glass)] bg-[var(--surface-elevated)]/75 text-[var(--text-secondary)] hover:text-[var(--planet-projects)] hover:border-[var(--planet-projects)] hover:scale-110 active:scale-95 transition-[color,border-color,transform] duration-200 focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]"
            >
              <FolderGit2 className="size-4 shrink-0" aria-hidden="true" />
            </a>

            <a
              href="#contact"
              onClick={(event) => handleJump(event, 'contact')}
              aria-label="Contact Me"
              title="Contact"
              className="group inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-[var(--border-glass)] bg-[var(--surface-elevated)]/75 text-[var(--text-secondary)] hover:text-[var(--planet-contact)] hover:border-[var(--planet-contact)] hover:scale-110 active:scale-95 transition-[color,border-color,transform] duration-200 focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]"
            >
              <Mail className="size-4 shrink-0" aria-hidden="true" />
            </a>

            {hasResume && profile.resume && (
              <a
                href={profile.resume.url}
                download="Austin_Joshua_Resume.pdf"
                aria-label="Résumé"
                title="Download Résumé (PDF)"
                className="group inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-[var(--border-glass)] bg-[var(--surface-elevated)]/75 text-[var(--text-secondary)] hover:text-[var(--planet-sun)] hover:border-[var(--planet-sun)] hover:scale-110 active:scale-95 transition-[color,border-color,transform] duration-200 focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]"
              >
                <Download className="size-4 shrink-0" aria-hidden="true" />
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
              className="group inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-[var(--border-glass)] bg-[var(--surface-elevated)]/75 text-[var(--text-secondary)] hover:text-[var(--planet-about)] hover:border-[var(--planet-about)] hover:scale-110 active:scale-95 transition-[color,border-color,transform] duration-200 focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]"
            >
              <Compass className="size-4 shrink-0" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      {/* Ultra-minimal Orbital Planet Waypoint Dots */}
      <div className="relative z-10 mt-4 md:mt-5 flex justify-center">
        <SolarSystemHud />
      </div>
    </SectionShell>
  );
}

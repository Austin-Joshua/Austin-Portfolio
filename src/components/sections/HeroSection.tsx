import { Compass, Download, FolderGit2, Mail } from 'lucide-react';
import { useEffect, useState, type MouseEvent, type PointerEvent } from 'react';
import { SectionShell } from '@/components/layout/SectionShell';
import { HeroPortraitReveal } from '@/components/ui/HeroPortraitReveal';
import { SolarSystemHud } from '@/components/ui/SolarSystemHud';
import { useMotionPreference } from '@/context/MotionPreferenceContext';
import { useOptionalUniverseNavigation } from '@/context/UniverseNavigationContext';
import { profileData } from '@/data/profile';
import { getSectionRoute } from '@/routes/routes';
import type { ProfileData } from '@/types/portfolio';
import { hasNonEmptyText, isValidLocalOrHttpAssetUrl } from '@/utils/dataGuards';
import { computeGyroTilt, subscribeDeviceOrientation } from '@/utils/gyroParallax';
import { navigateToSection } from '@/utils/scrollNavigation';
import { playClick } from '@/utils/soundEffects';

export interface HeroSectionProps {
  profile?: ProfileData;
}

export function HeroSection({ profile = profileData }: HeroSectionProps) {
  const { prefersReducedMotion } = useMotionPreference();
  const universeNav = useOptionalUniverseNavigation();
  const [parallax, setParallax] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (prefersReducedMotion) return;
    return subscribeDeviceOrientation((event) => {
      if (event.beta == null && event.gamma == null) return;
      const g = computeGyroTilt(event.gamma, event.beta, 14);
      setParallax({
        x: Math.max(-1, Math.min(1, g.px * 2)),
        y: Math.max(-1, Math.min(1, g.py * 2)),
      });
    });
  }, [prefersReducedMotion]);

  const handleJump = (
    event: MouseEvent<HTMLAnchorElement>,
    targetId: 'projects' | 'contact' | 'about',
  ) => {
    event.preventDefault();
    navigateToSection(targetId, { universeNav, prefersReducedMotion });
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
      title={undefined}
      labelledbyId="hero-heading"
      headingLevel={1}
      withDivider={false}
      className="relative flex flex-col justify-between overflow-x-clip !pt-16 sm:!pt-[4.25rem] !pb-[4.25rem] sm:!pb-[4.5rem] lg:!pt-[4.25rem] lg:!pb-0 min-h-[100dvh]"
    >
      {/* Atmospheric solar corona radial aura */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: 'var(--grad-hero-radial)',
        }}
      />

      {/* Centered Monumental Stage (Full-Length Name behind Giant Silhouette Portrait reaching the bottom) */}
      <div
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setParallax({ x: 0, y: 0 })}
        className="pointer-events-none relative z-10 flex-1 w-full flex flex-col items-center justify-end"
      >
        <div
          data-testid="hero-3d-stage"
          className="pointer-events-none relative mx-auto flex h-[calc(100dvh-8.25rem)] min-h-[430px] max-h-[820px] lg:h-[calc(100dvh-4.25rem)] lg:min-h-[540px] lg:max-h-[1080px] w-full max-w-[96rem] items-end justify-center"
        >
          {/* Full-length Monumental 3D Name layered directly behind Austin's full-height portrait */}
          <div
            className="pointer-events-none absolute inset-x-0 top-[2%] sm:top-[3%] lg:top-[2%] z-0 flex flex-col items-center justify-center text-center select-none overflow-visible"
            style={{
              transform: prefersReducedMotion
                ? undefined
                : `perspective(1000px) translate3d(${(-parallax.x * 14).toFixed(1)}px, ${(-parallax.y * 10).toFixed(1)}px, -45px) rotateX(${(parallax.y * 4).toFixed(2)}deg) rotateY(${(-parallax.x * 5).toFixed(2)}deg)`,
              transition: prefersReducedMotion ? 'none' : 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <h1
              id="hero-heading"
              className="font-display w-full text-[clamp(4.2rem,22vw,6.85rem)] sm:text-[clamp(6rem,20vw,10.25rem)] lg:text-[clamp(8.5rem,min(18.5vw,28dvh),17.5rem)] font-extrabold uppercase tracking-[0.02em] lg:tracking-[0.03em] leading-[0.82] text-[#eef3fb]/92 select-none"
              style={{
                textShadow:
                  '0 2px 0 rgba(190,202,222,0.5), 0 5px 0 rgba(132,146,172,0.42), 0 12px 0 rgba(74,86,108,0.34), 0 28px 56px rgba(2,3,7,0.96)',
              }}
            >
              {firstName} <br /> {lastName}
            </h1>
          </div>

          {/* Flat Interactive Portrait extending flush to bottom */}
          <div className="pointer-events-none relative z-10 h-full flex items-end justify-center">
            <HeroPortraitReveal
              portrait={profile.portrait}
              prefersReducedMotion={prefersReducedMotion}
            />
          </div>
        </div>

        {/* Left & Right Flanked Subtle Credentials on Desktop Only (Zero bottom clutter on Mobile Hero) */}
        <div className="pointer-events-none hidden lg:block">
          {/* Left Credential Column */}
          <div className="pointer-events-auto flex flex-col items-start text-left gap-1.5 max-w-[16rem] xl:max-w-[20.5rem] 2xl:max-w-[22.5rem] absolute left-3 xl:left-6 bottom-6 xl:bottom-9 z-20">
            {hasRole && profile.roleLabel && (
              <p className="font-sans text-[11px] xl:text-xs font-medium tracking-[0.04em] text-[var(--planet-sun)]/95 [text-shadow:0_2px_12px_rgba(2,3,7,0.9)]">
                {profile.roleLabel}
              </p>
            )}

            {hasTagline && profile.heroTagline && (
              <p className="font-sans text-[12.5px] xl:text-[13.5px] font-normal leading-relaxed text-[var(--text-secondary)] [text-shadow:0_2px_16px_rgba(2,3,7,0.92)]">
                {profile.heroTagline}
              </p>
            )}

            <p className="font-sans text-[11px] text-[var(--text-muted)] tracking-[0.01em]">
              B.E. CSE (2024–2028) · Rajalakshmi Institute of Technology, Chennai
            </p>
          </div>

          {/* Right Credential Column & Minimal Circular Actions */}
          <div className="pointer-events-auto flex flex-col items-end text-right gap-2 max-w-[16rem] xl:max-w-[20.5rem] absolute right-3 xl:right-6 bottom-6 xl:bottom-9 z-20">
            <div className="space-y-0.5">
              <p className="font-sans text-[11.5px] font-medium text-[var(--accent-primary)]">
                5 Shipped Systems · 3 Hackathon Awards
              </p>
              <p className="font-sans text-[11px] text-[var(--text-muted)]">
                President, Infinitus Mathematics Club · Python, React &amp; AI/ML
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <a
                href={getSectionRoute('projects')}
                onClick={(event) => handleJump(event, 'projects')}
                aria-label="View Projects"
                title="Projects"
                className="group inline-flex min-h-[44px] min-w-[44px] md:h-11 md:w-11 items-center justify-center rounded-full border border-[var(--border-glass)] bg-[var(--surface-elevated)]/85 text-[var(--text-secondary)] hover:text-[var(--planet-projects)] hover:border-[var(--planet-projects)] active:scale-95 transition-[color,border-color,transform] duration-150 focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]"
              >
                <FolderGit2 className="size-4 md:size-[18px] shrink-0" aria-hidden="true" />
              </a>

              <a
                href={getSectionRoute('contact')}
                onClick={(event) => handleJump(event, 'contact')}
                aria-label="Contact Me"
                title="Contact"
                className="group inline-flex min-h-[44px] min-w-[44px] md:h-11 md:w-11 items-center justify-center rounded-full border border-[var(--border-glass)] bg-[var(--surface-elevated)]/85 text-[var(--text-secondary)] hover:text-[var(--planet-contact)] hover:border-[var(--planet-contact)] active:scale-95 transition-[color,border-color,transform] duration-150 focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]"
              >
                <Mail className="size-4 md:size-[18px] shrink-0" aria-hidden="true" />
              </a>

              {hasResume && profile.resume && (
                <a
                  href={profile.resume.url}
                  download="Austin_Joshua_Resume.pdf"
                  onClick={() => playClick()}
                  aria-label="Résumé"
                  title="Download Résumé (PDF)"
                  className="group inline-flex min-h-[44px] min-w-[44px] md:h-11 md:w-11 items-center justify-center rounded-full border border-[var(--border-glass)] bg-[var(--surface-elevated)]/85 text-[var(--text-secondary)] hover:text-[var(--planet-sun)] hover:border-[var(--planet-sun)] active:scale-95 transition-[color,border-color,transform] duration-150 focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]"
                >
                  <Download className="size-4 md:size-[18px] shrink-0" aria-hidden="true" />
                </a>
              )}

              <a
                href={getSectionRoute('about')}
                onClick={(event) => handleJump(event, 'about')}
                aria-label="Explore About Planet"
                title="Explore Planets"
                className="group inline-flex min-h-[44px] min-w-[44px] md:h-11 md:w-11 items-center justify-center rounded-full border border-[var(--border-glass)] bg-[var(--surface-elevated)]/85 text-[var(--text-secondary)] hover:text-[var(--planet-about)] hover:border-[var(--planet-about)] active:scale-95 transition-[color,border-color,transform] duration-150 focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]"
              >
                <Compass className="size-4 md:size-[18px] shrink-0" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <SolarSystemHud />
    </SectionShell>
  );
}

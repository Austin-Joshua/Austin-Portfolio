import { ArrowUpRight, Compass, Cpu, GraduationCap } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { SectionShell } from '@/components/layout/SectionShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { useOptionalMotionPreference } from '@/context/MotionPreferenceContext';
import { profileData } from '@/data/profile';
import { setupScopedScrollAnimation } from '@/motion/gsapConfig';
import type { ProfileData } from '@/types/portfolio';
import { hasNonEmptyText, isValidLocalOrHttpAssetUrl } from '@/utils/dataGuards';

export interface AboutSectionProps {
  profile?: ProfileData;
}

const VERIFIED_FOCUS_AREAS = [
  { label: 'Full-Stack Web', detail: 'React · Next.js · TypeScript · Node.js' },
  { label: 'Backend & APIs', detail: 'Python · Go (Gin) · Spring Boot' },
  { label: 'Applied AI / ML', detail: 'scikit-learn · Predictive Modeling' },
] as const;

export function AboutSection({ profile = profileData }: AboutSectionProps) {
  const { prefersReducedMotion } = useOptionalMotionPreference();
  const contentScopeRef = useRef<HTMLDivElement>(null);
  const hairlineRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const stationParallaxRef = useRef<HTMLDivElement>(null);

  const validParagraphs = profile.aboutParagraphs.filter((p) => hasNonEmptyText(p));
  const hasResume =
    profile.resume !== null && isValidLocalOrHttpAssetUrl(profile.resume.url);

  useEffect(() => {
    const scope = contentScopeRef.current;
    const hairline = hairlineRef.current;
    const leftCol = leftColRef.current;
    const stationCard = stationParallaxRef.current;
    if (!scope || !hairline || !stationCard) return;

    return setupScopedScrollAnimation(
      contentScopeRef,
      prefersReducedMotion,
      ({ gsap }, mm) => {
        gsap.fromTo(
          hairline,
          { scaleX: 0.35 },
          {
            scaleX: 1,
            duration: 0.65,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: scope,
              start: 'top 82%',
              once: true,
            },
          },
        );

        // Alternating Left & Right horizontal scroll reveal (handwritten scroll format)
        if (leftCol) {
          gsap.fromTo(
            leftCol,
            { x: -28 },
            {
              x: 0,
              duration: 0.65,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: scope,
                start: 'top 84%',
                once: true,
              },
            },
          );
        }

        stationCard.style.transform = 'none';
        mm.add('(min-width: 1024px)', () => {
          gsap.fromTo(
            stationCard,
            { x: 28, y: 12 },
            {
              x: 0,
              y: -12,
              ease: 'none',
              scrollTrigger: {
                trigger: scope,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            },
          );
        });
      },
      () => {
        hairline.style.transform = 'scaleX(1)';
        if (leftCol) leftCol.style.transform = 'none';
        stationCard.style.transform = 'none';
      },
    );
  }, [prefersReducedMotion]);

  return (
    <SectionShell id="about" index="02" indexLabel="ABOUT" title="About">
      <div
        ref={contentScopeRef}
        data-reduced-motion={prefersReducedMotion ? 'true' : 'false'}
        className="pointer-events-none space-y-8 md:space-y-10"
      >
        {/* Cyan-accented orbital trajectory divider */}
        <div
          ref={hairlineRef}
          aria-hidden="true"
          data-testid="about-hairline"
          className="h-[2px] w-full origin-left rounded-full opacity-80"
          style={{
            background:
              'linear-gradient(90deg, var(--planet-about) 0%, rgba(56,189,248,0.22) 55%, transparent 100%)',
          }}
        />

        <div className="swiss-grid items-stretch gap-y-8 pointer-events-none">
          {/* Left column: Reconstructed Narrative Lead & Core Engineering Focus (Zero duplicate portrait) */}
          <div
            ref={leftColRef}
            className="col-span-4 md:col-span-5 lg:col-span-7 flex flex-col justify-between gap-6 pointer-events-auto"
          >
            {validParagraphs.length > 0 ? (
              <GlassCard padding="lg" variant="default" className="p-6 sm:p-8 lg:p-10 gap-7 h-full flex flex-col justify-between">
                <div className="space-y-6">
                  <p className="type-meta uppercase tracking-[0.16em] text-[var(--planet-about)]">
                    ENGINEERING PROFILE
                  </p>
                  {validParagraphs.map((paragraph, idx) => (
                    <p
                      key={`about-paragraph-${idx}`}
                      className={
                        idx === 0
                          ? 'text-lg sm:text-xl lg:text-[1.45rem] font-medium leading-[1.58] text-[var(--text-primary)] max-w-[60ch]'
                          : 'type-body text-base md:text-[1.0625rem] leading-[1.7] text-[var(--text-secondary)] max-w-[64ch]'
                      }
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Verified Engineering Focus Telemetry Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[var(--border-subtle)] pt-6">
                  {VERIFIED_FOCUS_AREAS.map((area) => (
                    <div
                      key={area.label}
                      className="rounded-[var(--radius-control)] border border-[var(--border-subtle)]/80 bg-[var(--surface-elevated)]/75 p-4 transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-[var(--planet-about)]/55"
                    >
                      <p className="type-meta text-xs uppercase tracking-[0.1em] text-[var(--planet-about)] mb-1.5">
                        {area.label}
                      </p>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                        {area.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            ) : (
              <GlassCard padding="lg" variant="elevated">
                <p className="type-meta uppercase text-[var(--text-muted)] mb-2">
                  ABOUT // PENDING_VERIFICATION
                </p>
                <p className="type-body text-[var(--text-secondary)] max-w-[65ch]">
                  {profile.aboutPendingNotice}
                </p>
              </GlassCard>
            )}
          </div>

          {/* Right column: Reconstructed Orbital Dossier (no duplicate portrait) */}
          <div className="col-span-4 md:col-span-3 lg:col-span-5 flex flex-col pointer-events-auto">
            <div
              ref={stationParallaxRef}
              data-testid="about-station-parallax"
              className="h-full"
            >
              <GlassCard
                padding="lg"
                variant="strong"
                className="relative overflow-hidden h-full p-6 sm:p-8 flex flex-col justify-between gap-6 border-[var(--planet-about)]/35"
              >
                {/* Restrained orbital trajectory motif */}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 240 240"
                  className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 opacity-25"
                  fill="none"
                >
                  <circle
                    cx="120"
                    cy="120"
                    r="86"
                    stroke="#38BDF8"
                    strokeWidth="1"
                    strokeDasharray="4 6"
                  />
                  <circle cx="120" cy="120" r="54" stroke="#DCE4F0" strokeOpacity="0.45" strokeWidth="1" />
                  <circle cx="206" cy="120" r="4" fill="#38BDF8" />
                </svg>

                <div className="relative z-10 space-y-5">
                  <p className="type-meta uppercase tracking-[0.16em] text-[var(--planet-about)]">
                    TERRA CYAN // ORBITAL DOSSIER
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3.5">
                      <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--planet-about)]/35 bg-[var(--planet-about)]/10 text-[var(--planet-about)]">
                        <GraduationCap className="size-5" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="type-meta text-xs uppercase text-[var(--text-muted)]">
                          Degree Program
                        </p>
                        <p className="text-base font-semibold text-[var(--text-primary)]">
                          B.E. Computer Science &amp; Engineering (2024–2028)
                        </p>
                        <p className="text-sm text-[var(--text-secondary)]">
                          Rajalakshmi Institute of Technology, Chennai
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5 border-t border-[var(--border-subtle)]/70 pt-4">
                      <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--planet-about)]/35 bg-[var(--planet-about)]/10 text-[var(--planet-about)]">
                        <Compass className="size-5" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="type-meta text-xs uppercase text-[var(--text-muted)]">
                          Leadership &amp; Coordination
                        </p>
                        <p className="text-base font-semibold text-[var(--text-primary)]">
                          President, Infinitus Mathematics Club (2026–2027)
                        </p>
                        <p className="text-sm text-[var(--text-secondary)]">
                          Overall Non-Technical Coordinator · TECHritz
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5 border-t border-[var(--border-subtle)]/70 pt-4">
                      <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--planet-about)]/35 bg-[var(--planet-about)]/10 text-[var(--planet-about)]">
                        <Cpu className="size-5" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="type-meta text-xs uppercase text-[var(--text-muted)]">
                          Competition Record
                        </p>
                        <p className="text-base font-semibold text-[var(--text-primary)]">
                          3 Hackathon Awards (National &amp; International)
                        </p>
                        <p className="text-sm text-[var(--text-secondary)]">
                          AgriFlux · CIVIQ · ResQ Meal
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {hasResume && profile.resume && (
                  <div className="relative z-10 border-t border-[var(--border-subtle)]/80 pt-5">
                    <a
                      href={profile.resume.url}
                      download="Austin_Joshua_Resume.pdf"
                      className="inline-flex min-h-[48px] w-full items-center justify-between gap-3 rounded-[var(--radius-control)] border border-[var(--planet-about)]/40 bg-[var(--planet-about)]/12 px-5 py-3 text-sm sm:text-base font-medium text-[var(--text-primary)] hover:border-[var(--planet-about)] hover:bg-[var(--planet-about)]/20 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]"
                    >
                      <span>{profile.resume.label} (PDF)</span>
                      <ArrowUpRight className="size-4 text-[var(--planet-about)] shrink-0" aria-hidden="true" />
                    </a>
                  </div>
                )}
              </GlassCard>
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

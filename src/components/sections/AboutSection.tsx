import { ArrowUpRight, Compass, GraduationCap } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { SectionShell } from '@/components/layout/SectionShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { SideReveal } from '@/components/ui/SideReveal';
import { useOptionalMotionPreference } from '@/context/MotionPreferenceContext';
import { profileData } from '@/data/profile';
import { setupScopedScrollAnimation } from '@/motion/gsapConfig';
import type { ProfileData } from '@/types/portfolio';
import { hasNonEmptyText, isValidLocalOrHttpAssetUrl } from '@/utils/dataGuards';
import { playClick } from '@/utils/soundEffects';

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
  const stationParallaxRef = useRef<HTMLDivElement>(null);

  const validParagraphs = profile.aboutParagraphs.filter((p) => hasNonEmptyText(p));
  const hasResume =
    profile.resume !== null && isValidLocalOrHttpAssetUrl(profile.resume.url);

  useEffect(() => {
    const scope = contentScopeRef.current;
    const hairline = hairlineRef.current;
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
            duration: 0.5,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: scope,
              start: 'top 82%',
            },
          },
        );

        stationCard.style.transform = 'none';
        mm.add('(min-width: 1024px)', () => {
          gsap.fromTo(
            stationCard,
            { y: 12 },
            {
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
        stationCard.style.transform = 'none';
      },
    );
  }, [prefersReducedMotion]);

  return (
    <SectionShell id="about" title="About">
      <div
        ref={contentScopeRef}
        data-reduced-motion={prefersReducedMotion ? 'true' : 'false'}
        className="pointer-events-none space-y-8"
      >
        <div
          ref={hairlineRef}
          aria-hidden="true"
          data-testid="about-hairline"
          className="h-[2px] w-32 origin-left rounded-full opacity-55"
          style={{
            background:
              'linear-gradient(90deg, var(--planet-about) 0%, transparent 100%)',
          }}
        />

        <div className="swiss-grid items-stretch gap-y-8 pointer-events-none">
          <SideReveal
            direction="left"
            className="col-span-4 md:col-span-5 lg:col-span-7 flex flex-col justify-between gap-6 pointer-events-auto"
          >
            {validParagraphs.length > 0 ? (
              <GlassCard
                padding="lg"
                variant="default"
                className="p-6 sm:p-8 lg:p-10 gap-7 h-full flex flex-col justify-between"
              >
                <div className="space-y-5">
                  <p className="type-meta text-xs font-medium text-[var(--planet-about)]">
                    Background
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[var(--border-subtle)] pt-6">
                  {VERIFIED_FOCUS_AREAS.map((area) => (
                    <div
                      key={area.label}
                      className="rounded-[var(--radius-control)] border border-[var(--border-subtle)]/80 bg-[var(--surface-elevated)]/75 p-4 transition-colors duration-150 hover:border-[var(--planet-about)]/50"
                    >
                      <p className="type-meta text-xs text-[var(--planet-about)] mb-1.5">
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
                <p className="type-meta text-xs text-[var(--text-muted)] mb-2">
                  Profile pending
                </p>
                <p className="type-body text-[var(--text-secondary)] max-w-[65ch]">
                  {profile.aboutPendingNotice}
                </p>
              </GlassCard>
            )}
          </SideReveal>

          <SideReveal
            direction="right"
            className="col-span-4 md:col-span-3 lg:col-span-5 flex flex-col pointer-events-auto"
          >
            <div
              ref={stationParallaxRef}
              data-testid="about-station-parallax"
              className="h-full"
            >
              <GlassCard
                padding="lg"
                variant="strong"
                className="relative h-full p-6 sm:p-8 flex flex-col justify-between gap-6 border-[var(--planet-about)]/35"
              >
                <div className="space-y-6">
                  <p className="type-meta text-xs font-medium text-[var(--planet-about)]">
                    Education &amp; leadership
                  </p>

                  <div className="space-y-5">
                    <div className="flex items-start gap-3.5">
                      <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--planet-about)]/35 bg-[var(--planet-about)]/10 text-[var(--planet-about)]">
                        <GraduationCap className="size-[18px]" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="type-meta text-xs text-[var(--text-muted)]">
                          Degree program
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
                        <Compass className="size-[18px]" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="type-meta text-xs text-[var(--text-muted)]">
                          Campus leadership
                        </p>
                        <p className="text-base font-semibold text-[var(--text-primary)]">
                          President, Infinitus Mathematics Club (2026–2027)
                        </p>
                        <p className="text-sm text-[var(--text-secondary)]">
                          Overall Non-Technical Coordinator · TECHritz
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {hasResume && profile.resume && (
                  <div className="border-t border-[var(--border-subtle)]/80 pt-5">
                    <a
                      href={profile.resume.url}
                      download="Austin_Joshua_Resume.pdf"
                      onClick={() => playClick()}
                      className="inline-flex min-h-[48px] w-full items-center justify-between gap-3 rounded-[var(--radius-control)] border border-[var(--planet-about)]/40 bg-[var(--planet-about)]/12 px-5 py-3 text-sm sm:text-base font-medium text-[var(--text-primary)] hover:border-[var(--planet-about)] hover:bg-[var(--planet-about)]/20 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]"
                    >
                      <span>{profile.resume.label} (PDF)</span>
                      <ArrowUpRight className="size-4 text-[var(--planet-about)] shrink-0" aria-hidden="true" />
                    </a>
                  </div>
                )}
              </GlassCard>
            </div>
          </SideReveal>
        </div>
      </div>
    </SectionShell>
  );
}

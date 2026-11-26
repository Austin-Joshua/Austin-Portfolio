import { ArrowUpRight } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { SectionShell } from '@/components/layout/SectionShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { PortraitSlot } from '@/components/ui/PortraitSlot';
import { useOptionalMotionPreference } from '@/context/MotionPreferenceContext';
import { profileData } from '@/data/profile';
import { setupScopedScrollAnimation } from '@/motion/gsapConfig';
import type { ProfileData } from '@/types/portfolio';
import { hasNonEmptyText, isValidLocalOrHttpAssetUrl } from '@/utils/dataGuards';

export interface AboutSectionProps {
  profile?: ProfileData;
}

export function AboutSection({ profile = profileData }: AboutSectionProps) {
  const { prefersReducedMotion } = useOptionalMotionPreference();
  const contentScopeRef = useRef<HTMLDivElement>(null);
  const hairlineRef = useRef<HTMLDivElement>(null);
  const portraitParallaxRef = useRef<HTMLDivElement>(null);

  const validParagraphs = profile.aboutParagraphs.filter((p) => hasNonEmptyText(p));
  const hasResume =
    profile.resume !== null && isValidLocalOrHttpAssetUrl(profile.resume.url);

  useEffect(() => {
    const scope = contentScopeRef.current;
    const hairline = hairlineRef.current;
    const portraitFrame = portraitParallaxRef.current;
    if (!scope || !hairline || !portraitFrame) return;

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

        portraitFrame.style.transform = 'none';
        mm.add('(min-width: 1024px)', () => {
          gsap.fromTo(
            portraitFrame,
            { y: 16 },
            {
              y: -16,
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
        portraitFrame.style.transform = 'none';
      },
    );
  }, [prefersReducedMotion]);

  return (
    <SectionShell id="about" index="02" indexLabel="ABOUT" title="About">
      <div
        ref={contentScopeRef}
        data-reduced-motion={prefersReducedMotion ? 'true' : 'false'}
        className="pointer-events-auto space-y-10"
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

        <div className="swiss-grid items-start gap-y-10">
          {/* Narrative & orbital station telemetry */}
          <div className="col-span-4 md:col-span-5 lg:col-span-7 space-y-6">
            {validParagraphs.length > 0 ? (
              <GlassCard padding="lg" variant="default" className="space-y-5">
                {validParagraphs.map((paragraph, idx) => (
                  <p
                    key={`${idx}-${paragraph.slice(0, 24)}`}
                    className={[
                      idx === 0
                        ? 'type-lead text-[var(--text-primary)]'
                        : 'type-body text-[var(--text-secondary)]',
                      'max-w-[62ch]',
                    ].join(' ')}
                  >
                    {paragraph}
                  </p>
                ))}
              </GlassCard>
            ) : (
              <GlassCard padding="lg" variant="elevated">
                <p className="type-meta uppercase text-[var(--text-muted)] mb-2">
                  PROFILE // PENDING_VERIFICATION
                </p>
                <p className="type-body text-[var(--text-secondary)] max-w-[68ch]">
                  {profile.aboutPendingNotice}
                </p>
              </GlassCard>
            )}

            {/* Verified Academic & Campus Leadership Telemetry Bar */}
            <div className="flex flex-wrap gap-3 pt-1">
              <div className="glass-surface px-4 py-2.5 rounded-[var(--radius-control)] border-l-2 border-l-[var(--planet-about)]">
                <p className="type-meta text-[11px] uppercase text-[var(--planet-about)]">
                  Degree · 2024–2028
                </p>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  B.E. Computer Science &amp; Engineering · RIT Chennai
                </p>
              </div>
              <div className="glass-surface px-4 py-2.5 rounded-[var(--radius-control)] border-l-2 border-l-[var(--planet-sun)]">
                <p className="type-meta text-[11px] uppercase text-[var(--planet-sun)]">
                  Leadership · 2026–2027
                </p>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  President, Infinitus Mathematics Club
                </p>
              </div>
            </div>

            {hasResume && profile.resume && (
              <div className="pt-2">
                <a
                  href={profile.resume.url}
                  download="Austin_Joshua_Resume.pdf"
                  className={[
                    'glass-surface inline-flex min-h-[44px] items-center gap-2',
                    'px-5 py-2.5 text-sm font-medium text-[var(--text-primary)]',
                    'rounded-[var(--radius-control)] hover:border-[var(--planet-about)]',
                    'transition-[border-color] duration-200',
                    'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
                  ].join(' ')}
                >
                  <span>{profile.resume.label}</span>
                  {hasNonEmptyText(profile.resume.sizeLabel) && (
                    <span className="type-meta text-[var(--text-muted)]">
                      ({profile.resume.sizeLabel})
                    </span>
                  )}
                  <ArrowUpRight className="size-4 text-[var(--planet-about)] shrink-0" aria-hidden="true" />
                </a>
              </div>
            )}
          </div>

          {/* Portrait slot column */}
          <div className="col-span-4 md:col-span-3 lg:col-span-5">
            <div ref={portraitParallaxRef} data-testid="about-portrait-parallax">
              <PortraitSlot portrait={profile.portrait} />
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

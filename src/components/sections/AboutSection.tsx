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
        className="space-y-10"
      >
        {/* Animated accent hairline */}
        <div
          ref={hairlineRef}
          aria-hidden="true"
          data-testid="about-hairline"
          className="accent-hairline w-full origin-left"
        />

        <div className="swiss-grid items-start gap-y-10">
          {/* Text column */}
          <div className="col-span-4 md:col-span-5 lg:col-span-7 space-y-6">
            {validParagraphs.length > 0 ? (
              <div className="space-y-5">
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
              </div>
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

            {/* Résumé link */}
            {hasResume && profile.resume && (
              <div className="pt-2">
                <a
                  href={profile.resume.url}
                  download="Austin_Joshua_Resume.pdf"
                  className={[
                    'glass-surface inline-flex min-h-[44px] items-center gap-2 px-5 py-2.5',
                    'rounded-[var(--radius-control)] font-mono text-xs font-medium text-[var(--text-primary)]',
                    'transition-[background-color,border-color,transform] duration-200',
                    'hover:border-[var(--accent-primary)] hover:bg-[var(--surface-card)] hover:-translate-y-0.5',
                    'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
                  ].join(' ')}
                >
                  <span>↓</span>
                  <span>{profile.resume.label}</span>
                  {hasNonEmptyText(profile.resume.sizeLabel) && (
                    <span className="text-[var(--text-muted)]">
                      ({profile.resume.sizeLabel})
                    </span>
                  )}
                  <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
                </a>
              </div>
            )}
          </div>

          {/* Portrait column */}
          <div
            ref={portraitParallaxRef}
            data-testid="about-portrait-parallax"
            className="col-span-4 md:col-span-3 lg:col-span-5"
          >
            <PortraitSlot portrait={profile.portrait} />
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

import { BookOpen, Code2, Calendar } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { SectionShell } from '@/components/layout/SectionShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { SideReveal } from '@/components/ui/SideReveal';
import { useOptionalMotionPreference } from '@/context/MotionPreferenceContext';
import { useOptionalUniverseNavigation } from '@/context/UniverseNavigationContext';
import { experienceData } from '@/data/experience';
import { setupScopedScrollAnimation } from '@/motion/gsapConfig';
import { getSectionRoute } from '@/routes/routes';
import type { ExperienceItem } from '@/types/portfolio';
import { hasNonEmptyText } from '@/utils/dataGuards';
import { navigateToSection } from '@/utils/scrollNavigation';

export interface ExperienceSectionProps {
  entries?: readonly ExperienceItem[];
}

const INTERNSHIP_READINESS_DETAILS = [
  {
    icon: Calendar,
    label: 'Availability',
    value: '2026–2027 Engineering Internships',
    detail: 'Open to software, backend, and applied AI roles (Chennai / Remote).',
  },
  {
    icon: Code2,
    label: 'Engineering workflow',
    value: 'CI/CD, Containers & Type-Safe Codebases',
    detail: 'GitHub Actions, Docker, REST/WebSocket APIs, and automated testing.',
  },
  {
    icon: BookOpen,
    label: 'Core coursework',
    value: 'B.E. CSE (2024–2028)',
    detail: 'Data Structures & Algorithms, DBMS, Operating Systems, AI Foundations.',
  },
] as const;

export function ExperienceSection({
  entries = experienceData,
}: ExperienceSectionProps) {
  const { prefersReducedMotion } = useOptionalMotionPreference();
  const universeNav = useOptionalUniverseNavigation();
  const timelineScopeRef = useRef<HTMLDivElement>(null);
  const spineFillRef = useRef<HTMLDivElement>(null);

  const handleJump = (target: 'projects' | 'contact') => {
    navigateToSection(target, { universeNav, prefersReducedMotion });
  };

  const validEntries = entries.filter(
    (entry) =>
      hasNonEmptyText(entry.id) &&
      hasNonEmptyText(entry.role) &&
      hasNonEmptyText(entry.organization) &&
      hasNonEmptyText(entry.period),
  );

  useEffect(() => {
    const scope = timelineScopeRef.current;
    const spine = spineFillRef.current;
    if (validEntries.length === 0 || !scope || !spine) return;

    return setupScopedScrollAnimation(
      timelineScopeRef,
      prefersReducedMotion,
      ({ gsap }) => {
        gsap.fromTo(
          spine,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: scope,
              start: 'top 75%',
              end: 'bottom 65%',
              scrub: true,
            },
          },
        );
      },
      () => {
        spine.style.transform = 'scaleY(1)';
      },
    );
  }, [prefersReducedMotion, validEntries.length]);

  return (
    <SectionShell
      id="experience"
      title="Experience"
      description="Undergraduate background and internship readiness in software engineering and applied AI."
    >
      <div className="pointer-events-none">
        {validEntries.length === 0 ? (
          <div className="swiss-grid items-stretch gap-y-8 pointer-events-none">
            <SideReveal
              direction="left"
              className="col-span-4 md:col-span-8 lg:col-span-7 pointer-events-auto"
            >
              <GlassCard
                padding="lg"
                variant="strong"
                className="relative h-full p-6 sm:p-8 lg:p-9 flex flex-col justify-between gap-6 border-[var(--planet-experience)]/35"
              >
                <div className="space-y-5">
                  <p className="type-meta text-xs font-medium text-[var(--planet-experience)]">
                    Current status
                  </p>
                  <h3 className="type-h3 text-2xl sm:text-3xl text-[var(--text-primary)]">
                    No experience entries added yet.
                  </h3>
                  <p className="type-lead text-base sm:text-lg text-[var(--text-secondary)] max-w-[60ch]">
                    Third-year B.E. CSE undergraduate at Rajalakshmi Institute of Technology (2024–2028), actively seeking Software Engineering, Python Development, and AI/ML internship roles.
                  </p>

                  <div className="flex flex-wrap gap-2.5 pt-1">
                    {[
                      'Software Engineering Intern',
                      'Python & Backend Developer',
                      'Applied AI / ML Intern',
                    ].map((roleTag) => (
                      <span
                        key={roleTag}
                        className="rounded-[var(--radius-control)] border border-[var(--planet-experience)]/35 bg-[var(--planet-experience)]/10 px-3 py-1.5 font-mono text-xs text-[var(--planet-experience)]"
                      >
                        {roleTag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 border-t border-[var(--border-subtle)] pt-5">
                  <a
                    href={getSectionRoute('projects')}
                    onClick={(e) => {
                      e.preventDefault();
                      handleJump('projects');
                    }}
                    className="inline-flex min-h-[44px] items-center rounded-[var(--radius-control)] border border-[var(--planet-experience)]/50 bg-[var(--planet-experience)]/12 px-4 py-2.5 font-mono text-xs sm:text-sm font-medium text-[var(--text-primary)] hover:border-[var(--planet-experience)] hover:bg-[var(--planet-experience)]/20 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]"
                  >
                    Inspect Shipped Projects
                  </a>
                  <a
                    href={getSectionRoute('contact')}
                    onClick={(e) => {
                      e.preventDefault();
                      handleJump('contact');
                    }}
                    className="glass-surface inline-flex min-h-[44px] items-center rounded-[var(--radius-control)] px-4 py-2.5 font-mono text-xs sm:text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--planet-experience)] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]"
                  >
                    Connect for Roles
                  </a>
                </div>
              </GlassCard>
            </SideReveal>

            <SideReveal
              direction="right"
              className="col-span-4 md:col-span-8 lg:col-span-5 pointer-events-auto"
            >
              <GlassCard padding="lg" variant="default" className="h-full p-6 sm:p-8 space-y-5">
                <p className="type-meta text-xs font-medium text-[var(--planet-experience)]">
                  Internship readiness
                </p>

                <div className="space-y-4">
                  {INTERNSHIP_READINESS_DETAILS.map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <div
                        key={item.label}
                        onMouseEnter={() =>
                          universeNav?.pulsePlanet('experience', 0.65, item.value)
                        }
                        className="flex items-start gap-3.5 rounded-[var(--radius-control)] border border-[var(--border-subtle)]/80 bg-[var(--surface-elevated)]/70 p-4"
                      >
                        <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--planet-experience)]/35 bg-[var(--planet-experience)]/10 text-[var(--planet-experience)]">
                          <ItemIcon className="size-4" aria-hidden="true" />
                        </span>
                        <div className="space-y-0.5">
                          <p className="type-meta text-[11px] text-[var(--text-muted)]">
                            {item.label}
                          </p>
                          <p className="text-base font-semibold text-[var(--text-primary)]">
                            {item.value}
                          </p>
                          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                            {item.detail}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            </SideReveal>
          </div>
        ) : (
          <div ref={timelineScopeRef} className="pointer-events-none relative pl-5 md:pl-8">
            <div
              aria-hidden="true"
              className="absolute top-2 bottom-2 left-0 w-[2px] bg-[var(--border-subtle)]"
            >
              <div
                ref={spineFillRef}
                data-testid="experience-spine-fill"
                className="h-full w-full origin-top bg-[var(--planet-experience)]"
                style={{ transform: 'scaleY(1)' }}
              />
            </div>

            <ol className="space-y-6 m-0 p-0 list-none">
              {validEntries.map((entry) => {
                const validHighlights = entry.highlights.filter((item) =>
                  hasNonEmptyText(item),
                );

                return (
                  <li
                    key={entry.id}
                    onMouseEnter={() =>
                      universeNav?.pulsePlanet('experience', 0.72, entry.organization)
                    }
                    className="swiss-grid items-start pointer-events-none"
                  >
                    <SideReveal
                      direction="left"
                      className="col-span-4 md:col-span-3 space-y-1 md:pt-6 pointer-events-auto"
                    >
                      <p className="type-meta text-sm text-[var(--planet-experience)]">
                        {entry.period}
                      </p>
                      {hasNonEmptyText(entry.locationOrMode) && (
                        <p className="type-meta text-[var(--text-muted)]">
                          {entry.locationOrMode}
                        </p>
                      )}
                    </SideReveal>

                    <SideReveal
                      direction="right"
                      className="pointer-events-auto col-span-4 md:col-span-5 lg:col-span-9"
                    >
                      <GlassCard
                        as="div"
                        padding="lg"
                        className="w-full p-6 md:p-8 space-y-3 border-l-2 border-l-[var(--planet-experience)]"
                      >
                        <div>
                          <h3 className="type-h3 text-[var(--text-primary)]">
                            {entry.role}
                          </h3>
                          <p className="type-lead text-[var(--text-secondary)]">
                            {entry.organization}
                          </p>
                        </div>

                        {hasNonEmptyText(entry.description) && (
                          <p className="type-body text-sm md:text-base text-[var(--text-secondary)]">
                            {entry.description}
                          </p>
                        )}

                        {validHighlights.length > 0 && (
                          <ul className="space-y-1.5 pl-4 text-sm md:text-base text-[var(--text-secondary)] list-disc">
                            {validHighlights.map((highlight, idx) => (
                              <li key={`${entry.id}-hl-${idx}`}>{highlight}</li>
                            ))}
                          </ul>
                        )}
                      </GlassCard>
                    </SideReveal>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </div>
    </SectionShell>
  );
}

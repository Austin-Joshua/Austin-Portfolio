import { useEffect, useRef } from 'react';
import { SectionShell } from '@/components/layout/SectionShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { useOptionalMotionPreference } from '@/context/MotionPreferenceContext';
import { experienceData } from '@/data/experience';
import { setupScopedScrollAnimation } from '@/motion/gsapConfig';
import type { ExperienceItem } from '@/types/portfolio';
import { hasNonEmptyText } from '@/utils/dataGuards';

export interface ExperienceSectionProps {
  entries?: readonly ExperienceItem[];
}

export function ExperienceSection({
  entries = experienceData,
}: ExperienceSectionProps) {
  const { prefersReducedMotion } = useOptionalMotionPreference();
  const timelineScopeRef = useRef<HTMLDivElement>(null);
  const spineFillRef = useRef<HTMLDivElement>(null);

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
    if (validEntries.length === 0 || !scope || !spine) {
      return;
    }

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
      index="05"
      indexLabel="EXPERIENCE"
      title="Experience"
    >
      {validEntries.length === 0 ? (
        <GlassCard padding="lg" variant="elevated">
          <p className="type-meta uppercase text-[var(--text-muted)] mb-2">
            TIMELINE // STATUS
          </p>
          <p className="type-body text-[var(--text-secondary)] max-w-[68ch]">
            No experience entries added yet.
          </p>
        </GlassCard>
      ) : (
        <div ref={timelineScopeRef} className="relative pl-5 md:pl-8">
          {/* Swiss vertical timeline rail driven by GSAP ScrollTrigger */}
          <div
            aria-hidden="true"
            className="absolute top-2 bottom-2 left-0 w-[2px] bg-[var(--border-subtle)]"
          >
            <div
              ref={spineFillRef}
              data-testid="experience-spine-fill"
              className="h-full w-full origin-top bg-[var(--accent-primary)]"
              style={{ transform: 'scaleY(1)' }}
            />
          </div>

          <ol className="space-y-6 m-0 p-0 list-none">
            {validEntries.map((entry) => {
              const validHighlights = entry.highlights.filter((item) =>
                hasNonEmptyText(item),
              );

              return (
                <li key={entry.id} className="swiss-grid items-start">
                  <div className="col-span-4 md:col-span-3 space-y-1 md:pt-6">
                    <p className="type-meta text-[var(--accent-primary)]">
                      {entry.period}
                    </p>
                    {hasNonEmptyText(entry.locationOrMode) && (
                      <p className="type-meta text-[var(--text-muted)]">
                        {entry.locationOrMode}
                      </p>
                    )}
                  </div>

                  <GlassCard
                    as="div"
                    padding="lg"
                    className="col-span-4 md:col-span-5 lg:col-span-9 space-y-3 border-l-2 border-l-[var(--accent-primary)]"
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
                      <p className="type-body text-[var(--text-secondary)] max-w-[68ch]">
                        {entry.description}
                      </p>
                    )}

                    {validHighlights.length > 0 && (
                      <ul className="space-y-2 pt-1 pl-5 text-[var(--text-secondary)] list-disc">
                        {validHighlights.map((highlight, index) => (
                          <li
                            key={`${entry.id}-${index}`}
                            className="type-body text-sm md:text-base"
                          >
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    )}
                  </GlassCard>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </SectionShell>
  );
}

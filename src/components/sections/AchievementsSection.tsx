import { ArrowUpRight, Star } from 'lucide-react';
import { m } from 'motion/react';
import { SectionShell } from '@/components/layout/SectionShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { useOptionalMotionPreference } from '@/context/MotionPreferenceContext';
import { achievementsData } from '@/data/achievements';
import type { AchievementAccent, AchievementItem } from '@/types/portfolio';
import { hasNonEmptyText, isValidHttpUrl } from '@/utils/dataGuards';

export interface AchievementsSectionProps {
  items?: readonly AchievementItem[];
}

const ACCENT_COLOR_MAP: Record<AchievementAccent, string> = {
  gold: '#FACC15',
  copper: '#FB923C',
  primary: '#38BDF8',
};

const VERIFIED_CERTIFICATIONS = [
  { title: 'Python', issuer: 'Simplilearn' },
  { title: 'MongoDB & DBMS', issuer: 'Scaler' },
  { title: 'Docker Essentials', issuer: 'IBM' },
  { title: 'Introduction to AI', issuer: 'Infosys Springboard' },
  { title: 'ISRO Outreach Image Analysis Workshop', issuer: 'Participant' },
  { title: 'Overall Non-Technical Coordinator', issuer: 'TECHritz International Tech Fest' },
] as const;

export function AchievementsSection({
  items = achievementsData,
}: AchievementsSectionProps) {
  const { prefersReducedMotion } = useOptionalMotionPreference();
  const validItems = items.filter(
    (item) =>
      hasNonEmptyText(item.id) &&
      hasNonEmptyText(item.title) &&
      hasNonEmptyText(item.issuer) &&
      hasNonEmptyText(item.date),
  );

  return (
    <SectionShell
      id="achievements"
      index="06"
      indexLabel="ACHIEVEMENTS"
      title="Achievements"
      description="Verified hackathon award constellation and technical credentials from official project records and résumé."
    >
      <div className="pointer-events-none space-y-8 md:space-y-10">
        {validItems.length === 0 ? (
          <GlassCard padding="lg" variant="elevated" className="pointer-events-auto">
            <p className="type-meta uppercase text-[var(--text-muted)] mb-2">
              RECOGNITION // STATUS
            </p>
            <p className="type-body text-[var(--text-secondary)] max-w-[68ch]">
              No achievements added yet.
            </p>
          </GlassCard>
        ) : (
          <div className="pointer-events-none relative space-y-7">
            {/* Constellation connecting beam */}
            <svg
              aria-hidden="true"
              viewBox="0 0 900 56"
              preserveAspectRatio="none"
              className="hidden lg:block w-full h-12 opacity-65 pointer-events-none"
              fill="none"
            >
              <polyline
                points="140,28 450,12 760,36"
                stroke="#FACC15"
                strokeOpacity="0.45"
                strokeWidth="1.5"
                strokeDasharray="4 5"
              />
              <circle cx="140" cy="28" r="5" fill="#FACC15" />
              <circle cx="450" cy="12" r="5" fill="#FB923C" />
              <circle cx="760" cy="36" r="5" fill="#38BDF8" />
            </svg>

            {/* Milestone Constellation Star Cards */}
            <div className="pointer-events-none grid grid-cols-1 md:grid-cols-3 gap-6">
              {validItems.map((item, idx) => {
                const accent: AchievementAccent = item.accent ?? 'gold';
                const starColor = ACCENT_COLOR_MAP[accent];
                const hasVerificationLink = isValidHttpUrl(item.verificationUrl);
                const canUseInView = !prefersReducedMotion && typeof IntersectionObserver !== 'undefined';

                return (
                  <m.article
                    key={item.id}
                    initial={canUseInView ? { x: idx % 2 === 0 ? -24 : 24 } : false}
                    whileInView={canUseInView ? { x: 0 } : undefined}
                    viewport={{ once: true, amount: 0.12 }}
                    whileHover={prefersReducedMotion ? undefined : { y: -4 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="pointer-events-auto glass-surface relative flex flex-col justify-between gap-5 p-6 md:p-8 transition-colors duration-200 hover:border-[var(--planet-achievements)]/60"
                    style={{
                      borderTop: `2px solid ${starColor}`,
                    }}
                  >
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="inline-flex items-center gap-1.5 type-meta text-xs sm:text-sm font-semibold"
                          style={{ color: starColor }}
                        >
                          <Star className="size-4 fill-current" aria-hidden="true" />
                          <span>{item.date}</span>
                        </span>
                      </div>

                      <h3 className="type-h3 text-[var(--text-primary)]">
                        {item.title}
                      </h3>

                      <p className="type-meta text-xs sm:text-sm text-[var(--text-muted)]">
                        {item.issuer}
                      </p>

                      {hasNonEmptyText(item.context) && (
                        <p className="type-body text-sm md:text-base text-[var(--text-secondary)]">
                          {item.context}
                        </p>
                      )}
                    </div>

                    {hasVerificationLink && item.verificationUrl && (
                      <a
                        href={item.verificationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[44px] items-center gap-1.5 self-start font-mono text-xs sm:text-sm font-medium text-[var(--text-primary)] hover:text-[var(--planet-achievements)] focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]"
                      >
                        <span>Verify Repository</span>
                        <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
                      </a>
                    )}
                  </m.article>
                );
              })}
            </div>
          </div>
        )}

        {/* Verified Credentials & Campus Leadership Orbit Strip */}
        <div className="pointer-events-auto glass-surface p-6 md:p-8 space-y-5">
          <p className="type-meta uppercase tracking-[0.14em] text-[var(--planet-achievements)]">
            CERTIFICATIONS &amp; CAMPUS MILESTONES
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {VERIFIED_CERTIFICATIONS.map((cert) => (
              <div
                key={cert.title}
                className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--surface-card)]/80 px-4 py-3.5 transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-[var(--planet-achievements)]/45"
              >
                <p className="text-base font-medium text-[var(--text-primary)]">
                  {cert.title}
                </p>
                <p className="type-meta text-xs text-[var(--text-muted)] mt-1">
                  {cert.issuer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

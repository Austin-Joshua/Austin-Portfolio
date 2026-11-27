import { ArrowUpRight, Star } from 'lucide-react';
import { SectionShell } from '@/components/layout/SectionShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { SideReveal } from '@/components/ui/SideReveal';
import { useOptionalUniverseNavigation } from '@/context/UniverseNavigationContext';
import { achievementsData } from '@/data/achievements';
import type { AchievementAccent, AchievementItem } from '@/types/portfolio';
import { hasNonEmptyText, isValidHttpUrl } from '@/utils/dataGuards';
import { playClick } from '@/utils/soundEffects';

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
  const universeNav = useOptionalUniverseNavigation();
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
      title="Achievements"
      description="Verified hackathon honors, technical certifications, and event coordination roles."
    >
      <div className="pointer-events-none space-y-8 md:space-y-10">
        {validItems.length === 0 ? (
          <GlassCard padding="lg" variant="elevated" className="pointer-events-auto">
            <p className="type-meta text-xs text-[var(--text-muted)] mb-2">
              Recognition
            </p>
            <p className="type-body text-[var(--text-secondary)] max-w-[68ch]">
              No achievements added yet.
            </p>
          </GlassCard>
        ) : (
          <div className="pointer-events-none grid grid-cols-1 md:grid-cols-3 gap-6">
            {validItems.map((item, idx) => {
              const accent: AchievementAccent = item.accent ?? 'gold';
              const starColor = ACCENT_COLOR_MAP[accent];
              const hasVerificationLink = isValidHttpUrl(item.verificationUrl);

              return (
                <SideReveal
                  key={item.id}
                  direction={idx % 2 === 0 ? 'left' : 'right'}
                  className="pointer-events-auto flex"
                >
                  <article
                    className={[
                      'glass-surface group relative flex w-full flex-col justify-between gap-5 p-6 md:p-8 transition-[border-color,background-color] duration-150 hover:border-[var(--planet-achievements)]/60',
                      hasVerificationLink ? 'cursor-pointer hover:bg-[var(--surface-card)]/90' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    style={{
                      borderTop: `2px solid ${starColor}`,
                    }}
                  >
                    <div className="space-y-3">
                      <span
                        className="inline-flex items-center gap-1.5 type-meta text-xs font-semibold"
                        style={{ color: starColor }}
                      >
                        <Star className="size-4 fill-current" aria-hidden="true" />
                        <span>{item.date}</span>
                      </span>

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
                        onClick={() => {
                          playClick();
                          universeNav?.pulsePlanet('achievements', 1.0, item.title);
                        }}
                        className="inline-flex min-h-[44px] items-center gap-1.5 self-start font-mono text-xs sm:text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--planet-achievements)] hover:text-[var(--planet-achievements)] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px] after:content-[''] after:absolute after:inset-0 after:z-[1]"
                      >
                        <span>Verify Repository</span>
                        <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
                      </a>
                    )}
                  </article>
                </SideReveal>
              );
            })}
          </div>
        )}

        <SideReveal
          direction="left"
          className="pointer-events-auto glass-surface p-6 md:p-8 space-y-5"
        >
          <p className="type-meta text-xs font-medium text-[var(--planet-achievements)]">
            Certifications &amp; workshops
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {VERIFIED_CERTIFICATIONS.map((cert) => (
              <div
                key={cert.title}
                className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--surface-card)]/80 px-4 py-3.5 transition-colors duration-150 hover:border-[var(--planet-achievements)]/45"
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
        </SideReveal>
      </div>
    </SectionShell>
  );
}

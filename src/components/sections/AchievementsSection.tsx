import { ArrowUpRight } from 'lucide-react';
import { SectionShell } from '@/components/layout/SectionShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { achievementsData } from '@/data/achievements';
import type { AchievementAccent, AchievementItem } from '@/types/portfolio';
import { hasNonEmptyText, isValidHttpUrl } from '@/utils/dataGuards';

export interface AchievementsSectionProps {
  items?: readonly AchievementItem[];
}

const ACCENT_BORDER_MAP: Record<AchievementAccent, string> = {
  gold: 'border-t-2 border-t-[var(--accent-gold)]',
  copper: 'border-t-2 border-t-[var(--accent-copper)]',
  primary: 'border-t-2 border-t-[var(--accent-primary)]',
};

const ACCENT_TEXT_MAP: Record<AchievementAccent, string> = {
  gold: 'text-[var(--accent-gold)]',
  copper: 'text-[var(--accent-copper)]',
  primary: 'text-[var(--accent-primary)]',
};

export function AchievementsSection({
  items = achievementsData,
}: AchievementsSectionProps) {
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
    >
      {validItems.length === 0 ? (
        <GlassCard padding="lg" variant="elevated">
          <p className="type-meta uppercase text-[var(--text-muted)] mb-2">
            RECOGNITION // STATUS
          </p>
          <p className="type-body text-[var(--text-secondary)] max-w-[68ch]">
            No achievements added yet.
          </p>
        </GlassCard>
      ) : (
        <div className="swiss-grid">
          {validItems.map((item) => {
            const accent: AchievementAccent = item.accent ?? 'gold';
            const hasVerificationLink = isValidHttpUrl(item.verificationUrl);

            return (
              <GlassCard
                key={item.id}
                as="article"
                padding="md"
                className={`col-span-4 md:col-span-4 lg:col-span-4 flex flex-col justify-between gap-4 ${ACCENT_BORDER_MAP[accent]}`}
              >
                <div className="space-y-2">
                  <p className={`type-meta ${ACCENT_TEXT_MAP[accent]}`}>
                    {item.date}
                  </p>
                  <h3 className="type-h3 text-[var(--text-primary)]">
                    {item.title}
                  </h3>
                  <p className="type-meta text-[var(--text-muted)]">
                    {item.issuer}
                  </p>
                  {hasNonEmptyText(item.context) && (
                    <p className="type-body text-sm text-[var(--text-secondary)] pt-1">
                      {item.context}
                    </p>
                  )}
                </div>

                {hasVerificationLink && item.verificationUrl && (
                  <a
                    href={item.verificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={[
                      'inline-flex min-h-[44px] items-center gap-1.5 self-start',
                      'font-mono text-xs font-medium text-[var(--text-primary)]',
                      'hover:text-[var(--accent-primary)]',
                      'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
                    ].join(' ')}
                  >
                    <span>Verify Credential</span>
                    <ArrowUpRight className="size-3.5 shrink-0" aria-hidden="true" />
                  </a>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}
    </SectionShell>
  );
}

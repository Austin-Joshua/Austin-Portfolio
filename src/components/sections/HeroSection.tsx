import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import type { MouseEvent } from 'react';
import { SectionShell } from '@/components/layout/SectionShell';
import { useMotionPreference } from '@/context/MotionPreferenceContext';
import { profileData } from '@/data/profile';
import type { ProfileData } from '@/types/portfolio';
import { hasNonEmptyText, isValidLocalOrHttpAssetUrl } from '@/utils/dataGuards';
import { scrollToSection } from '@/utils/scrollNavigation';

export interface HeroSectionProps {
  profile?: ProfileData;
}

export function HeroSection({ profile = profileData }: HeroSectionProps) {
  const { prefersReducedMotion } = useMotionPreference();

  const handleJump = (event: MouseEvent<HTMLAnchorElement>, targetId: string) => {
    event.preventDefault();
    scrollToSection(targetId, {
      prefersReducedMotion,
      focusTarget: false,
      updateHash: true,
    });
  };

  const hasRole = hasNonEmptyText(profile.roleLabel);
  const hasTagline = hasNonEmptyText(profile.heroTagline);
  const hasResume =
    profile.resume !== null && isValidLocalOrHttpAssetUrl(profile.resume.url);

  return (
    <SectionShell
      id="hero"
      index="01"
      indexLabel="HERO"
      title={profile.name}
      headingLevel={1}
      withDivider={false}
      className="scrim-hero-gradient min-h-[calc(100dvh-5rem)] flex flex-col justify-center pt-24 pb-16 md:pt-32 md:pb-24"
    >
      <div className="swiss-grid">
        <div className="col-span-4 md:col-span-7 lg:col-span-8 space-y-6">
          {hasRole && profile.roleLabel && (
            <p className="type-meta uppercase text-[var(--accent-primary)]">
              {profile.roleLabel}
            </p>
          )}

          {hasTagline && profile.heroTagline && (
            <p className="type-lead text-[var(--text-secondary)] max-w-[60ch]">
              {profile.heroTagline}
            </p>
          )}

          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 pt-2">
            <a
              href="#projects"
              onClick={(event) => handleJump(event, 'projects')}
              className={[
                'inline-flex min-h-[44px] sm:min-h-[48px] items-center justify-center gap-2',
                'px-6 py-3 rounded-[var(--radius-control)]',
                'bg-[var(--accent-primary)] text-[var(--text-on-accent)] font-semibold text-base',
                'shadow-[var(--shadow-glass)] transition-[filter,box-shadow] duration-[var(--transition-theme)]',
                'hover:brightness-110',
                'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
              ].join(' ')}
            >
              <span>View Projects</span>
              <ArrowDownRight className="size-4 shrink-0" aria-hidden="true" />
            </a>

            <a
              href="#contact"
              onClick={(event) => handleJump(event, 'contact')}
              className={[
                'glass-surface inline-flex min-h-[44px] sm:min-h-[48px] items-center justify-center gap-2',
                'px-6 py-3 rounded-[var(--radius-control)]',
                'text-[var(--text-primary)] font-medium text-base',
                'transition-[background-color,border-color] duration-[var(--transition-theme)]',
                'hover:border-[var(--accent-primary)] hover:bg-[var(--surface-card)]',
                'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
              ].join(' ')}
            >
              <span>Get in Touch</span>
            </a>

            {hasResume && profile.resume && (
              <a
                href={profile.resume.url}
                target="_blank"
                rel="noopener noreferrer"
                className={[
                  'inline-flex min-h-[44px] sm:min-h-[48px] items-center justify-center gap-1.5',
                  'px-4 py-3 rounded-[var(--radius-control)]',
                  'font-mono text-sm font-medium text-[var(--text-secondary)]',
                  'border border-transparent hover:border-[var(--border-glass)] hover:text-[var(--text-primary)]',
                  'transition-[border-color,color] duration-[var(--transition-theme)]',
                  'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
                ].join(' ')}
              >
                <span>{profile.resume.label}</span>
                {hasNonEmptyText(profile.resume.sizeLabel) && (
                  <span className="text-xs text-[var(--text-muted)]">
                    ({profile.resume.sizeLabel})
                  </span>
                )}
                <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

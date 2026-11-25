import {
  Award,
  Briefcase,
  Cpu,
  FolderGit2,
  Mail,
  User,
  type LucideIcon,
} from 'lucide-react';
import type { MouseEvent, RefObject } from 'react';
import { DesktopSectionRail } from '@/components/layout/DesktopSectionRail';
import { ScrollProgressBar } from '@/components/layout/ScrollProgressBar';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useMotionPreference } from '@/context/MotionPreferenceContext';
import { PRIMARY_NAV_SECTIONS, type SectionId } from '@/data/sections';
import { useActiveSection } from '@/hooks/useActiveSection';
import { scrollToSection } from '@/utils/scrollNavigation';

export interface ResumeAssetConfig {
  url: string;
  label?: string;
}

export interface NavbarProps {
  resumeAsset?: ResumeAssetConfig | null;
  scrollProgressRef?: RefObject<number>;
}

const SECTION_ICONS: Record<Exclude<SectionId, 'hero'>, LucideIcon> = {
  about: User,
  skills: Cpu,
  projects: FolderGit2,
  experience: Briefcase,
  achievements: Award,
  contact: Mail,
};

export function Navbar({
  resumeAsset = null,
  scrollProgressRef,
}: NavbarProps) {
  const activeSection = useActiveSection();
  const { prefersReducedMotion } = useMotionPreference();

  const handleAnchorClick = (
    event: MouseEvent<HTMLAnchorElement>,
    targetId: SectionId,
  ) => {
    event.preventDefault();
    scrollToSection(targetId, {
      prefersReducedMotion,
      focusTarget: false,
      updateHash: true,
    });
  };

  const hasValidResume = Boolean(resumeAsset?.url && resumeAsset.url.trim().length > 0);
  const resumeLabel = resumeAsset?.label?.trim() || 'Résumé';

  return (
    <>
      <header className="fixed inset-x-0 top-3 z-40 pointer-events-none">
        <div className="container-portfolio">
          <div className="relative glass-surface pointer-events-auto flex min-h-[56px] md:min-h-[64px] items-center justify-between gap-3 px-3 md:px-4 lg:px-6">
            <a
              href="#hero"
              onClick={(event) => handleAnchorClick(event, 'hero')}
              aria-label="AJ // — Back to Hero"
              className={[
                'inline-flex min-h-[44px] min-w-[44px] items-center px-2 shrink-0',
                'font-display text-base md:text-lg font-bold tracking-tight text-[var(--text-primary)]',
                'rounded-[var(--radius-control)]',
                'transition-colors duration-[var(--transition-theme)] hover:text-[var(--accent-primary)]',
                'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
              ].join(' ')}
            >
              <span>AJ //</span>
            </a>

            <nav aria-label="Primary" className="hidden md:flex items-center gap-1 lg:gap-2">
              {PRIMARY_NAV_SECTIONS.map((section) => {
                const isActive = activeSection === section.id;

                return (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    onClick={(event) => handleAnchorClick(event, section.id)}
                    aria-current={isActive ? 'location' : undefined}
                    className={[
                      'relative inline-flex min-h-[44px] items-center gap-1.5 px-2 lg:px-3 py-2',
                      'text-xs lg:text-sm whitespace-nowrap rounded-[var(--radius-control)]',
                      'transition-colors duration-[var(--transition-theme)]',
                      'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
                      isActive
                        ? 'font-semibold text-[var(--text-primary)]'
                        : 'font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                    ].join(' ')}
                  >
                    <span
                      aria-hidden="true"
                      className={[
                        'size-1.5 rounded-full transition-opacity duration-[var(--transition-theme)]',
                        isActive
                          ? 'bg-[var(--accent-primary)] opacity-100'
                          : 'bg-transparent opacity-0',
                      ].join(' ')}
                    />
                    <span>{section.label}</span>
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-2 bottom-1.5 h-[2px] bg-[var(--accent-primary)]"
                      />
                    )}
                  </a>
                );
              })}
            </nav>

            <div className="flex items-center gap-2 shrink-0">
              {hasValidResume && resumeAsset && (
                <a
                  href={resumeAsset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={[
                    'hidden md:inline-flex min-h-[44px] items-center px-3 py-2',
                    'font-mono text-xs font-medium text-[var(--text-secondary)]',
                    'border border-[var(--border-subtle)] rounded-[var(--radius-control)]',
                    'transition-colors duration-[var(--transition-theme)]',
                    'hover:border-[var(--accent-primary)] hover:text-[var(--text-primary)]',
                    'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
                  ].join(' ')}
                >
                  {resumeLabel}
                </a>
              )}
              <ThemeToggle />
            </div>
            <ScrollProgressBar scrollProgressRef={scrollProgressRef} />
          </div>
        </div>
      </header>

      <DesktopSectionRail
        activeSection={activeSection}
        onSectionSelect={handleAnchorClick}
      />

      <nav
        aria-label="Mobile section navigation"
        className={[
          'fixed inset-x-0 bottom-0 z-40 md:hidden',
          'glass-surface-strong rounded-none border-x-0 border-b-0 border-t border-[var(--border-glass)]',
        ].join(' ')}
        style={{
          paddingBottom: 'max(0.25rem, env(safe-area-inset-bottom))',
        }}
      >
        <div className="flex items-center justify-between sm:justify-around gap-1 overflow-x-auto px-2 py-2">
          {PRIMARY_NAV_SECTIONS.map((section) => {
            const isActive = activeSection === section.id;
            const Icon = SECTION_ICONS[section.id as Exclude<SectionId, 'hero'>];

            return (
              <a
                key={section.id}
                href={`#${section.id}`}
                onClick={(event) => handleAnchorClick(event, section.id)}
                aria-current={isActive ? 'location' : undefined}
                className={[
                  'relative inline-flex min-h-[44px] min-w-[44px] shrink-0 flex-col items-center justify-center gap-1',
                  'px-2.5 py-1.5 rounded-[var(--radius-control)]',
                  'transition-colors duration-[var(--transition-theme)]',
                  'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[2px]',
                  isActive
                    ? 'bg-[var(--surface-card)] text-[var(--accent-primary)] font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                ].join(' ')}
              >
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-2 top-0 h-[2px] bg-[var(--accent-primary)]"
                  />
                )}
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                <span className="text-[11px] leading-none whitespace-nowrap">
                  {section.label}
                </span>
              </a>
            );
          })}
        </div>
      </nav>
    </>
  );
}

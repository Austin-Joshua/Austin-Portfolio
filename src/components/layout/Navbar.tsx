import {
  Award,
  Briefcase,
  Cpu,
  Download,
  FolderGit2,
  Mail,
  User,
  type LucideIcon,
} from 'lucide-react';
import type { MouseEvent, RefObject } from 'react';
import { DesktopSectionRail } from '@/components/layout/DesktopSectionRail';
import { ScrollProgressBar } from '@/components/layout/ScrollProgressBar';
import { useMotionPreference } from '@/context/MotionPreferenceContext';
import { useOptionalUniverseNavigation } from '@/context/UniverseNavigationContext';
import { PRIMARY_NAV_SECTIONS, type SectionId } from '@/data/sections';
import { useActiveSection } from '@/hooks/useActiveSection';
import { SOLAR_SYSTEM_PLANETS } from '@/three/universeConfig';
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

function getPlanetAccentColor(sectionId: Exclude<SectionId, 'hero'>): string {
  return (
    SOLAR_SYSTEM_PLANETS.find((planet) => planet.sectionId === sectionId)?.color ??
    'var(--accent-primary)'
  );
}

export function Navbar({
  resumeAsset = null,
  scrollProgressRef,
}: NavbarProps) {
  const fallbackActiveSection = useActiveSection();
  const universeNav = useOptionalUniverseNavigation();
  const activeSection = universeNav?.activeSection ?? fallbackActiveSection;
  const { prefersReducedMotion } = useMotionPreference();

  const handleAnchorClick = (
    event: MouseEvent<HTMLAnchorElement>,
    targetId: SectionId,
  ) => {
    event.preventDefault();
    if (universeNav) {
      universeNav.navigateToPlanet(targetId === 'hero' ? 'sun' : targetId);
      return;
    }

    scrollToSection(targetId, {
      prefersReducedMotion,
      focusTarget: false,
      updateHash: true,
    });
  };

  const hasValidResume = Boolean(resumeAsset?.url && resumeAsset.url.trim().length > 0);
  const resumeLabel = resumeAsset?.label?.trim() || 'Download Résumé (PDF)';

  return (
    <>
      <header className="relative z-40 pointer-events-none pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 md:fixed md:inset-x-0 md:top-3 md:pt-0 md:pb-0">
        <div className="container-portfolio">
          <div className="relative glass-surface pointer-events-auto flex flex-nowrap w-full min-h-[52px] md:min-h-[64px] items-center justify-between gap-x-3 px-3 py-1 md:py-0 md:px-4 lg:px-6 max-w-full">
            {/* Canonical circular metallic AJ emblem brand link */}
            <a
              href="#hero"
              onClick={(event) => handleAnchorClick(event, 'hero')}
              className="inline-flex min-h-[44px] min-w-[44px] items-center gap-2.5 shrink-0 rounded-full p-1 transition-transform duration-200 hover:scale-105 focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]"
            >
              <img
                src="/assets/brand/aj-emblem.png"
                alt="AJ Cosmic Emblem"
                width={36}
                height={36}
                className="h-8 w-8 md:h-9 md:w-9 rounded-full object-contain"
              />
              <span className="sr-only">Austin Joshua — Return to Sun Overview</span>
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--text-secondary)] hidden sm:inline">
                Cosmic Universe
              </span>
            </a>

            <nav aria-label="Primary" className="hidden md:flex flex-wrap items-center gap-1 lg:gap-2 min-w-0">
              {PRIMARY_NAV_SECTIONS.map((section) => {
                const isActive = activeSection === section.id;
                const planetColor = getPlanetAccentColor(
                  section.id as Exclude<SectionId, 'hero'>,
                );

                return (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    onClick={(event) => handleAnchorClick(event, section.id)}
                    aria-current={isActive ? 'location' : undefined}
                    className={[
                      'relative inline-flex min-h-[44px] items-center gap-1.5 px-2 lg:px-3 py-2',
                      'text-xs lg:text-sm whitespace-nowrap rounded-[var(--radius-control)]',
                      'transition-colors duration-200',
                      'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
                      isActive
                        ? 'font-semibold text-[var(--text-primary)]'
                        : 'font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                    ].join(' ')}
                  >
                    <span
                      aria-hidden="true"
                      className="size-2 rounded-full transition-transform duration-200"
                      style={{
                        backgroundColor: planetColor,
                        opacity: isActive ? 1 : 0.55,
                        boxShadow: isActive ? `0 0 8px ${planetColor}` : 'none',
                      }}
                    />
                    <span>{section.label}</span>
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-2 bottom-1.5 h-[2px]"
                        style={{ backgroundColor: planetColor }}
                      />
                    )}
                  </a>
                );
              })}
            </nav>

            <div className="flex items-center gap-1 shrink-0 ml-auto md:ml-0">
              {hasValidResume && resumeAsset && (
                <a
                  href={resumeAsset.url}
                  download="Austin_Joshua_Resume.pdf"
                  aria-label={resumeLabel}
                  title={resumeLabel}
                  className={[
                    'inline-flex min-h-[44px] min-w-[44px] items-center justify-center',
                    'rounded-[var(--radius-control)]',
                    'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5',
                    'transition-[background-color,color] duration-200',
                    'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
                  ].join(' ')}
                >
                  <Download className="size-5 shrink-0" aria-hidden="true" />
                </a>
              )}
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
          'fixed inset-x-0 bottom-0 z-40 md:hidden pointer-events-auto',
          'glass-surface-strong rounded-none border-x-0 border-b-0 border-t border-[var(--border-glass)]',
        ].join(' ')}
        style={{
          paddingBottom: 'max(0.25rem, env(safe-area-inset-bottom))',
        }}
      >
        <div className="grid grid-cols-6 gap-0.5 px-1 py-1.5">
          {PRIMARY_NAV_SECTIONS.map((section) => {
            const isActive = activeSection === section.id;
            const Icon = SECTION_ICONS[section.id as Exclude<SectionId, 'hero'>];
            const planetColor = getPlanetAccentColor(
              section.id as Exclude<SectionId, 'hero'>,
            );

            return (
              <a
                key={section.id}
                href={`#${section.id}`}
                onClick={(event) => handleAnchorClick(event, section.id)}
                aria-current={isActive ? 'location' : undefined}
                className={[
                  'relative inline-flex min-h-[44px] min-w-0 w-full flex-col items-center justify-center gap-1',
                  'px-0.5 py-1.5 rounded-[var(--radius-control)]',
                  'font-mono text-[10px] leading-tight tracking-tight',
                  'transition-colors duration-200',
                  'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[2px]',
                  isActive
                    ? 'font-semibold bg-white/10 text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                ].join(' ')}
              >
                <Icon
                  className="size-4 shrink-0"
                  aria-hidden="true"
                  style={isActive ? { color: planetColor } : undefined}
                />
                <span className="truncate max-w-full">{section.label}</span>
              </a>
            );
          })}
        </div>
      </nav>
    </>
  );
}

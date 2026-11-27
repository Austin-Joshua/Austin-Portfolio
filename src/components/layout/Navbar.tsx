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
import { SoundToggle } from '@/components/ui/SoundToggle';
import { useMotionPreference } from '@/context/MotionPreferenceContext';
import { useOptionalUniverseNavigation } from '@/context/UniverseNavigationContext';
import { PRIMARY_NAV_SECTIONS, type SectionId } from '@/data/sections';
import { useActiveSection } from '@/hooks/useActiveSection';
import { getSectionRoute } from '@/routes/routes';
import { SOLAR_SYSTEM_PLANETS } from '@/three/universeConfig';
import { navigateToSection } from '@/utils/scrollNavigation';

export interface NavbarProps {
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

export function Navbar({ scrollProgressRef }: NavbarProps) {
  const fallbackActiveSection = useActiveSection();
  const universeNav = useOptionalUniverseNavigation();
  const activeSection = universeNav?.activeSection ?? fallbackActiveSection;
  const { prefersReducedMotion } = useMotionPreference();

  const handleAnchorClick = (
    event: MouseEvent<HTMLAnchorElement>,
    targetId: SectionId,
  ) => {
    event.preventDefault();
    navigateToSection(targetId, { universeNav, prefersReducedMotion });
  };

  return (
    <>
      <header className="relative z-40 pointer-events-none pt-[max(0.75rem,env(safe-area-inset-top))] pb-1 md:fixed md:inset-x-0 md:top-3 md:pt-0 md:pb-0">
        <div className="container-portfolio">
          {/* Desktop sticky pill (AJ Logo ONLY + minimal section links + sound icon toggle) */}
          <div className="hidden md:flex relative glass-surface pointer-events-auto flex-nowrap w-full min-h-[58px] items-center justify-between gap-x-4 px-5 lg:px-7">
            <a
              href={getSectionRoute('hero')}
              onClick={(event) => handleAnchorClick(event, 'hero')}
              aria-label="Austin Joshua — Return to Sun Overview"
              className="group inline-flex min-h-[44px] min-w-[44px] items-center justify-center shrink-0 rounded-full p-1 transition-transform duration-200 hover:scale-110 active:scale-95 focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]"
            >
              <img
                src="/assets/brand/aj-emblem.png"
                alt="AJ"
                width={38}
                height={38}
                className="h-9 w-9 rounded-full object-contain drop-shadow-[0_0_10px_rgba(255,179,71,0.22)] transition-[filter] duration-200 group-hover:drop-shadow-[0_0_16px_rgba(255,179,71,0.45)]"
              />
            </a>

            <nav aria-label="Primary" className="flex flex-wrap items-center gap-1 lg:gap-2 min-w-0">
              {PRIMARY_NAV_SECTIONS.map((section) => {
                const isActive = activeSection === section.id;
                const planetColor = getPlanetAccentColor(
                  section.id as Exclude<SectionId, 'hero'>,
                );

                return (
                  <a
                    key={section.id}
                    href={section.route}
                    onClick={(event) => handleAnchorClick(event, section.id)}
                    aria-current={isActive ? 'location' : undefined}
                    className={[
                      'group relative inline-flex min-h-[44px] items-center gap-1.5 px-2.5 lg:px-3.5 py-2',
                      'text-xs lg:text-sm whitespace-nowrap rounded-[var(--radius-control)]',
                      'transition-[color,transform] duration-200 hover:-translate-y-0.5 active:translate-y-0',
                      'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
                      isActive
                        ? 'font-semibold text-[var(--text-primary)]'
                        : 'font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                    ].join(' ')}
                  >
                    <span
                      aria-hidden="true"
                      className="size-2 rounded-full transition-opacity duration-150"
                      style={{
                        backgroundColor: planetColor,
                        opacity: isActive ? 1 : 0.65,
                      }}
                    />
                    <span>{section.label}</span>
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-2.5 bottom-1.5 h-[2px] rounded-full"
                        style={{ backgroundColor: planetColor }}
                      />
                    )}
                  </a>
                );
              })}
            </nav>

            <div className="flex items-center shrink-0">
              <SoundToggle />
            </div>

            <ScrollProgressBar scrollProgressRef={scrollProgressRef} />
          </div>

          {/* Mobile minimal floating AJ emblem badge + Sound toggle */}
          <div className="flex md:hidden items-center justify-between">
            <a
              href={getSectionRoute('hero')}
              onClick={(event) => handleAnchorClick(event, 'hero')}
              aria-label="Austin Joshua — Return to Sun Overview"
              className="glass-surface pointer-events-auto inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-1.5 transition-transform duration-200 active:scale-95 focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]"
            >
              <img
                src="/assets/brand/aj-emblem.png"
                alt="AJ"
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-contain"
              />
            </a>

            <SoundToggle />
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
                href={section.route}
                onClick={(event) => handleAnchorClick(event, section.id)}
                aria-current={isActive ? 'location' : undefined}
                className={[
                  'relative inline-flex min-h-[44px] min-w-0 w-full flex-col items-center justify-center gap-1',
                  'px-0.5 py-1.5 rounded-[var(--radius-control)]',
                  'font-mono text-[10px] leading-tight tracking-tight',
                  'transition-colors duration-200 active:scale-95',
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

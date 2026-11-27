import { ArrowUpRight } from 'lucide-react';
import { LayoutGroup, m } from 'motion/react';
import { useId, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { SectionShell } from '@/components/layout/SectionShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { LiveAnnouncer } from '@/components/ui/LiveAnnouncer';
import { SideReveal } from '@/components/ui/SideReveal';
import { useOptionalMotionPreference } from '@/context/MotionPreferenceContext';
import { useOptionalUniverseNavigation } from '@/context/UniverseNavigationContext';
import { projectsData } from '@/data/projects';
import { skillsData } from '@/data/skills';
import { FILTER_LAYOUT_TRANSITION, REDUCED_TRANSITION } from '@/motion/variants';
import { getSectionRoute } from '@/routes/routes';
import type { ProjectItem, SkillCategory, SkillItem } from '@/types/portfolio';
import { hasNonEmptyText } from '@/utils/dataGuards';
import { navigateToSection } from '@/utils/scrollNavigation';
import { getProjectsForSkill } from '@/utils/skillCrossRef';
import { playClick } from '@/utils/soundEffects';

export interface SkillsSectionProps {
  categories?: readonly SkillCategory[];
  projects?: readonly ProjectItem[];
}

const ALL_TAB_ID = 'all';

const CLUSTER_ACCENTS = [
  '#818CF8',
  '#38BDF8',
  '#C084FC',
  '#2DD4BF',
] as const;

export function SkillsSection({
  categories = skillsData,
  projects = projectsData,
}: SkillsSectionProps) {
  const [activeTabId, setActiveTabId] = useState<string>(ALL_TAB_ID);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [hoveredSkillId, setHoveredSkillId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState<string>('');
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const baseId = useId();
  const { prefersReducedMotion } = useOptionalMotionPreference();
  const universeNav = useOptionalUniverseNavigation();

  const validCategories = categories.filter(
    (category) => hasNonEmptyText(category.id) && hasNonEmptyText(category.label),
  );

  if (validCategories.length === 0) {
    return (
      <SectionShell id="skills" title="Skills">
        <GlassCard padding="lg" variant="elevated" className="pointer-events-auto">
          <p className="type-meta text-xs text-[var(--text-muted)] mb-2">
            Skills
          </p>
          <p className="type-body text-[var(--text-secondary)] max-w-[68ch]">
            No skill categories added yet.
          </p>
        </GlassCard>
      </SectionShell>
    );
  }

  const tabs = [
    { id: ALL_TAB_ID, label: 'All Molecules' },
    ...validCategories.map((c) => ({ id: c.id, label: c.label })),
  ];

  const resolvedActiveTab = tabs.some((tab) => tab.id === activeTabId)
    ? activeTabId
    : ALL_TAB_ID;

  const visibleCategories =
    resolvedActiveTab === ALL_TAB_ID
      ? validCategories
      : validCategories.filter((category) => category.id === resolvedActiveTab);

  const allSkills: SkillItem[] = validCategories.flatMap(
    (category) => category.items,
  );
  const activeInspectId = hoveredSkillId ?? selectedSkillId;
  const selectedSkill =
    allSkills.find((skill) => skill.id === selectedSkillId) ?? null;
  const inspectedSkill =
    allSkills.find((skill) => skill.id === activeInspectId) ?? null;
  const matchingProjects = selectedSkill
    ? getProjectsForSkill(selectedSkill, projects)
    : [];
  const inspectedProjects = inspectedSkill
    ? getProjectsForSkill(inspectedSkill, projects)
    : [];

  const handleTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let nextIndex: number | null = null;

    if (event.key === 'ArrowRight') {
      nextIndex = (index + 1) % tabs.length;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = tabs.length - 1;
    }

    if (nextIndex === null) return;

    event.preventDefault();
    const targetTab = tabs[nextIndex];
    if (targetTab) {
      playClick();
      setActiveTabId(targetTab.id);
      tabRefs.current[nextIndex]?.focus();
    }
  };

  const handleToggleSkill = (skill: SkillItem) => {
    playClick();
    const nextId = selectedSkillId === skill.id ? null : skill.id;
    setSelectedSkillId(nextId);
    universeNav?.pulsePlanet('skills', 1.0, nextId ? skill.name : '');

    if (!nextId) {
      setAnnouncement(`Cleared ${skill.name} project filter.`);
      return;
    }

    const matches = getProjectsForSkill(skill, projects);
    setAnnouncement(
      matches.length > 0
        ? `${skill.name} linked to ${matches.length} ${matches.length === 1 ? 'project' : 'projects'}.`
        : `${skill.name} selected; no linked projects yet.`,
    );
  };

  const handleJumpToProjects = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    navigateToSection('projects', { universeNav, prefersReducedMotion });
  };

  const tabPanelId = `${baseId}-panel`;
  const activeTabDomId = `${baseId}-tab-${resolvedActiveTab}`;
  const indicatorTransition = prefersReducedMotion
    ? REDUCED_TRANSITION
    : FILTER_LAYOUT_TRANSITION;

  return (
    <SectionShell
      id="skills"
      title="Skills"
      description="Technologies organized by domain. Select any skill to inspect its matching projects."
    >
      <div className="pointer-events-none space-y-8">
        <LayoutGroup id={`${baseId}-tabs`}>
          <SideReveal direction="left">
            <div
              role="tablist"
              aria-label="Skill categories"
              className="pointer-events-auto inline-flex flex-wrap gap-2.5 max-w-full"
            >
              {tabs.map((tab, index) => {
                const isSelected = tab.id === resolvedActiveTab;

                return (
                  <button
                    key={tab.id}
                    ref={(el) => {
                      tabRefs.current[index] = el;
                    }}
                    id={`${baseId}-tab-${tab.id}`}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    aria-controls={tabPanelId}
                    tabIndex={isSelected ? 0 : -1}
                    onClick={() => {
                      playClick();
                      setActiveTabId(tab.id);
                      universeNav?.pulsePlanet(
                        'skills',
                        0.72,
                        tab.id === ALL_TAB_ID ? '' : tab.label,
                      );
                    }}
                    onKeyDown={(event) => handleTabKeyDown(event, index)}
                    className={[
                      'relative isolate inline-flex min-h-[44px] items-center px-4 sm:px-5 py-2.5 rounded-[var(--radius-control)]',
                      'font-mono text-xs sm:text-sm font-medium cursor-pointer border transition-colors duration-150',
                      'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
                      isSelected
                        ? 'border-[var(--planet-skills)] text-[#020307] font-semibold'
                        : 'glass-surface text-[var(--text-secondary)] hover:border-[var(--planet-skills)] hover:text-[var(--text-primary)]',
                    ].join(' ')}
                  >
                    {isSelected && (
                      <m.span
                        layoutId={`${baseId}-active-indicator`}
                        data-testid="skills-active-indicator"
                        transition={indicatorTransition}
                        aria-hidden="true"
                        className="absolute inset-0 -z-10 rounded-[var(--radius-control)] bg-[var(--planet-skills)]"
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </SideReveal>
        </LayoutGroup>

        <LiveAnnouncer message={announcement} politeness="polite" />

        <div
          id={tabPanelId}
          role="tabpanel"
          aria-labelledby={activeTabDomId}
          data-testid="skills-molecular-clusters"
          className="pointer-events-none grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {visibleCategories.map((category, catIdx) => {
            const accent = CLUSTER_ACCENTS[catIdx % CLUSTER_ACCENTS.length];
            const itemCount = category.items.length;

            return (
              <SideReveal
                key={category.id}
                direction={catIdx % 2 === 0 ? 'left' : 'right'}
                className="pointer-events-auto relative glass-surface p-6 md:p-8 transition-colors duration-150 hover:border-[var(--border-glass-strong)]"
              >
                <div className="space-y-5">
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-2 size-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: accent }}
                    />
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="type-h3 text-[var(--text-primary)]">
                          {category.label}
                        </h3>
                        <span className="type-meta text-xs text-[var(--text-muted)] tabular-nums">
                          {itemCount} {itemCount === 1 ? 'skill' : 'skills'}
                        </span>
                      </div>
                      {hasNonEmptyText(category.description) && (
                        <p className="type-body text-sm md:text-base text-[var(--text-secondary)]">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {category.items.length > 0 ? (
                    <div className="flex flex-wrap gap-2.5 pt-1">
                      {category.items.map((skill) => {
                        const isSkillSelected = skill.id === selectedSkillId;
                        const isBondedToHovered =
                          inspectedProjects.length > 0 &&
                          inspectedProjects.some((p) =>
                            getProjectsForSkill(skill, [p]).length > 0,
                          );
                        const linkedCount = getProjectsForSkill(skill, projects).length;

                        return (
                          <button
                            key={skill.id}
                            type="button"
                            data-testid={`skill-atom-${skill.id}`}
                            aria-pressed={isSkillSelected}
                            onMouseEnter={() => {
                              setHoveredSkillId(skill.id);
                              universeNav?.pulsePlanet('skills', 0.45, skill.name);
                            }}
                            onMouseLeave={() => setHoveredSkillId(null)}
                            onClick={() => handleToggleSkill(skill)}
                            className={[
                              'inline-flex min-h-[44px] items-center gap-2 px-3.5 py-2',
                              'rounded-[var(--radius-control)] font-mono text-xs sm:text-sm cursor-pointer border',
                              'transition-[border-color,background-color,color,transform] duration-150 active:scale-[0.97]',
                              'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[2px]',
                              isSkillSelected
                                ? 'bg-white/14 text-[var(--text-primary)] font-semibold'
                                : isBondedToHovered
                                  ? 'bg-white/8 text-[var(--text-primary)]'
                                  : 'bg-[var(--surface-card)]/90 text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                            ].join(' ')}
                            style={{
                              borderColor:
                                isSkillSelected || isBondedToHovered
                                  ? accent
                                  : 'var(--border-subtle)',
                            }}
                          >
                            <span
                              aria-hidden="true"
                              className="size-2 rounded-full shrink-0"
                              style={{ backgroundColor: accent }}
                            />
                            <span>{skill.name}</span>
                            <span className="text-[11px] text-[var(--text-muted)] tabular-nums">
                              · {linkedCount}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="type-meta text-[var(--text-muted)]">
                      No skills recorded in this category yet.
                    </p>
                  )}
                </div>
              </SideReveal>
            );
          })}
        </div>

        {selectedSkill && (
          <GlassCard
            variant="strong"
            padding="lg"
            data-testid="skill-cross-reference"
            className="pointer-events-auto space-y-4 border-[var(--planet-skills)]/50"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="type-meta text-xs sm:text-sm font-medium text-[var(--planet-skills)]">
                Projects using {selectedSkill.name} ({matchingProjects.length})
              </p>
              <button
                type="button"
                onClick={() => {
                  playClick();
                  setSelectedSkillId(null);
                }}
                className="type-meta inline-flex min-h-[44px] items-center px-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer rounded-[var(--radius-control)] focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]"
              >
                Clear
              </button>
            </div>

            {matchingProjects.length > 0 ? (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 m-0 p-0 list-none">
                {matchingProjects.map((project) => (
                  <li key={project.slug}>
                    <a
                      href={getSectionRoute('projects')}
                      onClick={handleJumpToProjects}
                      className="flex min-h-[44px] items-center justify-between gap-3 rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3 text-[var(--text-primary)] hover:border-[var(--planet-skills)] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]"
                    >
                      <span className="font-medium">{project.title}</span>
                      <ArrowUpRight className="size-4 shrink-0 text-[var(--planet-skills)]" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="type-body text-sm text-[var(--text-secondary)]">
                No mapped projects for this skill yet.
              </p>
            )}
          </GlassCard>
        )}
      </div>
    </SectionShell>
  );
}

import { ArrowUpRight } from 'lucide-react';
import { LayoutGroup, m } from 'motion/react';
import { useId, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { SectionShell } from '@/components/layout/SectionShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { LiveAnnouncer } from '@/components/ui/LiveAnnouncer';
import { TagChip } from '@/components/ui/TagChip';
import { useOptionalMotionPreference } from '@/context/MotionPreferenceContext';
import { projectsData } from '@/data/projects';
import { skillsData } from '@/data/skills';
import { FILTER_LAYOUT_TRANSITION, REDUCED_TRANSITION } from '@/motion/variants';
import type { ProjectItem, SkillCategory, SkillItem } from '@/types/portfolio';
import { hasNonEmptyText } from '@/utils/dataGuards';
import { scrollToSection } from '@/utils/scrollNavigation';
import { getProjectsForSkill } from '@/utils/skillCrossRef';

export interface SkillsSectionProps {
  categories?: readonly SkillCategory[];
  projects?: readonly ProjectItem[];
}

const ALL_TAB_ID = 'all';

export function SkillsSection({
  categories = skillsData,
  projects = projectsData,
}: SkillsSectionProps) {
  const baseId = useId();
  const { prefersReducedMotion } = useOptionalMotionPreference();
  const [activeTabId, setActiveTabId] = useState<string>(ALL_TAB_ID);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState<string>('');
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const validCategories = categories.filter(
    (category) => hasNonEmptyText(category.id) && hasNonEmptyText(category.label),
  );

  if (validCategories.length === 0) {
    return (
      <SectionShell id="skills" index="03" indexLabel="SKILLS" title="Skills">
        <GlassCard padding="lg" variant="elevated">
          <p className="type-meta uppercase text-[var(--text-muted)] mb-2">
            CAPABILITIES // PENDING_VERIFICATION
          </p>
          <p className="type-body text-[var(--text-secondary)] max-w-[68ch]">
            No skill categories added yet.
          </p>
        </GlassCard>
      </SectionShell>
    );
  }

  const tabs = [
    { id: ALL_TAB_ID, label: 'All' },
    ...validCategories.map((category) => ({
      id: category.id,
      label: category.label,
    })),
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
  const selectedSkill =
    allSkills.find((skill) => skill.id === selectedSkillId) ?? null;
  const matchingProjects = selectedSkill
    ? getProjectsForSkill(selectedSkill, projects)
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

    if (nextIndex === null) {
      return;
    }

    event.preventDefault();
    const nextTab = tabs[nextIndex];
    if (nextTab) {
      setActiveTabId(nextTab.id);
      tabRefs.current[nextIndex]?.focus();
    }
  };

  const handleToggleSkill = (skill: SkillItem) => {
    if (selectedSkillId === skill.id) {
      setSelectedSkillId(null);
      setAnnouncement(`Cleared selection for ${skill.name}.`);
      return;
    }

    const related = getProjectsForSkill(skill, projects);
    setSelectedSkillId(skill.id);
    setAnnouncement(
      `${skill.name}: ${related.length} related ${related.length === 1 ? 'project' : 'projects'}.`,
    );
  };

  const handleJumpToProjects = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    scrollToSection('projects', {
      prefersReducedMotion,
      focusTarget: false,
      updateHash: true,
    });
  };

  const tabPanelId = `${baseId}-panel`;
  const activeTabDomId = `${baseId}-tab-${resolvedActiveTab}`;
  const indicatorTransition = prefersReducedMotion
    ? REDUCED_TRANSITION
    : FILTER_LAYOUT_TRANSITION;

  return (
    <SectionShell id="skills" index="03" indexLabel="SKILLS" title="Skills">
      <div className="space-y-6">
        <LayoutGroup id={`${baseId}-tabs`}>
          <div
            role="tablist"
            aria-label="Skill categories"
            className="flex flex-wrap gap-2 border-b border-[var(--border-subtle)] pb-4"
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
                  onClick={() => setActiveTabId(tab.id)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                  className={[
                    'relative isolate inline-flex min-h-[44px] items-center px-4 py-2 rounded-[var(--radius-control)]',
                    'font-mono text-xs font-medium cursor-pointer border',
                    'transition-colors duration-[var(--transition-theme)]',
                    'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
                    isSelected
                      ? 'border-[var(--accent-primary)] text-[var(--text-on-accent)] font-semibold'
                      : 'glass-surface text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--text-primary)]',
                  ].join(' ')}
                >
                  {isSelected && (
                    <m.span
                      layoutId={`${baseId}-active-indicator`}
                      data-testid="skills-active-indicator"
                      transition={indicatorTransition}
                      aria-hidden="true"
                      className="absolute inset-0 -z-10 rounded-[var(--radius-control)] bg-[var(--accent-primary)]"
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </LayoutGroup>

        <LiveAnnouncer message={announcement} politeness="polite" />

        <div
          id={tabPanelId}
          role="tabpanel"
          aria-labelledby={activeTabDomId}
          className="swiss-grid"
        >
          {visibleCategories.map((category) => (
            <GlassCard
              key={category.id}
              as="article"
              padding="md"
              className="col-span-4 md:col-span-4 lg:col-span-6 space-y-4"
            >
              <div className="border-b border-[var(--border-subtle)] pb-3">
                <h3 className="type-h3 text-[var(--text-primary)]">
                  {category.label}
                </h3>
                {hasNonEmptyText(category.description) && (
                  <p className="type-body text-sm text-[var(--text-secondary)] mt-1">
                    {category.description}
                  </p>
                )}
              </div>

              {category.items.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {category.items.map((skill) => {
                    const isSkillSelected = skill.id === selectedSkillId;

                    return (
                      <TagChip
                        key={skill.id}
                        selected={isSkillSelected}
                        onClick={() => handleToggleSkill(skill)}
                      >
                        {skill.name}
                      </TagChip>
                    );
                  })}
                </div>
              ) : (
                <p className="type-meta text-[var(--text-muted)]">
                  No skills recorded in this category yet.
                </p>
              )}
            </GlassCard>
          ))}
        </div>

        {selectedSkill && (
          <GlassCard
            variant="strong"
            padding="md"
            data-testid="skill-cross-reference"
            className="space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="type-meta uppercase text-[var(--accent-primary)]">
                SKILL CROSS-REFERENCE // {selectedSkill.name}
              </p>
              <button
                type="button"
                onClick={() => setSelectedSkillId(null)}
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
                      href="#projects"
                      onClick={handleJumpToProjects}
                      className="flex min-h-[44px] items-center justify-between gap-3 rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3 text-[var(--text-primary)] hover:border-[var(--accent-primary)] focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]"
                    >
                      <span>
                        <span className="type-meta text-[var(--text-muted)] mr-2">
                          {project.indexCode}
                        </span>
                        <span className="font-medium">{project.title}</span>
                      </span>
                      <ArrowUpRight className="size-4 shrink-0 text-[var(--accent-primary)]" aria-hidden="true" />
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

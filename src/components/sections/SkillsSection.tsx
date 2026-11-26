import { ArrowUpRight } from 'lucide-react';
import { LayoutGroup, m } from 'motion/react';
import { useId, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { SectionShell } from '@/components/layout/SectionShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { LiveAnnouncer } from '@/components/ui/LiveAnnouncer';
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
  const baseId = useId();
  const { prefersReducedMotion } = useOptionalMotionPreference();
  const [activeTabId, setActiveTabId] = useState<string>(ALL_TAB_ID);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [hoveredSkillId, setHoveredSkillId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState<string>('');
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const validCategories = categories.filter(
    (category) => hasNonEmptyText(category.id) && hasNonEmptyText(category.label),
  );

  if (validCategories.length === 0) {
    return (
      <SectionShell id="skills" index="03" indexLabel="SKILLS" title="Skills">
        <GlassCard padding="lg" variant="elevated" className="pointer-events-auto">
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
    { id: ALL_TAB_ID, label: 'All Molecules' },
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
      setActiveTabId(targetTab.id);
      tabRefs.current[nextIndex]?.focus();
    }
  };

  const handleToggleSkill = (skill: SkillItem) => {
    const nextId = selectedSkillId === skill.id ? null : skill.id;
    setSelectedSkillId(nextId);

    if (!nextId) {
      setAnnouncement(`Cleared ${skill.name} atomic cross-reference filter.`);
      return;
    }

    const matches = getProjectsForSkill(skill, projects);
    setAnnouncement(
      matches.length > 0
        ? `${skill.name} atom bond linked to ${matches.length} ${matches.length === 1 ? 'project' : 'projects'}.`
        : `${skill.name} selected; no linked projects yet.`,
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
    <SectionShell
      id="skills"
      index="03"
      indexLabel="SKILLS"
      title="Skills"
      description="Explore verified technologies as orbiting molecular clusters. Select or hover any atomic node to reveal its project bonds."
    >
      <div className="pointer-events-auto space-y-8">
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
                    'font-mono text-xs font-medium cursor-pointer border transition-colors duration-200',
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
        </LayoutGroup>

        <LiveAnnouncer message={announcement} politeness="polite" />

        {/* Atomic / Molecular Orbit Clusters */}
        <div
          id={tabPanelId}
          role="tabpanel"
          aria-labelledby={activeTabDomId}
          data-testid="skills-molecular-clusters"
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {visibleCategories.map((category, catIdx) => {
            const accent = CLUSTER_ACCENTS[catIdx % CLUSTER_ACCENTS.length];
            const itemCount = category.items.length;
            const canUseInView = !prefersReducedMotion && typeof IntersectionObserver !== 'undefined';

            return (
              <m.div
                key={category.id}
                initial={canUseInView ? { x: catIdx % 2 === 0 ? -24 : 24 } : false}
                whileInView={canUseInView ? { x: 0 } : undefined}
                viewport={{ once: true, amount: 0.12 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative glass-surface p-5 md:p-6 overflow-hidden transition-[border-color,box-shadow] duration-200 hover:border-[var(--border-glass-strong)]"
              >
                {/* Molecular ring SVG bonding atom coordinates to central category nucleus */}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 360 120"
                  className="pointer-events-none absolute top-0 right-0 h-28 w-72 opacity-30"
                  fill="none"
                >
                  <circle cx="290" cy="54" r="38" stroke={accent} strokeDasharray="3 6" />
                  <circle cx="290" cy="54" r="14" fill={accent} fillOpacity="0.22" stroke={accent} />
                  {Array.from({ length: Math.min(itemCount, 6) }).map((_, i) => {
                    const angle = (i / Math.max(1, Math.min(itemCount, 6))) * Math.PI * 1.4 - 0.5;
                    const x2 = 290 + Math.cos(angle) * 58;
                    const y2 = 54 + Math.sin(angle) * 44;
                    return (
                      <g key={i}>
                        <line x1="290" y1="54" x2={x2} y2={y2} stroke={accent} strokeOpacity="0.55" />
                        <circle cx={x2} cy={y2} r="3" fill={accent} />
                      </g>
                    );
                  })}
                </svg>

                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-2.5 pr-20">
                    <span
                      aria-hidden="true"
                      className="size-3 rounded-full shrink-0"
                      style={{
                        backgroundColor: accent,
                        boxShadow: `0 0 12px ${accent}`,
                      }}
                    />
                    <div>
                      <h3 className="type-h3 text-[var(--text-primary)]">
                        {category.label}
                      </h3>
                      {hasNonEmptyText(category.description) && (
                        <p className="type-body text-xs md:text-sm text-[var(--text-secondary)] mt-0.5">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {category.items.length > 0 ? (
                    <div className="flex flex-wrap gap-2.5 pt-2">
                      {category.items.map((skill) => {
                        const isSkillSelected = skill.id === selectedSkillId;
                        const isBondedToHovered =
                          inspectedProjects.length > 0 &&
                          inspectedProjects.some((p) =>
                            getProjectsForSkill(skill, [p]).length > 0,
                          );
                        const linkedCount = getProjectsForSkill(skill, projects).length;

                        return (
                          <m.button
                            key={skill.id}
                            type="button"
                            data-testid={`skill-atom-${skill.id}`}
                            aria-pressed={isSkillSelected}
                            onMouseEnter={() => setHoveredSkillId(skill.id)}
                            onMouseLeave={() => setHoveredSkillId(null)}
                            onClick={() => handleToggleSkill(skill)}
                            whileHover={prefersReducedMotion ? undefined : { scale: 1.07, y: -2 }}
                            whileTap={prefersReducedMotion ? undefined : { scale: 0.94 }}
                            className={[
                              'group relative inline-flex min-h-[44px] items-center gap-2 px-3.5 py-2',
                              'rounded-full font-mono text-xs cursor-pointer border transition-colors duration-200',
                              'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[2px]',
                              isSkillSelected
                                ? 'bg-white/15 text-[var(--text-primary)] font-semibold'
                                : isBondedToHovered
                                  ? 'bg-white/10 text-[var(--text-primary)]'
                                  : 'bg-[var(--surface-card)]/85 text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                            ].join(' ')}
                            style={{
                              borderColor:
                                isSkillSelected || isBondedToHovered
                                  ? accent
                                  : 'var(--border-subtle)',
                              boxShadow: isSkillSelected ? `0 0 16px ${accent}66` : undefined,
                            }}
                          >
                            <span
                              aria-hidden="true"
                              className={[
                                'size-2.5 rounded-full transition-transform duration-200 group-hover:scale-125',
                                isSkillSelected ? 'ring-4 ring-white/20' : '',
                              ].join(' ')}
                              style={{ backgroundColor: accent }}
                            />
                            <span>{skill.name}</span>
                            <span className="text-[10px] text-[var(--text-muted)]">
                              · {linkedCount}
                            </span>
                          </m.button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="type-meta text-[var(--text-muted)]">
                      No skills recorded in this category yet.
                    </p>
                  )}
                </div>
              </m.div>
            );
          })}
        </div>

        {/* Molecular Bond Cross-Reference Readout */}
        {selectedSkill && (
          <GlassCard
            variant="strong"
            padding="md"
            data-testid="skill-cross-reference"
            className="space-y-3 border-[var(--planet-skills)]/50"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="type-meta uppercase text-[var(--planet-skills)]">
                MOLECULAR BOND // {selectedSkill.name} ({matchingProjects.length}{' '}
                {matchingProjects.length === 1 ? 'Project World' : 'Project Worlds'})
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
                      className="flex min-h-[44px] items-center justify-between gap-3 rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3 text-[var(--text-primary)] hover:border-[var(--planet-skills)] transition-[border-color,transform] duration-200 hover:translate-x-0.5 focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]"
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

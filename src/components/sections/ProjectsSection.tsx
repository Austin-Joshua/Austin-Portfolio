import { ArrowUpRight, Sparkles, X } from 'lucide-react';
import { m } from 'motion/react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { SectionShell } from '@/components/layout/SectionShell';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { LiveAnnouncer } from '@/components/ui/LiveAnnouncer';
import { ProjectDetailModal } from '@/components/ui/ProjectDetailModal';
import { TagChip } from '@/components/ui/TagChip';
import { useOptionalMotionPreference } from '@/context/MotionPreferenceContext';
import { projectsData } from '@/data/projects';
import { useProjectUrlState } from '@/hooks/useProjectUrlState';
import { FILTER_LAYOUT_TRANSITION, REDUCED_TRANSITION } from '@/motion/variants';
import type { ProjectItem } from '@/types/portfolio';
import { hasNonEmptyText, isValidHttpUrl } from '@/utils/dataGuards';
import {
  ALL_PROJECT_CATEGORY,
  extractProjectCategories,
  filterProjectsByCategory,
  formatProjectCountAnnouncement,
  type ProjectCategoryOption,
} from '@/utils/projectFilters';
import { scrollToSection } from '@/utils/scrollNavigation';

export interface ProjectsSectionProps {
  projects?: readonly ProjectItem[];
  categories?: readonly ProjectCategoryOption[];
}

const WORLD_THEMES: Record<string, { primary: string; glow: string; ring: string }> = {
  agriflux: { primary: '#2DD4BF', glow: 'rgba(45, 212, 191, 0.25)', ring: '#38BDF8' },
  civiq: { primary: '#FB923C', glow: 'rgba(251, 146, 60, 0.25)', ring: '#FACC15' },
  'resq-meal': { primary: '#FACC15', glow: 'rgba(250, 204, 21, 0.24)', ring: '#FB923C' },
  'rit-digital-twin': { primary: '#38BDF8', glow: 'rgba(56, 189, 248, 0.25)', ring: '#818CF8' },
  neuroram: { primary: '#F472B6', glow: 'rgba(244, 114, 182, 0.25)', ring: '#818CF8' },
};

function getWorldTheme(slug: string) {
  return (
    WORLD_THEMES[slug] ?? {
      primary: '#FB923C',
      glow: 'rgba(251, 146, 60, 0.22)',
      ring: '#DCE4F0',
    }
  );
}

/**
 * Distinct planetary mini-world orb rendered beside each project's mission brief.
 */
function ProjectWorldOrb({ slug }: { slug: string }) {
  const world = getWorldTheme(slug);
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 96 96"
      className="h-16 w-16 shrink-0"
      fill="none"
    >
      <ellipse
        cx="48"
        cy="48"
        rx="40"
        ry="15"
        transform="rotate(-20 48 48)"
        stroke={world.ring}
        strokeOpacity="0.65"
        strokeWidth="1.5"
      />
      <circle cx="48" cy="48" r="24" fill={world.glow} />
      <circle
        cx="48"
        cy="48"
        r="19"
        fill={world.primary}
        fillOpacity="0.88"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth="1"
      />
      <path
        d="M34 45 C42 40, 54 54, 62 47"
        stroke="rgba(2,3,7,0.38)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="77" cy="36" r="3" fill={world.ring} />
    </svg>
  );
}

export function ProjectsSection({
  projects = projectsData,
  categories,
}: ProjectsSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>(ALL_PROJECT_CATEGORY);
  const [focusedWorldSlug, setFocusedWorldSlug] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState<string>('');
  const sectionBodyRef = useRef<HTMLDivElement>(null);
  const { prefersReducedMotion } = useOptionalMotionPreference();

  const validProjects = useMemo(
    () =>
      projects.filter(
        (project) => hasNonEmptyText(project.slug) && hasNonEmptyText(project.title),
      ),
    [projects],
  );

  const handleInvalidDeepLink = useCallback(() => {
    scrollToSection('projects', {
      prefersReducedMotion,
      focusTarget: false,
      updateHash: false,
    });
  }, [prefersReducedMotion]);

  const {
    activeProject,
    invalidSlugNotice,
    dismissInvalidSlugNotice,
    openProject,
    closeProject,
  } = useProjectUrlState({
    projects: validProjects,
    onInvalidSlug: handleInvalidDeepLink,
  });

  const filterOptions =
    categories && categories.length > 0
      ? categories
      : extractProjectCategories(validProjects);

  const invalidNoticeBanner = invalidSlugNotice ? (
    <GlassCard
      variant="elevated"
      padding="sm"
      data-testid="invalid-project-notice"
      className="pointer-events-auto flex flex-wrap items-center justify-between gap-3 border-[var(--status-warning)]"
    >
      <LiveAnnouncer
        message={invalidSlugNotice}
        politeness="polite"
        visible
        className="text-sm text-[var(--status-warning)]"
      />
      <Button
        variant="ghost"
        size="sm"
        onClick={dismissInvalidSlugNotice}
        aria-label="Dismiss invalid project link notice"
        leftIcon={<X className="size-4" />}
      >
        Dismiss
      </Button>
    </GlassCard>
  ) : null;

  if (validProjects.length === 0) {
    return (
      <SectionShell id="projects" index="04" indexLabel="PROJECTS" title="Projects">
        <div className="pointer-events-none space-y-6">
          {invalidNoticeBanner}
          <GlassCard padding="lg" variant="elevated" className="pointer-events-auto">
            <p className="type-meta uppercase text-[var(--text-muted)] mb-2">
              PROJECTS // STATUS
            </p>
            <p className="type-body text-[var(--text-secondary)] max-w-[68ch]">
              No projects added yet.
            </p>
          </GlassCard>
        </div>
      </SectionShell>
    );
  }

  const resolvedCategory = filterOptions.some((opt) => opt.id === activeCategory)
    ? activeCategory
    : ALL_PROJECT_CATEGORY;

  const filteredProjects = filterProjectsByCategory(validProjects, resolvedCategory);
  const selectedWorld =
    filteredProjects.find((p) => p.slug === focusedWorldSlug) ??
    filteredProjects[0] ??
    null;

  const handleSelectCategory = (option: ProjectCategoryOption) => {
    setActiveCategory(option.id);
    const nextFiltered = filterProjectsByCategory(validProjects, option.id);
    setAnnouncement(formatProjectCountAnnouncement(nextFiltered.length, option.label));
  };

  const handleResetFilters = () => {
    setActiveCategory(ALL_PROJECT_CATEGORY);
    setAnnouncement(formatProjectCountAnnouncement(validProjects.length, 'All'));
  };

  const layoutTransition = prefersReducedMotion
    ? REDUCED_TRANSITION
    : FILTER_LAYOUT_TRANSITION;

  return (
    <SectionShell
      id="projects"
      index="04"
      indexLabel="PROJECTS"
      title="Projects"
      description="Five bespoke engineering worlds orbiting the Pyros Amber sector. Select any planetary world to inspect its mission architecture or launch full schematics."
    >
      <div ref={sectionBodyRef} tabIndex={-1} className="pointer-events-none space-y-8 md:space-y-10 focus:outline-none">
        {invalidNoticeBanner}

        {/* Category Filter Strip */}
        <div className="pointer-events-auto flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
          <div
            role="group"
            aria-label="Filter projects by category"
            className="flex flex-wrap gap-2.5"
          >
            {filterOptions.map((option) => {
              const isSelected = option.id === resolvedCategory;

              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => handleSelectCategory(option)}
                  className={[
                    'inline-flex min-h-[44px] items-center px-4 sm:px-5 py-2.5 rounded-[var(--radius-control)]',
                    'font-mono text-xs sm:text-sm font-medium cursor-pointer border transition-[background-color,border-color,color] duration-200',
                    'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
                    isSelected
                      ? 'bg-[var(--planet-projects)] text-[#020307] border-[var(--planet-projects)] font-semibold'
                      : 'glass-surface text-[var(--text-secondary)] hover:border-[var(--planet-projects)] hover:text-[var(--text-primary)]',
                  ].join(' ')}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <p className="type-meta text-xs sm:text-sm text-[var(--text-muted)]">
            {filteredProjects.length}{' '}
            {filteredProjects.length === 1 ? 'PROJECT WORLD' : 'PROJECT WORLDS'}
          </p>
        </div>

        <LiveAnnouncer message={announcement} politeness="polite" />

        {filteredProjects.length > 0 && selectedWorld ? (
          <div className="pointer-events-none space-y-7">
            {/* Orbital World Inspector Panel for the active selected project world */}
            <GlassCard
              variant="strong"
              padding="lg"
              data-testid="featured-project-world"
              className="pointer-events-auto relative overflow-hidden p-6 sm:p-8 lg:p-10 border-[var(--border-glass-strong)]"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full blur-3xl opacity-35"
                style={{ background: getWorldTheme(selectedWorld.slug).glow }}
              />
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <ProjectWorldOrb slug={selectedWorld.slug} />
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className="type-meta text-xs sm:text-sm font-semibold"
                        style={{ color: getWorldTheme(selectedWorld.slug).primary }}
                      >
                        {selectedWorld.categoryLabel}
                      </span>
                      {selectedWorld.outcomes?.[0] && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--planet-achievements)]/40 bg-[var(--planet-achievements)]/10 px-3 py-1 font-mono text-xs text-[var(--planet-achievements)]">
                          <Sparkles className="size-3.5" aria-hidden="true" />
                          {selectedWorld.outcomes[0]}
                        </span>
                      )}
                    </div>
                    <h3 className="type-h3 text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text-primary)]">
                      {selectedWorld.title}
                    </h3>
                    <p className="type-lead text-base sm:text-lg text-[var(--text-secondary)] max-w-[64ch]">
                      {selectedWorld.summary}
                    </p>
                    {selectedWorld.role && (
                      <p className="type-meta text-xs sm:text-sm text-[var(--text-muted)]">
                        Role: {selectedWorld.role}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => openProject(selectedWorld.slug)}
                    aria-label={`Launch World Details for ${selectedWorld.title}`}
                  >
                    Launch World Details
                  </Button>
                  {isValidHttpUrl(selectedWorld.links.github) && selectedWorld.links.github && (
                    <a
                      href={selectedWorld.links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass-surface inline-flex min-h-[44px] items-center gap-1.5 px-4 py-2.5 rounded-[var(--radius-control)] font-mono text-xs sm:text-sm text-[var(--text-primary)] hover:border-[var(--planet-projects)] focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]"
                    >
                      <span>GitHub</span>
                      <ArrowUpRight className="size-4" aria-hidden="true" />
                    </a>
                  )}
                  {isValidHttpUrl(selectedWorld.links.live) && selectedWorld.links.live && (
                    <a
                      href={selectedWorld.links.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[44px] items-center gap-1.5 px-4 py-2.5 rounded-[var(--radius-control)] font-mono text-xs sm:text-sm font-semibold text-[#020307] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]"
                      style={{ backgroundColor: getWorldTheme(selectedWorld.slug).primary }}
                    >
                      <span>Live Demo</span>
                      <ArrowUpRight className="size-4" aria-hidden="true" />
                    </a>
                  )}
                </div>
              </div>
            </GlassCard>

            {/* Orbital Project Trajectory Grid */}
            <div className="pointer-events-none grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project, idx) => {
                const world = getWorldTheme(project.slug);
                const visibleStack = project.stack
                  .filter((item) => hasNonEmptyText(item))
                  .slice(0, 4);
                const extraCount = Math.max(
                  0,
                  project.stack.filter((item) => hasNonEmptyText(item)).length - 4,
                );
                const isSelectedWorld = selectedWorld.slug === project.slug;
                const hasGithub = isValidHttpUrl(project.links.github);
                const hasLive = isValidHttpUrl(project.links.live);
                const canUseInView = !prefersReducedMotion && typeof IntersectionObserver !== 'undefined';

                return (
                  <m.div
                    key={project.slug}
                    layout={!prefersReducedMotion}
                    initial={canUseInView ? { x: idx % 2 === 0 ? -22 : 22 } : false}
                    whileInView={canUseInView ? { x: 0 } : undefined}
                    viewport={{ once: true, amount: 0.12 }}
                    whileHover={prefersReducedMotion ? undefined : { y: -4 }}
                    transition={layoutTransition}
                    className="pointer-events-auto flex"
                  >
                    <article
                      onMouseEnter={() => setFocusedWorldSlug(project.slug)}
                      className={[
                        'glass-surface flex w-full flex-col justify-between gap-5 p-6 md:p-7 transition-all duration-200',
                        isSelectedWorld ? 'bg-[var(--surface-card)]' : '',
                      ].join(' ')}
                      style={{
                        borderColor: isSelectedWorld ? world.primary : 'var(--border-glass)',
                        boxShadow: isSelectedWorld ? `0 0 24px ${world.glow}` : undefined,
                      }}
                    >
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            aria-hidden="true"
                            className="size-3 rounded-full"
                            style={{ backgroundColor: world.primary }}
                          />
                          <span className="type-meta text-xs" style={{ color: world.primary }}>
                            {project.categoryLabel}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setFocusedWorldSlug(project.slug)}
                          className="text-left w-full rounded-[var(--radius-control)] focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[2px] cursor-pointer"
                        >
                          <h3 className="type-h3 text-[var(--text-primary)] hover:underline">
                            {project.title}
                          </h3>
                        </button>

                        <p className="type-body text-sm md:text-base text-[var(--text-secondary)]">
                          {project.summary}
                        </p>

                        {visibleStack.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {visibleStack.map((tech) => (
                              <TagChip key={tech}>{tech}</TagChip>
                            ))}
                            {extraCount > 0 && <TagChip>+{extraCount}</TagChip>}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border-subtle)] pt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openProject(project.slug)}
                          aria-label={`Inspect Details — ${project.title}`}
                        >
                          Inspect Details
                        </Button>

                        <div className="flex items-center gap-2">
                          {hasGithub && project.links.github && (
                            <a
                              href={project.links.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex min-h-[44px] items-center gap-1 px-2.5 py-1.5 rounded-[var(--radius-control)] font-mono text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[2px]"
                            >
                              <span>GitHub</span>
                              <ArrowUpRight className="size-3.5" aria-hidden="true" />
                            </a>
                          )}
                          {hasLive && project.links.live && (
                            <a
                              href={project.links.live}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex min-h-[44px] items-center gap-1 px-2.5 py-1.5 rounded-[var(--radius-control)] font-mono text-xs font-semibold focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[2px]"
                              style={{ color: world.primary }}
                            >
                              <span>Live Demo</span>
                              <ArrowUpRight className="size-3.5" aria-hidden="true" />
                            </a>
                          )}
                        </div>
                      </div>
                    </article>
                  </m.div>
                );
              })}
            </div>
          </div>
        ) : (
          <GlassCard
            padding="lg"
            variant="elevated"
            className="pointer-events-auto border-dashed text-center space-y-4"
          >
            <p className="type-body text-[var(--text-secondary)]">
              No projects match this filter.
            </p>
            <div>
              <Button variant="secondary" size="md" onClick={handleResetFilters}>
                Reset filters
              </Button>
            </div>
          </GlassCard>
        )}
      </div>

      <ProjectDetailModal
        project={activeProject}
        onClose={closeProject}
        fallbackFocusRef={sectionBodyRef}
      />
    </SectionShell>
  );
}

import { ArrowUpRight, X } from 'lucide-react';
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

const MAX_OVERVIEW_TAGS = 5;

function getBentoSpanClass(index: number): string {
  const isWide = index % 4 === 0 || index % 4 === 3;
  return isWide
    ? 'col-span-4 md:col-span-4 lg:col-span-7'
    : 'col-span-4 md:col-span-4 lg:col-span-5';
}

export function ProjectsSection({
  projects = projectsData,
  categories,
}: ProjectsSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>(ALL_PROJECT_CATEGORY);
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
      className="flex flex-wrap items-center justify-between gap-3 border-[var(--status-warning)]"
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

  if (validProjects.length === 0 && filterOptions.length <= 1) {
    return (
      <SectionShell id="projects" index="04" indexLabel="PROJECTS" title="Projects">
        <div ref={sectionBodyRef} tabIndex={-1} className="space-y-4">
          {invalidNoticeBanner}
          <GlassCard padding="lg" variant="elevated">
            <p className="type-meta uppercase text-[var(--text-muted)] mb-2">
              PROJECTS // PENDING_VERIFICATION
            </p>
            <p className="type-body text-[var(--text-secondary)] max-w-[68ch]">
              No project entries added yet.
            </p>
          </GlassCard>
        </div>
      </SectionShell>
    );
  }

  const activeOption =
    filterOptions.find((option) => option.id === activeCategory) ?? filterOptions[0];
  const resolvedCategory = activeOption?.id ?? ALL_PROJECT_CATEGORY;
  const filteredProjects = filterProjectsByCategory(validProjects, resolvedCategory);

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
    <SectionShell id="projects" index="04" indexLabel="PROJECTS" title="Projects">
      <div ref={sectionBodyRef} tabIndex={-1} className="space-y-6">
        {invalidNoticeBanner}

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
          <div
            role="group"
            aria-label="Filter projects by category"
            className="flex flex-wrap gap-2"
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
                    'inline-flex min-h-[44px] items-center px-4 py-2 rounded-[var(--radius-control)]',
                    'font-mono text-xs font-medium cursor-pointer border',
                    'transition-[background-color,border-color,color] duration-[var(--transition-theme)]',
                    'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
                    isSelected
                      ? 'bg-[var(--accent-primary)] text-[var(--text-on-accent)] border-[var(--accent-primary)] font-semibold'
                      : 'glass-surface text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--text-primary)]',
                  ].join(' ')}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <p className="type-meta text-[var(--text-muted)]">
            {filteredProjects.length}{' '}
            {filteredProjects.length === 1 ? 'PROJECT' : 'PROJECTS'}
          </p>
        </div>

        <LiveAnnouncer message={announcement} politeness="polite" />

        {filteredProjects.length > 0 ? (
          <div className="swiss-grid">
            {filteredProjects.map((project, index) => {
              const visibleStack = project.stack
                .filter((item) => hasNonEmptyText(item))
                .slice(0, MAX_OVERVIEW_TAGS);
              const extraTagCount = Math.max(
                0,
                project.stack.filter((item) => hasNonEmptyText(item)).length -
                  MAX_OVERVIEW_TAGS,
              );
              const hasGithub = isValidHttpUrl(project.links.github);
              const hasLive = isValidHttpUrl(project.links.live);

              return (
                <m.div
                  key={project.slug}
                  layout={!prefersReducedMotion}
                  transition={layoutTransition}
                  className={`${getBentoSpanClass(index)} flex`}
                >
                  <GlassCard
                    as="article"
                    padding="lg"
                    className="flex w-full flex-col justify-between gap-6"
                  >
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="type-meta text-[var(--text-muted)]">
                          {project.indexCode}
                        </span>
                        {hasNonEmptyText(project.categoryLabel) && (
                          <TagChip variant="accent">{project.categoryLabel}</TagChip>
                        )}
                      </div>

                      <div className="space-y-2">
                        <h3 className="type-h3 text-[var(--text-primary)]">
                          {project.title}
                        </h3>
                        {hasNonEmptyText(project.summary) && (
                          <p className="type-body text-[var(--text-secondary)]">
                            {project.summary}
                          </p>
                        )}
                      </div>

                      {visibleStack.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {visibleStack.map((tech) => (
                            <TagChip key={tech}>{tech}</TagChip>
                          ))}
                          {extraTagCount > 0 && <TagChip>+{extraTagCount}</TagChip>}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openProject(project.slug)}
                        aria-label={`Inspect Details — ${project.title}`}
                      >
                        Inspect Details
                      </Button>

                      {(hasGithub || hasLive) && (
                        <div className="flex flex-wrap items-center gap-2">
                          {hasGithub && project.links.github && (
                            <a
                              href={project.links.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={[
                                'inline-flex min-h-[44px] items-center gap-1.5 px-3 py-2',
                                'rounded-[var(--radius-control)] border border-[var(--border-subtle)]',
                                'font-mono text-xs font-medium text-[var(--text-primary)]',
                                'hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]',
                                'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
                              ].join(' ')}
                            >
                              <span>GitHub</span>
                              <ArrowUpRight className="size-3.5 shrink-0" aria-hidden="true" />
                            </a>
                          )}
                          {hasLive && project.links.live && (
                            <a
                              href={project.links.live}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={[
                                'inline-flex min-h-[44px] items-center gap-1.5 px-3 py-2',
                                'rounded-[var(--radius-control)] bg-[var(--accent-primary)] text-[var(--text-on-accent)]',
                                'font-mono text-xs font-semibold',
                                'hover:brightness-110',
                                'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
                              ].join(' ')}
                            >
                              <span>Live Demo</span>
                              <ArrowUpRight className="size-3.5 shrink-0" aria-hidden="true" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </GlassCard>
                </m.div>
              );
            })}
          </div>
        ) : (
          <GlassCard
            padding="lg"
            variant="elevated"
            className="border-dashed text-center space-y-4"
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

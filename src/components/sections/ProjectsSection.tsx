import { ArrowUpRight, X } from 'lucide-react';
import { m } from 'motion/react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { SectionShell } from '@/components/layout/SectionShell';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { LiveAnnouncer } from '@/components/ui/LiveAnnouncer';
import { ProjectDetailModal } from '@/components/ui/ProjectDetailModal';
import { SideReveal } from '@/components/ui/SideReveal';
import { TagChip } from '@/components/ui/TagChip';
import { useOptionalMotionPreference } from '@/context/MotionPreferenceContext';
import { useOptionalUniverseNavigation } from '@/context/UniverseNavigationContext';
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
import { playClick, playProjectWorldSound } from '@/utils/soundEffects';

export interface ProjectsSectionProps {
  projects?: readonly ProjectItem[];
  categories?: readonly ProjectCategoryOption[];
}

const ACCENT_BY_SLUG: Record<string, string> = {
  agriflux: '#2DD4BF',
  civiq: '#FB923C',
  'resq-meal': '#FACC15',
  'rit-digital-twin': '#38BDF8',
  neuroram: '#F472B6',
};

function getProjectAccent(slug: string): string {
  return ACCENT_BY_SLUG[slug] ?? 'var(--planet-projects)';
}

export function ProjectsSection({
  projects = projectsData,
  categories,
}: ProjectsSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>(ALL_PROJECT_CATEGORY);
  const [announcement, setAnnouncement] = useState<string>('');
  const sectionBodyRef = useRef<HTMLDivElement>(null);
  const { prefersReducedMotion } = useOptionalMotionPreference();
  const universeNav = useOptionalUniverseNavigation();

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
      updateRoute: false,
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
        onClick={() => {
          playClick();
          dismissInvalidSlugNotice();
        }}
        aria-label="Dismiss invalid project link notice"
        leftIcon={<X className="size-4" />}
      >
        Dismiss
      </Button>
    </GlassCard>
  ) : null;

  if (validProjects.length === 0) {
    return (
      <SectionShell id="projects" title="Projects">
        <div className="pointer-events-none space-y-6">
          {invalidNoticeBanner}
          <GlassCard padding="lg" variant="elevated" className="pointer-events-auto">
            <p className="type-meta text-xs text-[var(--text-muted)] mb-2">
              Projects
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

  const handleSelectCategory = (option: ProjectCategoryOption) => {
    playClick();
    setActiveCategory(option.id);
    universeNav?.pulsePlanet(
      'projects',
      0.8,
      option.id === ALL_PROJECT_CATEGORY ? '' : option.label,
    );
    const nextFiltered = filterProjectsByCategory(validProjects, option.id);
    setAnnouncement(formatProjectCountAnnouncement(nextFiltered.length, option.label));
  };

  const handleResetFilters = () => {
    playClick();
    setActiveCategory(ALL_PROJECT_CATEGORY);
    universeNav?.pulsePlanet('projects', 0.65, '');
    setAnnouncement(formatProjectCountAnnouncement(validProjects.length, 'All'));
  };

  const layoutTransition = prefersReducedMotion
    ? REDUCED_TRANSITION
    : FILTER_LAYOUT_TRANSITION;

  return (
    <SectionShell
      id="projects"
      title="Projects"
      description="Selected engineering and AI systems. Open any project for problem framing, architecture notes, and links."
    >
      <div
        ref={sectionBodyRef}
        tabIndex={-1}
        className="pointer-events-none space-y-8 focus:outline-none"
      >
        {invalidNoticeBanner}

        <SideReveal direction="left">
          <div className="pointer-events-auto flex flex-wrap items-center justify-between gap-4">
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
                      'font-mono text-xs sm:text-sm font-medium cursor-pointer border transition-[background-color,border-color,color] duration-150',
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

            <p className="type-meta text-xs sm:text-sm text-[var(--text-muted)] tabular-nums">
              {filteredProjects.length}{' '}
              {filteredProjects.length === 1 ? 'project' : 'projects'}
            </p>
          </div>
        </SideReveal>

        <LiveAnnouncer message={announcement} politeness="polite" />

        {filteredProjects.length > 0 ? (
          <div className="pointer-events-none grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, idx) => {
              const accent = getProjectAccent(project.slug);
              const cleanStack = project.stack.filter((item) => hasNonEmptyText(item));
              const visibleStack = cleanStack.slice(0, 4);
              const extraCount = Math.max(0, cleanStack.length - 4);
              const externalLinks = [
                isValidHttpUrl(project.links.github) && project.links.github
                  ? { label: 'GitHub', href: project.links.github, primary: false }
                  : null,
                isValidHttpUrl(project.links.live) && project.links.live
                  ? { label: 'Live Demo', href: project.links.live, primary: true }
                  : null,
              ].filter((entry): entry is { label: string; href: string; primary: boolean } => entry !== null);

              return (
                <SideReveal
                  key={project.slug}
                  direction={idx % 2 === 0 ? 'left' : 'right'}
                  className="pointer-events-auto flex"
                >
                  <m.article
                    layout={!prefersReducedMotion}
                    transition={layoutTransition}
                    className="glass-surface group relative flex w-full flex-col justify-between gap-5 p-6 md:p-7 cursor-pointer transition-[border-color,background-color] duration-150 hover:border-[var(--planet-projects)]/70 hover:bg-[var(--surface-card)]/90"
                    style={{ borderTop: `2px solid ${accent}` }}
                  >
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="type-meta text-xs" style={{ color: accent }}>
                          {project.categoryLabel}
                        </span>
                        {project.outcomes?.[0] && (
                          <span className="type-meta text-[11px] text-[var(--planet-achievements)] truncate max-w-[14rem]">
                            {project.outcomes[0]}
                          </span>
                        )}
                      </div>

                      <h3 className="type-h3 text-[var(--text-primary)] group-hover:text-[var(--planet-projects)] transition-colors duration-150">
                        {project.title}
                      </h3>

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
                      <button
                        type="button"
                        className="inline-flex min-h-[44px] md:min-h-[36px] min-w-[44px] items-center justify-center rounded-[var(--radius-control)] border border-[var(--border-glass)] bg-transparent px-3 py-1.5 text-sm font-medium text-[var(--text-primary)] select-none whitespace-nowrap cursor-pointer transition-[background-color,border-color,color] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:border-[var(--accent-primary)] group-hover:bg-[var(--surface-card)] focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px] after:content-[''] after:absolute after:inset-0 after:z-[1]"
                        onClick={() => {
                          playProjectWorldSound(project.slug);
                          universeNav?.pulsePlanet('projects', 1.1, project.title);
                          openProject(project.slug);
                        }}
                        aria-label={`Inspect Details — ${project.title}`}
                      >
                        Inspect Details
                      </button>

                      <div className="relative z-10 flex items-center gap-2">
                        {externalLinks.map((ext) => (
                          <a
                            key={ext.label}
                            href={ext.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => playClick()}
                            className={[
                              'inline-flex min-h-[44px] items-center gap-1 px-2.5 py-1.5 rounded-[var(--radius-control)] font-mono text-xs transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[2px]',
                              ext.primary
                                ? 'font-semibold hover:brightness-110'
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                            ].join(' ')}
                            style={ext.primary ? { color: accent } : undefined}
                          >
                            <span>{ext.label}</span>
                            <ArrowUpRight className="size-3.5" aria-hidden="true" />
                          </a>
                        ))}
                      </div>
                    </div>
                  </m.article>
                </SideReveal>
              );
            })}
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

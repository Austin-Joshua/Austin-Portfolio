import type { ProjectItem } from '@/types/portfolio';
import { hasNonEmptyText } from '@/utils/dataGuards';

export const ALL_PROJECT_CATEGORY = 'all';

export interface ProjectCategoryOption {
  readonly id: string;
  readonly label: string;
}

export function extractProjectCategories(
  projects: readonly ProjectItem[],
): readonly ProjectCategoryOption[] {
  const seen = new Map<string, string>();

  for (const project of projects) {
    if (!hasNonEmptyText(project.category)) {
      continue;
    }

    const normalizedId = project.category.trim().toLowerCase();
    if (!seen.has(normalizedId)) {
      seen.set(
        normalizedId,
        hasNonEmptyText(project.categoryLabel)
          ? project.categoryLabel.trim()
          : project.category.trim(),
      );
    }
  }

  return [
    { id: ALL_PROJECT_CATEGORY, label: 'All' },
    ...Array.from(seen.entries(), ([id, label]) => ({ id, label })),
  ];
}

export function filterProjectsByCategory(
  projects: readonly ProjectItem[],
  category: string,
): readonly ProjectItem[] {
  const normalized = category.trim().toLowerCase();
  if (!normalized || normalized === ALL_PROJECT_CATEGORY) {
    return projects;
  }

  return projects.filter(
    (project) => project.category.trim().toLowerCase() === normalized,
  );
}

export function formatProjectCountAnnouncement(
  count: number,
  categoryLabel: string,
): string {
  if (count === 0) {
    return `No projects match ${categoryLabel}.`;
  }

  const noun = count === 1 ? 'project' : 'projects';
  if (categoryLabel.toLowerCase() === ALL_PROJECT_CATEGORY) {
    return `Showing all ${count} ${noun}.`;
  }

  return `Showing ${count} ${noun} in ${categoryLabel}.`;
}

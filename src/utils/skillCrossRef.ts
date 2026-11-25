import type { ProjectItem, SkillItem } from '@/types/portfolio';

function normalizeKey(value: string): string {
  return value.trim().toLowerCase();
}

export function getProjectsForSkill(
  skill: SkillItem,
  projects: readonly ProjectItem[],
): readonly ProjectItem[] {
  const normalizedSkillId = normalizeKey(skill.id);
  const linkedSlugs = new Set(
    (skill.projectSlugs ?? []).map((slug) => normalizeKey(slug)),
  );

  return projects.filter((project) => {
    if (linkedSlugs.has(normalizeKey(project.slug))) {
      return true;
    }

    const projectSkillIds = project.skillIds ?? [];
    return projectSkillIds.some((id) => normalizeKey(id) === normalizedSkillId);
  });
}

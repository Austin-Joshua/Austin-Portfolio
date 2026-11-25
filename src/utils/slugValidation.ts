import type { ProjectItem } from '@/types/portfolio';
import { hasNonEmptyText } from '@/utils/dataGuards';

const SAFE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SLUG_LENGTH = 120;

export interface ParsedProjectQuery {
  readonly hasParam: boolean;
  readonly rawValue: string | null;
}

export function sanitizeProjectSlug(
  rawSlug: string | null | undefined,
): string | null {
  if (typeof rawSlug !== 'string') {
    return null;
  }

  let decoded: string;
  try {
    decoded = rawSlug.includes('%') ? decodeURIComponent(rawSlug) : rawSlug;
  } catch {
    return null;
  }

  const normalized = decoded.trim().toLowerCase();
  if (
    normalized.length === 0 ||
    normalized.length > MAX_SLUG_LENGTH ||
    !SAFE_SLUG_PATTERN.test(normalized)
  ) {
    return null;
  }

  return normalized;
}

export function parseProjectQueryParam(search: string): ParsedProjectQuery {
  try {
    const params = new URLSearchParams(search);
    if (!params.has('project')) {
      return { hasParam: false, rawValue: null };
    }
    return {
      hasParam: true,
      rawValue: params.get('project'),
    };
  } catch {
    return { hasParam: false, rawValue: null };
  }
}

export function resolveProjectBySlug(
  rawSlug: string | null | undefined,
  projects: readonly ProjectItem[],
): ProjectItem | null {
  if (projects.length === 0) {
    return null;
  }

  const sanitized = sanitizeProjectSlug(rawSlug);
  if (!sanitized) {
    return null;
  }

  return (
    projects.find(
      (project) =>
        hasNonEmptyText(project.slug) &&
        project.slug.trim().toLowerCase() === sanitized,
    ) ?? null
  );
}

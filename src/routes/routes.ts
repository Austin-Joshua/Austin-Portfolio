import type { SectionId } from '@/data/sections';
import {
  parseProjectQueryParam,
  sanitizeProjectSlug,
} from '@/utils/slugValidation';

export const ROOT_ROUTE = '/';
export const PROJECTS_BASE_ROUTE = '/projects';

export const SECTION_ROUTES: Record<SectionId, string> = {
  hero: '/',
  about: '/about',
  skills: '/skills',
  projects: '/projects',
  experience: '/experience',
  achievements: '/achievements',
  contact: '/contact',
};

export const SECTION_ROUTE_TITLES: Record<SectionId, string> = {
  hero: 'Austin Joshua — AJ Cosmic Universe',
  about: 'About — Austin Joshua',
  skills: 'Skills — Austin Joshua',
  projects: 'Projects — Austin Joshua',
  experience: 'Experience — Austin Joshua',
  achievements: 'Achievements — Austin Joshua',
  contact: 'Contact — Austin Joshua',
};

const ROUTE_TO_SECTION: Record<string, SectionId> = {
  '/': 'hero',
  '/home': 'hero',
  '/hero': 'hero',
  '/sun': 'hero',
  '/about': 'about',
  '/skills': 'skills',
  '/projects': 'projects',
  '/experience': 'experience',
  '/achievements': 'achievements',
  '/contact': 'contact',
};

export interface LocationParts {
  pathname: string;
  search?: string;
  hash?: string;
}

export interface ResolvedPortfolioRoute {
  readonly sectionId: SectionId | null;
  readonly projectParam: string | null;
  readonly hasProjectParam: boolean;
  readonly shouldCanonicalize: boolean;
  readonly isUnknownPath: boolean;
}

function normalizePathname(rawPathname: string): string {
  const collapsed = rawPathname.trim().replace(/\/{2,}/g, '/');
  if (collapsed.length === 0 || collapsed === '/') {
    return '/';
  }
  return collapsed.endsWith('/') ? collapsed.slice(0, -1) : collapsed;
}

/**
 * Returns the canonical URL pathname for a portfolio section (e.g. `/` or `/achievements`).
 */
export function getSectionRoute(sectionId: SectionId): string {
  return SECTION_ROUTES[sectionId] ?? ROOT_ROUTE;
}

/**
 * Returns the canonical URL pathname for a project detail world (`/projects/:slug`).
 */
export function getProjectRoute(slug: string): string {
  const clean = sanitizeProjectSlug(slug) ?? slug.trim().toLowerCase();
  return `${PROJECTS_BASE_ROUTE}/${encodeURIComponent(clean)}`;
}

/**
 * Returns a clean document title for the resolved section or active project detail route.
 */
export function buildRouteTitle(
  sectionId: SectionId,
  projectTitle?: string | null,
): string {
  if (sectionId === 'projects' && projectTitle && projectTitle.trim().length > 0) {
    return `${projectTitle.trim()} — Projects | Austin Joshua`;
  }
  return SECTION_ROUTE_TITLES[sectionId] ?? SECTION_ROUTE_TITLES.hero;
}

/**
 * Parses legacy section hashes (`#achievements`, `#about`, `#hero`, `#sun`).
 */
export function parseLegacySectionHash(hash: string): SectionId | null {
  const cleaned = hash.trim().replace(/^#/, '').toLowerCase();
  if (!cleaned) return null;
  if (cleaned === 'sun' || cleaned === 'home' || cleaned === 'hero') {
    return 'hero';
  }
  return ROUTE_TO_SECTION[`/${cleaned}`] ?? null;
}

/**
 * Resolves clean path routes (`/about`, `/projects/agriflux`, `/achievements`, `/`)
 * as well as legacy hash (`/#achievements`) and query (`/?project=agriflux#projects`) URLs.
 */
export function resolveLocationRoute(
  parts?: LocationParts,
): ResolvedPortfolioRoute {
  const locationParts: LocationParts =
    parts ??
    (typeof window !== 'undefined'
      ? {
          pathname: window.location.pathname,
          search: window.location.search,
          hash: window.location.hash,
        }
      : { pathname: '/', search: '', hash: '' });

  const normalizedPath = normalizePathname(locationParts.pathname || '/');
  const lowerPath = normalizedPath.toLowerCase();
  const hasHash = Boolean(locationParts.hash && locationParts.hash.trim().length > 0);
  const query = parseProjectQueryParam(locationParts.search ?? '');

  // Check `/projects/:slug` path route first
  if (lowerPath.startsWith(`${PROJECTS_BASE_ROUTE}/`)) {
    const rawSlugSegment = normalizedPath.slice(`${PROJECTS_BASE_ROUTE}/`.length);
    const hasExtraSlash = rawSlugSegment.includes('/');
    const singleSegment = hasExtraSlash ? '' : rawSlugSegment;
    return {
      sectionId: 'projects',
      projectParam: singleSegment,
      hasProjectParam: true,
      shouldCanonicalize:
        hasHash ||
        query.hasParam ||
        hasExtraSlash ||
        locationParts.pathname !== normalizedPath ||
        rawSlugSegment !== rawSlugSegment.toLowerCase(),
      isUnknownPath: false,
    };
  }

  // Legacy query deep link: `/?project=agriflux#projects` -> `/projects/agriflux`
  if (query.hasParam) {
    return {
      sectionId: 'projects',
      projectParam: query.rawValue,
      hasProjectParam: true,
      shouldCanonicalize: true,
      isUnknownPath: false,
    };
  }

  const matchedSection = ROUTE_TO_SECTION[lowerPath] ?? null;
  if (matchedSection && matchedSection !== 'hero') {
    const canonicalPath = getSectionRoute(matchedSection);
    return {
      sectionId: matchedSection,
      projectParam: null,
      hasProjectParam: false,
      shouldCanonicalize:
        hasHash ||
        locationParts.pathname !== canonicalPath,
      isUnknownPath: false,
    };
  }

  const hashSection = parseLegacySectionHash(locationParts.hash ?? '');
  if (matchedSection === 'hero') {
    if (hashSection) {
      return {
        sectionId: hashSection,
        projectParam: null,
        hasProjectParam: false,
        shouldCanonicalize: true,
        isUnknownPath: false,
      };
    }

    return {
      sectionId: 'hero',
      projectParam: null,
      hasProjectParam: false,
      shouldCanonicalize: hasHash || locationParts.pathname !== ROOT_ROUTE,
      isUnknownPath: false,
    };
  }

  // Unknown route -> gracefully fall back to root overview
  return {
    sectionId: null,
    projectParam: null,
    hasProjectParam: false,
    shouldCanonicalize: true,
    isUnknownPath: true,
  };
}

/**
 * Builds the canonical URL for navigating to a portfolio section.
 */
export function buildSectionUrl(sectionId: SectionId): string {
  return getSectionRoute(sectionId);
}

/**
 * Builds the canonical URL for opening or closing a project modal.
 */
export function buildProjectUrl(slug: string | null): string {
  return slug !== null ? getProjectRoute(slug) : PROJECTS_BASE_ROUTE;
}

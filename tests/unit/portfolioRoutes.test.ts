import { describe, expect, it } from 'vitest';
import {
  buildProjectUrl,
  buildRouteTitle,
  buildSectionUrl,
  getProjectRoute,
  getSectionRoute,
  parseLegacySectionHash,
  PROJECTS_BASE_ROUTE,
  resolveLocationRoute,
  ROOT_ROUTE,
  SECTION_ROUTES,
} from '@/routes/routes';

describe('Canonical Portfolio Route Registry', () => {
  it('defines clean paths for every section and project detail page', () => {
    expect(ROOT_ROUTE).toBe('/');
    expect(PROJECTS_BASE_ROUTE).toBe('/projects');
    expect(SECTION_ROUTES).toEqual({
      hero: '/',
      about: '/about',
      skills: '/skills',
      projects: '/projects',
      experience: '/experience',
      achievements: '/achievements',
      contact: '/contact',
    });

    expect(getSectionRoute('hero')).toBe('/');
    expect(getSectionRoute('achievements')).toBe('/achievements');
    expect(getProjectRoute('agriflux')).toBe('/projects/agriflux');
    expect(buildSectionUrl('skills')).toBe('/skills');
    expect(buildProjectUrl('rit-digital-twin')).toBe('/projects/rit-digital-twin');
    expect(buildProjectUrl(null)).toBe('/projects');
  });

  it('resolves clean path routes, trailing slashes, and document titles accurately', () => {
    expect(resolveLocationRoute({ pathname: '/achievements' })).toEqual({
      sectionId: 'achievements',
      projectParam: null,
      hasProjectParam: false,
      shouldCanonicalize: false,
      isUnknownPath: false,
    });

    expect(resolveLocationRoute({ pathname: '/achievements/' })).toEqual({
      sectionId: 'achievements',
      projectParam: null,
      hasProjectParam: false,
      shouldCanonicalize: true,
      isUnknownPath: false,
    });

    expect(resolveLocationRoute({ pathname: '/projects/agriflux' })).toEqual({
      sectionId: 'projects',
      projectParam: 'agriflux',
      hasProjectParam: true,
      shouldCanonicalize: false,
      isUnknownPath: false,
    });

    expect(buildRouteTitle('hero')).toBe('Austin Joshua — AJ Cosmic Universe');
    expect(buildRouteTitle('achievements')).toBe('Achievements — Austin Joshua');
    expect(buildRouteTitle('projects', 'AgriFlux')).toBe(
      'AgriFlux — Projects | Austin Joshua',
    );
  });

  it('normalizes legacy hash fragments and ?project= query links into clean paths', () => {
    expect(parseLegacySectionHash('#ACHIEVEMENTS')).toBe('achievements');
    expect(parseLegacySectionHash('#sun')).toBe('hero');
    expect(parseLegacySectionHash('#unknown')).toBeNull();

    expect(resolveLocationRoute({ pathname: '/', hash: '#achievements' })).toEqual({
      sectionId: 'achievements',
      projectParam: null,
      hasProjectParam: false,
      shouldCanonicalize: true,
      isUnknownPath: false,
    });

    expect(
      resolveLocationRoute({
        pathname: '/',
        search: '?project=agriflux',
        hash: '#projects',
      }),
    ).toEqual({
      sectionId: 'projects',
      projectParam: 'agriflux',
      hasProjectParam: true,
      shouldCanonicalize: true,
      isUnknownPath: false,
    });

    expect(resolveLocationRoute({ pathname: '/nonexistent-page' })).toEqual({
      sectionId: null,
      projectParam: null,
      hasProjectParam: false,
      shouldCanonicalize: true,
      isUnknownPath: true,
    });
  });
});

import {
  buildProjectUrl,
  buildRouteTitle,
  buildSectionUrl,
  getProjectRoute,
  getSectionRoute,
  parseLegacySectionHash,
  resolveLocationRoute,
  SECTION_ROUTES,
} from '@/routes/routes';

export type SectionId =
  | 'hero'
  | 'about'
  | 'skills'
  | 'projects'
  | 'experience'
  | 'achievements'
  | 'contact';

export interface SectionDefinition {
  id: SectionId;
  index: string;
  label: string;
  route: string;
}

export const PORTFOLIO_SECTIONS: readonly SectionDefinition[] = [
  { id: 'hero', index: '01', label: 'Hero', route: SECTION_ROUTES.hero },
  { id: 'about', index: '02', label: 'About', route: SECTION_ROUTES.about },
  { id: 'skills', index: '03', label: 'Skills', route: SECTION_ROUTES.skills },
  { id: 'projects', index: '04', label: 'Projects', route: SECTION_ROUTES.projects },
  { id: 'experience', index: '05', label: 'Experience', route: SECTION_ROUTES.experience },
  { id: 'achievements', index: '06', label: 'Achievements', route: SECTION_ROUTES.achievements },
  { id: 'contact', index: '07', label: 'Contact', route: SECTION_ROUTES.contact },
] as const;

export const PRIMARY_NAV_SECTIONS: readonly SectionDefinition[] =
  PORTFOLIO_SECTIONS.filter((section) => section.id !== 'hero');

const SECTION_ID_SET = new Set<string>(PORTFOLIO_SECTIONS.map((s) => s.id));

export function isSectionId(value: string): value is SectionId {
  return SECTION_ID_SET.has(value);
}

export function parseSectionHash(hash: string): SectionId | null {
  return parseLegacySectionHash(hash);
}

export {
  buildProjectUrl,
  buildRouteTitle,
  buildSectionUrl,
  getProjectRoute,
  getSectionRoute,
  resolveLocationRoute,
  SECTION_ROUTES,
};

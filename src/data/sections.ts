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
}

export const PORTFOLIO_SECTIONS: readonly SectionDefinition[] = [
  { id: 'hero', index: '01', label: 'Hero' },
  { id: 'about', index: '02', label: 'About' },
  { id: 'skills', index: '03', label: 'Skills' },
  { id: 'projects', index: '04', label: 'Projects' },
  { id: 'experience', index: '05', label: 'Experience' },
  { id: 'achievements', index: '06', label: 'Achievements' },
  { id: 'contact', index: '07', label: 'Contact' },
] as const;

export const PRIMARY_NAV_SECTIONS: readonly SectionDefinition[] =
  PORTFOLIO_SECTIONS.filter((section) => section.id !== 'hero');

const SECTION_ID_SET = new Set<string>(PORTFOLIO_SECTIONS.map((s) => s.id));

export function isSectionId(value: string): value is SectionId {
  return SECTION_ID_SET.has(value);
}

export function parseSectionHash(hash: string): SectionId | null {
  const cleaned = hash.trim().replace(/^#/, '').toLowerCase();
  return isSectionId(cleaned) ? cleaned : null;
}

export function buildSectionUrl(sectionId: SectionId, currentHref?: string): string {
  if (typeof window === 'undefined' && !currentHref) {
    return `/#${sectionId}`;
  }

  try {
    const base =
      currentHref ??
      (typeof window !== 'undefined' ? window.location.href : 'http://localhost/');
    const url = new URL(base);
    url.hash = `#${sectionId}`;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return `/#${sectionId}`;
  }
}

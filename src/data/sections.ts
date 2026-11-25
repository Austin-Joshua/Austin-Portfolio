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

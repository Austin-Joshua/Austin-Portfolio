export interface PortraitAsset {
  readonly src: string;
  readonly alt: string;
  readonly width?: number;
  readonly height?: number;
}

export interface ResumeAsset {
  readonly url: string;
  readonly label: string;
  readonly sizeLabel?: string;
}

export interface ProfileData {
  readonly name: string;
  readonly roleLabel: string | null;
  readonly heroTagline: string | null;
  readonly aboutParagraphs: readonly string[];
  readonly aboutPendingNotice: string;
  readonly portrait: PortraitAsset | null;
  readonly resume: ResumeAsset | null;
}

export interface SkillItem {
  readonly id: string;
  readonly name: string;
  readonly projectSlugs?: readonly string[];
}

export interface SkillCategory {
  readonly id: string;
  readonly label: string;
  readonly description?: string | null;
  readonly items: readonly SkillItem[];
}

export type ProjectCategorySlug =
  | 'software-engineering'
  | 'ai-ml'
  | 'interactive-3d'
  | (string & {});

export interface ProjectMediaItem {
  readonly src: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
}

export interface ProjectLinks {
  readonly github: string | null;
  readonly live: string | null;
}

export interface ProjectItem {
  readonly slug: string;
  readonly indexCode: string;
  readonly title: string;
  readonly category: ProjectCategorySlug;
  readonly categoryLabel: string;
  readonly summary: string;
  readonly role: string | null;
  readonly stack: readonly string[];
  readonly skillIds?: readonly string[];
  readonly problem: string;
  readonly approach: string;
  readonly outcomes?: readonly string[];
  readonly media?: readonly ProjectMediaItem[];
  readonly links: ProjectLinks;
}

export interface ExperienceItem {
  readonly id: string;
  readonly role: string;
  readonly organization: string;
  readonly period: string;
  readonly locationOrMode?: string | null;
  readonly description?: string | null;
  readonly highlights: readonly string[];
}

export type AchievementAccent = 'gold' | 'copper' | 'primary';

export interface AchievementItem {
  readonly id: string;
  readonly title: string;
  readonly issuer: string;
  readonly date: string;
  readonly context?: string | null;
  readonly accent?: AchievementAccent;
  readonly verificationUrl?: string | null;
}

export type SocialPlatform = 'github' | 'linkedin' | 'x' | 'website' | 'other';

export interface SocialLinkItem {
  readonly id: string;
  readonly platform: SocialPlatform;
  readonly label: string;
  readonly url: string;
  readonly handle?: string | null;
}

export interface ContactData {
  readonly headline: string | null;
  readonly email: string | null;
  readonly availabilityNote: string | null;
  readonly socialLinks: readonly SocialLinkItem[];
}

import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { achievementsData } from '@/data/achievements';
import { contactData } from '@/data/contact';
import { experienceData } from '@/data/experience';
import { profileData } from '@/data/profile';
import { projectsData } from '@/data/projects';
import { skillsData } from '@/data/skills';
import { useClipboard } from '@/hooks/useClipboard';
import type { ProjectItem, SkillItem } from '@/types/portfolio';
import {
  hasNonEmptyText,
  isValidEmailAddress,
  isValidHttpUrl,
  isValidLocalOrHttpAssetUrl,
} from '@/utils/dataGuards';
import {
  ALL_PROJECT_CATEGORY,
  extractProjectCategories,
  filterProjectsByCategory,
  formatProjectCountAnnouncement,
} from '@/utils/projectFilters';
import { getProjectsForSkill } from '@/utils/skillCrossRef';

describe('Phase 4 data modules and utilities', () => {
  const originalClipboard = Object.getOwnPropertyDescriptor(
    navigator,
    'clipboard',
  );

  afterEach(() => {
    if (originalClipboard) {
      Object.defineProperty(navigator, 'clipboard', originalClipboard);
    }
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('keeps initial data modules neutral, unfabricated, and free of literal TBD strings', () => {
    expect(profileData.name).toBe('Austin Joshua');
    expect(profileData.portrait).toBeNull();
    expect(profileData.resume).toBeNull();
    expect(skillsData).toEqual([]);
    expect(projectsData).toEqual([]);
    expect(experienceData).toEqual([]);
    expect(achievementsData).toEqual([]);
    expect(contactData.email).toBeNull();
    expect(contactData.socialLinks).toEqual([]);

    const serialized = JSON.stringify({
      profileData,
      skillsData,
      projectsData,
      experienceData,
      achievementsData,
      contactData,
    });
    expect(serialized).not.toMatch(/\bTBD\b|Lorem ipsum/i);
  });

  it('validates text, emails, local asset paths, and safe http(s) URLs cleanly', () => {
    expect(hasNonEmptyText('  Austin  ')).toBe(true);
    expect(hasNonEmptyText('   ')).toBe(false);

    expect(isValidHttpUrl('https://github.com/example')).toBe(true);
    expect(isValidHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isValidHttpUrl('data:text/html,hi')).toBe(false);

    expect(isValidLocalOrHttpAssetUrl('/assets/portrait/photo.webp')).toBe(true);
    expect(isValidLocalOrHttpAssetUrl('//evil.example/img.png')).toBe(false);

    expect(isValidEmailAddress('austin@example.com')).toBe(true);
    expect(isValidEmailAddress('invalid email@example.com')).toBe(false);
  });

  it('matches skill-to-project cross-references strictly from typed IDs and slugs', () => {
    const sampleProjects: ProjectItem[] = [
      {
        slug: 'alpha-engine',
        indexCode: 'P-01',
        title: 'Alpha Engine',
        category: 'ai-ml',
        categoryLabel: 'AI / ML',
        summary: 'Uses TypeScript wording in summary only.',
        role: 'Lead',
        stack: ['Python'],
        skillIds: ['pytorch'],
        problem: 'Problem statement',
        approach: 'Technical approach',
        links: { github: null, live: null },
      },
      {
        slug: 'beta-ui',
        indexCode: 'P-02',
        title: 'Beta UI',
        category: 'software-engineering',
        categoryLabel: 'Software',
        summary: 'Interface engineering',
        role: 'Author',
        stack: ['TypeScript'],
        problem: 'Problem statement',
        approach: 'Technical approach',
        links: { github: null, live: null },
      },
    ];

    const tsSkill: SkillItem = {
      id: 'typescript',
      name: 'TypeScript',
      projectSlugs: ['beta-ui'],
    };
    const pytorchSkill: SkillItem = {
      id: 'pytorch',
      name: 'PyTorch',
    };

    expect(getProjectsForSkill(tsSkill, sampleProjects).map((p) => p.slug)).toEqual([
      'beta-ui',
    ]);
    expect(
      getProjectsForSkill(pytorchSkill, sampleProjects).map((p) => p.slug),
    ).toEqual(['alpha-engine']);
  });

  it('extracts unique categories, filters projects, and formats count announcements', () => {
    const sampleProjects: ProjectItem[] = [
      {
        slug: 'one',
        indexCode: 'P-01',
        title: 'One',
        category: 'ai-ml',
        categoryLabel: 'AI / ML',
        summary: 'First',
        role: null,
        stack: ['Python'],
        problem: 'Problem',
        approach: 'Approach',
        links: { github: null, live: null },
      },
      {
        slug: 'two',
        indexCode: 'P-02',
        title: 'Two',
        category: 'software-engineering',
        categoryLabel: 'Software',
        summary: 'Second',
        role: null,
        stack: ['TypeScript'],
        problem: 'Problem',
        approach: 'Approach',
        links: { github: null, live: null },
      },
    ];

    expect(extractProjectCategories(sampleProjects)).toEqual([
      { id: ALL_PROJECT_CATEGORY, label: 'All' },
      { id: 'ai-ml', label: 'AI / ML' },
      { id: 'software-engineering', label: 'Software' },
    ]);
    expect(filterProjectsByCategory(sampleProjects, 'ai-ml')).toHaveLength(1);
    expect(formatProjectCountAnnouncement(1, 'AI / ML')).toBe(
      'Showing 1 project in AI / ML.',
    );
    expect(formatProjectCountAnnouncement(0, 'Interactive / 3D')).toBe(
      'No projects match Interactive / 3D.',
    );
  });

  it('handles useClipboard copy success, rejection fallback, and unavailable API safely', async () => {
    vi.useFakeTimers();

    const writeTextSuccess = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: writeTextSuccess },
    });

    const { result, unmount } = renderHook(() => useClipboard({ resetDelayMs: 2000 }));

    let ok = false;
    await act(async () => {
      ok = await result.current.copy('austin@example.com');
    });
    expect(ok).toBe(true);
    expect(result.current.status).toBe('copied');
    expect(result.current.announcement).toMatch(/copied/i);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.status).toBe('idle');

    // Rejection fallback
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error('NotAllowedError')) },
    });

    await act(async () => {
      ok = await result.current.copy('austin@example.com');
    });
    expect(ok).toBe(false);
    expect(result.current.status).toBe('fallback');
    expect(result.current.announcement).toMatch(/direct email/i);

    // Unavailable Clipboard API
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    });

    await act(async () => {
      ok = await result.current.copy('austin@example.com');
    });
    expect(ok).toBe(false);
    expect(result.current.status).toBe('fallback');

    unmount();
  });
});

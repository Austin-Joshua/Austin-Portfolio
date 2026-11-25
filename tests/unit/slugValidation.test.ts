import { describe, expect, it } from 'vitest';
import type { ProjectItem } from '@/types/portfolio';
import {
  parseProjectQueryParam,
  resolveProjectBySlug,
  sanitizeProjectSlug,
} from '@/utils/slugValidation';

const SAMPLE_PROJECTS: ProjectItem[] = [
  {
    slug: 'orbital-engine',
    indexCode: 'P-01',
    title: 'Orbital Engine',
    category: 'software-engineering',
    categoryLabel: 'Software',
    summary: 'Spatial simulation engine.',
    role: 'Author',
    stack: ['TypeScript'],
    problem: 'Problem statement.',
    approach: 'Technical approach.',
    links: { github: null, live: null },
  },
];

describe('slugValidation', () => {
  it('accepts valid kebab-case slugs matching verified project records', () => {
    expect(sanitizeProjectSlug('orbital-engine')).toBe('orbital-engine');
    expect(sanitizeProjectSlug('  ORBITAL-ENGINE  ')).toBe('orbital-engine');
    expect(resolveProjectBySlug('orbital-engine', SAMPLE_PROJECTS)?.title).toBe(
      'Orbital Engine',
    );
  });

  it('rejects unknown, empty, malformed-encoded, and unsafe slugs', () => {
    expect(sanitizeProjectSlug('')).toBeNull();
    expect(sanitizeProjectSlug('   ')).toBeNull();
    expect(sanitizeProjectSlug('%E0%A4%A')).toBeNull();
    expect(sanitizeProjectSlug('<script>alert(1)</script>')).toBeNull();
    expect(sanitizeProjectSlug('../etc/passwd')).toBeNull();
    expect(sanitizeProjectSlug('a'.repeat(121))).toBeNull();

    expect(resolveProjectBySlug('unknown-project', SAMPLE_PROJECTS)).toBeNull();
    expect(resolveProjectBySlug('<img src=x>', SAMPLE_PROJECTS)).toBeNull();
  });

  it('rejects all slugs cleanly when projects dataset is empty', () => {
    expect(resolveProjectBySlug('orbital-engine', [])).toBeNull();
  });

  it('parses project query parameter safely including empty values', () => {
    expect(parseProjectQueryParam('?project=orbital-engine')).toEqual({
      hasParam: true,
      rawValue: 'orbital-engine',
    });
    expect(parseProjectQueryParam('?project=')).toEqual({
      hasParam: true,
      rawValue: '',
    });
    expect(parseProjectQueryParam('')).toEqual({
      hasParam: false,
      rawValue: null,
    });
  });
});

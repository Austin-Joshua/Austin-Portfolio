import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useProjectUrlState } from '@/hooks/useProjectUrlState';
import type { ProjectItem } from '@/types/portfolio';

const PROJECTS: ProjectItem[] = [
  {
    slug: 'alpha-system',
    indexCode: 'P-01',
    title: 'Alpha System',
    category: 'software-engineering',
    categoryLabel: 'Software',
    summary: 'Alpha summary',
    role: null,
    stack: ['TypeScript'],
    problem: 'Alpha problem',
    approach: 'Alpha approach',
    links: { github: null, live: null },
  },
  {
    slug: 'beta-neural',
    indexCode: 'P-02',
    title: 'Beta Neural',
    category: 'ai-ml',
    categoryLabel: 'AI / ML',
    summary: 'Beta summary',
    role: null,
    stack: ['Python'],
    problem: 'Beta problem',
    approach: 'Beta approach',
    links: { github: null, live: null },
  },
];

describe('useProjectUrlState', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
  });

  afterEach(() => {
    window.history.replaceState(null, '', '/');
    vi.restoreAllMocks();
  });

  it('opens matching project modal on canonical /projects/:slug and normalizes legacy ?project= links', () => {
    window.history.replaceState(null, '', '/?project=alpha-system#projects');

    const { result } = renderHook(() =>
      useProjectUrlState({ projects: PROJECTS }),
    );

    expect(result.current.activeProject?.slug).toBe('alpha-system');
    expect(result.current.invalidSlugNotice).toBeNull();
    expect(window.location.pathname).toBe('/projects/alpha-system');
    expect(window.location.search).toBe('');
    expect(window.location.hash).toBe('');
  });

  it('strips invalid deep link on mount via replaceState, normalizes to /projects, and triggers invalid notice', () => {
    window.history.replaceState(null, '', '/projects/non-existent');
    const onInvalidSlug = vi.fn();

    const { result } = renderHook(() =>
      useProjectUrlState({ projects: PROJECTS, onInvalidSlug }),
    );

    expect(result.current.activeProject).toBeNull();
    expect(result.current.invalidSlugNotice).toMatch(/not found/i);
    expect(window.location.pathname).toBe('/projects');
    expect(window.location.search).toBe('');
    expect(window.location.hash).toBe('');
    expect(onInvalidSlug).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.dismissInvalidSlugNotice();
    });
    expect(result.current.invalidSlugNotice).toBeNull();
  });

  it('pushes history without duplicates when opening, switching, closing, and handling Back/Forward popstate', () => {
    const pushSpy = vi.spyOn(window.history, 'pushState');

    const { result, unmount } = renderHook(() =>
      useProjectUrlState({ projects: PROJECTS }),
    );

    act(() => {
      result.current.openProject('alpha-system');
    });
    expect(result.current.activeProject?.slug).toBe('alpha-system');
    expect(window.location.pathname).toBe('/projects/alpha-system');
    expect(pushSpy).toHaveBeenCalledTimes(1);

    // Calling openProject again for same slug must not push duplicate entry
    act(() => {
      result.current.openProject('alpha-system');
    });
    expect(pushSpy).toHaveBeenCalledTimes(1);

    // Switching directly from project A to project B
    act(() => {
      result.current.openProject('beta-neural');
    });
    expect(result.current.activeProject?.slug).toBe('beta-neural');
    expect(window.location.pathname).toBe('/projects/beta-neural');
    expect(pushSpy).toHaveBeenCalledTimes(2);

    // Simulated Browser Back to alpha-system
    act(() => {
      window.history.replaceState(null, '', '/projects/alpha-system');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(result.current.activeProject?.slug).toBe('alpha-system');
    expect(pushSpy).toHaveBeenCalledTimes(2);

    // Simulated Browser Back to clean /projects URL (closes without pushing history loop)
    act(() => {
      window.history.replaceState(null, '', '/projects');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(result.current.activeProject).toBeNull();
    expect(pushSpy).toHaveBeenCalledTimes(2);

    // Simulated Browser Forward back into alpha-system
    act(() => {
      window.history.replaceState(null, '', '/projects/alpha-system');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(result.current.activeProject?.slug).toBe('alpha-system');

    // Close via Close action
    act(() => {
      result.current.closeProject();
    });
    expect(result.current.activeProject).toBeNull();
    expect(window.location.pathname).toBe('/projects');
    expect(pushSpy).toHaveBeenCalledTimes(3);

    const removeSpy = vi.spyOn(window, 'removeEventListener');
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('popstate', expect.any(Function));
  });
});

import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useActiveSection } from '@/hooks/useActiveSection';

function ActiveSectionProbe({ sectionIds }: { sectionIds: readonly string[] }) {
  const active = useActiveSection({ sectionIds });
  return <span data-testid="active-section">{active}</span>;
}

describe('useActiveSection', () => {
  const originalObserver = window.IntersectionObserver;

  afterEach(() => {
    window.IntersectionObserver = originalObserver;
    vi.restoreAllMocks();
  });

  it('defaults to hero when no observed sections exist in the DOM', () => {
    render(<ActiveSectionProbe sectionIds={['hero', 'about', 'projects']} />);
    expect(screen.getByTestId('active-section')).toHaveTextContent('hero');
  });

  it('updates active section based on IntersectionObserver entries and disconnects on unmount', () => {
    let observerCallback: IntersectionObserverCallback | undefined;
    const observeMock = vi.fn();
    const disconnectMock = vi.fn();

    class MockIntersectionObserver implements IntersectionObserver {
      public readonly root: Element | Document | null = null;
      public readonly rootMargin: string = '';
      public readonly thresholds: ReadonlyArray<number> = [];

      constructor(cb: IntersectionObserverCallback) {
        observerCallback = cb;
      }

      observe = observeMock;
      unobserve = vi.fn();
      disconnect = disconnectMock;
      takeRecords = vi.fn(() => []);
    }

    window.IntersectionObserver =
      MockIntersectionObserver;

    const heroEl = document.createElement('section');
    heroEl.id = 'hero';
    const aboutEl = document.createElement('section');
    aboutEl.id = 'about';
    const projectsEl = document.createElement('section');
    projectsEl.id = 'projects';
    document.body.append(heroEl, aboutEl, projectsEl);

    try {
      const { unmount } = render(
        <ActiveSectionProbe sectionIds={['hero', 'about', 'projects']} />,
      );

      expect(observeMock).toHaveBeenCalledTimes(3);
      expect(screen.getByTestId('active-section')).toHaveTextContent('hero');

      act(() => {
        observerCallback?.(
          [
            {
              target: heroEl,
              isIntersecting: false,
              intersectionRatio: 0,
            } as unknown as IntersectionObserverEntry,
            {
              target: aboutEl,
              isIntersecting: true,
              intersectionRatio: 0.45,
            } as unknown as IntersectionObserverEntry,
          ],
          {} as IntersectionObserver,
        );
      });

      expect(screen.getByTestId('active-section')).toHaveTextContent('about');

      act(() => {
        observerCallback?.(
          [
            {
              target: aboutEl,
              isIntersecting: true,
              intersectionRatio: 0.2,
            } as unknown as IntersectionObserverEntry,
            {
              target: projectsEl,
              isIntersecting: true,
              intersectionRatio: 0.7,
            } as unknown as IntersectionObserverEntry,
          ],
          {} as IntersectionObserver,
        );
      });

      expect(screen.getByTestId('active-section')).toHaveTextContent('projects');

      // Leaving without a replacement section entering should avoid flickering back
      act(() => {
        observerCallback?.(
          [
            {
              target: aboutEl,
              isIntersecting: false,
              intersectionRatio: 0,
            } as unknown as IntersectionObserverEntry,
            {
              target: projectsEl,
              isIntersecting: false,
              intersectionRatio: 0,
            } as unknown as IntersectionObserverEntry,
          ],
          {} as IntersectionObserver,
        );
      });

      expect(screen.getByTestId('active-section')).toHaveTextContent('projects');

      unmount();
      expect(disconnectMock).toHaveBeenCalledTimes(1);
    } finally {
      heroEl.remove();
      aboutEl.remove();
      projectsEl.remove();
    }
  });
});

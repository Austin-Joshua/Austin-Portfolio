import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { DesktopSectionRail } from '@/components/layout/DesktopSectionRail';
import { Navbar } from '@/components/layout/Navbar';
import { ScrollProgressBar } from '@/components/layout/ScrollProgressBar';
import { MotionPreferenceProvider } from '@/context/MotionPreferenceContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { PORTFOLIO_SECTIONS, type SectionId } from '@/data/sections';

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <ThemeProvider>
      <MotionPreferenceProvider>{ui}</MotionPreferenceProvider>
    </ThemeProvider>,
  );
}

describe('T3.3 Navigation Enhancements', () => {
  const originalMatchMedia = Object.getOwnPropertyDescriptor(window, 'matchMedia');

  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    if (originalMatchMedia) {
      Object.defineProperty(window, 'matchMedia', originalMatchMedia);
    }
    vi.restoreAllMocks();
  });

  it('updates ScrollProgressBar transform and aria-valuenow via GSAP ScrollTrigger and reverts on unmount', async () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const revertSpy = vi.fn();
    let capturedConfig: ScrollTrigger.Vars | undefined;

    vi.spyOn(gsap, 'context').mockImplementation((fn) => {
      if (typeof fn === 'function') {
        fn({} as gsap.Context);
      }
      return { revert: revertSpy } as unknown as gsap.Context;
    });

    const createSpy = vi
      .spyOn(ScrollTrigger, 'create')
      .mockImplementation((config) => {
        capturedConfig = config;
        return { progress: 0 } as unknown as ScrollTrigger;
      });

    const { unmount } = renderWithProviders(<ScrollProgressBar />);

    const bar = screen.getByTestId('scroll-progress-bar');
    const fill = screen.getByTestId('scroll-progress-fill');

    expect(bar).toHaveAttribute('role', 'progressbar');
    expect(bar).not.toHaveAttribute('aria-live');
    expect(bar).toHaveAttribute('aria-valuenow', '0');

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledTimes(1);
    });

    capturedConfig?.onUpdate?.({ progress: 0.5 } as ScrollTrigger);
    expect(fill.style.transform).toBe('scaleX(0.5)');
    expect(bar).toHaveAttribute('aria-valuenow', '50');

    capturedConfig?.onUpdate?.({ progress: 1 } as ScrollTrigger);
    expect(fill.style.transform).toBe('scaleX(1)');
    expect(bar).toHaveAttribute('aria-valuenow', '100');

    unmount();
    expect(revertSpy).toHaveBeenCalledTimes(1);
  });

  it('disables ScrollTrigger scroll-progress animation under prefers-reduced-motion', () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('prefers-reduced-motion: reduce'),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const createSpy = vi.spyOn(ScrollTrigger, 'create');

    renderWithProviders(<ScrollProgressBar />);

    const bar = screen.getByTestId('scroll-progress-bar');
    const fill = screen.getByTestId('scroll-progress-fill');

    expect(bar).toHaveAttribute('data-reduced-motion', 'true');
    expect(bar).toHaveAttribute('aria-valuenow', '0');
    expect(fill.style.transform).toBe('scaleX(0)');
    expect(createSpy).not.toHaveBeenCalled();
  });

  it('renders DesktopSectionRail with all seven canonical sections, aria-current sync, and passes axe', async () => {
    const user = userEvent.setup();
    const onSectionSelect = vi.fn(
      (event: React.MouseEvent<HTMLAnchorElement>, targetId: SectionId) => {
        event.preventDefault();
        return targetId;
      },
    );

    const { container } = render(
      <DesktopSectionRail
        activeSection="projects"
        onSectionSelect={onSectionSelect}
      />,
    );

    const railNav = screen.getByRole('navigation', { name: 'Section index' });
    const links = within(railNav).getAllByRole('link');
    expect(links).toHaveLength(PORTFOLIO_SECTIONS.length);

    for (const section of PORTFOLIO_SECTIONS) {
      const link = within(railNav).getByRole('link', {
        name: section.label,
      });
      expect(link).toHaveAttribute('href', `#${section.id}`);

      if (section.id === 'projects') {
        expect(link).toHaveAttribute('aria-current', 'location');
      } else {
        expect(link).not.toHaveAttribute('aria-current');
      }
    }

    await user.click(within(railNav).getByRole('link', { name: 'Contact' }));
    expect(onSectionSelect).toHaveBeenCalledTimes(1);
    expect(onSectionSelect.mock.calls[0]?.[1]).toBe('contact');
    expect(await axe(container)).toHaveNoViolations();
  });

  it('keeps approved desktop capsule, mobile bottom nav, rail, and progress without introducing a mobile drawer or hamburger', async () => {
    const { container } = renderWithProviders(<Navbar />);

    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
    expect(
      screen.getByRole('navigation', { name: 'Mobile section navigation' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Section index' })).toBeInTheDocument();
    expect(screen.getByTestId('scroll-progress-bar')).toBeInTheDocument();

    // Verify zero drawer or hamburger menu exists
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /menu|drawer|navigation/i }),
    ).not.toBeInTheDocument();

    expect(await axe(container)).toHaveNoViolations();
  });
});

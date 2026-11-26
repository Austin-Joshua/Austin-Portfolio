import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { SectionShell } from '@/components/layout/SectionShell';
import { SkipLink } from '@/components/layout/SkipLink';
import { MotionPreferenceProvider } from '@/context/MotionPreferenceContext';

function renderWithProviders(ui: React.ReactElement) {
  return render(<MotionPreferenceProvider>{ui}</MotionPreferenceProvider>);
}

describe('T3.2 Semantic Layout & Navigation Shell', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders SkipLink targeting #main-content and focuses target cleanly', async () => {
    const user = userEvent.setup();
    const scrollIntoViewMock = vi.fn();

    renderWithProviders(
      <>
        <SkipLink />
        <main id="main-content" tabIndex={-1}>
          <h1>Main Target</h1>
        </main>
      </>,
    );

    const mainEl = screen.getByRole('main');
    mainEl.scrollIntoView = scrollIntoViewMock;

    const skip = screen.getByRole('link', { name: 'Skip to main content' });
    expect(skip).toHaveAttribute('href', '#main-content');

    await user.click(skip);
    expect(mainEl).toHaveFocus();
    expect(scrollIntoViewMock).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    });
  });

  it('renders SectionShell with semantic landmark ID and Swiss index metadata', () => {
    render(
      <SectionShell
        id="about"
        index="02"
        title="About"
        description="Architectural overview."
      >
        <p>Section content</p>
      </SectionShell>,
    );

    const section = document.getElementById('about');
    expect(section).toBeInTheDocument();
    expect(section).toHaveAttribute('aria-labelledby', 'about-heading');
    // Index metadata is no longer rendered visually (removed in cinematic redesign)
    expect(screen.getByRole('heading', { level: 2, name: 'About' })).toBeInTheDocument();
  });

  it('renders circular AJ metallic emblem in Navbar without theme toggle', async () => {
    const { container } = renderWithProviders(<Navbar />);
    const emblem = screen.getByRole('img', { name: /AJ Cosmic Emblem/i });
    expect(emblem).toHaveAttribute('src', '/assets/brand/aj-emblem.png');
    expect(screen.queryByRole('button', { name: /Switch to/i })).not.toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('renders Navbar with desktop capsule links, mobile bottom bar links, active indicator, conditional resume, and passes axe', async () => {
    const { container, rerender } = renderWithProviders(
      <>
        <section id="hero" />
        <Navbar />
      </>,
    );

    const desktopNav = screen.getByRole('navigation', { name: 'Primary' });
    const mobileNav = screen.getByRole('navigation', {
      name: 'Mobile section navigation',
    });

    const expectedLabels = [
      'About',
      'Skills',
      'Projects',
      'Experience',
      'Achievements',
      'Contact',
    ];

    for (const label of expectedLabels) {
      expect(within(desktopNav).getByRole('link', { name: label })).toHaveAttribute(
        'href',
        `#${label.toLowerCase()}`,
      );
      expect(within(mobileNav).getByRole('link', { name: label })).toHaveAttribute(
        'href',
        `#${label.toLowerCase()}`,
      );
    }

    expect(screen.queryByRole('link', { name: /Résumé/i })).not.toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();

    rerender(
      <MotionPreferenceProvider>
        <section id="hero" />
        <Navbar resumeAsset={{ url: '/assets/resume/sample.pdf', label: 'Résumé' }} />
      </MotionPreferenceProvider>,
    );

    const resumeLink = screen.getByRole('link', { name: 'Résumé' });
    expect(resumeLink).toHaveAttribute('href', '/assets/resume/sample.pdf');
    expect(resumeLink).toHaveAttribute('download', 'Austin_Joshua_Resume.pdf');
  });

  it('marks the active section link with aria-current="location" across desktop and mobile navigation', () => {
    const aboutEl = document.createElement('section');
    aboutEl.id = 'about';
    const skillsEl = document.createElement('section');
    skillsEl.id = 'skills';
    document.body.append(aboutEl, skillsEl);

    let ioCallback: IntersectionObserverCallback | undefined;
    class MockIO implements IntersectionObserver {
      readonly root = null;
      readonly rootMargin = '';
      readonly thresholds = [];
      constructor(cb: IntersectionObserverCallback) {
        ioCallback = cb;
      }
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      takeRecords = vi.fn(() => []);
    }
    const prevIO = window.IntersectionObserver;
    window.IntersectionObserver = MockIO;

    try {
      renderWithProviders(
        <>
          <section id="hero" />
          <Navbar />
        </>,
      );

      act(() => {
        ioCallback?.(
          [
            {
              target: skillsEl,
              isIntersecting: true,
              intersectionRatio: 0.85,
            } as unknown as IntersectionObserverEntry,
          ],
          {} as IntersectionObserver,
        );
      });

      const desktopNav = screen.getByRole('navigation', { name: 'Primary' });
      const mobileNav = screen.getByRole('navigation', {
        name: 'Mobile section navigation',
      });

      expect(within(desktopNav).getByRole('link', { name: 'Skills' })).toHaveAttribute(
        'aria-current',
        'location',
      );
      expect(within(mobileNav).getByRole('link', { name: 'Skills' })).toHaveAttribute(
        'aria-current',
        'location',
      );
      expect(within(desktopNav).getByRole('link', { name: 'About' })).not.toHaveAttribute(
        'aria-current',
      );
    } finally {
      window.IntersectionObserver = prevIO;
      aboutEl.remove();
      skillsEl.remove();
    }
  });

  it('renders Footer with Austin Joshua identity, dynamic year, Back to Top link, and passes axe', async () => {
    const user = userEvent.setup();
    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});

    const { container } = renderWithProviders(<Footer />);
    const year = String(new Date().getFullYear());

    expect(screen.getByText('Austin Joshua')).toBeInTheDocument();
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument();

    const backToTop = screen.getByRole('link', { name: 'Back to Top' });
    expect(backToTop).toHaveAttribute('href', '#hero');

    await user.click(backToTop);
    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    expect(await axe(container)).toHaveNoViolations();

    scrollToSpy.mockRestore();
  });
});

import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LazyMotion, MotionConfig } from 'motion/react';
import { StrictMode, useRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { App } from '@/App';
import { AboutSection } from '@/components/sections/AboutSection';
import { ContactSection } from '@/components/sections/ContactSection';
import { ExperienceSection } from '@/components/sections/ExperienceSection';
import { ProjectsSection } from '@/components/sections/ProjectsSection';
import { SkillsSection } from '@/components/sections/SkillsSection';
import { ProjectDetailModal } from '@/components/ui/ProjectDetailModal';
import { MotionPreferenceProvider } from '@/context/MotionPreferenceContext';
import { ThemeProvider } from '@/context/ThemeContext';
import {
  resetGsapLoaderForTests,
  setupScopedScrollAnimation,
} from '@/motion/gsapConfig';
import { domMax } from '@/motion/motionFeatures';
import {
  createModalDialogVariants,
  REDUCED_TRANSITION,
} from '@/motion/variants';
import type {
  ContactData,
  ExperienceItem,
  ProfileData,
  ProjectItem,
  SkillCategory,
} from '@/types/portfolio';

function mockMatchMedia(reducedMotion: boolean, minDesktop = true) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => {
      let matches = false;
      if (query.includes('prefers-reduced-motion: reduce')) {
        matches = reducedMotion;
      } else if (query.includes('prefers-reduced-motion: no-preference')) {
        matches = !reducedMotion;
      } else if (query.includes('min-width: 1024px')) {
        matches = minDesktop;
      }
      return {
        matches,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      };
    }),
  });
}

function renderWithMotionProviders(ui: React.ReactElement) {
  return render(
    <ThemeProvider>
      <MotionPreferenceProvider>
        <MotionConfig reducedMotion="user">
          <LazyMotion features={domMax} strict>
            {ui}
          </LazyMotion>
        </MotionConfig>
      </MotionPreferenceProvider>
    </ThemeProvider>,
  );
}

describe('Phase 7 — GSAP & Motion Choreography', () => {
  const originalMatchMedia = Object.getOwnPropertyDescriptor(window, 'matchMedia');
  const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');

  beforeEach(() => {
    window.localStorage.clear();
    resetGsapLoaderForTests();
  });

  afterEach(() => {
    if (originalMatchMedia) {
      Object.defineProperty(window, 'matchMedia', originalMatchMedia);
    }
    if (originalClipboard) {
      Object.defineProperty(navigator, 'clipboard', originalClipboard);
    }
    vi.restoreAllMocks();
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  });

  it('setupScopedScrollAnimation skips GSAP under reduced motion and cleans up on unmount', async () => {
    mockMatchMedia(true);
    const onSetup = vi.fn();
    const onFallback = vi.fn();
    const el = document.createElement('div');
    const cleanup = setupScopedScrollAnimation(
      { current: el },
      true,
      onSetup,
      onFallback,
    );

    expect(onFallback).toHaveBeenCalledTimes(1);
    expect(onSetup).not.toHaveBeenCalled();
    cleanup();

    mockMatchMedia(false);
    const revertSpy = vi.fn();
    vi.spyOn(gsap, 'context').mockImplementation((fn) => {
      if (typeof fn === 'function') {
        fn({} as gsap.Context);
      }
      return { revert: revertSpy } as unknown as gsap.Context;
    });

    const activeSetup = vi.fn();
    const activeCleanup = setupScopedScrollAnimation(
      { current: el },
      false,
      activeSetup,
    );

    await waitFor(() => {
      expect(activeSetup).toHaveBeenCalledTimes(1);
    });

    activeCleanup();
    expect(revertSpy).toHaveBeenCalledTimes(1);
  });

  it('AboutSection initializes GSAP hairline/parallax cleanly under StrictMode and snaps to static under reduced motion', async () => {
    mockMatchMedia(false, true);
    const fromToSpy = vi.spyOn(gsap, 'fromTo').mockReturnValue({} as gsap.core.Tween);
    const revertSpy = vi.fn();
    vi.spyOn(gsap, 'context').mockImplementation((fn) => {
      if (typeof fn === 'function') {
        fn({} as gsap.Context);
      }
      return { revert: revertSpy } as unknown as gsap.Context;
    });

    const sampleProfile: ProfileData = {
      name: 'Austin Joshua',
      roleLabel: 'Computer Science Engineering',
      heroTagline: 'Systems & AI',
      aboutParagraphs: ['Engineering distributed interfaces and reliable compute.'],
      aboutPendingNotice: 'Verified narrative pending.',
      portrait: null,
      resume: null,
    };

    const { unmount } = render(
      <StrictMode>
        <ThemeProvider>
          <MotionPreferenceProvider>
            <AboutSection profile={sampleProfile} />
          </MotionPreferenceProvider>
        </ThemeProvider>
      </StrictMode>,
    );

    await waitFor(() => {
      expect(fromToSpy).toHaveBeenCalled();
    });

    unmount();
    expect(revertSpy).toHaveBeenCalled();

    // Reduced-motion static final state
    vi.restoreAllMocks();
    resetGsapLoaderForTests();
    mockMatchMedia(true, true);
    const reducedFromToSpy = vi.spyOn(gsap, 'fromTo');

    renderWithMotionProviders(<AboutSection profile={sampleProfile} />);
    expect(screen.getByTestId('about-hairline').style.transform).toBe('scaleX(1)');
    expect(screen.getByTestId('about-portrait-parallax').style.transform).toBe('none');
    expect(reducedFromToSpy).not.toHaveBeenCalled();
  });

  it('ExperienceSection skips timeline GSAP when empty and animates spine when populated', async () => {
    mockMatchMedia(false);
    const fromToSpy = vi.spyOn(gsap, 'fromTo').mockReturnValue({} as gsap.core.Tween);
    vi.spyOn(ScrollTrigger, 'create');

    const { rerender, unmount } = renderWithMotionProviders(
      <ExperienceSection entries={[]} />,
    );
    expect(screen.getByText('No experience entries added yet.')).toBeInTheDocument();
    expect(screen.queryByTestId('experience-spine-fill')).not.toBeInTheDocument();
    expect(fromToSpy).not.toHaveBeenCalled();

    const entries: ExperienceItem[] = [
      {
        id: 'exp-1',
        role: 'Systems Intern',
        organization: 'Precision Labs',
        period: '2025',
        locationOrMode: 'Remote',
        highlights: ['Reduced p99 worker latency by 28%.'],
      },
    ];

    rerender(
      <ThemeProvider>
        <MotionPreferenceProvider>
          <ExperienceSection entries={entries} />
        </MotionPreferenceProvider>
      </ThemeProvider>,
    );

    expect(screen.getByTestId('experience-spine-fill')).toBeInTheDocument();
    await waitFor(() => {
      expect(fromToSpy).toHaveBeenCalled();
    });

    unmount();

    // Reduced-motion static spine
    vi.restoreAllMocks();
    resetGsapLoaderForTests();
    mockMatchMedia(true);
    renderWithMotionProviders(<ExperienceSection entries={entries} />);
    expect(screen.getByTestId('experience-spine-fill').style.transform).toBe(
      'scaleY(1)',
    );
  });

  it('SkillsSection moves active indicator pill cleanly on tab switch inside LayoutGroup', async () => {
    mockMatchMedia(false);
    const user = userEvent.setup();
    const categories: SkillCategory[] = [
      { id: 'lang', label: 'Languages', items: [{ id: 'ts', name: 'TypeScript' }] },
      { id: 'ai', label: 'AI / ML', items: [{ id: 'pt', name: 'PyTorch' }] },
    ];

    renderWithMotionProviders(
      <SkillsSection categories={categories} projects={[]} />,
    );

    const allTab = screen.getByRole('tab', { name: 'All' });
    expect(within(allTab).getByTestId('skills-active-indicator')).toBeInTheDocument();

    const aiTab = screen.getByRole('tab', { name: 'AI / ML' });
    await user.click(aiTab);

    expect(within(aiTab).getByTestId('skills-active-indicator')).toBeInTheDocument();
    expect(within(allTab).queryByTestId('skills-active-indicator')).toBeNull();
  });

  it('ProjectsSection filters cards cleanly under LazyMotion & MotionConfig without hiding content', async () => {
    mockMatchMedia(false);
    const user = userEvent.setup();
    const sampleProjects: ProjectItem[] = [
      {
        slug: 'sys-core',
        indexCode: 'P-01',
        title: 'System Core',
        category: 'systems',
        categoryLabel: 'Systems',
        summary: 'Deterministic scheduler.',
        role: 'Author',
        stack: ['Rust'],
        problem: 'Latency variance',
        approach: 'Lock-free ring queue',
        links: { github: null, live: null },
      },
      {
        slug: 'ui-grid',
        indexCode: 'P-02',
        title: 'UI Grid',
        category: 'frontend',
        categoryLabel: 'Frontend',
        summary: 'Accessible Swiss layout.',
        role: 'Author',
        stack: ['TypeScript'],
        problem: 'Layout jitter',
        approach: 'Tokenized 12-column CSS grid',
        links: { github: null, live: null },
      },
    ];

    const { container } = renderWithMotionProviders(
      <ProjectsSection projects={sampleProjects} />,
    );

    await user.click(screen.getByRole('button', { name: /Systems/i }));
    expect(screen.getByRole('heading', { level: 3, name: 'System Core' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 3, name: 'UI Grid' })).not.toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it('ContactSection renders AnimatePresence Copy Email badge feedback cleanly', async () => {
    mockMatchMedia(false);
    const user = userEvent.setup();
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: writeTextMock },
    });

    const contact: ContactData = {
      headline: 'Engineering inquiries welcome.',
      email: 'austin@example.com',
      availabilityNote: 'Available for systems engineering',
      socialLinks: [],
    };

    renderWithMotionProviders(<ContactSection contact={contact} />);

    const badge = screen.getByTestId('copy-feedback-badge');
    expect(badge).toHaveTextContent('');
    await user.click(screen.getByRole('button', { name: 'Copy Email' }));

    await waitFor(() => {
      expect(badge).toHaveTextContent('Email address copied to clipboard.');
    });
  });

  it('ProjectDetailModal uses AnimatePresence and releases focus/scroll lock immediately on close', async () => {
    mockMatchMedia(false);
    const project: ProjectItem = {
      slug: 'modal-proj',
      indexCode: 'P-01',
      title: 'Modal Project',
      category: 'systems',
      categoryLabel: 'Systems',
      summary: 'Modal animation test.',
      role: 'Engineer',
      stack: ['TypeScript'],
      problem: 'Scroll lock race',
      approach: 'Release on useIsPresent() exit',
      links: { github: null, live: null },
    };

    function ModalHarness({ open }: { open: boolean }) {
      const triggerRef = useRef<HTMLButtonElement>(null);
      return (
        <div>
          <button ref={triggerRef} type="button">
            Open Trigger
          </button>
          <ProjectDetailModal
            project={open ? project : null}
            onClose={vi.fn()}
            fallbackFocusRef={triggerRef}
          />
        </div>
      );
    }

    const { rerender } = renderWithMotionProviders(<ModalHarness open={false} />);
    const trigger = screen.getByRole('button', { name: 'Open Trigger' });

    act(() => {
      rerender(
        <ThemeProvider>
          <MotionPreferenceProvider>
            <MotionConfig reducedMotion="user">
              <LazyMotion features={domMax} strict>
                <ModalHarness open={true} />
              </LazyMotion>
            </MotionConfig>
          </MotionPreferenceProvider>
        </ThemeProvider>,
      );
    });

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(document.body.style.overflow).toBe('hidden');
    });

    act(() => {
      rerender(
        <ThemeProvider>
          <MotionPreferenceProvider>
            <MotionConfig reducedMotion="user">
              <LazyMotion features={domMax} strict>
                <ModalHarness open={false} />
              </LazyMotion>
            </MotionConfig>
          </MotionPreferenceProvider>
        </ThemeProvider>,
      );
    });

    await waitFor(() => {
      expect(document.body.style.overflow).toBe('');
      expect(trigger).toHaveFocus();
    });

    // Verify reduced-motion modal variants use minimal opacity fade
    const reducedVariants = createModalDialogVariants(false, true);
    expect(reducedVariants.visible).toEqual({
      opacity: 1,
      transition: REDUCED_TRANSITION,
    });
  });

  it('full App renders all 7 sections cleanly under StrictMode and passes vitest-axe', async () => {
    mockMatchMedia(false, true);
    const { container } = render(
      <StrictMode>
        <ThemeProvider>
          <MotionPreferenceProvider>
            <App />
          </MotionPreferenceProvider>
        </ThemeProvider>
      </StrictMode>,
    );

    const sections = container.querySelectorAll('main section[id]');
    expect(sections).toHaveLength(7);
    sections.forEach((section) => {
      expect(getComputedStyle(section).opacity).not.toBe('0');
    });

    // Simulate resize safely without throwing
    fireEvent(window, new Event('resize'));
    expect(await axe(container)).toHaveNoViolations();
  });
});

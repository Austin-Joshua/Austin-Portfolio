import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LazyMotion, MotionConfig } from 'motion/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { CosmicIntroLoader } from '@/components/layout/CosmicIntroLoader';
import { MotionPreferenceProvider } from '@/context/MotionPreferenceContext';
import { domMax } from '@/motion/motionFeatures';

function renderLoader(ui: React.ReactElement) {
  return render(
    <MotionPreferenceProvider>
      <MotionConfig reducedMotion="user">
        <LazyMotion features={domMax} strict>
          {ui}
        </LazyMotion>
      </MotionConfig>
    </MotionPreferenceProvider>,
  );
}

describe('CosmicIntroLoader — AJ emblem + separate cosmic aura + horizontal split', () => {
  const originalMatchMedia = Object.getOwnPropertyDescriptor(window, 'matchMedia');

  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove('aj-intro-pending', 'aj-intro-seen');
  });

  afterEach(() => {
    if (originalMatchMedia) {
      Object.defineProperty(window, 'matchMedia', originalMatchMedia);
    }
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('plays on every load/refresh with static AJ emblem over separate cosmic aura and splits horizontally', async () => {
    const { container, unmount: unmountAxe } = renderLoader(<CosmicIntroLoader />);
    expect(await axe(container)).toHaveNoViolations();
    unmountAxe();

    vi.useFakeTimers();

    const { unmount } = renderLoader(<CosmicIntroLoader />);

    const loader = screen.getByTestId('cosmic-intro-loader');
    expect(loader).toHaveAttribute('data-phase', 'holding');
    expect(screen.getByRole('img', { name: /AJ metallic circular emblem/i })).toHaveAttribute(
      'src',
      '/assets/brand/aj-emblem.png',
    );
    expect(screen.getByTestId('intro-cosmic-aura')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('intro-curtain-left')).toBeInTheDocument();
    expect(screen.getByTestId('intro-curtain-right')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(900);
    });
    expect(screen.getByTestId('cosmic-intro-loader')).toHaveAttribute('data-phase', 'splitting');

    act(() => {
      vi.advanceTimersByTime(850);
    });
    expect(screen.queryByTestId('cosmic-intro-loader')).not.toBeInTheDocument();
    unmount();

    // Subsequent refresh / remount ALSO replays the intro loader per user preference
    renderLoader(<CosmicIntroLoader />);
    expect(screen.getByTestId('cosmic-intro-loader')).toHaveAttribute('data-phase', 'holding');
  });

  it('allows immediate skip via Skip button and Escape key', async () => {
    const user = userEvent.setup();
    renderLoader(<CosmicIntroLoader />);

    await user.click(screen.getByTestId('intro-skip-button'));
    expect(screen.queryByTestId('cosmic-intro-loader')).not.toBeInTheDocument();

    renderLoader(<CosmicIntroLoader />);
    expect(screen.getByTestId('cosmic-intro-loader')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByTestId('cosmic-intro-loader')).not.toBeInTheDocument();
  });

  it('bypasses long loader animation when prefers-reduced-motion is active', () => {
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

    renderLoader(<CosmicIntroLoader />);
    expect(screen.queryByTestId('cosmic-intro-loader')).not.toBeInTheDocument();
  });
});

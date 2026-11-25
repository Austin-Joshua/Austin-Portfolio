import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  MotionPreferenceProvider,
  useMotionPreference,
} from '@/context/MotionPreferenceContext';

function MotionProbe() {
  const { prefersReducedMotion } = useMotionPreference();
  return <span data-testid="reduced-motion">{String(prefersReducedMotion)}</span>;
}

type ChangeHandler = (event: MediaQueryListEvent) => void;

function createMockMatchMedia(initialMatches: boolean) {
  let matches = initialMatches;
  const listeners = new Set<ChangeHandler>();

  const addEventListener = vi.fn((event: string, cb: ChangeHandler) => {
    if (event === 'change') {
      listeners.add(cb);
    }
  });

  const removeEventListener = vi.fn((event: string, cb: ChangeHandler) => {
    if (event === 'change') {
      listeners.delete(cb);
    }
  });

  const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener,
    removeEventListener,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

  const emitChange = (nextMatches: boolean) => {
    matches = nextMatches;
    const event = { matches: nextMatches } as MediaQueryListEvent;
    for (const listener of listeners) {
      listener(event);
    }
  };

  return {
    matchMediaMock,
    addEventListener,
    removeEventListener,
    listeners,
    emitChange,
  };
}

describe('MotionPreferenceContext', () => {
  const originalDescriptor = Object.getOwnPropertyDescriptor(
    window,
    'matchMedia',
  );

  afterEach(() => {
    if (originalDescriptor) {
      Object.defineProperty(window, 'matchMedia', originalDescriptor);
    }
    vi.restoreAllMocks();
  });

  it('exposes true when initial reduced-motion query matches', () => {
    const { matchMediaMock } = createMockMatchMedia(true);
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: matchMediaMock,
    });

    render(
      <MotionPreferenceProvider>
        <MotionProbe />
      </MotionPreferenceProvider>,
    );

    expect(screen.getByTestId('reduced-motion')).toHaveTextContent('true');
  });

  it('exposes false when initial reduced-motion query does not match and updates on change', () => {
    const { matchMediaMock, emitChange } = createMockMatchMedia(false);
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: matchMediaMock,
    });

    render(
      <MotionPreferenceProvider>
        <MotionProbe />
      </MotionPreferenceProvider>,
    );

    expect(screen.getByTestId('reduced-motion')).toHaveTextContent('false');

    act(() => {
      emitChange(true);
    });
    expect(screen.getByTestId('reduced-motion')).toHaveTextContent('true');

    act(() => {
      emitChange(false);
    });
    expect(screen.getByTestId('reduced-motion')).toHaveTextContent('false');
  });

  it('removes listeners on unmount and ignores stale change callbacks', () => {
    const { matchMediaMock, addEventListener, removeEventListener, listeners } =
      createMockMatchMedia(false);
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: matchMediaMock,
    });

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { unmount } = render(
      <MotionPreferenceProvider>
        <MotionProbe />
      </MotionPreferenceProvider>,
    );

    expect(addEventListener).toHaveBeenCalledTimes(1);
    const registeredHandler = addEventListener.mock.calls[0]?.[1];

    unmount();

    expect(removeEventListener).toHaveBeenCalledTimes(1);
    expect(listeners.size).toBe(0);

    // Invoke captured handler directly to confirm no React warning or state update post-unmount
    act(() => {
      registeredHandler?.({ matches: true } as MediaQueryListEvent);
    });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('defaults safely to false when matchMedia is unavailable', () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: undefined,
    });

    render(
      <MotionPreferenceProvider>
        <MotionProbe />
      </MotionPreferenceProvider>,
    );

    expect(screen.getByTestId('reduced-motion')).toHaveTextContent('false');
  });

  it('throws a clear error when useMotionPreference is called outside provider', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<MotionProbe />)).toThrow(
      'useMotionPreference must be used within a MotionPreferenceProvider.',
    );

    consoleErrorSpy.mockRestore();
  });
});

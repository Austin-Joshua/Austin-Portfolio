import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { App } from '@/App';
import { MotionPreferenceProvider } from '@/context/MotionPreferenceContext';
import { ThemeProvider } from '@/context/ThemeContext';
import * as webglHook from '@/hooks/useWebGLSupport';
import { UniverseFallback } from '@/three/UniverseFallback';
import { UniverseLayer } from '@/three/UniverseLayer';
import { WebGLErrorBoundary } from '@/three/WebGLErrorBoundary';

const mockUnmount = vi.fn();
const mockConfigure = vi.fn();
const mockRender = vi.fn();

// Mock R3F createRoot/extend + DigitalUniverseScene cleanly for jsdom lifecycle verification
vi.mock('@/three/DigitalUniverseScene', () => ({
  DigitalUniverseScene: ({ theme }: { theme: string }) => (
    <div data-testid="mock-universe-scene" data-scene-theme={theme} />
  ),
}));

vi.mock('@react-three/fiber', () => ({
  useThree: () => ({ invalidate: vi.fn() }),
  useFrame: vi.fn(),
  extend: vi.fn(),
  createRoot: (canvas: HTMLCanvasElement) => ({
    configure: (config: {
      onCreated?: (state: { gl: { domElement: HTMLCanvasElement } }) => void;
      frameloop?: string;
    }) => {
      mockConfigure(config);
      config.onCreated?.({ gl: { domElement: canvas } });
      return Promise.resolve();
    },
    render: (node: unknown) => {
      mockRender(node);
    },
    unmount: () => {
      mockUnmount();
    },
  }),
}));

describe('Phase 6 3D Digital Universe & Fallback', () => {
  const originalVisibilityState = Object.getOwnPropertyDescriptor(
    document,
    'visibilityState',
  );

  afterEach(() => {
    mockUnmount.mockClear();
    mockConfigure.mockClear();
    mockRender.mockClear();
    if (originalVisibilityState) {
      Object.defineProperty(document, 'visibilityState', originalVisibilityState);
    }
    vi.restoreAllMocks();
  });

  it('renders decorative non-focusable UniverseFallback in dark and light themes', () => {
    const { rerender } = render(<UniverseFallback theme="dark" />);
    const fallback = screen.getByTestId('universe-fallback');

    expect(fallback).toHaveAttribute('aria-hidden', 'true');
    expect(fallback).toHaveAttribute('data-universe-theme', 'dark');

    rerender(<UniverseFallback theme="light" />);
    expect(screen.getByTestId('universe-fallback')).toHaveAttribute(
      'data-universe-theme',
      'light',
    );
  });

  it('catches WebGL initialization errors via WebGLErrorBoundary and renders fallback', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onError = vi.fn();

    function BrokenScene(): never {
      throw new Error('Simulated shader compile error');
    }

    render(
      <WebGLErrorBoundary
        fallback={<UniverseFallback theme="dark" />}
        onError={onError}
      >
        <BrokenScene />
      </WebGLErrorBoundary>,
    );

    expect(screen.getByTestId('universe-fallback')).toBeInTheDocument();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/shader compile error/i)).not.toBeInTheDocument();

    warnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('renders UniverseFallback deterministically when WebGL is unsupported', () => {
    vi.spyOn(webglHook, 'useWebGLSupport').mockReturnValue({
      supported: false,
      version: null,
    });

    render(
      <ThemeProvider>
        <MotionPreferenceProvider>
          <UniverseLayer />
        </MotionPreferenceProvider>
      </ThemeProvider>,
    );

    expect(screen.getByTestId('universe-fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('r3f-webgl-canvas')).not.toBeInTheDocument();
  });

  it('lazily mounts UniverseCanvas via createRoot, pauses when hidden, recovers on webglcontextlost, and unmounts cleanly', async () => {
    vi.spyOn(webglHook, 'useWebGLSupport').mockReturnValue({
      supported: true,
      version: 2,
    });

    const { unmount } = render(
      <ThemeProvider>
        <MotionPreferenceProvider>
          <UniverseLayer />
        </MotionPreferenceProvider>
      </ThemeProvider>,
    );

    const canvasWrapper = await screen.findByTestId('universe-canvas-wrapper');
    expect(canvasWrapper).toHaveAttribute('aria-hidden', 'true');

    await waitFor(() => {
      expect(canvasWrapper).toHaveClass('opacity-100');
    });
    expect(canvasWrapper).toHaveAttribute('data-frameloop', 'always');
    expect(mockConfigure).toHaveBeenCalled();
    expect(mockRender).toHaveBeenCalled();

    // Backgrounded document pauses frameloop to demand
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'hidden',
    });
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(canvasWrapper).toHaveAttribute('data-frameloop', 'demand');

    const webglCanvas = screen.getByTestId('r3f-webgl-canvas');
    expect(webglCanvas).toHaveAttribute('aria-hidden', 'true');
    expect(webglCanvas).toHaveAttribute('tabindex', '-1');
    const removeSpy = vi.spyOn(webglCanvas, 'removeEventListener');

    // Runtime webglcontextlost transitions cleanly to fallback
    act(() => {
      webglCanvas.dispatchEvent(
        new Event('webglcontextlost', { cancelable: true }),
      );
    });
    expect(screen.getByTestId('universe-fallback')).toBeInTheDocument();

    // Unmount cleans up R3F root and context listeners
    unmount();
    expect(mockUnmount).toHaveBeenCalledTimes(1);
    expect(removeSpy).toHaveBeenCalledWith(
      'webglcontextlost',
      expect.any(Function),
    );
  });

  it('keeps Hero typography, primary CTAs, and landmarks accessible with UniverseLayer active', async () => {
    vi.spyOn(webglHook, 'useWebGLSupport').mockReturnValue({
      supported: false,
      version: null,
    });

    const { container } = render(
      <ThemeProvider>
        <MotionPreferenceProvider>
          <App />
        </MotionPreferenceProvider>
      </ThemeProvider>,
    );

    expect(screen.getByTestId('universe-fallback')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    expect(
      screen.getByRole('heading', { level: 1, name: 'Austin Joshua' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View Projects' })).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});

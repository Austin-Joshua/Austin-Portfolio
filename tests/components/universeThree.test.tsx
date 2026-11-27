import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { App } from '@/App';
import { MotionPreferenceProvider } from '@/context/MotionPreferenceContext';
import {
  UniverseNavigationProvider,
  useUniverseNavigation,
} from '@/context/UniverseNavigationContext';
import { SolarSystemHud } from '@/components/ui/SolarSystemHud';
import * as webglHook from '@/hooks/useWebGLSupport';
import { UniverseFallback } from '@/three/UniverseFallback';
import { UniverseLayer } from '@/three/UniverseLayer';
import { WebGLErrorBoundary } from '@/three/WebGLErrorBoundary';

const mockUnmount = vi.fn();
const mockConfigure = vi.fn();
const mockRender = vi.fn();

vi.mock('@/three/SolarSystemScene', () => ({
  SolarSystemScene: ({ activeSection }: { activeSection: string }) => (
    <div data-testid="mock-universe-scene" data-active-section={activeSection} />
  ),
}));

const mockConnect = vi.fn();
const mockDisconnect = vi.fn();
const mockEvents = vi.fn();

vi.mock('@react-three/fiber', () => ({
  useThree: () => ({ invalidate: vi.fn(), camera: { position: { lerp: vi.fn() }, lookAt: vi.fn() } }),
  useFrame: vi.fn(),
  extend: vi.fn(),
  events: mockEvents,
  createRoot: (canvas: HTMLCanvasElement) => ({
    configure: (config: {
      onCreated?: (state: {
        gl: { domElement: HTMLCanvasElement };
        events?: { connect?: (el: HTMLElement) => void; disconnect?: () => void };
        setEvents?: (cfg: unknown) => void;
      }) => void;
      frameloop?: string;
    }) => {
      mockConfigure(config);
      config.onCreated?.({
        gl: { domElement: canvas },
        events: { connect: mockConnect, disconnect: mockDisconnect },
        setEvents: vi.fn(),
      });
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

describe('Persistent 3D Cosmic Universe & Fallback', () => {
  const originalVisibilityState = Object.getOwnPropertyDescriptor(
    document,
    'visibilityState',
  );

  afterEach(() => {
    mockUnmount.mockClear();
    mockConfigure.mockClear();
    mockRender.mockClear();
    mockConnect.mockClear();
    mockDisconnect.mockClear();
    if (originalVisibilityState) {
      Object.defineProperty(document, 'visibilityState', originalVisibilityState);
    }
    vi.restoreAllMocks();
  });

  it('renders decorative non-focusable cosmic UniverseFallback', () => {
    render(<UniverseFallback />);
    const fallback = screen.getByTestId('universe-fallback');
    expect(fallback).toHaveAttribute('aria-hidden', 'true');
  });

  it('catches WebGL initialization errors via WebGLErrorBoundary and renders fallback', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onError = vi.fn();

    function BrokenScene(): never {
      throw new Error('Simulated shader compile error');
    }

    render(
      <WebGLErrorBoundary fallback={<UniverseFallback />} onError={onError}>
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
      <MotionPreferenceProvider>
        <UniverseNavigationProvider>
          <UniverseLayer />
        </UniverseNavigationProvider>
      </MotionPreferenceProvider>,
    );

    expect(screen.getByTestId('universe-fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('r3f-webgl-canvas')).not.toBeInTheDocument();
  });

  it('lazily mounts persistent UniverseCanvas via createRoot, pauses when hidden, recovers on webglcontextlost, and unmounts cleanly', async () => {
    vi.spyOn(webglHook, 'useWebGLSupport').mockReturnValue({
      supported: true,
      version: 2,
    });

    const { unmount } = render(
      <MotionPreferenceProvider>
        <UniverseNavigationProvider>
          <UniverseLayer />
        </UniverseNavigationProvider>
      </MotionPreferenceProvider>,
    );

    const canvasWrapper = await screen.findByTestId('universe-canvas-wrapper');
    expect(canvasWrapper).toHaveAttribute('aria-hidden', 'true');

    await waitFor(() => {
      expect(canvasWrapper).toHaveClass('opacity-100');
    });
    expect(canvasWrapper).toHaveAttribute('data-frameloop', 'always');
    expect(mockConfigure).toHaveBeenCalled();
    const configuredArg = mockConfigure.mock.calls[0]?.[0] as { events?: unknown } | undefined;
    expect(configuredArg?.events).toBe(mockEvents);
    expect(mockConnect).toHaveBeenCalledWith(canvasWrapper);
    await waitFor(() => {
      expect(mockRender).toHaveBeenCalled();
    });

    // Backgrounded tab pauses frameloop to demand
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

    unmount();
    expect(mockUnmount).toHaveBeenCalledTimes(1);
    expect(removeSpy).toHaveBeenCalledWith(
      'webglcontextlost',
      expect.any(Function),
    );
  });

  it(
    'keeps Hero typography, primary CTAs, and landmarks accessible with UniverseLayer active without bottom Hero HUD strip',
    async () => {
      vi.spyOn(webglHook, 'useWebGLSupport').mockReturnValue({
        supported: false,
        version: null,
      });

      const { container } = render(
        <MotionPreferenceProvider>
          <App />
        </MotionPreferenceProvider>,
      );

      expect(screen.getByTestId('universe-fallback')).toHaveAttribute(
        'aria-hidden',
        'true',
      );
      expect(
        screen.getByRole('heading', { level: 1, name: 'Austin Joshua' }),
      ).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'View Projects' })).toBeInTheDocument();
      expect(screen.queryByTestId('solar-system-hud')).not.toBeInTheDocument();
      expect(await axe(container)).toHaveNoViolations();
    },
    15_000,
  );

  it('links section content pulses with live planet telemetry HUD', () => {
    function SectionPulseDriver() {
      const { navigateToPlanet, pulsePlanet } = useUniverseNavigation();
      return (
        <div>
          <button type="button" onClick={() => navigateToPlanet('skills')}>
            Go Skills
          </button>
          <button
            type="button"
            onClick={() => pulsePlanet('skills', 1, 'TypeScript')}
          >
            Focus TypeScript
          </button>
          <SolarSystemHud />
        </div>
      );
    }

    render(
      <MotionPreferenceProvider>
        <UniverseNavigationProvider>
          <SectionPulseDriver />
        </UniverseNavigationProvider>
      </MotionPreferenceProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Go Skills' }));
    const telemetry = screen.getByTestId('live-planet-telemetry');
    expect(telemetry).toHaveTextContent('Skills');

    fireEvent.click(screen.getByRole('button', { name: 'Focus TypeScript' }));
    expect(telemetry).toHaveTextContent('TypeScript');
  });
});

import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { probeWebGLSupport, useWebGLSupport } from '@/hooks/useWebGLSupport';

describe('useWebGLSupport / probeWebGLSupport', () => {
  const originalCreateElement = document.createElement.bind(document);

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('probes an off-DOM temporary canvas for WebGL2 and calls loseContext cleanup', () => {
    const loseContextMock = vi.fn();
    const fakeGl2 = {
      isContextLost: vi.fn(() => false),
      getExtension: vi.fn((name: string) =>
        name === 'WEBGL_lose_context' ? { loseContext: loseContextMock } : null,
      ),
    } as unknown as WebGL2RenderingContext;

    const fakeCanvas = {
      width: 300,
      height: 150,
      getContext: vi.fn((type: string) => (type === 'webgl2' ? fakeGl2 : null)),
    } as unknown as HTMLCanvasElement;

    const appendSpy = vi.spyOn(document.body, 'appendChild');
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'canvas') {
        return fakeCanvas;
      }
      return originalCreateElement(tag);
    });

    const result = probeWebGLSupport();

    expect(result).toEqual({ supported: true, version: 2 });
    expect(appendSpy).not.toHaveBeenCalled();
    expect(loseContextMock).toHaveBeenCalledTimes(1);
    expect(fakeCanvas.width).toBe(0);
    expect(fakeCanvas.height).toBe(0);
  });

  it('falls back cleanly to WebGL1 when WebGL2 is unavailable', () => {
    const loseContextMock = vi.fn();
    const fakeGl1 = {
      isContextLost: vi.fn(() => false),
      getExtension: vi.fn(() => ({ loseContext: loseContextMock })),
    } as unknown as WebGLRenderingContext;

    const fakeCanvas = {
      width: 300,
      height: 150,
      getContext: vi.fn((type: string) => (type === 'webgl' ? fakeGl1 : null)),
    } as unknown as HTMLCanvasElement;

    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'canvas') {
        return fakeCanvas;
      }
      return originalCreateElement(tag);
    });

    expect(probeWebGLSupport()).toEqual({ supported: true, version: 1 });
    expect(loseContextMock).toHaveBeenCalledTimes(1);
  });

  it('returns unsupported when getContext returns null or throws', () => {
    const throwingCanvas = {
      width: 300,
      height: 150,
      getContext: vi.fn(() => {
        throw new Error('WebGL blocked');
      }),
    } as unknown as HTMLCanvasElement;

    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'canvas') {
        return throwingCanvas;
      }
      return originalCreateElement(tag);
    });

    const { result } = renderHook(() => useWebGLSupport());
    expect(result.current).toEqual({ supported: false, version: null });
  });
});

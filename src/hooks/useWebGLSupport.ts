import { useState } from 'react';

export interface WebGLSupportStatus {
  readonly supported: boolean;
  readonly version: 2 | 1 | null;
}

const UNSUPPORTED_STATUS: WebGLSupportStatus = {
  supported: false,
  version: null,
};

function releaseTemporaryContext(
  canvas: HTMLCanvasElement,
  gl: WebGLRenderingContext | WebGL2RenderingContext,
): void {
  try {
    const loseExt = gl.getExtension('WEBGL_lose_context');
    if (loseExt && typeof loseExt.loseContext === 'function') {
      loseExt.loseContext();
    }
  } catch {
    // Best-effort cleanup for probe context
  }

  canvas.width = 0;
  canvas.height = 0;
}

export function probeWebGLSupport(): WebGLSupportStatus {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return UNSUPPORTED_STATUS;
  }

  let canvas: HTMLCanvasElement;
  try {
    canvas = document.createElement('canvas');
  } catch {
    return UNSUPPORTED_STATUS;
  }

  try {
    const gl2 = canvas.getContext('webgl2', {
      failIfMajorPerformanceCaveat: false,
    });

    if (gl2 && !gl2.isContextLost?.()) {
      releaseTemporaryContext(canvas, gl2);
      return { supported: true, version: 2 };
    }

    const gl1 = (canvas.getContext('webgl', {
      failIfMajorPerformanceCaveat: false,
    }) ??
      canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;

    if (gl1 && !gl1.isContextLost?.()) {
      releaseTemporaryContext(canvas, gl1);
      return { supported: true, version: 1 };
    }
  } catch {
    return UNSUPPORTED_STATUS;
  }

  canvas.width = 0;
  canvas.height = 0;
  return UNSUPPORTED_STATUS;
}

export function useWebGLSupport(): WebGLSupportStatus {
  const [status] = useState<WebGLSupportStatus>(() => probeWebGLSupport());
  return status;
}

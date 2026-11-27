export interface TiltMetrics {
  px: number;
  py: number;
  rotateX: number;
  rotateY: number;
  glareX: number;
  glareY: number;
}

export interface BoundingRectLike {
  left: number;
  top: number;
  width: number;
  height: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Computes normalized pointer tilt [-0.5, 0.5], 3D CSS rotation angles, and specular sheen coordinates.
 * Mirrors Austin-Joshua/infinitus Gyro-Parallax math.
 */
export function computePointerTilt(
  clientX: number,
  clientY: number,
  rect: BoundingRectLike,
  maxTilt = 14,
): TiltMetrics {
  if (rect.width <= 0 || rect.height <= 0 || maxTilt <= 0) {
    return { px: 0, py: 0, rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 };
  }

  const px = clamp((clientX - rect.left) / rect.width - 0.5, -0.5, 0.5);
  const py = clamp((clientY - rect.top) / rect.height - 0.5, -0.5, 0.5);

  return {
    px,
    py,
    rotateX: -py * 2 * maxTilt,
    rotateY: px * 2 * maxTilt,
    glareX: 50 + px * 80,
    glareY: 50 + py * 80,
  };
}

/**
 * Computes 3D tilt angles from DeviceOrientationEvent gamma/beta values centered around neutral 45deg hold.
 */
export function computeGyroTilt(
  gamma: number | null | undefined,
  beta: number | null | undefined,
  maxTilt = 14,
): TiltMetrics {
  if (maxTilt <= 0 || (gamma == null && beta == null)) {
    return { px: 0, py: 0, rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 };
  }

  const rawX = clamp(gamma ?? 0, -28, 28);
  const rawY = clamp((beta ?? 45) - 45, -28, 28);
  const px = rawX / 56;
  const py = rawY / 56;

  return {
    px,
    py,
    rotateX: -py * 2 * maxTilt,
    rotateY: px * 2 * maxTilt,
    glareX: 50 + px * 80,
    glareY: 50 + py * 80,
  };
}

/**
 * Requests iOS DeviceOrientation permission on user gesture when required; returns whether permission was granted.
 */
export async function requestIosGyroPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.DeviceOrientationEvent) {
    return false;
  }

  const maybeReq = (
    window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    }
  ).requestPermission;

  if (typeof maybeReq !== 'function') {
    return true;
  }

  try {
    const result = await maybeReq();
    return result === 'granted';
  } catch {
    return false;
  }
}

/**
 * Subscribes to device orientation events immediately across all browsers and triggers iOS
 * gesture-gated permission request when `DeviceOrientationEvent.requestPermission` is present.
 */
export function subscribeDeviceOrientation(
  onOrientation: (event: DeviceOrientationEvent) => void,
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  let disposed = false;
  window.addEventListener('deviceorientation', onOrientation, { passive: true });

  const maybeReq = (
    window as unknown as {
      DeviceOrientationEvent?: {
        requestPermission?: () => Promise<'granted' | 'denied'>;
      };
    }
  ).DeviceOrientationEvent?.requestPermission;

  const unlockOnGesture = () => {
    void requestIosGyroPermission().then((granted) => {
      if (granted && !disposed) {
        window.removeEventListener('deviceorientation', onOrientation);
        window.addEventListener('deviceorientation', onOrientation, { passive: true });
      }
    });
  };

  if (typeof maybeReq === 'function') {
    window.addEventListener('pointerdown', unlockOnGesture, {
      once: true,
      passive: true,
    });
  }

  return () => {
    disposed = true;
    window.removeEventListener('pointerdown', unlockOnGesture);
    window.removeEventListener('deviceorientation', onOrientation);
  };
}

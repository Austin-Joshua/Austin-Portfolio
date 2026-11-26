export interface StarfieldFrameInput {
  currentWarp: number;
  rawScrollVelocity: number;
  delta: number;
  prefersReducedMotion: boolean;
  driftSpeed: number;
}

export interface StarfieldFrameResult {
  nextWarp: number;
  forwardTravel: number;
  cappedDelta: number;
}

/**
 * Computes damped hyperspace velocity and travel increment for a single frame.
 * Guarantees capped frame deltas and bounded warp magnitude so rapid scrolling
 * feels cinematic without unstable particle jumps.
 */
export function stepHyperspaceFrame({
  currentWarp,
  rawScrollVelocity,
  delta,
  prefersReducedMotion,
  driftSpeed,
}: StarfieldFrameInput): StarfieldFrameResult {
  const cappedDelta = Math.min(Math.max(delta, 0), 0.05);

  if (prefersReducedMotion) {
    return {
      nextWarp: 0,
      forwardTravel: 0,
      cappedDelta: 0,
    };
  }

  const clampedTarget = Math.max(-3.2, Math.min(3.2, rawScrollVelocity));
  const lerpAlpha = 1 - Math.exp(-cappedDelta * 6.5);
  const nextWarp = currentWarp + (clampedTarget - currentWarp) * lerpAlpha;

  const baseDrift = driftSpeed * 8.5;
  const warpBoost = Math.abs(nextWarp) * 18.0;
  const forwardTravel = cappedDelta * (baseDrift + warpBoost);

  return {
    nextWarp,
    forwardTravel,
    cappedDelta,
  };
}

export interface ParallaxResult {
  x: number;
  y: number;
}

/**
 * Computes depth-weighted pointer parallax offset (near layers respond more strongly than far layers).
 */
export function computeDepthParallax(
  pointerX: number,
  pointerY: number,
  depthWeight: number,
  enabled: boolean,
): ParallaxResult {
  if (!enabled) {
    return { x: 0, y: 0 };
  }
  return {
    x: -pointerX * depthWeight,
    y: pointerY * depthWeight * 0.72,
  };
}

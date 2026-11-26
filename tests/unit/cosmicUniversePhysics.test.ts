import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  computeDepthParallax,
  stepHyperspaceFrame,
} from '@/three/starfieldPhysics';
import {
  hasSeenCosmicIntro,
  INTRO_SEEN_STORAGE_KEY,
  markCosmicIntroSeen,
  shouldPlayCosmicIntroOnMount,
} from '@/utils/introStorage';

describe('Starfield hyperspace velocity & pointer parallax physics', () => {
  it('accelerates travel smoothly with scroll velocity and damps back toward gentle drift', () => {
    const idleStep = stepHyperspaceFrame({
      currentWarp: 0,
      rawScrollVelocity: 0,
      delta: 0.016,
      prefersReducedMotion: false,
      driftSpeed: 0.032,
    });

    const scrollStep = stepHyperspaceFrame({
      currentWarp: idleStep.nextWarp,
      rawScrollVelocity: 2.4,
      delta: 0.016,
      prefersReducedMotion: false,
      driftSpeed: 0.032,
    });

    expect(scrollStep.nextWarp).toBeGreaterThan(idleStep.nextWarp);
    expect(scrollStep.forwardTravel).toBeGreaterThan(idleStep.forwardTravel);

    // Caps huge frame deltas so background pauses never cause star teleports
    const hugeDeltaStep = stepHyperspaceFrame({
      currentWarp: 0,
      rawScrollVelocity: 2.4,
      delta: 5.0,
      prefersReducedMotion: false,
      driftSpeed: 0.032,
    });
    expect(hugeDeltaStep.cappedDelta).toBe(0.05);

    // Reduced motion halts warp and drift completely
    const reduced = stepHyperspaceFrame({
      currentWarp: 1.8,
      rawScrollVelocity: 2.5,
      delta: 0.016,
      prefersReducedMotion: true,
      driftSpeed: 0.032,
    });
    expect(reduced).toEqual({ nextWarp: 0, forwardTravel: 0, cappedDelta: 0 });
  });

  it('applies stronger depth-weighted pointer parallax to near layers than far layers', () => {
    const far = computeDepthParallax(0.8, -0.4, 0.55, true);
    const near = computeDepthParallax(0.8, -0.4, 1.65, true);
    expect(Math.abs(near.x)).toBeGreaterThan(Math.abs(far.x));
    expect(Math.abs(near.y)).toBeGreaterThan(Math.abs(far.y));
    expect(computeDepthParallax(0.8, -0.4, 1.65, false)).toEqual({ x: 0, y: 0 });
  });
});

describe('Cosmic Intro Storage & Brand Emblem Asset', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove('aj-intro-pending', 'aj-intro-seen');
  });

  it('plays once per first visit, never traps restricted storage, and honors reduced motion', () => {
    expect(hasSeenCosmicIntro()).toBe(false);
    expect(shouldPlayCosmicIntroOnMount(false)).toBe(true);
    expect(shouldPlayCosmicIntroOnMount(true)).toBe(false);

    markCosmicIntroSeen();
    expect(window.localStorage.getItem(INTRO_SEEN_STORAGE_KEY)).toBe('1');
    expect(hasSeenCosmicIntro()).toBe(true);
    expect(shouldPlayCosmicIntroOnMount(false)).toBe(false);

    // Restricted localStorage must not crash or trap the visitor
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(hasSeenCosmicIntro()).toBe(true);
    expect(shouldPlayCosmicIntroOnMount(false)).toBe(false);
    vi.restoreAllMocks();
  });

  it('ships canonical circular metallic AJ emblem RGBA PNG and favicons', () => {
    const emblemPath = resolve(process.cwd(), 'public/assets/brand/aj-emblem.png');
    expect(existsSync(emblemPath)).toBe(true);
    expect(existsSync(resolve(process.cwd(), 'public/favicon.png'))).toBe(true);
    expect(existsSync(resolve(process.cwd(), 'public/apple-touch-icon.png'))).toBe(true);

    const buf = readFileSync(emblemPath);
    expect(buf.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
    expect(buf.readUInt32BE(16)).toBe(512);
    expect(buf.readUInt32BE(20)).toBe(512);
    expect(buf[25]).toBe(6); // RGBA transparency outside metallic emblem ring
  });
});

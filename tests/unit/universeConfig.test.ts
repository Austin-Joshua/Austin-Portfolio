import { afterEach, describe, expect, it } from 'vitest';
import { DARK_UNIVERSE_PALETTE, getUniversePalette } from '@/three/themePalettes';
import { resolveQualityTier } from '@/three/useQualityTier';

describe('Three theme palettes & adaptive quality tiers', () => {
  afterEach(() => {
    document.documentElement.style.removeProperty('--surface-canvas');
    document.documentElement.style.removeProperty('--accent-primary');
    document.documentElement.style.removeProperty('--accent-primary-deep');
    document.documentElement.style.removeProperty('--text-primary');
  });

  it('uses strictly approved dark core tokens and resolves light mode from active CSS variables', () => {
    const dark = getUniversePalette('dark');
    expect(dark).toEqual(DARK_UNIVERSE_PALETTE);
    expect(dark.canvas).toBe('#061A1D');
    expect(dark.primary).toBe('#00D5C5');
    expect(dark.secondary).toBe('#126B75');
    expect(dark.highlight).toBe('#E8FFFC');
    expect(dark.additiveBlending).toBe(true);

    document.documentElement.style.setProperty('--surface-canvas', '#FAF6F6');
    document.documentElement.style.setProperty('--accent-primary', '#B0122E');
    document.documentElement.style.setProperty('--accent-primary-deep', '#7A0C20');
    document.documentElement.style.setProperty('--text-primary', '#1C090D');

    const light = getUniversePalette('light');
    expect(light.additiveBlending).toBe(false);
    expect(light.canvas).toBe('#FAF6F6');
    expect(light.primary).toBe('#B0122E');
    expect(light.secondary).toBe('#7A0C20');
    expect(light.highlight).toBe('#1C090D');
  });

  it('selects static demand mode under prefers-reduced-motion', () => {
    const tier = resolveQualityTier({
      viewportWidth: 1440,
      prefersReducedMotion: true,
      hardwareConcurrency: 12,
    });

    expect(tier.tier).toBe('static');
    expect(tier.frameloop).toBe('demand');
    expect(tier.driftSpeed).toBe(0);
    expect(tier.enablePointerParallax).toBe(false);
  });

  it('scales down density, DPR cap, and parallax on mobile and constrained hardware', () => {
    const mobile = resolveQualityTier({
      viewportWidth: 390,
      prefersReducedMotion: false,
      hardwareConcurrency: 8,
    });
    expect(mobile.tier).toBe('mobile-conserving');
    expect(mobile.dpr[1]).toBeLessThanOrEqual(1.5);
    expect(mobile.enablePointerParallax).toBe(false);
    expect(mobile.focalOffset).toEqual([0, 0, 0]);

    const saveDataTier = resolveQualityTier({
      viewportWidth: 1440,
      prefersReducedMotion: false,
      hardwareConcurrency: 8,
      saveData: true,
    });
    expect(saveDataTier.tier).toBe('mobile-conserving');

    const tablet = resolveQualityTier({
      viewportWidth: 768,
      prefersReducedMotion: false,
      hardwareConcurrency: 8,
    });
    expect(tablet.tier).toBe('tablet-balanced');

    const desktop = resolveQualityTier({
      viewportWidth: 1440,
      prefersReducedMotion: false,
      hardwareConcurrency: 8,
    });
    expect(desktop.tier).toBe('desktop-high');
    expect(desktop.enablePointerParallax).toBe(true);
    expect(desktop.particleCount).toBeGreaterThan(mobile.particleCount);
    expect(desktop.dpr).toEqual([1, 2]);
  });
});

import { describe, expect, it } from 'vitest';
import {
  COSMIC_PALETTE,
  getPlanetDefinition,
  getPlanetWorldPosition,
  SOLAR_SYSTEM_PLANETS,
} from '@/three/universeConfig';
import { resolveQualityTier } from '@/three/useQualityTier';

describe('Cosmic Solar System palette, planets & adaptive quality tiers', () => {
  it('defines a permanent pitch-black cosmic palette and six distinct orbiting planets', () => {
    expect(COSMIC_PALETTE.canvas).toBe('#020307');
    expect(COSMIC_PALETTE.sunCore).toBe('#FFD27D');
    expect(SOLAR_SYSTEM_PLANETS).toHaveLength(6);

    const ids = SOLAR_SYSTEM_PLANETS.map((p) => p.id);
    expect(ids).toEqual([
      'about',
      'skills',
      'projects',
      'experience',
      'achievements',
      'contact',
    ]);

    const colors = new Set(SOLAR_SYSTEM_PLANETS.map((p) => p.color));
    expect(colors.size).toBe(6);

    const pos0 = getPlanetWorldPosition(getPlanetDefinition('projects'), 0, 1);
    const posLater = getPlanetWorldPosition(getPlanetDefinition('projects'), 4, 1);
    expect(pos0).not.toEqual(posLater);
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

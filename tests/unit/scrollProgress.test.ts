import { describe, expect, it } from 'vitest';
import { calculateScrollProgress } from '@/utils/scrollProgress';

describe('calculateScrollProgress', () => {
  it('returns 0 at the top of a scrollable document', () => {
    expect(calculateScrollProgress(0, 3000, 900)).toBe(0);
  });

  it('returns 0.5 at the vertical midpoint', () => {
    expect(calculateScrollProgress(1050, 3000, 900)).toBeCloseTo(0.5, 5);
  });

  it('returns 1 at the bottom of a scrollable document', () => {
    expect(calculateScrollProgress(2100, 3000, 900)).toBe(1);
  });

  it('clamps out-of-range scroll positions to [0, 1]', () => {
    expect(calculateScrollProgress(-120, 3000, 900)).toBe(0);
    expect(calculateScrollProgress(2500, 3000, 900)).toBe(1);
  });

  it('returns 0 safely when document is non-scrollable or inputs are invalid', () => {
    expect(calculateScrollProgress(0, 800, 900)).toBe(0);
    expect(calculateScrollProgress(100, 900, 900)).toBe(0);
    expect(calculateScrollProgress(Number.NaN, 3000, 900)).toBe(0);
  });
});

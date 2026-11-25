import type { Theme } from '@/utils/themeStorage';

export interface UniverseThemePalette {
  readonly canvas: string;
  readonly primary: string;
  readonly secondary: string;
  readonly highlight: string;
  readonly gold: string;
  readonly additiveBlending: boolean;
  readonly particleOpacity: number;
  readonly ringOpacity: number;
  readonly coreOpacity: number;
}

export const DARK_UNIVERSE_PALETTE: UniverseThemePalette = {
  canvas: '#061A1D',
  primary: '#00D5C5',
  secondary: '#126B75',
  highlight: '#E8FFFC',
  gold: '#E5B85C',
  additiveBlending: true,
  particleOpacity: 0.82,
  ringOpacity: 0.42,
  coreOpacity: 0.55,
};

export const LIGHT_UNIVERSE_PALETTE: UniverseThemePalette = {
  canvas: '#FAF6F6',
  primary: '#B0122E',
  secondary: '#7A0C20',
  highlight: '#1C090D',
  gold: '#8A5E08',
  additiveBlending: false,
  particleOpacity: 0.45,
  ringOpacity: 0.3,
  coreOpacity: 0.4,
};

function readCssToken(name: string, fallback: string): string {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return fallback;
  }
  const value = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value.length > 0 ? value : fallback;
}

export function getUniversePalette(theme: Theme): UniverseThemePalette {
  if (theme === 'dark') {
    return DARK_UNIVERSE_PALETTE;
  }

  return {
    canvas: readCssToken('--surface-canvas', LIGHT_UNIVERSE_PALETTE.canvas),
    primary: readCssToken('--accent-primary', LIGHT_UNIVERSE_PALETTE.primary),
    secondary: readCssToken('--accent-primary-deep', LIGHT_UNIVERSE_PALETTE.secondary),
    highlight: readCssToken('--text-primary', LIGHT_UNIVERSE_PALETTE.highlight),
    gold: readCssToken('--accent-gold', LIGHT_UNIVERSE_PALETTE.gold),
    additiveBlending: false,
    particleOpacity: 0.45,
    ringOpacity: 0.3,
    coreOpacity: 0.4,
  };
}

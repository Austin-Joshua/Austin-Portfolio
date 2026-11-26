import type { Theme } from '@/utils/themeStorage';

export interface UniverseThemePalette {
  readonly canvas: string;
  readonly primary: string;
  readonly secondary: string;
  readonly highlight: string;
  readonly gold: string;
  readonly metallic: string;
  readonly additiveBlending: boolean;
  readonly particleOpacity: number;
  readonly ringOpacity: number;
  readonly coreOpacity: number;
}

export const DARK_UNIVERSE_PALETTE: UniverseThemePalette = {
  canvas: '#070A18',
  primary: '#9788FF',
  secondary: '#6B70E8',
  highlight: '#DDE3F3',
  gold: '#E7BC70',
  metallic: '#E18DAF',
  additiveBlending: true,
  particleOpacity: 0.9,
  ringOpacity: 0.62,
  coreOpacity: 0.78,
};

export const LIGHT_UNIVERSE_PALETTE: UniverseThemePalette = {
  canvas: '#F8F7FB',
  primary: '#D20D46',
  secondary: '#A70F38',
  highlight: '#7045C8',
  gold: '#946213',
  metallic: '#5C6475',
  additiveBlending: false,
  particleOpacity: 0.52,
  ringOpacity: 0.42,
  coreOpacity: 0.56,
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
    highlight: readCssToken('--accent-secondary', LIGHT_UNIVERSE_PALETTE.highlight),
    gold: readCssToken('--accent-gold', LIGHT_UNIVERSE_PALETTE.gold),
    metallic: readCssToken('--accent-chrome', LIGHT_UNIVERSE_PALETTE.metallic),
    additiveBlending: false,
    particleOpacity: LIGHT_UNIVERSE_PALETTE.particleOpacity,
    ringOpacity: LIGHT_UNIVERSE_PALETTE.ringOpacity,
    coreOpacity: LIGHT_UNIVERSE_PALETTE.coreOpacity,
  };
}

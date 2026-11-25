import type { Theme } from '@/utils/themeStorage';

export interface UniverseThemePalette {
  readonly canvas: string;
  readonly primary: string;
  readonly secondary: string;
  readonly highlight: string;
  readonly additiveBlending: boolean;
  readonly particleOpacity: number;
  readonly ringOpacity: number;
  readonly coreOpacity: number;
}

/**
 * Approved Dark Core (Abyssal Teal) tokens per UI_UX_DESIGN.md Sec. 2.1:
 * #061A1D, #00D5C5, #126B75, #E8FFFC.
 * Secondary provisional accents and light hex literals are omitted; light mode
 * resolves active theme CSS custom properties dynamically once on theme change.
 */
export const DARK_UNIVERSE_PALETTE: UniverseThemePalette = {
  canvas: '#061A1D',
  primary: '#00D5C5',
  secondary: '#126B75',
  highlight: '#E8FFFC',
  additiveBlending: true,
  particleOpacity: 0.78,
  ringOpacity: 0.34,
  coreOpacity: 0.42,
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
    canvas: readCssToken('--surface-canvas', DARK_UNIVERSE_PALETTE.canvas),
    primary: readCssToken('--accent-primary', DARK_UNIVERSE_PALETTE.primary),
    secondary: readCssToken('--accent-primary-deep', DARK_UNIVERSE_PALETTE.secondary),
    highlight: readCssToken('--text-primary', DARK_UNIVERSE_PALETTE.highlight),
    additiveBlending: false,
    particleOpacity: 0.52,
    ringOpacity: 0.28,
    coreOpacity: 0.36,
  };
}

import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  getDefaultTheme,
  readStoredTheme,
  removeStoredTheme,
  writeStoredTheme,
  type Theme,
} from '@/utils/themeStorage';

describe('themeStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('returns dark as the default theme', () => {
    expect(getDefaultTheme()).toBe('dark');
    expect(DEFAULT_THEME).toBe('dark');
  });

  it('returns dark when the storage key is missing', () => {
    expect(readStoredTheme()).toBe('dark');
  });

  it('returns dark when dark is stored', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    expect(readStoredTheme()).toBe('dark');
  });

  it('returns light when light is stored', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'light');
    expect(readStoredTheme()).toBe('light');
  });

  it('falls back to dark for invalid stored values', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'purple');
    expect(readStoredTheme()).toBe('dark');
  });

  it('persists valid themes under the exact storage key', () => {
    const saved = writeStoredTheme('light');
    expect(saved).toBe(true);
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('refuses to persist invalid theme values', () => {
    const setItem = vi.fn();
    const saved = writeStoredTheme('crimson' as unknown as Theme, { setItem });

    expect(saved).toBe(false);
    expect(setItem).not.toHaveBeenCalled();
  });

  it('handles storage exceptions safely on getItem, setItem, and removeItem', () => {
    const throwingStorage = {
      getItem: () => {
        throw new Error('SecurityError');
      },
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
      removeItem: () => {
        throw new Error('SecurityError');
      },
    };

    expect(readStoredTheme(throwingStorage)).toBe('dark');
    expect(writeStoredTheme('light', throwingStorage)).toBe(false);
    expect(removeStoredTheme(throwingStorage)).toBe(false);
  });

  it('handles null storage gracefully without throwing', () => {
    expect(readStoredTheme(null)).toBe('dark');
    expect(writeStoredTheme('light', null)).toBe(false);
    expect(removeStoredTheme(null)).toBe(false);
  });
});

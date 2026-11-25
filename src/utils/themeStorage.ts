export type Theme = 'dark' | 'light';

export const THEME_STORAGE_KEY = 'aj-portfolio-theme';
export const DEFAULT_THEME: Theme = 'dark';

type ReadableStorage = Pick<Storage, 'getItem'>;
type WritableStorage = Pick<Storage, 'setItem'>;
type RemovableStorage = Pick<Storage, 'removeItem'>;

export function isValidTheme(value: unknown): value is Theme {
  return value === 'dark' || value === 'light';
}

export function getDefaultTheme(): Theme {
  return DEFAULT_THEME;
}

function resolveBrowserStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage ?? null;
  } catch {
    return null;
  }
}

export function readStoredTheme(storage?: ReadableStorage | null): Theme {
  const targetStorage = storage === undefined ? resolveBrowserStorage() : storage;
  if (!targetStorage) {
    return DEFAULT_THEME;
  }

  try {
    const raw = targetStorage.getItem(THEME_STORAGE_KEY);
    return isValidTheme(raw) ? raw : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function writeStoredTheme(
  theme: Theme,
  storage?: WritableStorage | null,
): boolean {
  if (!isValidTheme(theme)) {
    return false;
  }

  const targetStorage = storage === undefined ? resolveBrowserStorage() : storage;
  if (!targetStorage) {
    return false;
  }

  try {
    targetStorage.setItem(THEME_STORAGE_KEY, theme);
    return true;
  } catch {
    return false;
  }
}

export function removeStoredTheme(storage?: RemovableStorage | null): boolean {
  const targetStorage = storage === undefined ? resolveBrowserStorage() : storage;
  if (!targetStorage) {
    return false;
  }

  try {
    targetStorage.removeItem(THEME_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

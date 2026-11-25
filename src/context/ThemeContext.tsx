import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  isValidTheme,
  readStoredTheme,
  writeStoredTheme,
  type Theme,
} from '@/utils/themeStorage';

export interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function applyThemeToDocument(theme: Theme): void {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

function resolveInitialTheme(): Theme {
  if (typeof document !== 'undefined') {
    const domTheme = document.documentElement.dataset.theme;
    if (isValidTheme(domTheme)) {
      return domTheme;
    }
  }

  return readStoredTheme();
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(resolveInitialTheme);
  const themeRef = useRef<Theme>(theme);

  useEffect(() => {
    themeRef.current = theme;
    applyThemeToDocument(theme);
  }, [theme]);

  const setTheme = useCallback((nextTheme: Theme) => {
    if (!isValidTheme(nextTheme) || nextTheme === themeRef.current) {
      return;
    }

    themeRef.current = nextTheme;
    applyThemeToDocument(nextTheme);
    writeStoredTheme(nextTheme);
    setThemeState(nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    const nextTheme: Theme = themeRef.current === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  }, [setTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      toggleTheme,
    }),
    [theme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider.');
  }
  return context;
}

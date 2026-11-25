import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export interface MotionPreferenceContextValue {
  prefersReducedMotion: boolean;
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const MotionPreferenceContext = createContext<
  MotionPreferenceContextValue | undefined
>(undefined);

function getSafeMediaQueryList(): MediaQueryList | null {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return null;
  }

  try {
    return window.matchMedia(REDUCED_MOTION_QUERY);
  } catch {
    return null;
  }
}

function getInitialReducedMotion(): boolean {
  const mediaQuery = getSafeMediaQueryList();
  return Boolean(mediaQuery?.matches);
}

export function MotionPreferenceProvider({ children }: { children: ReactNode }) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(
    getInitialReducedMotion,
  );

  useEffect(() => {
    const mediaQuery = getSafeMediaQueryList();
    if (!mediaQuery) {
      return;
    }

    let isMounted = true;

    const handleChange = (event: MediaQueryListEvent) => {
      if (!isMounted) {
        return;
      }
      setPrefersReducedMotion(event.matches);
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => {
        isMounted = false;
        mediaQuery.removeEventListener('change', handleChange);
      };
    }

    // Legacy Safari fallback (<14) without duplicating listeners
    const legacyMediaQuery = mediaQuery as MediaQueryList & {
      addListener?: (listener: (event: MediaQueryListEvent) => void) => void;
      removeListener?: (listener: (event: MediaQueryListEvent) => void) => void;
    };

    if (typeof legacyMediaQuery.addListener === 'function') {
      legacyMediaQuery.addListener(handleChange);
      return () => {
        isMounted = false;
        legacyMediaQuery.removeListener?.(handleChange);
      };
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<MotionPreferenceContextValue>(
    () => ({ prefersReducedMotion }),
    [prefersReducedMotion],
  );

  return (
    <MotionPreferenceContext.Provider value={value}>
      {children}
    </MotionPreferenceContext.Provider>
  );
}

export function useMotionPreference(): MotionPreferenceContextValue {
  const context = useContext(MotionPreferenceContext);
  if (!context) {
    throw new Error(
      'useMotionPreference must be used within a MotionPreferenceProvider.',
    );
  }
  return context;
}

export function useOptionalMotionPreference(): MotionPreferenceContextValue {
  const context = useContext(MotionPreferenceContext);
  return useMemo<MotionPreferenceContextValue>(
    () => context ?? { prefersReducedMotion: getInitialReducedMotion() },
    [context],
  );
}

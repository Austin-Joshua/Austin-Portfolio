export const INTRO_SEEN_STORAGE_KEY = 'aj-cosmic-intro-seen';

export function hasSeenCosmicIntro(): boolean {
  if (typeof window === 'undefined') {
    return true;
  }

  try {
    return window.localStorage.getItem(INTRO_SEEN_STORAGE_KEY) === '1';
  } catch {
    // Restricted storage should never trap visitors behind an unskippable or broken intro
    return true;
  }
}

export function markCosmicIntroSeen(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(INTRO_SEEN_STORAGE_KEY, '1');
  } catch {
    // Ignore storage quota/privacy failures gracefully
  }
}

export function shouldPlayCosmicIntroOnMount(prefersReducedMotion: boolean): boolean {
  if (prefersReducedMotion || typeof document === 'undefined') {
    return false;
  }

  if (document.documentElement.classList.contains('aj-intro-pending')) {
    return true;
  }

  if (document.documentElement.classList.contains('aj-intro-seen')) {
    return false;
  }

  return !hasSeenCosmicIntro();
}

export const INTRO_SEEN_STORAGE_KEY = 'aj-cosmic-intro-seen';

export function hasSeenCosmicIntro(): boolean {
  return false;
}

export function markCosmicIntroSeen(): void {
  // No-op across reloads: the AJ curtain loader replays on every refresh unless prefers-reduced-motion is set.
}

export function shouldPlayCosmicIntroOnMount(prefersReducedMotion: boolean): boolean {
  return !prefersReducedMotion;
}

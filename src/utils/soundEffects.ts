import type { PlanetId } from '@/three/universeConfig';

export const SOUND_STORAGE_KEY = 'aj_cosmic_sound_enabled';

export type HapticKind = 'light' | 'medium' | 'success' | 'warning';

type SoundListener = (enabled: boolean) => void;

const listeners = new Set<SoundListener>();

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;

/**
 * Checks whether Web Audio cosmic sound feedback is active.
 * Defaults to enabled unless muted in storage or `prefers-reduced-motion: reduce` is active.
 */
export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const stored = window.localStorage.getItem(SOUND_STORAGE_KEY);
    if (stored !== null) {
      return stored === 'true';
    }
  } catch {
    // Restricted storage fallback
  }

  try {
    if (
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return false;
    }
  } catch {
    // matchMedia optional
  }

  return true;
}

/**
 * Persists audio preference, notifies subscribers, and plays a confirmation click when unmuting.
 */
export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  const next = Boolean(enabled);
  try {
    window.localStorage.setItem(SOUND_STORAGE_KEY, String(next));
  } catch {
    // Ignore storage failures
  }
  for (const listener of listeners) {
    try {
      listener(next);
    } catch {
      // Ignore subscriber errors
    }
  }

  if (next) {
    playClick();
  }
}

/**
 * Toggles sound state between enabled and muted and returns the new state.
 */
export function toggleSound(): boolean {
  const next = !isSoundEnabled();
  setSoundEnabled(next);
  return next;
}

/**
 * Subscribes to sound enable/mute changes and returns an unsubscribe cleanup function.
 */
export function subscribeSound(callback: SoundListener): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

/**
 * Triggers subtle tactile haptic vibration on supported devices (no-op on desktop/SSR).
 */
export function triggerHaptic(type: HapticKind = 'light'): void {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return;
  if (!('vibrate' in navigator) || typeof navigator.vibrate !== 'function') return;

  try {
    switch (type) {
      case 'light':
        navigator.vibrate(10);
        break;
      case 'medium':
        navigator.vibrate(20);
        break;
      case 'success':
        navigator.vibrate([12, 35, 18]);
        break;
      case 'warning':
        navigator.vibrate([24, 40, 24]);
        break;
    }
  } catch {
    // Ignore unsupported hardware errors
  }
}

function getAudioContext(): { ctx: AudioContext; master: GainNode } | null {
  if (typeof window === 'undefined') return null;

  try {
    const AudioCtxCtor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtxCtor) return null;

    if (!audioCtx || !masterGain) {
      audioCtx = new AudioCtxCtor();
      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      masterGain.connect(audioCtx.destination);
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }

    return { ctx: audioCtx, master: masterGain };
  } catch {
    return null;
  }
}

interface ToneOptions {
  freq: number;
  type?: OscillatorType;
  duration?: number;
  gainPeak?: number;
  startDelay?: number;
}

function playTone({
  freq,
  type = 'sine',
  duration = 0.09,
  gainPeak = 0.55,
  startDelay = 0,
}: ToneOptions): void {
  if (!isSoundEnabled()) return;

  const env = getAudioContext();
  if (!env) return;

  const { ctx, master } = env;
  const startTime = ctx.currentTime + startDelay;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);

  gainNode.gain.setValueAtTime(0.0001, startTime);
  gainNode.gain.linearRampToValueAtTime(gainPeak, startTime + 0.008);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gainNode);
  gainNode.connect(master);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

/** Crisp tactile click sound ported from Infinitus (A5 / 880Hz, 35ms). */
export function playClick(): void {
  triggerHaptic('light');
  playTone({ freq: 880, type: 'sine', duration: 0.035, gainPeak: 0.55 });
}

/** Ascending Pythagorean fifth chime for opening modals & detailed worlds (528Hz -> 792Hz). */
export function playOpenModal(): void {
  triggerHaptic('medium');
  playTone({ freq: 528, type: 'sine', duration: 0.12, gainPeak: 0.6, startDelay: 0 });
  playTone({ freq: 792, type: 'sine', duration: 0.16, gainPeak: 0.55, startDelay: 0.045 });
}

/** Descending resolution chime when closing modals (792Hz -> 528Hz). */
export function playCloseModal(): void {
  triggerHaptic('light');
  playTone({ freq: 792, type: 'sine', duration: 0.09, gainPeak: 0.5, startDelay: 0 });
  playTone({ freq: 528, type: 'sine', duration: 0.11, gainPeak: 0.45, startDelay: 0.035 });
}

/** Soft triumphant major triad for copy-email & confirmed actions (C5-E5-G5). */
export function playSuccess(): void {
  triggerHaptic('success');
  playTone({ freq: 523.25, type: 'sine', duration: 0.14, gainPeak: 0.55, startDelay: 0 });
  playTone({ freq: 659.25, type: 'sine', duration: 0.16, gainPeak: 0.55, startDelay: 0.045 });
  playTone({ freq: 783.99, type: 'sine', duration: 0.24, gainPeak: 0.65, startDelay: 0.09 });
}

const PLANET_TONES: Record<PlanetId, readonly ToneOptions[]> = {
  sun: [
    { freq: 220, type: 'triangle', duration: 0.2, gainPeak: 0.5, startDelay: 0 },
    { freq: 330, type: 'sine', duration: 0.26, gainPeak: 0.45, startDelay: 0.04 },
    { freq: 440, type: 'sine', duration: 0.3, gainPeak: 0.35, startDelay: 0.08 },
  ],
  about: [
    { freq: 293.66, type: 'sine', duration: 0.15, gainPeak: 0.55, startDelay: 0 },
    { freq: 440, type: 'sine', duration: 0.22, gainPeak: 0.5, startDelay: 0.045 },
  ],
  skills: [
    { freq: 392, type: 'triangle', duration: 0.12, gainPeak: 0.48, startDelay: 0 },
    { freq: 523.25, type: 'sine', duration: 0.15, gainPeak: 0.5, startDelay: 0.04 },
    { freq: 659.25, type: 'sine', duration: 0.2, gainPeak: 0.45, startDelay: 0.08 },
  ],
  projects: [
    { freq: 329.63, type: 'triangle', duration: 0.14, gainPeak: 0.52, startDelay: 0 },
    { freq: 493.88, type: 'sine', duration: 0.18, gainPeak: 0.52, startDelay: 0.045 },
    { freq: 659.25, type: 'sine', duration: 0.24, gainPeak: 0.46, startDelay: 0.09 },
  ],
  experience: [
    { freq: 261.63, type: 'triangle', duration: 0.15, gainPeak: 0.5, startDelay: 0 },
    { freq: 392, type: 'sine', duration: 0.22, gainPeak: 0.48, startDelay: 0.05 },
  ],
  achievements: [
    { freq: 440, type: 'sine', duration: 0.13, gainPeak: 0.5, startDelay: 0 },
    { freq: 554.37, type: 'sine', duration: 0.15, gainPeak: 0.52, startDelay: 0.045 },
    { freq: 880, type: 'sine', duration: 0.24, gainPeak: 0.48, startDelay: 0.09 },
  ],
  contact: [
    { freq: 587.33, type: 'sine', duration: 0.11, gainPeak: 0.48, startDelay: 0 },
    { freq: 880, type: 'sine', duration: 0.18, gainPeak: 0.42, startDelay: 0.06 },
  ],
};

/**
 * Plays a distinct celestial harmonic signature mapped to each Solar System planet and the Sun.
 */
export function playPlanetSound(planetId: PlanetId): void {
  triggerHaptic('medium');
  const tones = PLANET_TONES[planetId] ?? PLANET_TONES.sun;
  for (const tone of tones) {
    playTone(tone);
  }
}

const PROJECT_WORLD_TONES: Record<string, readonly ToneOptions[]> = {
  agriflux: [
    { freq: 523.25, type: 'sine', duration: 0.12, gainPeak: 0.5, startDelay: 0 },
    { freq: 659.25, type: 'sine', duration: 0.18, gainPeak: 0.45, startDelay: 0.045 },
  ],
  civiq: [
    { freq: 587.33, type: 'triangle', duration: 0.11, gainPeak: 0.46, startDelay: 0 },
    { freq: 783.99, type: 'sine', duration: 0.18, gainPeak: 0.46, startDelay: 0.045 },
  ],
  'resq-meal': [
    { freq: 493.88, type: 'sine', duration: 0.12, gainPeak: 0.5, startDelay: 0 },
    { freq: 739.99, type: 'sine', duration: 0.18, gainPeak: 0.46, startDelay: 0.045 },
  ],
  'rit-digital-twin': [
    { freq: 440, type: 'triangle', duration: 0.13, gainPeak: 0.48, startDelay: 0 },
    { freq: 659.25, type: 'sine', duration: 0.2, gainPeak: 0.46, startDelay: 0.05 },
  ],
  neuroram: [
    { freq: 659.25, type: 'sine', duration: 0.11, gainPeak: 0.48, startDelay: 0 },
    { freq: 987.77, type: 'sine', duration: 0.19, gainPeak: 0.42, startDelay: 0.045 },
  ],
};

/**
 * Plays a distinct cosmic chime when selecting or interacting with an individual Project World.
 */
export function playProjectWorldSound(slug: string): void {
  triggerHaptic('light');
  const tones = PROJECT_WORLD_TONES[slug] ?? PROJECT_WORLD_TONES.agriflux;
  for (const tone of tones) {
    playTone(tone);
  }
}

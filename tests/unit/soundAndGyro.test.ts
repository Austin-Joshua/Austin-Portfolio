import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  computeGyroTilt,
  computePointerTilt,
  requestIosGyroPermission,
} from '@/utils/gyroParallax';
import {
  isSoundEnabled,
  playClick,
  playCloseModal,
  playOpenModal,
  playPlanetSound,
  playProjectWorldSound,
  playSuccess,
  setSoundEnabled,
  SOUND_STORAGE_KEY,
  subscribeSound,
  toggleSound,
  triggerHaptic,
} from '@/utils/soundEffects';

interface RecordedOscillator {
  type: OscillatorType;
  freq: number;
}

describe('Gyro-Parallax Math & Permissions', () => {
  it('computes normalized pointer tilt, 3D angles, and specular glare within bounds', () => {
    const rect = { left: 100, top: 200, width: 400, height: 500 };

    const center = computePointerTilt(300, 450, rect, 10);
    expect(center.px).toBeCloseTo(0);
    expect(center.py).toBeCloseTo(0);
    expect(center.rotateX).toBeCloseTo(0);
    expect(center.rotateY).toBeCloseTo(0);
    expect(center.glareX).toBeCloseTo(50);
    expect(center.glareY).toBeCloseTo(50);

    const topRight = computePointerTilt(999, -50, rect, 12);
    expect(topRight.px).toBe(0.5);
    expect(topRight.py).toBe(-0.5);
    expect(topRight.rotateX).toBe(12);
    expect(topRight.rotateY).toBe(12);
    expect(topRight.glareX).toBe(90);
    expect(topRight.glareY).toBe(10);

    const invalid = computePointerTilt(10, 10, { left: 0, top: 0, width: 0, height: 100 }, 12);
    expect(invalid).toEqual({
      px: 0,
      py: 0,
      rotateX: 0,
      rotateY: 0,
      glareX: 50,
      glareY: 50,
    });
  });

  it('computes gyro tilt centered around neutral 45deg hold and clamps extreme orientations', () => {
    const neutral = computeGyroTilt(0, 45, 14);
    expect(neutral.px).toBeCloseTo(0);
    expect(neutral.py).toBeCloseTo(0);
    expect(neutral.rotateX).toBeCloseTo(0);
    expect(neutral.rotateY).toBeCloseTo(0);

    const tilted = computeGyroTilt(28, 73, 14);
    expect(tilted.px).toBeCloseTo(0.5);
    expect(tilted.py).toBeCloseTo(0.5);
    expect(tilted.rotateY).toBeCloseTo(14);
    expect(tilted.rotateX).toBeCloseTo(-14);

    const extreme = computeGyroTilt(-120, -40, 10);
    expect(extreme.px).toBeCloseTo(-0.5);
    expect(extreme.py).toBeCloseTo(-0.5);

    const empty = computeGyroTilt(null, null, 10);
    expect(empty.rotateX).toBe(0);
    expect(empty.rotateY).toBe(0);
  });

  it('resolves iOS DeviceOrientation permission requests safely', async () => {
    const originalDeviceOrientation = window.DeviceOrientationEvent;

    try {
      const grantedSpy = vi.fn().mockResolvedValue('granted');
      Object.defineProperty(window, 'DeviceOrientationEvent', {
        configurable: true,
        value: { requestPermission: grantedSpy },
      });
      await expect(requestIosGyroPermission()).resolves.toBe(true);
      expect(grantedSpy).toHaveBeenCalledTimes(1);

      const deniedSpy = vi.fn().mockResolvedValue('denied');
      Object.defineProperty(window, 'DeviceOrientationEvent', {
        configurable: true,
        value: { requestPermission: deniedSpy },
      });
      await expect(requestIosGyroPermission()).resolves.toBe(false);

      // Standard non-iOS browsers without requestPermission return true immediately
      Object.defineProperty(window, 'DeviceOrientationEvent', {
        configurable: true,
        value: function MockOrientationEvent() {},
      });
      await expect(requestIosGyroPermission()).resolves.toBe(true);
    } finally {
      Object.defineProperty(window, 'DeviceOrientationEvent', {
        configurable: true,
        value: originalDeviceOrientation,
      });
    }
  });
});

describe('Cosmic Web Audio Sound & Haptic Engine', () => {
  let recordedOscs: RecordedOscillator[] = [];
  let vibrateSpy: ReturnType<typeof vi.fn>;
  let originalAudioContext: typeof window.AudioContext | undefined;

  beforeEach(() => {
    window.localStorage.clear();
    recordedOscs = [];
    originalAudioContext = window.AudioContext;

    class MockAudioContext {
      currentTime = 1;
      state = 'running';
      destination = {};
      resume = vi.fn().mockResolvedValue(undefined);
      createGain() {
        return {
          gain: {
            setValueAtTime: vi.fn(),
            linearRampToValueAtTime: vi.fn(),
            exponentialRampToValueAtTime: vi.fn(),
          },
          connect: vi.fn(),
        };
      }
      createOscillator() {
        const osc: RecordedOscillator = { type: 'sine', freq: 0 };
        recordedOscs.push(osc);
        return {
          get type() {
            return osc.type;
          },
          set type(val: OscillatorType) {
            osc.type = val;
          },
          frequency: {
            setValueAtTime: vi.fn((val: number) => {
              osc.freq = val;
            }),
          },
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn(),
        };
      }
    }

    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      value: MockAudioContext,
    });

    vibrateSpy = vi.fn();
    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: vibrateSpy,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      value: originalAudioContext,
    });
    vi.restoreAllMocks();
  });

  it('persists enable/mute state, notifies subscribers, and plays unique planet & project tones', () => {
    expect(isSoundEnabled()).toBe(true);

    const states: boolean[] = [];
    const unsubscribe = subscribeSound((enabled) => states.push(enabled));

    expect(toggleSound()).toBe(false);
    expect(window.localStorage.getItem(SOUND_STORAGE_KEY)).toBe('false');
    expect(isSoundEnabled()).toBe(false);

    // Muted calls emit zero audio tones
    playClick();
    expect(recordedOscs).toHaveLength(0);

    // Unmuting emits confirmation click and updates subscribers
    setSoundEnabled(true);
    expect(isSoundEnabled()).toBe(true);
    expect(states).toEqual([false, true]);
    expect(recordedOscs.length).toBeGreaterThanOrEqual(1);
    unsubscribe();

    recordedOscs.length = 0;
    const planetIds = [
      'sun',
      'about',
      'skills',
      'projects',
      'experience',
      'achievements',
      'contact',
    ] as const;

    const perPlanetFreqs = planetIds.map((id) => {
      const before = recordedOscs.length;
      playPlanetSound(id);
      return recordedOscs.slice(before).map((o) => o.freq);
    });

    for (const freqs of perPlanetFreqs) {
      expect(freqs.length).toBeGreaterThanOrEqual(2);
    }
    // Every planet/Sun signature should be distinct
    const serialized = new Set(perPlanetFreqs.map((f) => f.join(',')));
    expect(serialized.size).toBe(planetIds.length);

    recordedOscs.length = 0;
    const worldSlugs = [
      'agriflux',
      'civiq',
      'resq-meal',
      'rit-digital-twin',
      'neuroram',
    ] as const;
    const worldFreqs = new Set(
      worldSlugs.map((slug) => {
        const before = recordedOscs.length;
        playProjectWorldSound(slug);
        return recordedOscs
          .slice(before)
          .map((o) => o.freq)
          .join(',');
      }),
    );
    expect(worldFreqs.size).toBe(worldSlugs.length);

    playOpenModal();
    playCloseModal();
    playSuccess();
    triggerHaptic('success');
    expect(vibrateSpy).toHaveBeenCalled();
  });
});

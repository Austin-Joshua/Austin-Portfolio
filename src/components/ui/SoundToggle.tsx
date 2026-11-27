import { Volume2, VolumeX } from 'lucide-react';
import { AnimatePresence, m } from 'motion/react';
import { useSyncExternalStore } from 'react';
import {
  isSoundEnabled,
  subscribeSound,
  toggleSound,
} from '@/utils/soundEffects';

export interface SoundToggleProps {
  className?: string;
}

/**
 * Circular Web Audio harmonic sound toggle matching Infinitus SoundToggle ergonomics.
 */
export function SoundToggle({ className = '' }: SoundToggleProps) {
  const enabled = useSyncExternalStore(subscribeSound, isSoundEnabled, () => false);

  return (
    <button
      type="button"
      data-testid="sound-toggle-button"
      onClick={() => toggleSound()}
      aria-pressed={enabled}
      aria-label={enabled ? 'Mute cosmic sound effects' : 'Enable cosmic sound effects'}
      title={enabled ? 'Mute cosmic sounds' : 'Enable cosmic sounds'}
      className={[
        'glass-surface pointer-events-auto relative inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full',
        'cursor-pointer transition-[border-color,color,transform] duration-200 hover:scale-105 hover:border-[var(--planet-sun)] active:scale-95',
        'focus-visible:outline-2 focus-visible:outline-[var(--focus-ring)] focus-visible:outline-offset-[3px]',
        enabled ? 'text-[var(--planet-sun)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <AnimatePresence mode="wait" initial={false}>
        {enabled ? (
          <m.span
            key="sound-on"
            initial={{ scale: 0.72, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.72, opacity: 0 }}
            transition={{ duration: 0.14 }}
            className="flex items-center justify-center"
          >
            <Volume2 className="size-4 sm:size-[18px]" aria-hidden="true" />
          </m.span>
        ) : (
          <m.span
            key="sound-off"
            initial={{ scale: 0.72, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.72, opacity: 0 }}
            transition={{ duration: 0.14 }}
            className="flex items-center justify-center"
          >
            <VolumeX className="size-4 sm:size-[18px]" aria-hidden="true" />
          </m.span>
        )}
      </AnimatePresence>
    </button>
  );
}

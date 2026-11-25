import { useCallback, useEffect, useRef, useState } from 'react';

export type ClipboardStatus = 'idle' | 'copied' | 'fallback';

export interface UseClipboardOptions {
  resetDelayMs?: number;
}

export interface UseClipboardResult {
  status: ClipboardStatus;
  announcement: string;
  copy: (value: string) => Promise<boolean>;
  reset: () => void;
}

export function useClipboard(
  options: UseClipboardOptions = {},
): UseClipboardResult {
  const { resetDelayMs = 3000 } = options;
  const [status, setStatus] = useState<ClipboardStatus>('idle');
  const [announcement, setAnnouncement] = useState<string>('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearResetTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => clearResetTimer, [clearResetTimer]);

  const scheduleReset = useCallback(() => {
    clearResetTimer();
    if (resetDelayMs > 0) {
      timerRef.current = setTimeout(() => {
        setStatus('idle');
        setAnnouncement('');
      }, resetDelayMs);
    }
  }, [clearResetTimer, resetDelayMs]);

  const reset = useCallback(() => {
    clearResetTimer();
    setStatus('idle');
    setAnnouncement('');
  }, [clearResetTimer]);

  const copy = useCallback(
    async (value: string): Promise<boolean> => {
      const trimmed = value.trim();
      if (!trimmed) {
        return false;
      }

      if (
        typeof navigator !== 'undefined' &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === 'function'
      ) {
        try {
          await navigator.clipboard.writeText(trimmed);
          setStatus('copied');
          setAnnouncement('Email address copied to clipboard.');
          scheduleReset();
          return true;
        } catch {
          setStatus('fallback');
          setAnnouncement(
            'Clipboard access was blocked. Use the direct email link instead.',
          );
          scheduleReset();
          return false;
        }
      }

      setStatus('fallback');
      setAnnouncement(
        'Clipboard access is unavailable. Use the direct email link instead.',
      );
      scheduleReset();
      return false;
    },
    [scheduleReset],
  );

  return {
    status,
    announcement,
    copy,
    reset,
  };
}

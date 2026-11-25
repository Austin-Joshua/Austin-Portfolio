export type LivePoliteness = 'polite' | 'assertive';

export interface LiveAnnouncerProps {
  message: string;
  politeness?: LivePoliteness;
  visible?: boolean;
  atomic?: boolean;
  className?: string;
}

export function LiveAnnouncer({
  message,
  politeness = 'polite',
  visible = false,
  atomic = true,
  className = '',
}: LiveAnnouncerProps) {
  const role = politeness === 'assertive' ? 'alert' : 'status';

  return (
    <div
      role={role}
      aria-live={politeness}
      aria-atomic={atomic}
      className={[
        visible ? 'type-body text-[var(--text-secondary)]' : 'sr-only',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {message}
    </div>
  );
}

import type { Theme } from '@/utils/themeStorage';

export interface UniverseFallbackProps {
  theme?: Theme;
  className?: string;
}

export function UniverseFallback({
  theme = 'dark',
  className = '',
}: UniverseFallbackProps) {
  const isDark = theme === 'dark';

  return (
    <div
      aria-hidden="true"
      data-testid="universe-fallback"
      data-universe-theme={theme}
      className={[
        'pointer-events-none select-none fixed inset-0 z-0 overflow-hidden',
        'bg-[var(--surface-canvas)] transition-colors duration-[var(--transition-theme)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Restrained radial depth derived exclusively from active CSS theme tokens */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 72% 42%, color-mix(in srgb, var(--accent-primary) 12%, transparent) 0%, color-mix(in srgb, var(--accent-primary-deep) 8%, transparent) 32%, transparent 66%)',
        }}
      />

      {/* Swiss orbital coordinate diagram */}
      <svg
        viewBox="0 0 1200 900"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full opacity-80"
        fill="none"
      >
        <g transform="translate(840 390)">
          <circle
            cx="0"
            cy="0"
            r="340"
            stroke="var(--text-primary)"
            strokeOpacity={isDark ? '0.14' : '0.16'}
            strokeWidth="1"
            strokeDasharray="6 8"
          />
          <ellipse
            cx="0"
            cy="0"
            rx="270"
            ry="135"
            transform="rotate(-22)"
            stroke="var(--accent-primary)"
            strokeOpacity={isDark ? '0.28' : '0.24'}
            strokeWidth="1.25"
          />
          <ellipse
            cx="0"
            cy="0"
            rx="210"
            ry="96"
            transform="rotate(34)"
            stroke="var(--accent-primary-deep)"
            strokeOpacity={isDark ? '0.4' : '0.26'}
            strokeWidth="1"
          />
          <circle
            cx="0"
            cy="0"
            r="116"
            stroke="var(--text-primary)"
            strokeOpacity={isDark ? '0.22' : '0.18'}
            strokeWidth="1"
          />
          <line
            x1="-420"
            y1="0"
            x2="420"
            y2="0"
            stroke="var(--border-subtle)"
            strokeWidth="1"
          />
          <line
            x1="0"
            y1="-360"
            x2="0"
            y2="360"
            stroke="var(--border-subtle)"
            strokeWidth="1"
          />
          <circle
            cx="196"
            cy="-84"
            r="3"
            fill="var(--accent-primary)"
            fillOpacity={isDark ? '0.7' : '0.55'}
          />
          <circle
            cx="-144"
            cy="118"
            r="2.5"
            fill="var(--text-primary)"
            fillOpacity={isDark ? '0.55' : '0.45'}
          />
        </g>
      </svg>
    </div>
  );
}

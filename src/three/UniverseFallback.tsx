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
        'pointer-events-none select-none absolute inset-0 h-full w-full overflow-hidden',
        'transition-colors duration-[var(--transition-theme)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Centered radial atmospheric glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle 68% at 50% 50%, color-mix(in srgb, var(--accent-primary) 22%, transparent) 0%, color-mix(in srgb, var(--accent-primary-deep) 14%, transparent) 42%, transparent 72%)',
        }}
      />

      {/* Swiss orbital coordinate diagram centered cleanly inside the Hero stage */}
      <svg
        viewBox="0 0 800 800"
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full"
        fill="none"
      >
        <g transform="translate(400 400)">
          <circle
            cx="0"
            cy="0"
            r="340"
            stroke="var(--text-primary)"
            strokeOpacity={isDark ? '0.1' : '0.12'}
            strokeWidth="1"
            strokeDasharray="3 9"
          />
          <ellipse
            cx="0"
            cy="0"
            rx="290"
            ry="145"
            transform="rotate(-22)"
            stroke="var(--accent-primary)"
            strokeOpacity={isDark ? '0.32' : '0.28'}
            strokeWidth="1.5"
          />
          <ellipse
            cx="0"
            cy="0"
            rx="220"
            ry="104"
            transform="rotate(28)"
            stroke="var(--accent-primary-deep)"
            strokeOpacity={isDark ? '0.45' : '0.3'}
            strokeWidth="1.2"
          />
          <circle
            cx="0"
            cy="0"
            r="142"
            stroke="var(--accent-primary)"
            strokeOpacity={isDark ? '0.35' : '0.26'}
            strokeWidth="1.2"
          />
          <circle
            cx="0"
            cy="0"
            r="64"
            stroke="var(--accent-primary)"
            strokeOpacity={isDark ? '0.6' : '0.42'}
            strokeWidth="1.5"
          />
          <line
            x1="-360"
            y1="0"
            x2="360"
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
            cx="218"
            cy="-92"
            r="5"
            fill="var(--accent-primary)"
            fillOpacity={isDark ? '0.85' : '0.7'}
          />
          <circle
            cx="-162"
            cy="130"
            r="3.5"
            fill="var(--accent-primary)"
            fillOpacity={isDark ? '0.65' : '0.5'}
          />
          <circle
            cx="96"
            cy="108"
            r="3.5"
            fill="var(--accent-gold)"
            fillOpacity={isDark ? '0.75' : '0.6'}
          />
          <polygon
            points="0,-42 36,21 -36,21"
            stroke="var(--accent-primary)"
            strokeOpacity={isDark ? '0.55' : '0.38'}
            strokeWidth="1.2"
            fill="none"
          />
        </g>
      </svg>
    </div>
  );
}

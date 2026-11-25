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
      {/* Primary radial atmospheric glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 55% 65% at 72% 42%, color-mix(in srgb, var(--accent-primary) 16%, transparent) 0%, color-mix(in srgb, var(--accent-primary-deep) 10%, transparent) 40%, transparent 70%)',
        }}
      />

      {/* Secondary ambient glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 35% 45% at 25% 65%, color-mix(in srgb, var(--accent-primary-deep) 8%, transparent) 0%, transparent 60%)',
        }}
      />

      {/* Swiss orbital coordinate diagram — larger and more prominent */}
      <svg
        viewBox="0 0 1200 900"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        fill="none"
      >
        <g transform="translate(840 390)">
          {/* Outermost drift ring */}
          <circle
            cx="0"
            cy="0"
            r="380"
            stroke="var(--text-primary)"
            strokeOpacity={isDark ? '0.07' : '0.08'}
            strokeWidth="1"
            strokeDasharray="3 9"
          />
          {/* Outer ellipse */}
          <ellipse
            cx="0"
            cy="0"
            rx="310"
            ry="155"
            transform="rotate(-18)"
            stroke="var(--accent-primary)"
            strokeOpacity={isDark ? '0.22' : '0.18'}
            strokeWidth="1.5"
          />
          {/* Mid ellipse */}
          <ellipse
            cx="0"
            cy="0"
            rx="230"
            ry="108"
            transform="rotate(28)"
            stroke="var(--accent-primary-deep)"
            strokeOpacity={isDark ? '0.35' : '0.22'}
            strokeWidth="1.2"
          />
          {/* Inner orbit */}
          <circle
            cx="0"
            cy="0"
            r="140"
            stroke="var(--accent-primary)"
            strokeOpacity={isDark ? '0.28' : '0.2'}
            strokeWidth="1"
          />
          {/* Core circle */}
          <circle
            cx="0"
            cy="0"
            r="58"
            stroke="var(--accent-primary)"
            strokeOpacity={isDark ? '0.5' : '0.35'}
            strokeWidth="1.5"
          />
          {/* Axes */}
          <line
            x1="-460"
            y1="0"
            x2="460"
            y2="0"
            stroke="var(--border-subtle)"
            strokeWidth="1"
          />
          <line
            x1="0"
            y1="-400"
            x2="0"
            y2="400"
            stroke="var(--border-subtle)"
            strokeWidth="1"
          />
          {/* Orbital bodies */}
          <circle
            cx="218"
            cy="-92"
            r="4"
            fill="var(--accent-primary)"
            fillOpacity={isDark ? '0.8' : '0.6'}
          />
          <circle
            cx="-162"
            cy="130"
            r="3"
            fill="var(--accent-primary)"
            fillOpacity={isDark ? '0.55' : '0.45'}
          />
          <circle
            cx="90"
            cy="110"
            r="2.5"
            fill="var(--accent-gold)"
            fillOpacity={isDark ? '0.6' : '0.5'}
          />
          <circle
            cx="-75"
            cy="-85"
            r="2"
            fill="var(--text-primary)"
            fillOpacity={isDark ? '0.4' : '0.3'}
          />
          {/* Core polygon */}
          <polygon
            points="0,-38 33,19 -33,19"
            stroke="var(--accent-primary)"
            strokeOpacity={isDark ? '0.45' : '0.3'}
            strokeWidth="1"
            fill="none"
          />
        </g>
      </svg>
    </div>
  );
}

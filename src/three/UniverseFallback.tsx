import { SOLAR_SYSTEM_PLANETS } from '@/three/universeConfig';

export interface UniverseFallbackProps {
  className?: string;
}

/**
 * Deterministic pitch-black cosmic SVG solar-system fallback when WebGL is
 * unavailable or while the lazy R3F chunk hydrates.
 */
export function UniverseFallback({ className = '' }: UniverseFallbackProps) {
  return (
    <div
      aria-hidden="true"
      data-testid="universe-fallback"
      className={[
        'pointer-events-none select-none fixed inset-0 z-0 h-full w-full overflow-hidden bg-[var(--surface-canvas)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Subtle deep-space starlight nebula haze */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle 54% at 68% 46%, rgba(255, 179, 71, 0.14) 0%, rgba(56, 189, 248, 0.06) 42%, transparent 74%)',
        }}
      />

      {/* Orbital schematic SVG representing the Sun & six section planets */}
      <svg
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full opacity-75"
        fill="none"
      >
        <g transform="translate(810 385)">
          <circle cx="0" cy="0" r="36" fill="rgba(255, 179, 71, 0.22)" />
          <circle cx="0" cy="0" r="18" fill="#FFB347" fillOpacity="0.72" />
          <line x1="-540" y1="0" x2="540" y2="0" stroke="rgba(220,228,240,0.08)" strokeWidth="1" />
          <line x1="0" y1="-360" x2="0" y2="360" stroke="rgba(220,228,240,0.08)" strokeWidth="1" />

          {SOLAR_SYSTEM_PLANETS.map((planet, idx) => {
            const rx = 105 + idx * 68;
            const ry = rx * 0.48;
            const angle = planet.initialAngle;
            const px = Math.cos(angle) * rx;
            const py = Math.sin(angle) * ry;
            return (
              <g key={planet.id}>
                <ellipse
                  cx="0"
                  cy="0"
                  rx={rx}
                  ry={ry}
                  transform={`rotate(${idx % 2 === 0 ? -10 : 8})`}
                  stroke={planet.color}
                  strokeOpacity="0.28"
                  strokeWidth="1"
                  strokeDasharray="3 7"
                />
                <circle cx={px} cy={py} r={5 + idx * 0.9} fill={planet.color} fillOpacity="0.78" />
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

import React from 'react';

export interface VConicGaugeProps {
  /** Value from 0 to 1 */
  progress: number;
  /** Size (width & height) of the gauge */
  size?: number;
  /** Stroke width of the arc */
  strokeWidth?: number;
  /** Center label (e.g. score) */
  label?: string;
  /** Optional sublabel below the main label */
  sublabel?: string;
  className?: string;
}

/**
 * Builds an SVG arc path for a partial circle.
 */
function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  const rad = (deg: number) => ((deg - 90) * Math.PI) / 180;
  const start = {
    x: cx + r * Math.cos(rad(endAngle)),
    y: cy + r * Math.sin(rad(endAngle)),
  };
  const end = {
    x: cx + r * Math.cos(rad(startAngle)),
    y: cy + r * Math.sin(rad(startAngle)),
  };
  const largeArc = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

export const VConicGauge: React.FC<VConicGaugeProps> = ({
  progress,
  size = 120,
  strokeWidth = 10,
  label,
  sublabel,
  className = '',
}) => {
  const clamped = Math.min(1, Math.max(0, progress));
  const cx = size / 2;
  const cy = size / 2;
  const r = (size - strokeWidth) / 2;

  const totalAngle = 270;
  const startAngle = 135;
  const endAngle = startAngle + totalAngle;
  const fillAngle = startAngle + totalAngle * clamped;

  const bgPath = describeArc(cx, cy, r, startAngle, endAngle);
  const fillPath = clamped > 0 ? describeArc(cx, cy, r, startAngle, fillAngle) : '';

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={Math.round(clamped * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Gauge: ${Math.round(clamped * 100)}%`}
    >
      <svg width={size} height={size} className="absolute inset-0">
        {/* Track */}
        <path
          d={bgPath}
          stroke="#373438"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        {/* Fill — gold with glow */}
        {fillPath && (
          <path
            d={fillPath}
            stroke="#dbc585"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 0 6px #dbc585)' }}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label != null && (
          <span className="text-3xl font-black uppercase tracking-tight text-[var(--color-on-surface)] font-[family-name:var(--font-display)]">
            {label}
          </span>
        )}
        {sublabel != null && (
          <span className="text-xs font-bold uppercase tracking-widest text-[#968d9d] mt-1 font-[family-name:var(--font-label)]">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
};

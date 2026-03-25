import React from 'react';

export type TrendDirection = 'up' | 'down' | 'flat';

export interface VMetricCardProps {
  value: string | number;
  label: string;
  trend?: TrendDirection;
  trendLabel?: string;
  className?: string;
}

const trendArrows: Record<TrendDirection, string> = {
  up: '\u25B2',
  down: '\u25BC',
  flat: '\u25C6',
};

const trendColorMap: Record<TrendDirection, string> = {
  up: 'text-[var(--color-success)]',
  down: 'text-[var(--color-error)]',
  flat: 'text-[var(--color-outline)]',
};

export const VMetricCard: React.FC<VMetricCardProps> = ({
  value,
  label,
  trend,
  trendLabel,
  className = '',
}) => {
  return (
    <div
      className={`bg-[var(--color-surface-container-low)] border border-[var(--ghost-border)] rounded-md p-4 shadow-[var(--shadow-sm)] ${className}`}
      role="region"
      aria-label={`${label}: ${value}${trend ? `, trending ${trend}` : ''}`}
    >
      <span className="block text-4xl font-bold text-[var(--color-on-surface)] font-[family-name:var(--font-display)]">
        {value}
      </span>
      <span className="block text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] mt-1 font-[family-name:var(--font-label)]">
        {label}
      </span>
      {trend && (
        <div className="flex items-center gap-1 mt-2">
          <span className={`text-xs ${trendColorMap[trend]}`}>
            {trendArrows[trend]}
          </span>
          {trendLabel && (
            <span className={`text-xs font-semibold ${trendColorMap[trend]}`}>
              {trendLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

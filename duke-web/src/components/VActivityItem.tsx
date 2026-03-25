import React from 'react';

export interface VActivityItemProps {
  title: string;
  subtitle?: string;
  pointDelta?: number;
  timestamp?: string;
  className?: string;
}

export const VActivityItem: React.FC<VActivityItemProps> = ({
  title,
  subtitle,
  pointDelta,
  timestamp,
  className = '',
}) => {
  const deltaSign = pointDelta != null && pointDelta >= 0 ? '+' : '';
  const deltaColorClass =
    pointDelta != null && pointDelta > 0
      ? 'text-[var(--color-success)] bg-[var(--color-success)]/10'
      : pointDelta === 0
        ? 'text-[var(--color-outline)] bg-[var(--color-outline)]/10'
        : 'text-[var(--color-error)] bg-[var(--color-error)]/10';

  return (
    <div
      className={`flex items-center justify-between py-3 rounded-sm hover:bg-[#1d1b1f] transition-colors ${className}`}
      aria-label={`${title}${pointDelta != null ? `, ${deltaSign}${pointDelta} points` : ''}`}
    >
      <div className="flex flex-col gap-0.5 flex-1">
        <span className="text-sm font-bold text-[var(--color-on-surface)] font-[family-name:var(--font-display)]">
          {title}
        </span>
        {subtitle && (
          <span className="text-xs text-[var(--color-on-surface-variant)] font-[family-name:var(--font-body)]">{subtitle}</span>
        )}
        {timestamp && (
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-outline)] font-[family-name:var(--font-label)]">
            {timestamp}
          </span>
        )}
      </div>
      {pointDelta != null && (
        <span
          className={`rounded-sm px-2 py-1 ml-3 text-xs font-bold ${deltaColorClass} font-[family-name:var(--font-label)]`}
        >
          {deltaSign}{pointDelta}
        </span>
      )}
    </div>
  );
};

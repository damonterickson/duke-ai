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
      ? 'text-[var(--color-secondary)] bg-[var(--color-secondary)]/10'
      : pointDelta === 0
        ? 'text-[var(--color-outline)] bg-[var(--color-outline)]/10'
        : 'text-[var(--color-error)] bg-[var(--color-error)]/10';

  return (
    <div
      className={`flex items-center justify-between py-3 ${className}`}
      aria-label={`${title}${pointDelta != null ? `, ${deltaSign}${pointDelta} points` : ''}`}
    >
      <div className="flex flex-col gap-1 flex-1">
        <span className="text-sm font-semibold text-[var(--color-on-surface)]">
          {title}
        </span>
        {subtitle && (
          <span className="text-sm text-[var(--color-outline)]">{subtitle}</span>
        )}
        {timestamp && (
          <span className="text-xs font-medium text-[var(--color-outline)]">
            {timestamp}
          </span>
        )}
      </div>
      {pointDelta != null && (
        <span
          className={`rounded-lg py-1 px-2 ml-3 text-sm font-medium ${deltaColorClass}`}
        >
          {deltaSign}{pointDelta}
        </span>
      )}
    </div>
  );
};

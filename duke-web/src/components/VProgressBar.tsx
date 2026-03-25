import React from 'react';

export interface VProgressBarProps {
  /** Progress value from 0 to 1 */
  progress: number;
  /** Height in pixels */
  height?: number;
  className?: string;
}

export const VProgressBar: React.FC<VProgressBarProps> = ({
  progress,
  height = 8,
  className = '',
}) => {
  const clamped = Math.min(1, Math.max(0, progress));
  const pct = Math.round(clamped * 100);

  return (
    <div
      className={`w-full rounded-lg overflow-hidden bg-[var(--color-surface-container-highest)] ${className}`}
      style={{ height }}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Progress: ${pct}%`}
    >
      <div
        className="h-full rounded-lg bg-gradient-to-r from-[var(--gradient-gold-from)] to-[var(--gradient-gold-to)] transition-[width] duration-300 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

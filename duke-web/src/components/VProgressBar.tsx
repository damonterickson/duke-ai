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
  height = 6,
  className = '',
}) => {
  const clamped = Math.min(1, Math.max(0, progress));
  const pct = Math.round(clamped * 100);

  return (
    <div
      className={`w-full rounded-sm overflow-hidden bg-[#373438] ${className}`}
      style={{ height }}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Progress: ${pct}%`}
    >
      <div
        className="h-full rounded-sm transition-[width] duration-300 ease-out"
        style={{
          width: `${pct}%`,
          background: 'linear-gradient(90deg, #dbc585, #f8e19e)',
          boxShadow: '0 0 10px #dbc585',
        }}
      />
    </div>
  );
};

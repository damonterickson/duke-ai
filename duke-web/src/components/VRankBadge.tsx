import React from 'react';

export interface VRankBadgeProps {
  rank: string;
  label?: string;
  className?: string;
}

export const VRankBadge: React.FC<VRankBadgeProps> = ({
  rank,
  label,
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center rounded-lg border border-[rgba(200,199,184,0.2)] px-2 py-1 text-sm font-medium uppercase tracking-wide text-[var(--color-secondary)] ${className}`}
      aria-label={label ?? `Rank: ${rank}`}
    >
      {rank}
    </span>
  );
};

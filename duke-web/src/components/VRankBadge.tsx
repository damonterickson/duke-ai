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
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-bold uppercase tracking-wider border border-[var(--color-primary)] text-[var(--color-primary)] font-[family-name:var(--font-label)] ${className}`}
      aria-label={label ?? `Rank: ${rank}`}
    >
      {rank}
    </span>
  );
};

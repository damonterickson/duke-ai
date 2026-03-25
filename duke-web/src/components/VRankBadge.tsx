import React from 'react';

export interface VRankBadgeProps {
  rank: string;
  label?: string;
  glow?: boolean;
  className?: string;
}

export const VRankBadge: React.FC<VRankBadgeProps> = ({
  rank,
  label,
  glow = false,
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-bold uppercase tracking-wider bg-transparent ghost-border text-[#968d9d] font-[family-name:var(--font-label)] ${glow ? 'shadow-[0_0_12px_rgba(219,197,133,0.4)]' : ''} ${className}`}
      aria-label={label ?? `Rank: ${rank}`}
    >
      {rank}
    </span>
  );
};

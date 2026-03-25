import React from 'react';
import { type IconType } from 'react-icons';
import { MdLightbulb } from 'react-icons/md';

export interface VInsightCardProps {
  /** Material icon component from react-icons/md */
  icon?: IconType;
  /** Label text, e.g. "Vanguard AI Insight" */
  label: string;
  /** The recommendation / insight text */
  text: string;
  className?: string;
}

export const VInsightCard: React.FC<VInsightCardProps> = ({
  icon: Icon = MdLightbulb,
  label,
  text,
  className = '',
}) => {
  return (
    <div
      className={`flex items-start gap-4 border-l-4 border-l-[var(--color-primary)] rounded-r-xl bg-[var(--color-surface-container-high)] p-5 ${className}`}
      aria-label={`${label}: ${text}`}
    >
      <Icon className="text-[var(--color-primary)] text-2xl mt-0.5 shrink-0" />
      <div className="flex flex-col gap-2 flex-1">
        <span className="text-xs font-bold uppercase tracking-[1.5px] text-[var(--color-outline)]">
          {label}
        </span>
        <p className="text-sm text-[var(--color-on-surface)] leading-5">
          {text}
        </p>
      </div>
    </div>
  );
};

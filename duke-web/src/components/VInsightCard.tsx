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
      className={`flex items-start gap-4 border-l-4 border-l-[var(--color-primary)] rounded-r-md bg-[var(--color-surface-container-low)] border border-[var(--ghost-border)] p-5 shadow-[var(--shadow-sm)] ${className}`}
      aria-label={`${label}: ${text}`}
    >
      <Icon className="text-[var(--color-primary)] text-2xl mt-0.5 shrink-0" />
      <div className="flex flex-col gap-2 flex-1">
        <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] font-[family-name:var(--font-label)]">
          {label}
        </span>
        <p className="text-sm text-[var(--color-on-surface)] leading-relaxed font-[family-name:var(--font-body)]">
          {text}
        </p>
      </div>
    </div>
  );
};

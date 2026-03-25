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
      className={`flex items-start gap-4 glass-card ghost-border rounded-sm p-5 shadow-[var(--shadow-sm)] relative overflow-hidden ${className}`}
      aria-label={`${label}: ${text}`}
    >
      {/* Accent block instead of border-left (no-line rule) */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-r-sm"
        style={{
          background: '#450084',
          boxShadow: '0 0 12px rgba(69,0,132,0.5)',
        }}
      />
      <div className="pl-2 flex items-start gap-4 flex-1">
        <Icon className="text-[#d9b9ff] text-2xl mt-0.5 shrink-0" />
        <div className="flex flex-col gap-2 flex-1">
          <span className="text-xs font-bold uppercase tracking-widest text-[#968d9d] font-[family-name:var(--font-label)]">
            {label}
          </span>
          <p className="text-sm text-[var(--color-on-surface)] leading-relaxed font-[family-name:var(--font-body)]">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
};

import React from 'react';

export interface VGlassPanelProps {
  children: React.ReactNode;
  className?: string;
}

export const VGlassPanel: React.FC<VGlassPanelProps> = ({
  children,
  className = '',
}) => {
  return (
    <div
      className={`rounded-2xl overflow-hidden p-4 backdrop-blur-xl bg-[var(--glass-overlay)] border border-[var(--ghost-border-color)] ${className}`}
    >
      {children}
    </div>
  );
};

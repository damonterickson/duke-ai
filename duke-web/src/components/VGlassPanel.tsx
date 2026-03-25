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
      className={`glass-panel rounded-sm overflow-hidden p-4 ${className}`}
    >
      {children}
    </div>
  );
};

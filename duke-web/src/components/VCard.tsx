import React from 'react';

export interface VCardProps {
  children: React.ReactNode;
  className?: string;
  tier?: 'lowest' | 'low' | 'default' | 'high' | 'highest';
}

export const VCard: React.FC<VCardProps> = ({
  children,
  className = '',
  tier: _tier = 'low',
}) => {
  return (
    <div
      className={`glass-card ghost-border rounded-sm p-4 shadow-[var(--shadow-sm)] ${className}`}
      role="region"
    >
      {children}
    </div>
  );
};

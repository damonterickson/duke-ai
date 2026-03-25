import React from 'react';

export interface VCardProps {
  children: React.ReactNode;
  className?: string;
  tier?: 'lowest' | 'low' | 'default' | 'high' | 'highest';
}

const tierBgMap: Record<NonNullable<VCardProps['tier']>, string> = {
  lowest: 'bg-[var(--color-surface-container-lowest)]',
  low: 'bg-[var(--color-surface-container-low)]',
  default: 'bg-[var(--color-surface-container)]',
  high: 'bg-[var(--color-surface-container-high)]',
  highest: 'bg-[var(--color-surface-container-highest)]',
};

export const VCard: React.FC<VCardProps> = ({
  children,
  className = '',
  tier = 'low',
}) => {
  return (
    <div
      className={`rounded-md p-4 border border-[var(--ghost-border)] shadow-[var(--shadow-sm)] ${tierBgMap[tier]} ${className}`}
      role="region"
    >
      {children}
    </div>
  );
};

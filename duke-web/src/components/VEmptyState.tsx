'use client';

import React from 'react';
import { VButton } from './VButton';

export interface VEmptyStateProps {
  icon: string;
  headline: string;
  body: string;
  ctaLabel: string;
  onCtaPress: () => void;
  className?: string;
}

export const VEmptyState: React.FC<VEmptyStateProps> = ({
  icon,
  headline,
  body,
  ctaLabel,
  onCtaPress,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-1 flex-col items-center justify-center px-8 gap-3 ${className}`}
      role="region"
      aria-label={headline}
    >
      <div className="w-24 h-24 flex items-center justify-center mb-2">
        <span className="text-6xl text-[#968d9d]">{icon}</span>
      </div>
      <h2 className="text-xl font-bold text-[#e7e1e6] text-center font-[family-name:var(--font-display)]">
        {headline}
      </h2>
      <p className="text-sm text-[#cdc3d4] text-center leading-relaxed font-[family-name:var(--font-body)]">
        {body}
      </p>
      <VButton
        label={ctaLabel}
        onPress={onCtaPress}
        variant="primary"
        className="mt-4 min-w-[200px]"
      />
    </div>
  );
};

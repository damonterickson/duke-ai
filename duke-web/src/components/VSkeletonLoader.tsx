import React from 'react';

export interface VSkeletonLoaderProps {
  width?: number | string;
  height?: number;
  className?: string;
}

export const VSkeletonLoader: React.FC<VSkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  className = '',
}) => {
  return (
    <div
      className={`rounded animate-pulse bg-[var(--color-surface-container)] ${className}`}
      style={{ width, height }}
      role="progressbar"
      aria-label="Loading..."
    />
  );
};

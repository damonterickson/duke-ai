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
      className={`rounded-lg animate-pulse bg-[var(--color-surface-container-low)] ${className}`}
      style={{ width, height }}
      role="progressbar"
      aria-label="Loading..."
    />
  );
};

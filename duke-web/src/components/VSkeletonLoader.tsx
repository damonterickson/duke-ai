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
      className={`rounded-sm bg-[#211f23] ${className}`}
      style={{
        width,
        height,
        backgroundImage: 'linear-gradient(90deg, #211f23 0%, #2c292d 40%, #211f23 80%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s ease-in-out infinite',
      }}
      role="progressbar"
      aria-label="Loading..."
    />
  );
};

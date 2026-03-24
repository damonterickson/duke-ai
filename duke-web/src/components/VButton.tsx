'use client';

import React from 'react';

export interface VButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const VButton: React.FC<VButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  className = '',
}) => {
  const base =
    'inline-flex items-center justify-center min-h-[48px] py-3 px-6 rounded-lg font-semibold text-sm tracking-wide transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

  const variants: Record<string, string> = {
    primary:
      'bg-gradient-to-r from-[var(--gradient-primary-from)] to-[var(--gradient-primary-to)] text-[var(--color-on-primary)] shadow-[0_0_15px_rgba(69,0,132,0.3)]',
    secondary:
      'bg-[var(--color-surface-container-low)] text-[var(--color-primary)] shadow-[0_0_30px_rgba(84,69,17,0.15)]',
    tertiary: 'bg-transparent text-[var(--color-primary)]',
  };

  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-85 active:opacity-75';

  return (
    <button
      onClick={onPress}
      disabled={disabled || loading}
      aria-label={label}
      aria-disabled={disabled}
      className={`${base} ${variants[variant]} ${disabledClass} ${className}`}
    >
      {loading ? (
        <svg
          className="animate-spin h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : (
        label
      )}
    </button>
  );
};

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
    'inline-flex items-center justify-center min-h-[48px] py-3 px-6 rounded-sm text-sm uppercase tracking-wider font-bold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d9b9ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#151317] font-[family-name:var(--font-label)]';

  const variants: Record<string, string> = {
    primary:
      'bg-[#450084] text-[#b27ff5] shadow-[var(--shadow-sm)] hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(69,0,132,0.4)] active:scale-[0.98]',
    secondary:
      'bg-transparent ghost-border text-[#b27ff5] hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(69,0,132,0.4)] active:scale-[0.98]',
    tertiary:
      'bg-transparent text-[#dbc585] hover:opacity-80 active:scale-[0.98]',
  };

  const disabledClass = disabled
    ? 'opacity-50 cursor-not-allowed'
    : 'cursor-pointer';

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

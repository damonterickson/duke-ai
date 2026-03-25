'use client';

import React, { useState } from 'react';

export interface VInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  helperText?: string;
  error?: boolean;
  errorText?: string;
  type?: string;
  className?: string;
}

export const VInput: React.FC<VInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  helperText,
  error = false,
  errorText,
  type = 'text',
  className = '',
}) => {
  const [focused, setFocused] = useState(false);

  const borderClass = error
    ? 'border-[var(--color-error)]'
    : focused
      ? 'border-[var(--color-primary)]'
      : 'border-[var(--ghost-border)]';

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-xs uppercase tracking-widest font-[family-name:var(--font-label)] text-[var(--color-on-surface-variant)] mb-1">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChangeText(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-label={label}
        aria-invalid={error}
        className={`bg-[var(--color-surface-container-low)] rounded-md py-3 px-4 text-base text-[var(--color-on-surface)] placeholder:text-[var(--color-outline)] border ${borderClass} outline-none transition-all font-[family-name:var(--font-body)]`}
      />
      {error && errorText ? (
        <span className="text-xs text-[var(--color-error)] mt-0.5">{errorText}</span>
      ) : helperText ? (
        <span className="text-xs text-[var(--color-outline)] mt-0.5">{helperText}</span>
      ) : null}
    </div>
  );
};

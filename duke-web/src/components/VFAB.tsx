'use client';

import React from 'react';
import { type IconType } from 'react-icons';
import { MdAdd } from 'react-icons/md';

export interface VFABProps {
  onPress: () => void;
  icon?: IconType;
  label?: string;
  className?: string;
}

export const VFAB: React.FC<VFABProps> = ({
  onPress,
  icon: Icon = MdAdd,
  label,
  className = '',
}) => {
  return (
    <button
      onClick={onPress}
      aria-label={label ?? 'Action button'}
      className={`fixed bottom-8 right-4 z-50 w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-r from-[var(--gradient-primary-from)] to-[var(--gradient-primary-to)] text-[var(--color-on-primary)] shadow-[0_0_20px_rgba(219,197,133,0.4)] hover:opacity-85 active:opacity-75 transition-opacity cursor-pointer ${className}`}
    >
      <Icon className="text-2xl" />
    </button>
  );
};

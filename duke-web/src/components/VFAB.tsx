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
      className={`fixed bottom-8 right-4 z-50 w-14 h-14 rounded-sm flex items-center justify-center bg-[#450084] text-[#d9b9ff] shadow-[var(--shadow-lg)] hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(69,0,132,0.4)] active:scale-[0.98] transition-all cursor-pointer ${className}`}
    >
      <Icon className="text-2xl" />
    </button>
  );
};

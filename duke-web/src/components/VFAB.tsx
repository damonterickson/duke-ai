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
      className={`fixed bottom-8 right-4 z-50 w-14 h-14 rounded-md flex items-center justify-center gradient-primary text-white shadow-glow hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer ${className}`}
    >
      <Icon className="text-2xl" />
    </button>
  );
};

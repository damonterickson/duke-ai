'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MdRocketLaunch,
  MdPsychology,
  MdGroups,
  MdPerson,
} from 'react-icons/md';
import { type IconType } from 'react-icons';

interface TabDef {
  key: string;
  label: string;
  href: string;
  icon: IconType;
}

const tabs: TabDef[] = [
  { key: 'mission', label: 'Mission', href: '/mission', icon: MdRocketLaunch },
  { key: 'intel', label: 'Intel', href: '/intel', icon: MdPsychology },
  { key: 'squad', label: 'Squad', href: '/squad', icon: MdGroups },
  { key: 'profile', label: 'Profile', href: '/profile', icon: MdPerson },
];

export const VTabBar: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex bg-[var(--color-surface-container-low)] pt-2 pb-1"
      role="tablist"
      aria-label="Tab bar"
    >
      {tabs.map((tab) => {
        const active = pathname.startsWith(tab.href);
        const Icon = tab.icon;

        return (
          <Link
            key={tab.key}
            href={tab.href}
            role="tab"
            aria-selected={active}
            aria-label={tab.label}
            className="relative flex flex-1 flex-col items-center justify-center py-1 gap-0.5 no-underline"
          >
            {active && (
              <span className="absolute top-0 w-8 h-[3px] rounded-lg bg-[var(--color-primary)]" />
            )}
            <Icon
              className={`text-2xl ${
                active
                  ? 'text-[var(--color-primary)]'
                  : 'text-[var(--color-outline)]'
              }`}
            />
            <span
              className={`text-xs font-medium ${
                active
                  ? 'text-[var(--color-primary)]'
                  : 'text-[var(--color-outline)]'
              }`}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};

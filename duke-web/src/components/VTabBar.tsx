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
      className="fixed bottom-0 left-0 right-0 z-40 flex bg-[#1d1b1f]"
      style={{ height: 64 }}
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
            className="relative flex flex-1 flex-col items-center justify-center gap-0.5 no-underline transition-all"
          >
            {active && (
              <span className="absolute top-0 w-8 h-[3px] rounded-b bg-[#450084] shadow-[0_0_8px_rgba(69,0,132,0.6)]" />
            )}
            <Icon
              className={`text-2xl transition-opacity ${
                active ? 'text-[#d9b9ff] opacity-100' : 'text-[#968d9d] opacity-60'
              }`}
            />
            <span
              className={`text-xs font-bold uppercase tracking-wider transition-opacity font-[family-name:var(--font-label)] ${
                active ? 'text-[#d9b9ff] opacity-100' : 'text-[#968d9d] opacity-60'
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

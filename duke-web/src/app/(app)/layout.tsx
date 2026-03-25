'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MdGpsFixed, MdAnalytics, MdGroups, MdPerson } from 'react-icons/md';

const tabs = [
  { href: '/mission', label: 'MISSION', icon: MdGpsFixed },
  { href: '/intel', label: 'INTEL', icon: MdAnalytics },
  { href: '/squad', label: 'SQUAD', icon: MdGroups },
  { href: '/profile', label: 'PROFILE', icon: MdPerson },
] as const;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Main content area */}
      <main className="flex-1 pb-[72px] overflow-y-auto">
        {children}
      </main>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 inset-x-0 h-[72px] bg-[var(--color-inverse-surface)] flex items-start pt-2 z-50">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 flex flex-col items-center gap-0.5 pt-1"
            >
              <Icon
                size={24}
                className={isActive ? 'text-white' : 'text-white/50'}
              />
              <span
                className={`text-[10px] font-[var(--font-label)] uppercase tracking-[1.5px] ${
                  isActive ? 'text-white' : 'text-white/50'
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

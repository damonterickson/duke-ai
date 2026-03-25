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
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      {/* Main content area */}
      <main className="flex-1 pb-[64px] overflow-y-auto">
        {children}
      </main>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 inset-x-0 h-[64px] bg-[#1d1b1f]/90 backdrop-blur-xl flex items-center z-50 shadow-[0_-4px_30px_rgba(69,0,132,0.15)]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-opacity ${isActive ? 'opacity-100' : 'opacity-50 hover:opacity-70'}`}
            >
              <Icon
                size={22}
                className={isActive ? 'text-[#d9b9ff]' : 'text-[#968d9d]'}
              />
              <span
                className={`text-[10px] uppercase tracking-[1.5px] font-[family-name:var(--font-label)] ${isActive ? 'text-[#d9b9ff] font-bold' : 'text-[#968d9d] font-medium'}`}
              >
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-b-full bg-[#d9b9ff]" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

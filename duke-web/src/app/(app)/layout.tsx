'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/mission', label: 'MISSION', icon: 'gps_fixed' },
  { href: '/intel', label: 'INTEL', icon: 'psychology' },
  { href: '/squad', label: 'SQUAD', icon: 'groups' },
  { href: '/profile', label: 'PROFILE', icon: 'account_circle' },
] as const;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#151317]">
        <div className="w-10 h-10 border-4 border-[#d9b9ff] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      {/* Main content area */}
      <main className="flex-1 pb-[64px] overflow-y-auto">
        {children}
      </main>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 inset-x-0 h-[64px] bg-[#1d1b1f]/90 backdrop-blur-xl flex items-center z-50 shadow-[0_-4px_30px_rgba(69,0,132,0.15)]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-opacity ${isActive ? 'opacity-100' : 'opacity-50 hover:opacity-70'}`}
            >
              <span
                className={`material-symbols-outlined text-[22px] ${isActive ? 'text-[#d9b9ff]' : 'text-[#968d9d]'}`}
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {tab.icon}
              </span>
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

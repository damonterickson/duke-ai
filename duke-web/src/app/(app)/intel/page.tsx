'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MdAnalytics, MdMenuBook, MdDirectionsRun, MdBalance, MdLock } from 'react-icons/md';

export default function IntelPage() {
  const router = useRouter();

  const pathCards = [
    {
      icon: MdMenuBook,
      title: 'Academic Optimization',
      desc: 'Maximize GPA impact on your OML',
      highlighted: false,
    },
    {
      icon: MdDirectionsRun,
      title: 'Physical Optimization',
      desc: 'Push your ACFT score higher',
      highlighted: false,
    },
    {
      icon: MdBalance,
      title: 'Balanced Approach',
      desc: 'Optimize all pillars equally',
      highlighted: true,
    },
  ];

  return (
    <div className="flex flex-col min-h-full bg-[var(--color-background)]">
      {/* Header */}
      <header className="gradient-primary text-white px-4 py-4 flex items-center justify-between shadow-[var(--shadow-md)]">
        <h1 className="text-sm font-bold uppercase tracking-[3px] font-[family-name:var(--font-label)]">DUKE VANGUARD</h1>
        <MdAnalytics size={24} className="text-white/80" />
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 pb-20 max-w-lg mx-auto md:max-w-2xl lg:max-w-4xl w-full space-y-6">
        {/* Coming Soon Card (replaces AI Briefing) */}
        <section className="bg-[var(--color-surface-container-low)] border border-[var(--ghost-border)] rounded-md p-6 shadow-[var(--shadow-sm)] flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-md bg-[var(--color-primary-container)] flex items-center justify-center">
            <MdLock size={24} className="text-[var(--color-on-primary-container)]" />
          </div>
          <h2 className="text-lg font-bold text-[var(--color-on-surface)] font-[family-name:var(--font-display)]">
            Intelligence Briefings Coming Soon
          </h2>
          <p className="text-sm text-[var(--color-on-surface-variant)] leading-relaxed max-w-sm font-[family-name:var(--font-body)]">
            AI-powered strategic analysis and personalized intelligence briefs are on the way. In the meantime, explore the optimization paths below.
          </p>
        </section>

        {/* Optimization Paths */}
        <section>
          <h2 className="text-lg font-semibold uppercase tracking-wider text-[var(--color-on-surface)] mb-3 font-[family-name:var(--font-label)]">
            Optimization Paths
          </h2>
          <div className="space-y-3">
            {pathCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <button
                  key={i}
                  className={`w-full flex items-center gap-4 p-4 rounded-md text-left cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all border ${
                    card.highlighted
                      ? 'gradient-primary border-transparent shadow-glow'
                      : 'bg-[var(--color-surface-container-low)] border-[var(--ghost-border)] shadow-[var(--shadow-sm)]'
                  }`}
                  aria-label={card.title}
                  onClick={() => router.push('/profile')}
                >
                  <div className={`w-12 h-12 rounded-md flex items-center justify-center shrink-0 ${card.highlighted ? 'bg-white/20' : 'bg-[var(--color-primary-container)]'}`}>
                    <Icon
                      size={24}
                      className={card.highlighted ? 'text-white' : 'text-[var(--color-on-primary-container)]'}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-base font-bold ${
                          card.highlighted ? 'text-white' : 'text-[var(--color-on-surface)]'
                        } font-[family-name:var(--font-display)]`}
                      >
                        {card.title}
                      </span>
                      {card.highlighted && (
                        <span className="px-2 py-0.5 rounded-sm text-xs font-bold uppercase tracking-wider gradient-gold text-white font-[family-name:var(--font-label)]">
                          Recommended
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-sm mt-1 block ${
                        card.highlighted ? 'text-white/80' : 'text-[var(--color-on-surface-variant)]'
                      }`}
                    >
                      {card.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

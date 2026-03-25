'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MdMenuBook, MdDirectionsRun, MdBalance, MdLock } from 'react-icons/md';

export default function IntelPage() {
  const router = useRouter();

  const pathCards = [
    {
      icon: MdMenuBook,
      title: 'Academic Optimization',
      desc: 'Maximize GPA impact on your OML',
      accent: '#d9b9ff',
      accentBg: '#450084',
      highlighted: false,
    },
    {
      icon: MdDirectionsRun,
      title: 'Physical Optimization',
      desc: 'Push your ACFT score higher',
      accent: '#dbc585',
      accentBg: '#544511',
      highlighted: false,
    },
    {
      icon: MdBalance,
      title: 'Balanced Approach',
      desc: 'Optimize all pillars equally',
      accent: '#c3cc8c',
      accentBg: '#2c3303',
      highlighted: true,
    },
  ];

  return (
    <div className="flex flex-col min-h-full bg-[#151317]">
      {/* Header — glass bar */}
      <header className="glass-card ghost-border bg-[#151317]/60 backdrop-blur-2xl px-4 py-4 flex items-center justify-between shadow-lg shadow-purple-900/20 sticky top-0 z-40">
        <h1
          className="text-lg font-black uppercase tracking-tighter italic text-[#d9b9ff]"
          style={{ fontFamily: 'Public Sans, sans-serif' }}
        >
          DUKE VANGUARD
        </h1>
        <span
          className="text-[10px] uppercase tracking-[0.3em] text-[#968d9d]"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          INTEL
        </span>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 pb-20 max-w-lg mx-auto md:max-w-2xl lg:max-w-4xl w-full space-y-8">
        {/* Coming Soon Card */}
        <section className="glass-card ghost-border rounded-sm p-8 flex flex-col items-center text-center gap-4 glow-shadow-purple">
          <div className="w-14 h-14 rounded-sm bg-[#450084] flex items-center justify-center">
            <MdLock size={28} className="text-[#b27ff5]" />
          </div>
          <h2
            className="text-2xl font-black uppercase tracking-tighter text-[#e7e1e6]"
            style={{ fontFamily: 'Public Sans, sans-serif' }}
          >
            INTELLIGENCE BRIEFINGS COMING SOON
          </h2>
          <p className="text-sm text-[#cdc3d4] leading-relaxed max-w-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
            AI-powered strategic analysis and personalized intelligence briefs are on the way. In the meantime, explore the optimization paths below.
          </p>
        </section>

        {/* Optimization Paths */}
        <section className="bg-[#1d1b1f] rounded-sm p-6">
          <h2
            className="text-xs uppercase tracking-[0.3em] text-[#968d9d] mb-5"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            OPTIMIZATION PATHS
          </h2>
          <div className="space-y-3">
            {pathCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <button
                  key={i}
                  className={`w-full flex items-center gap-4 p-4 rounded-sm text-left cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all ${
                    card.highlighted
                      ? 'bg-[#450084] shadow-lg shadow-[#450084]/30'
                      : 'glass-card ghost-border'
                  }`}
                  aria-label={card.title}
                  onClick={() => router.push('/profile')}
                >
                  <div
                    className="w-12 h-12 rounded-sm flex items-center justify-center shrink-0"
                    style={{ backgroundColor: card.highlighted ? 'rgba(255,255,255,0.15)' : card.accentBg }}
                  >
                    <Icon
                      size={24}
                      style={{ color: card.highlighted ? '#e7e1e6' : card.accent }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-base font-black uppercase tracking-tight ${
                          card.highlighted ? 'text-[#e7e1e6]' : 'text-[#e7e1e6]'
                        }`}
                        style={{ fontFamily: 'Public Sans, sans-serif' }}
                      >
                        {card.title}
                      </span>
                      {card.highlighted && (
                        <span
                          className="px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-[0.2em] bg-[#544511] text-[#dbc585]"
                          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                        >
                          Recommended
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-sm mt-1 block ${
                        card.highlighted ? 'text-[#cdc3d4]' : 'text-[#cdc3d4]'
                      }`}
                      style={{ fontFamily: 'Inter, sans-serif' }}
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

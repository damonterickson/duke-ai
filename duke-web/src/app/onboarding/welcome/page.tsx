'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 min-h-screen">
      {/* Ambient glow */}
      <div className="absolute w-[400px] h-[400px] bg-[#d9b9ff]/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />

      <div className="text-center mb-12 relative z-10">
        {/* Shield icon in glass circle */}
        <div
          className="w-32 h-32 rounded-full glass-panel-ob flex items-center justify-center mx-auto mb-8 glow-purple-ob"
        >
          <span
            className="material-symbols-outlined text-[72px] text-[#d9b9ff]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            shield_with_heart
          </span>
        </div>

        <h1
          className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-[#d9b9ff] mb-4"
          style={{ fontFamily: 'Public Sans, sans-serif' }}
        >
          DUKE VANGUARD
        </h1>

        <p
          className="text-[10px] tracking-[0.2em] uppercase text-[#dbc585] mb-6"
          style={{ fontFamily: 'Space Grotesk, sans-serif', filter: 'drop-shadow(0 0 10px rgba(219,197,133,0.3))' }}
        >
          YOUR OML MENTOR
        </p>

        <p className="text-sm md:text-base text-[#968d9d] max-w-md mx-auto leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
          Understand your OML score, discover your biggest opportunities, and
          optimize your path to your branch of choice.
        </p>
      </div>

      <button
        onClick={() => router.push('/onboarding/year-group')}
        className="relative z-10 min-w-[260px] py-4 px-10 rounded-sm bg-[#450084] text-[#b27ff5] text-sm font-bold uppercase tracking-wider cursor-pointer hover:scale-[1.02] transition-all flex items-center justify-center gap-3 glow-purple-ob"
        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
      >
        <span className="material-symbols-outlined text-lg">rocket_launch</span>
        Get Started
      </button>
    </div>
  );
}

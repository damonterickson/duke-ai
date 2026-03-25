'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MdShield, MdRocketLaunch } from 'react-icons/md';

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 bg-[#151317] min-h-screen kinetic-grid">
      <div className="text-center mb-10">
        <div className="w-24 h-24 rounded-sm bg-[#450084] flex items-center justify-center mx-auto mb-6 glow-shadow-purple">
          <MdShield size={56} className="text-[#d9b9ff]" />
        </div>
        <h1
          className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-[#d9b9ff] mb-3"
          style={{ fontFamily: 'Public Sans, sans-serif' }}
        >
          DUKE VANGUARD
        </h1>
        <p
          className="text-xl md:text-2xl font-black uppercase tracking-tighter text-[#e7e1e6] mb-4"
          style={{ fontFamily: 'Public Sans, sans-serif' }}
        >
          YOUR OML MENTOR
        </p>
        <p className="text-sm md:text-base text-[#cdc3d4] max-w-md mx-auto leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
          Understand your OML score, discover your biggest opportunities, and
          optimize your path to your branch of choice.
        </p>
      </div>

      <button
        onClick={() => router.push('/onboarding/year-group')}
        className="min-w-[240px] py-3.5 px-8 rounded-sm bg-[#450084] text-[#b27ff5] text-sm font-bold uppercase tracking-wider cursor-pointer hover:bg-[#450084]/80 transition-all shadow-lg shadow-[#450084]/20 flex items-center justify-center gap-2"
        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
      >
        <MdRocketLaunch size={18} />
        Get Started
      </button>

      {/* Progress dots */}
      <div className="flex gap-2 mt-8">
        <div className="w-2.5 h-2.5 rounded-full bg-[#d9b9ff]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#968d9d]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#968d9d]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#968d9d]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#968d9d]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#968d9d]" />
      </div>
    </div>
  );
}

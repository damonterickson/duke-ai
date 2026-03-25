'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MdShield, MdRocketLaunch } from 'react-icons/md';

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 bg-[var(--color-background)] min-h-screen">
      <div className="text-center mb-10">
        <div className="w-24 h-24 rounded-md gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow">
          <MdShield size={56} className="text-white" />
        </div>
        <h1
          className="text-4xl md:text-5xl font-bold text-[var(--color-primary)] mb-3 font-[family-name:var(--font-display)]"
        >
          Duke Vanguard
        </h1>
        <p
          className="text-xl md:text-2xl font-bold text-[var(--color-on-surface)] mb-4 font-[family-name:var(--font-display)]"
        >
          Your OML Mentor
        </p>
        <p className="text-sm md:text-base text-[var(--color-on-surface-variant)] max-w-md mx-auto leading-relaxed">
          Understand your OML score, discover your biggest opportunities, and
          optimize your path to your branch of choice.
        </p>
      </div>

      <button
        onClick={() => router.push('/onboarding/year-group')}
        className="min-w-[240px] py-3.5 px-8 rounded-md gradient-primary text-white text-sm font-bold uppercase tracking-wider cursor-pointer hover:opacity-90 transition-opacity shadow-glow flex items-center justify-center gap-2 font-[family-name:var(--font-label)]"
      >
        <MdRocketLaunch size={18} />
        Get Started
      </button>

      {/* Progress dots */}
      <div className="flex gap-2 mt-8">
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-outline-variant)]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-outline-variant)]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-outline-variant)]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-outline-variant)]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-outline-variant)]" />
      </div>
    </div>
  );
}

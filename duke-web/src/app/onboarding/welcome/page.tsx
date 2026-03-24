'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { VButton } from '@/components';

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8">
      <div className="text-center mb-12">
        <h1
          className="text-4xl md:text-5xl font-bold text-[var(--color-primary)] mb-2"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Duke Vanguard
        </h1>
        <p
          className="text-xl md:text-2xl text-[var(--color-on-surface)] mb-4"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Your OML Mentor
        </p>
        <p className="text-base text-[var(--color-outline)] max-w-md mx-auto">
          Understand your OML score, discover your biggest opportunities, and
          optimize your path to your branch of choice.
        </p>
      </div>

      <VButton
        label="Get Started"
        onPress={() => router.push('/onboarding/year-group')}
        className="min-w-[240px]"
      />
    </div>
  );
}

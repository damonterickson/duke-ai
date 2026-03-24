'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const onboardingComplete = localStorage.getItem('duke_onboarding_complete');
    if (onboardingComplete === 'true') {
      router.replace('/mission');
    } else {
      router.replace('/onboarding/welcome');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--color-background)]">
      <div className="animate-pulse text-[var(--color-on-surface-variant)] font-[var(--font-label)] text-sm uppercase tracking-widest">
        Duke Vanguard
      </div>
    </div>
  );
}

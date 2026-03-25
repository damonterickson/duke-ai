'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

const STEPS = [
  '/onboarding/year-group',
  '/onboarding/gpa',
  '/onboarding/aft',
  '/onboarding/leadership',
  '/onboarding/branch',
];

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const currentStepIndex = STEPS.indexOf(pathname);
  const showDots = currentStepIndex >= 0;

  return (
    <div className="min-h-dvh flex flex-col bg-[#151317]">
      {showDots && (
        <div className="flex items-center justify-center gap-2 pt-8 pb-2">
          {STEPS.map((step, i) => (
            <div
              key={step}
              role="img"
              aria-label={`Step ${i + 1} of ${STEPS.length}${i === currentStepIndex ? ', current' : ''}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentStepIndex
                  ? 'w-6 bg-[#d9b9ff]'
                  : 'w-2 bg-[#968d9d]'
              }`}
            />
          ))}
        </div>
      )}
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}

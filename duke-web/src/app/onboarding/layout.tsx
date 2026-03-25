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
    <div className="min-h-dvh flex flex-col bg-[#151317] kinetic-grid-onboarding">
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <style jsx global>{`
        .kinetic-grid-onboarding {
          background-image: radial-gradient(circle at 2px 2px, rgba(217, 185, 255, 0.05) 1px, transparent 0);
          background-size: 40px 40px;
        }
        .glass-panel-ob {
          background: rgba(55, 52, 56, 0.5);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }
        .glass-surface-ob {
          background: rgba(55, 52, 56, 0.35);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }
        .glow-purple-ob {
          box-shadow: 0 0 20px rgba(69, 0, 132, 0.3);
        }
        .glow-gold-ob {
          box-shadow: 0 0 20px rgba(219, 197, 133, 0.3);
        }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>

      <main className="flex-1 flex flex-col">{children}</main>

      {showDots && (
        <div className="flex items-center justify-center gap-2.5 pb-8 pt-4">
          {STEPS.map((step, i) => (
            <div
              key={step}
              role="img"
              aria-label={`Step ${i + 1} of ${STEPS.length}${i === currentStepIndex ? ', current' : ''}`}
              className={`rounded-full transition-all duration-300 ${
                i === currentStepIndex
                  ? 'w-7 h-2.5 bg-[#d9b9ff]'
                  : i < currentStepIndex
                    ? 'w-2.5 h-2.5 bg-[#d9b9ff]/50'
                    : 'w-2.5 h-2.5 bg-[#968d9d]/50'
              }`}
              style={i === currentStepIndex ? { boxShadow: '0 0 12px rgba(217, 185, 255, 0.5)' } : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

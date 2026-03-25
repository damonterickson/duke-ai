'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MdRocketLaunch } from 'react-icons/md';
import { useProfileStore } from '@/stores/profile';

export default function MissionReadyPage() {
  const router = useRouter();
  const profile = useProfileStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  function handleLaunch() {
    try {
      localStorage.setItem('duke_onboarding_complete', 'true');
    } catch {
      // localStorage may not be available
    }
    router.replace('/mission');
  }

  const summaryItems = [
    { icon: 'person', label: 'Year Group', value: profile.yearGroup ?? '--' },
    {
      icon: 'school',
      label: 'Target Branch',
      value: profile.targetBranch ?? 'Not set',
    },
    {
      icon: 'target',
      label: 'Goal OML',
      value: profile.goalOml != null ? String(profile.goalOml) : 'Not set',
    },
  ];

  const nextSteps = [
    'Get your first AI intelligence brief',
    'Track scores across all three OML pillars',
    'Join or create a squad to compete',
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#151317] min-h-screen kinetic-grid">
      {/* Top Bar — glass */}
      <header className="glass-card ghost-border bg-[#151317]/60 backdrop-blur-2xl py-3.5 text-center shadow-lg shadow-purple-900/20">
        <span
          className="text-sm font-black text-[#d9b9ff] tracking-tighter uppercase italic"
          style={{ fontFamily: 'Public Sans, sans-serif' }}
        >
          DUKE VANGUARD
        </span>
      </header>

      <div className="flex-1 flex flex-col px-6 md:px-8 max-w-lg mx-auto w-full">
        {/* Success Icon */}
        <div
          className={`flex justify-center mt-10 mb-5 transition-all duration-700 ${
            visible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}
        >
          <div className="w-[120px] h-[120px] rounded-sm bg-[#450084] flex items-center justify-center glow-shadow-purple">
            <svg
              className="w-16 h-16 text-[#d9b9ff]"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <div
          className={`text-center mb-6 transition-all duration-600 delay-100 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <h1
            className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-[#e7e1e6] mb-2"
            style={{ fontFamily: 'Public Sans, sans-serif' }}
          >
            MISSION READY
          </h1>
          <p className="text-sm text-[#cdc3d4] leading-relaxed max-w-md mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
            Your Vanguard profile is configured. The AI advisor is now calibrated
            to your goals and will provide personalized optimization guidance.
          </p>
        </div>

        {/* Profile Summary */}
        <div
          className={`transition-all duration-500 delay-200 ${
            visible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="glass-card ghost-border rounded-sm p-5 mb-4 glow-shadow-purple">
            <p
              className="text-xs uppercase tracking-[0.3em] text-[#968d9d] mb-4"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              MISSION PARAMETERS
            </p>
            <div className="space-y-4">
              {summaryItems.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-[#d9b9ff]">
                    {item.icon === 'person' && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    )}
                    {item.icon === 'school' && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
                      </svg>
                    )}
                    {item.icon === 'target' && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
                      </svg>
                    )}
                  </span>
                  <span className="text-sm text-[#cdc3d4] flex-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {item.label}
                  </span>
                  <span
                    className="text-sm font-black text-[#f8e19e]"
                    style={{ fontFamily: 'Public Sans, sans-serif' }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div
          className={`mb-4 transition-all duration-500 delay-300 ${
            visible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="space-y-3">
            {nextSteps.map((text, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-sm bg-[#450084] flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-[#d9b9ff]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {i === 0 && (
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
                    )}
                    {i === 1 && (
                      <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
                    )}
                    {i === 2 && (
                      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                    )}
                  </svg>
                </div>
                <span className="text-sm font-semibold text-[#e7e1e6] flex-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-auto pb-8">
          <button
            onClick={handleLaunch}
            className="w-full py-3.5 rounded-sm bg-[#450084] text-[#b27ff5] text-sm font-bold uppercase tracking-wider cursor-pointer hover:bg-[#450084]/80 transition-all shadow-lg shadow-[#450084]/20 glow-shadow-purple flex items-center justify-center gap-2"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            <MdRocketLaunch size={18} />
            Launch Mission
          </button>
        </div>
      </div>
    </div>
  );
}

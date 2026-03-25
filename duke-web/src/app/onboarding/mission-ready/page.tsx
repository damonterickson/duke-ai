'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
    { icon: 'military_tech', label: 'Target Branch', value: profile.targetBranch ?? 'Not set' },
    { icon: 'target', label: 'Goal OML', value: profile.goalOml != null ? String(profile.goalOml) : 'Not set' },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Ambient glow */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#dbc585]/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="flex-1 flex flex-col px-6 md:px-8 max-w-lg mx-auto w-full">
        {/* Animated checkmark */}
        <div
          className={`flex justify-center mt-12 mb-6 transition-all duration-700 ${
            visible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}
        >
          <div
            className="w-[120px] h-[120px] rounded-full glass-panel-ob flex items-center justify-center"
            style={{ boxShadow: '0 0 40px rgba(219, 197, 133, 0.3)' }}
          >
            <span
              className="material-symbols-outlined text-[64px] text-[#dbc585]"
              style={{ fontVariationSettings: "'FILL' 1", filter: 'drop-shadow(0 0 15px rgba(219,197,133,0.4))' }}
            >
              check_circle
            </span>
          </div>
        </div>

        {/* Title */}
        <div
          className={`text-center mb-8 transition-all duration-600 delay-100 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <h1
            className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-[#e7e1e6] mb-3"
            style={{ fontFamily: 'Public Sans, sans-serif' }}
          >
            MISSION READY
          </h1>
          <p className="text-sm text-[#968d9d] leading-relaxed max-w-md mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
            Your Vanguard profile is configured. The AI advisor is now calibrated
            to your goals and will provide personalized optimization guidance.
          </p>
        </div>

        {/* Profile Summary in glass panel */}
        <div
          className={`transition-all duration-500 delay-200 ${
            visible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="glass-panel-ob rounded-sm p-6 mb-6 glow-purple-ob">
            <p
              className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d] mb-5"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              MISSION PARAMETERS
            </p>
            <div className="space-y-4">
              {summaryItems.map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-sm bg-[#450084] flex items-center justify-center flex-shrink-0">
                    <span
                      className="material-symbols-outlined text-[#d9b9ff]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {item.icon}
                    </span>
                  </div>
                  <span className="text-sm text-[#968d9d] flex-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {item.label}
                  </span>
                  <span
                    className="text-sm font-black text-[#dbc585]"
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
          className={`mb-6 transition-all duration-500 delay-300 ${
            visible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="space-y-3">
            {[
              { icon: 'analytics', text: 'Get your first AI intelligence brief' },
              { icon: 'trending_up', text: 'Track scores across all three OML pillars' },
              { icon: 'groups', text: 'Join or create a squad to compete' },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-sm bg-[#450084] flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[18px] text-[#d9b9ff]" style={{ fontVariationSettings: "'FILL' 1" }}>{step.icon}</span>
                </div>
                <span className="text-sm font-semibold text-[#e7e1e6]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {step.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-auto pb-8">
          <button
            onClick={handleLaunch}
            className="w-full py-4 rounded-sm bg-[#450084] text-[#b27ff5] text-sm font-bold uppercase tracking-wider cursor-pointer hover:scale-[1.01] transition-all glow-purple-ob flex items-center justify-center gap-3"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            <span className="material-symbols-outlined text-lg">rocket_launch</span>
            Launch Mission
          </button>
        </div>
      </div>
    </div>
  );
}

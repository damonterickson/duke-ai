'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProfileStore } from '@/stores/profile';
import { getSession, signOut } from '@/services/supabase';

export default function SettingsPage() {
  const router = useRouter();
  const profile = useProfileStore();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const session = await getSession();
      if (session) {
        setUserEmail(session.user.email ?? null);
        setIsAuthenticated(true);
      }
    }
    checkAuth();
  }, []);

  const [targetBranch, setTargetBranch] = useState(profile.targetBranch ?? '');
  const [goalOml, setGoalOml] = useState(profile.goalOml != null ? String(profile.goalOml) : '');
  const [aiCoachEnabled, setAiCoachEnabled] = useState(false);

  function handleSaveProfile() {
    const oml = goalOml ? parseFloat(goalOml) : null;
    profile.updateProfile({
      targetBranch: targetBranch || null,
      goalOml: oml,
    });
    window.alert('Profile updated successfully.');
  }

  function handleResetOnboarding() {
    if (window.confirm('This will show the onboarding screens again on next launch. Reset?')) {
      router.replace('/onboarding/welcome');
    }
  }

  return (
    <div className="min-h-screen bg-[#151317] text-[#e7e1e6] selection:bg-[#450084] selection:text-[#d9b9ff]">
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <style jsx global>{`
        .glass-panel-settings { background: rgba(55, 52, 56, 0.5); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
      `}</style>

      <div className="pt-6 pb-8 px-6 max-w-3xl mx-auto space-y-10">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-[#968d9d] hover:text-[#d9b9ff] transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-[#d9b9ff]" style={{ fontFamily: 'Public Sans, sans-serif' }}>
            SETTINGS
          </h1>
        </div>

        {/* Profile Section */}
        <section>
          <h2 className="text-[12px] text-[#968d9d] uppercase tracking-[0.3em] font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Profile
          </h2>
          <div className="glass-panel-settings rounded-lg p-6 space-y-5">
            {[
              { label: 'Year Group', value: profile.yearGroup ?? '--' },
              { label: 'Gender', value: profile.gender === 'M' ? 'Male' : profile.gender === 'F' ? 'Female' : '--' },
              { label: 'Age Bracket', value: profile.ageBracket ?? '--' },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center">
                <span className="text-sm text-[#968d9d]">{item.label}</span>
                <span className="text-base font-black text-[#f8e19e]" style={{ fontFamily: 'Public Sans, sans-serif' }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Goals Section */}
        <section>
          <h2 className="text-[12px] text-[#968d9d] uppercase tracking-[0.3em] font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Goals
          </h2>
          <div className="bg-[#1d1b1f] rounded-lg p-6 space-y-5">
            <div>
              <label className="text-[10px] text-[#968d9d] uppercase tracking-[0.3em] block mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Target Branch</label>
              <input
                value={targetBranch}
                onChange={(e) => setTargetBranch(e.target.value)}
                placeholder="Infantry"
                className="w-full bg-[#151317] text-[#e7e1e6] px-4 py-3 rounded-sm outline-none focus:ring-2 focus:ring-[#d9b9ff]/30 placeholder:text-[#968d9d]"
                style={{ border: 'none' }}
              />
            </div>
            <div>
              <label className="text-[10px] text-[#968d9d] uppercase tracking-[0.3em] block mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Goal OML Score</label>
              <input
                value={goalOml}
                onChange={(e) => setGoalOml(e.target.value)}
                placeholder="700"
                type="number"
                className="w-full bg-[#151317] text-[#e7e1e6] px-4 py-3 rounded-sm outline-none focus:ring-2 focus:ring-[#d9b9ff]/30 placeholder:text-[#968d9d]"
                style={{ border: 'none' }}
              />
            </div>
            <button
              onClick={handleSaveProfile}
              className="w-full py-3 rounded-sm bg-[#450084] text-[#b27ff5] text-sm font-bold uppercase tracking-wider hover:scale-[1.02] transition-all"
              style={{ fontFamily: 'Space Grotesk, sans-serif', boxShadow: '0 0 20px rgba(69,0,132,0.3)' }}
            >
              Save Goals
            </button>
          </div>
        </section>

        {/* AI Coach Section */}
        <section>
          <h2 className="text-[12px] text-[#968d9d] uppercase tracking-[0.3em] font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            AI Coach
          </h2>
          <div className="bg-[#211f23] rounded-lg p-6">
            <button
              className="flex items-center justify-between w-full cursor-pointer"
              onClick={() => setAiCoachEnabled(!aiCoachEnabled)}
              role="switch"
              aria-checked={aiCoachEnabled}
              aria-label="Toggle AI Coach"
            >
              <div className="flex-1 mr-4">
                <span className="text-base font-black text-[#e7e1e6] block uppercase tracking-tight" style={{ fontFamily: 'Public Sans, sans-serif' }}>
                  AI Coach
                </span>
                <span className="text-sm text-[#968d9d] mt-1 block">
                  Vanguard AI will create and manage goals based on your profile
                </span>
              </div>
              <div className={`w-12 h-7 rounded-full relative transition-colors ${aiCoachEnabled ? 'bg-[#d9b9ff]' : 'bg-[#373438]'}`}>
                <div className={`w-5 h-5 rounded-full absolute top-1 transition-transform shadow-sm ${aiCoachEnabled ? 'bg-[#450084] translate-x-[24px]' : 'bg-[#968d9d] translate-x-[3px]'}`} />
              </div>
            </button>
            {aiCoachEnabled && (
              <span className="text-xs font-semibold text-[#d9b9ff] mt-3 block">
                AI Coach will create goals on your next briefing. Max 5 active goals.
              </span>
            )}
          </div>
        </section>

        {/* Account Section */}
        <section>
          <h2 className="text-[12px] text-[#968d9d] uppercase tracking-[0.3em] font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Account
          </h2>
          <div className="glass-panel-settings rounded-lg p-6">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-[#450084] flex items-center justify-center" style={{ boxShadow: '0 0 15px rgba(69,0,132,0.3)' }}>
                    <span className="material-symbols-outlined text-[#d9b9ff]" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-bold text-[#e7e1e6] block">{userEmail}</span>
                    <span className="text-xs text-[#968d9d]">Signed in -- data syncs across devices</span>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    await signOut();
                    localStorage.clear();
                    router.replace('/auth');
                  }}
                  className="flex items-center gap-2 text-sm font-semibold text-[#ffb4ab] cursor-pointer hover:text-[#ffb4ab]/80 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">logout</span>
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-[#968d9d] mb-4">
                  You&apos;re using Duke Vanguard without an account. Sign in to save your data across devices.
                </p>
                <button
                  onClick={() => router.push('/auth')}
                  className="w-full py-3 rounded-sm bg-[#450084] text-[#b27ff5] text-sm font-bold uppercase tracking-wider hover:scale-[1.02] transition-all"
                  style={{ fontFamily: 'Space Grotesk, sans-serif', boxShadow: '0 0 20px rgba(69,0,132,0.3)' }}
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </section>

        {/* App Section */}
        <section>
          <h2 className="text-[12px] text-[#968d9d] uppercase tracking-[0.3em] font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            App
          </h2>
          <div className="bg-[#211f23] rounded-lg p-6">
            <button
              onClick={handleResetOnboarding}
              className="w-full py-3 rounded-sm bg-[#1d1b1f] text-[#e7e1e6] text-sm font-semibold cursor-pointer hover:bg-[#2c292d] transition-colors"
            >
              Restart Onboarding
            </button>
          </div>
        </section>

        {/* About */}
        <section className="glass-panel-settings rounded-lg p-8 flex flex-col items-center" style={{ boxShadow: '0 0 20px rgba(69,0,132,0.2)' }}>
          <span className="material-symbols-outlined text-3xl text-[#d9b9ff] mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
          <span className="text-lg font-black uppercase tracking-tighter text-[#d9b9ff]" style={{ fontFamily: 'Public Sans, sans-serif' }}>
            DUKE VANGUARD
          </span>
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#968d9d] mt-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Version 0.2.0
          </span>
          <p className="text-sm text-[#968d9d] text-center mt-3 leading-relaxed max-w-sm">
            AI-powered OML optimizer for Army ROTC cadets. Built with care for every future officer.
          </p>
        </section>
      </div>
    </div>
  );
}

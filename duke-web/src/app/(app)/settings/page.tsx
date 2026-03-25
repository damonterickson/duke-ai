'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MdLogout, MdPerson, MdArrowBack } from 'react-icons/md';
import { VInput } from '@/components';
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
    <div className="flex flex-col min-h-full bg-[#151317]">
      {/* Header — glass bar */}
      <header className="glass-card ghost-border bg-[#151317]/60 backdrop-blur-2xl px-4 py-4 flex items-center gap-3 shadow-lg shadow-purple-900/20 sticky top-0 z-40">
        <button onClick={() => router.back()} aria-label="Go back" className="text-[#968d9d] hover:text-[#d9b9ff] cursor-pointer transition-colors">
          <MdArrowBack size={24} />
        </button>
        <h1
          className="text-lg font-black uppercase tracking-tighter text-[#d9b9ff]"
          style={{ fontFamily: 'Public Sans, sans-serif' }}
        >
          SETTINGS
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 pb-20 max-w-lg mx-auto md:max-w-2xl w-full space-y-8">
        {/* Profile Section */}
        <section>
          <h2
            className="text-xs uppercase tracking-[0.3em] text-[#968d9d] mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            PROFILE
          </h2>
          <div className="glass-card ghost-border rounded-sm p-5 space-y-5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#cdc3d4]" style={{ fontFamily: 'Inter, sans-serif' }}>Year Group</span>
              <span
                className="text-base font-black text-[#f8e19e]"
                style={{ fontFamily: 'Public Sans, sans-serif' }}
              >
                {profile.yearGroup ?? '--'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#cdc3d4]" style={{ fontFamily: 'Inter, sans-serif' }}>Gender</span>
              <span
                className="text-base font-black text-[#f8e19e]"
                style={{ fontFamily: 'Public Sans, sans-serif' }}
              >
                {profile.gender === 'M' ? 'Male' : profile.gender === 'F' ? 'Female' : '--'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#cdc3d4]" style={{ fontFamily: 'Inter, sans-serif' }}>Age Bracket</span>
              <span
                className="text-base font-black text-[#f8e19e]"
                style={{ fontFamily: 'Public Sans, sans-serif' }}
              >
                {profile.ageBracket ?? '--'}
              </span>
            </div>
          </div>
        </section>

        {/* Goals Section */}
        <section className="bg-[#1d1b1f] rounded-sm p-6">
          <h2
            className="text-xs uppercase tracking-[0.3em] text-[#968d9d] mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            GOALS
          </h2>
          <div className="space-y-4">
            <VInput
              label="Target Branch"
              value={targetBranch}
              onChangeText={setTargetBranch}
              placeholder="Infantry"
            />
            <VInput
              label="Goal OML Score"
              value={goalOml}
              onChangeText={setGoalOml}
              placeholder="700"
              type="number"
            />
            <button
              onClick={handleSaveProfile}
              className="w-full py-2.5 rounded-sm bg-[#450084] text-[#b27ff5] text-sm font-bold uppercase tracking-wider cursor-pointer hover:bg-[#450084]/80 transition-all shadow-lg shadow-[#450084]/20"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Save Goals
            </button>
          </div>
        </section>

        {/* AI Coach Section */}
        <section>
          <h2
            className="text-xs uppercase tracking-[0.3em] text-[#968d9d] mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            AI COACH
          </h2>
          <div className="glass-card ghost-border rounded-sm p-5">
            <button
              className="flex items-center justify-between w-full cursor-pointer"
              onClick={() => setAiCoachEnabled(!aiCoachEnabled)}
              role="switch"
              aria-checked={aiCoachEnabled}
              aria-label="Toggle AI Coach"
            >
              <div className="flex-1 mr-3">
                <span
                  className="text-base font-black text-[#e7e1e6] block uppercase tracking-tight"
                  style={{ fontFamily: 'Public Sans, sans-serif' }}
                >
                  AI Coach
                </span>
                <span className="text-sm text-[#cdc3d4] mt-1 block" style={{ fontFamily: 'Inter, sans-serif' }}>
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
        <section className="bg-[#1d1b1f] rounded-sm p-6">
          <h2
            className="text-xs uppercase tracking-[0.3em] text-[#968d9d] mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            ACCOUNT
          </h2>
          <div className="glass-card ghost-border rounded-sm p-5">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-sm bg-[#450084] flex items-center justify-center glow-shadow-purple">
                    <MdPerson size={22} className="text-[#d9b9ff]" />
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
                  className="flex items-center gap-2 text-sm font-semibold text-[#ffb4ab] cursor-pointer hover:underline mt-2"
                >
                  <MdLogout size={16} />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-[#cdc3d4] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                  You&apos;re using Duke Vanguard without an account. Sign in to save your data across devices.
                </p>
                <button
                  onClick={() => router.push('/auth')}
                  className="w-full py-2.5 rounded-sm bg-[#450084] text-[#b27ff5] text-sm font-bold uppercase tracking-wider cursor-pointer hover:bg-[#450084]/80 transition-all shadow-lg shadow-[#450084]/20"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </section>

        {/* App Section */}
        <section>
          <h2
            className="text-xs uppercase tracking-[0.3em] text-[#968d9d] mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            APP
          </h2>
          <div className="glass-card ghost-border rounded-sm p-5">
            <button
              onClick={handleResetOnboarding}
              className="w-full py-2.5 rounded-sm glass-card ghost-border text-[#e7e1e6] text-sm font-semibold cursor-pointer hover:bg-[#450084]/10 transition-colors"
            >
              Restart Onboarding
            </button>
          </div>
        </section>

        {/* About */}
        <section className="glass-card ghost-border rounded-sm p-6 flex flex-col items-center glow-shadow-purple">
          <span
            className="text-lg font-black uppercase tracking-tighter text-[#d9b9ff]"
            style={{ fontFamily: 'Public Sans, sans-serif' }}
          >
            DUKE VANGUARD
          </span>
          <span
            className="text-[10px] uppercase tracking-[0.3em] text-[#968d9d] mt-1"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Version 0.2.0
          </span>
          <p className="text-sm text-[#cdc3d4] text-center mt-2 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
            AI-powered OML optimizer for Army ROTC cadets. Built with care for every future officer.
          </p>
        </section>
      </div>
    </div>
  );
}

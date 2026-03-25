'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MdLogout, MdPerson, MdArrowBack } from 'react-icons/md';
import { VButton, VCard, VInput } from '@/components';
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
    <div className="flex flex-col min-h-full bg-[var(--color-background)]">
      {/* Header */}
      <header className="gradient-primary text-white px-4 py-4 flex items-center gap-3 shadow-[var(--shadow-md)]">
        <button onClick={() => router.back()} aria-label="Go back" className="text-white/80 hover:text-white cursor-pointer transition-colors">
          <MdArrowBack size={24} />
        </button>
        <h1 className="text-sm font-bold uppercase tracking-[3px] font-[family-name:var(--font-label)]">SETTINGS</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 pb-20 max-w-lg mx-auto md:max-w-2xl w-full space-y-6">
        {/* Profile Section */}
        <section>
          <h2 className="text-lg font-semibold uppercase tracking-wider text-[var(--color-on-surface)] mb-3 font-[family-name:var(--font-label)]">Profile</h2>
          <div className="bg-[var(--color-surface-container-low)] border border-[var(--ghost-border)] rounded-md shadow-[var(--shadow-sm)] p-4 space-y-3">
            <div className="flex justify-between items-center py-1">
              <span className="text-sm text-[var(--color-on-surface-variant)]">Year Group</span>
              <span className="text-base font-bold text-[var(--color-on-surface)]">{profile.yearGroup ?? '--'}</span>
            </div>
            <div className="h-px bg-[var(--ghost-border)]" />
            <div className="flex justify-between items-center py-1">
              <span className="text-sm text-[var(--color-on-surface-variant)]">Gender</span>
              <span className="text-base font-bold text-[var(--color-on-surface)]">
                {profile.gender === 'M' ? 'Male' : profile.gender === 'F' ? 'Female' : '--'}
              </span>
            </div>
            <div className="h-px bg-[var(--ghost-border)]" />
            <div className="flex justify-between items-center py-1">
              <span className="text-sm text-[var(--color-on-surface-variant)]">Age Bracket</span>
              <span className="text-base font-bold text-[var(--color-on-surface)]">{profile.ageBracket ?? '--'}</span>
            </div>
          </div>
        </section>

        {/* Goals Section */}
        <section>
          <h2 className="text-lg font-semibold uppercase tracking-wider text-[var(--color-on-surface)] mb-3 font-[family-name:var(--font-label)]">Goals</h2>
          <div className="bg-[var(--color-surface-container-low)] border border-[var(--ghost-border)] rounded-md shadow-[var(--shadow-sm)] p-4 space-y-4">
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
              className="w-full py-2.5 rounded-md gradient-primary text-white text-sm font-bold uppercase tracking-wider cursor-pointer hover:opacity-90 transition-opacity font-[family-name:var(--font-label)]"
            >
              Save Goals
            </button>
          </div>
        </section>

        {/* AI Coach Section */}
        <section>
          <h2 className="text-lg font-semibold uppercase tracking-wider text-[var(--color-on-surface)] mb-3 font-[family-name:var(--font-label)]">AI Coach</h2>
          <div className="bg-[var(--color-surface-container-low)] border border-[var(--ghost-border)] rounded-md shadow-[var(--shadow-sm)] p-4">
            <button
              className="flex items-center justify-between w-full cursor-pointer"
              onClick={() => setAiCoachEnabled(!aiCoachEnabled)}
              role="switch"
              aria-checked={aiCoachEnabled}
              aria-label="Toggle AI Coach"
            >
              <div className="flex-1 mr-3">
                <span className="text-base font-bold text-[var(--color-on-surface)] block">AI Coach</span>
                <span className="text-sm text-[var(--color-on-surface-variant)] mt-1 block">
                  Vanguard AI will create and manage goals based on your profile
                </span>
              </div>
              <div className={`w-12 h-7 rounded-full relative transition-colors ${aiCoachEnabled ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-surface-container-high)]'}`}>
                <div className={`w-5 h-5 rounded-full absolute top-1 transition-transform shadow-sm ${aiCoachEnabled ? 'bg-white translate-x-[24px]' : 'bg-[var(--color-outline)] translate-x-[3px]'}`} />
              </div>
            </button>
            {aiCoachEnabled && (
              <span className="text-xs font-semibold text-[var(--color-primary)] mt-3 block">
                AI Coach will create goals on your next briefing. Max 5 active goals.
              </span>
            )}
          </div>
        </section>

        {/* Account Section */}
        <section>
          <h2 className="text-lg font-semibold uppercase tracking-wider text-[var(--color-on-surface)] mb-3 font-[family-name:var(--font-label)]">Account</h2>
          <div className="bg-[var(--color-surface-container-low)] border border-[var(--ghost-border)] rounded-md shadow-[var(--shadow-sm)] p-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-md gradient-primary flex items-center justify-center">
                    <MdPerson size={22} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-bold text-[var(--color-on-surface)] block">{userEmail}</span>
                    <span className="text-xs text-[var(--color-on-surface-variant)]">Signed in -- data syncs across devices</span>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    await signOut();
                    localStorage.clear();
                    router.replace('/auth');
                  }}
                  className="flex items-center gap-2 text-sm font-semibold text-[var(--color-error)] cursor-pointer hover:underline mt-2"
                >
                  <MdLogout size={16} />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-[var(--color-on-surface-variant)] mb-3">
                  You&apos;re using Duke Vanguard without an account. Sign in to save your data across devices.
                </p>
                <button
                  onClick={() => router.push('/auth')}
                  className="w-full py-2.5 rounded-md gradient-primary text-white text-sm font-bold uppercase tracking-wider cursor-pointer hover:opacity-90 transition-opacity font-[family-name:var(--font-label)]"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </section>

        {/* App Section */}
        <section>
          <h2 className="text-lg font-semibold uppercase tracking-wider text-[var(--color-on-surface)] mb-3 font-[family-name:var(--font-label)]">App</h2>
          <div className="bg-[var(--color-surface-container-low)] border border-[var(--ghost-border)] rounded-md shadow-[var(--shadow-sm)] p-4">
            <button
              onClick={handleResetOnboarding}
              className="w-full py-2.5 rounded-md border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] text-sm font-semibold cursor-pointer hover:bg-[var(--color-surface-container)] transition-colors"
            >
              Restart Onboarding
            </button>
          </div>
        </section>

        {/* About */}
        <section className="bg-[var(--color-surface-container-low)] border border-[var(--ghost-border)] rounded-md shadow-[var(--shadow-sm)] p-5 flex flex-col items-center">
          <span className="text-lg font-bold text-[var(--color-primary)] font-[family-name:var(--font-display)]">Duke Vanguard</span>
          <span className="text-xs text-[var(--color-on-surface-variant)] mt-1 font-[family-name:var(--font-label)]">Version 0.2.0</span>
          <p className="text-sm text-[var(--color-on-surface-variant)] text-center mt-2 leading-relaxed">
            AI-powered OML optimizer for Army ROTC cadets. Built with care for every future officer.
          </p>
        </section>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MdLogout, MdPerson } from 'react-icons/md';
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
    <div className="flex flex-col min-h-full bg-[var(--color-surface)]">
      <div className="flex-1 overflow-y-auto p-4 pb-12">
        <div className="flex items-center justify-between mt-2 mb-4">
          <h1 className="text-2xl font-bold text-[var(--color-on-surface)]">Settings</h1>
          <VButton label="Back" onPress={() => router.back()} variant="tertiary" />
        </div>

        {/* Profile Section */}
        <h2 className="text-lg font-semibold text-[var(--color-on-surface)] mb-3 mt-4">Profile</h2>
        <VCard tier="low" className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-[var(--color-outline)]">Year Group</span>
            <span className="text-base font-semibold text-[var(--color-on-surface)]">{profile.yearGroup ?? '--'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-[var(--color-outline)]">Gender</span>
            <span className="text-base font-semibold text-[var(--color-on-surface)]">
              {profile.gender === 'M' ? 'Male' : profile.gender === 'F' ? 'Female' : '--'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-[var(--color-outline)]">Age Bracket</span>
            <span className="text-base font-semibold text-[var(--color-on-surface)]">{profile.ageBracket ?? '--'}</span>
          </div>
        </VCard>

        {/* Goals Section */}
        <h2 className="text-lg font-semibold text-[var(--color-on-surface)] mb-3 mt-4">Goals</h2>
        <VCard tier="low" className="flex flex-col gap-3">
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
          <VButton label="Save Goals" onPress={handleSaveProfile} variant="secondary" className="mt-2" />
        </VCard>

        {/* AI Coach Section */}
        <h2 className="text-lg font-semibold text-[var(--color-on-surface)] mb-3 mt-4">AI Coach</h2>
        <VCard tier="low" className="flex flex-col gap-3">
          <button
            className="flex items-center justify-between w-full cursor-pointer"
            onClick={() => setAiCoachEnabled(!aiCoachEnabled)}
            role="switch"
            aria-checked={aiCoachEnabled}
            aria-label="Toggle AI Coach"
          >
            <div className="flex-1 mr-3">
              <span className="text-base font-semibold text-[var(--color-on-surface)] block">AI Coach</span>
              <span className="text-sm text-[var(--color-outline)] mt-1 block">
                Vanguard AI will create and manage goals based on your profile
              </span>
            </div>
            <div className={`w-11 h-6 rounded-full relative transition-colors ${aiCoachEnabled ? 'bg-[var(--color-tertiary)]' : 'bg-[var(--color-surface-container-high)]'}`}>
              <div className={`w-5 h-5 rounded-full absolute top-0.5 transition-transform ${aiCoachEnabled ? 'bg-[var(--color-tertiary)] translate-x-[22px]' : 'bg-[var(--color-outline)] translate-x-[2px]'}`} style={{ backgroundColor: aiCoachEnabled ? 'var(--color-tertiary)' : 'var(--color-outline)' }} />
            </div>
          </button>
          {aiCoachEnabled && (
            <span className="text-xs font-medium text-[var(--color-tertiary)]">
              AI Coach will create goals on your next briefing. Max 5 active goals.
            </span>
          )}
        </VCard>

        {/* Account Section */}
        <h2 className="text-lg font-semibold text-[var(--color-on-surface)] mb-3 mt-4">Account</h2>
        <VCard tier="low" className="flex flex-col gap-3">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                  <MdPerson size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-semibold text-[var(--color-on-surface)] block">{userEmail}</span>
                  <span className="text-xs text-[var(--color-outline)]">Signed in — data syncs across devices</span>
                </div>
              </div>
              <button
                onClick={async () => {
                  await signOut();
                  localStorage.clear();
                  router.replace('/auth');
                }}
                className="flex items-center gap-2 text-sm text-[var(--color-error)] cursor-pointer hover:underline mt-1"
              >
                <MdLogout size={16} />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-[var(--color-outline)]">
                You&apos;re using Duke Vanguard without an account. Sign in to save your data across devices.
              </p>
              <VButton
                label="Sign In"
                onPress={() => router.push('/auth')}
                variant="primary"
              />
            </>
          )}
        </VCard>

        {/* App Section */}
        <h2 className="text-lg font-semibold text-[var(--color-on-surface)] mb-3 mt-4">App</h2>
        <VCard tier="low">
          <VButton label="Restart Onboarding" onPress={handleResetOnboarding} variant="tertiary" />
        </VCard>

        {/* About */}
        <VCard tier="low" className="mt-8 flex flex-col items-center">
          <span className="text-lg font-semibold text-[var(--color-primary)]">Duke Vanguard</span>
          <span className="text-xs text-[var(--color-outline)] mt-1">Version 0.2.0</span>
          <p className="text-sm text-[var(--color-outline)] text-center mt-2">
            AI-powered OML optimizer for Army ROTC cadets. Built with care for every future officer.
          </p>
        </VCard>
      </div>
    </div>
  );
}

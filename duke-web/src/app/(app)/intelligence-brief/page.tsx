'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { MdArrowBack, MdLock } from 'react-icons/md';
import { VProgressBar } from '@/components';
import { useProfileStore } from '@/stores/profile';
import { useScoresStore } from '@/stores/scores';
import { calculateOML } from '@/engine/oml';
import type { CadetProfile, OMLConfig, ACFTTables } from '@/engine/oml';
import omlConfig from '@/data/oml-config.json';
import acftTables from '@/data/acft-tables.json';

export default function IntelligenceBriefPage() {
  const router = useRouter();
  const profile = useProfileStore();
  const scores = useScoresStore();

  const latestScore = scores.scoreHistory[0];

  const omlResult = useMemo(() => {
    if (!profile.yearGroup || !profile.gender || !profile.ageBracket) return null;
    const cadet: CadetProfile = {
      gpa: latestScore?.gpa ?? 0,
      mslGpa: latestScore?.msl_gpa ?? 0,
      acftScores: {},
      leadershipEval: latestScore?.leadership_eval ?? 0,
      cstScore: latestScore?.cst_score ?? undefined,
      clcScore: latestScore?.clc_score ?? undefined,
      commandRoles: [],
      extracurricularHours: 0,
      yearGroup: profile.yearGroup,
      gender: profile.gender,
      ageBracket: profile.ageBracket,
    };
    try {
      return calculateOML(cadet, omlConfig as OMLConfig, acftTables as unknown as ACFTTables);
    } catch {
      return null;
    }
  }, [profile, latestScore]);

  const oml = omlResult?.totalScore ?? latestScore?.total_oml ?? 0;

  return (
    <div className="flex flex-col min-h-full bg-[var(--color-background)]">
      {/* Header */}
      <header className="gradient-primary text-white px-4 py-4 flex items-center justify-between shadow-[var(--shadow-md)]">
        <button onClick={() => router.back()} aria-label="Go back" className="text-white/80 hover:text-white cursor-pointer transition-colors">
          <MdArrowBack size={24} />
        </button>
        <h1 className="text-sm font-bold uppercase tracking-[3px] font-[family-name:var(--font-label)]">INTELLIGENCE BRIEF</h1>
        <div className="w-6" />
      </header>

      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 pb-20 max-w-lg mx-auto md:max-w-2xl w-full space-y-5">
        {/* OML Summary */}
        <section className="glass-panel rounded-md p-5 shadow-[var(--shadow-sm)]">
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-2 block font-[family-name:var(--font-label)]">
            COMPOSITE OML SCORE
          </span>
          <div className="flex items-baseline mb-3">
            <span className="text-5xl font-bold text-[var(--color-on-surface)] font-[family-name:var(--font-display)]">
              {oml > 0 ? Math.round(oml) : '--'}
            </span>
            <span className="text-xl font-semibold text-[var(--color-on-surface-variant)] ml-1"> / 1000</span>
          </div>
          <VProgressBar progress={Math.min(oml / 1000, 1)} />
          {profile.goalOml != null && (
            <p className="text-sm font-bold text-[var(--color-primary)] mt-3 font-[family-name:var(--font-label)]">
              Target: {profile.goalOml} ({oml > 0 ? `${Math.round(profile.goalOml - oml)} points to go` : 'Set scores to track'})
            </p>
          )}
          <div className="flex gap-3 mt-5">
            {[
              { label: 'Academic', value: latestScore?.gpa ? Math.min(latestScore.gpa / 4.0, 1) : 0, display: latestScore?.gpa?.toFixed(2) ?? '--' },
              { label: 'Physical', value: latestScore?.acft_total ? Math.min(latestScore.acft_total / 600, 1) : 0, display: latestScore?.acft_total ? `${Math.round(latestScore.acft_total)}` : '--' },
              { label: 'Leadership', value: latestScore?.leadership_eval ? Math.min(latestScore.leadership_eval / 100, 1) : 0, display: latestScore?.leadership_eval?.toString() ?? '--' },
            ].map((pillar, i) => (
              <div key={i} className="flex-1 bg-[var(--color-surface-container-low)] rounded-md p-3 border border-[var(--ghost-border)]">
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] block mb-1 font-[family-name:var(--font-label)]">{pillar.label}</span>
                <span className="text-lg font-bold text-[var(--color-on-surface)] block mb-2 font-[family-name:var(--font-display)]">{pillar.display}</span>
                <VProgressBar progress={pillar.value} />
              </div>
            ))}
          </div>
        </section>

        {/* Coming Soon (replaces AI analysis) */}
        <section className="bg-[var(--color-surface-container-low)] border border-[var(--ghost-border)] rounded-md p-8 shadow-[var(--shadow-sm)] flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-md bg-[var(--color-primary-container)] flex items-center justify-center">
            <MdLock size={32} className="text-[var(--color-on-primary-container)]" />
          </div>
          <h2 className="text-xl font-bold text-[var(--color-on-surface)] font-[family-name:var(--font-display)]">
            AI Intelligence Briefings Coming Soon
          </h2>
          <p className="text-sm text-[var(--color-on-surface-variant)] leading-relaxed max-w-md font-[family-name:var(--font-body)]">
            AI Intelligence Briefings are coming soon. In the meantime, track your scores and check your OML on the dashboard.
          </p>
          <button
            className="mt-2 px-6 py-2.5 rounded-md gradient-primary text-white text-sm font-bold uppercase tracking-wider cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all shadow-[var(--shadow-sm)] font-[family-name:var(--font-label)]"
            onClick={() => router.push('/mission')}
          >
            Go to Dashboard
          </button>
        </section>
      </div>
    </div>
  );
}

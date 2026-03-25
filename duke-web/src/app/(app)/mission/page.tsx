'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MdSettings, MdLocalFireDepartment, MdTrendingUp, MdMyLocation } from 'react-icons/md';
import { VConicGauge, VGlassPanel, VProgressBar } from '@/components';
import { useProfileStore } from '@/stores/profile';
import { useScoresStore } from '@/stores/scores';
import { useEngagementStore } from '@/stores/engagement';
import { useSquadStore } from '@/stores/squad';
import { calculateOML } from '@/engine/oml';
import type { CadetProfile } from '@/engine/oml';
import omlConfig from '@/data/oml-config.json';
import acftTables from '@/data/acft-tables.json';

export default function MissionPage() {
  const router = useRouter();
  const profile = useProfileStore();
  const scores = useScoresStore();
  const engagement = useEngagementStore();
  const squad = useSquadStore();

  const latestScore = scores.scoreHistory[0];

  // Build OML from profile + scores
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
      return calculateOML(cadet, omlConfig as any, acftTables as any);
    } catch {
      return null;
    }
  }, [profile, latestScore]);

  const omlTotal = omlResult?.totalScore ?? latestScore?.total_oml ?? 0;
  const omlProgress = Math.min(omlTotal / 1000, 1);
  const percentile =
    squad.totalCadets > 0
      ? Math.round(((squad.totalCadets - squad.individualRank) / squad.totalCadets) * 100)
      : 0;

  const mission = engagement.activeMission;
  const topBranch = engagement.branchFit[0];
  const [missionAccepted, setMissionAccepted] = useState(false);

  // Pillar scores (normalized 0-1)
  const physical = latestScore?.acft_total ? Math.min(latestScore.acft_total / 600, 1) : 0;
  const academic = latestScore?.gpa ? Math.min(latestScore.gpa / 4.0, 1) : 0;
  const leadership = latestScore?.leadership_eval ? Math.min(latestScore.leadership_eval / 100, 1) : 0;

  return (
    <div className="flex flex-col min-h-full bg-[var(--color-background)]">
      {/* Header */}
      <header className="gradient-primary text-white px-4 py-4 flex items-center justify-between shadow-[var(--shadow-md)]">
        <h1 className="text-sm font-bold uppercase tracking-[3px] font-[family-name:var(--font-label)]">DUKE VANGUARD</h1>
        <button
          onClick={() => router.push('/profile')}
          aria-label="Settings"
          className="text-white/80 hover:text-white cursor-pointer transition-colors"
        >
          <MdSettings size={24} />
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 pb-20 max-w-lg mx-auto md:max-w-2xl lg:max-w-4xl w-full space-y-6">
        {/* OML Performance Ring */}
        <section className="flex flex-col items-center bg-[var(--color-surface-container-low)] border border-[var(--ghost-border)] rounded-md shadow-[var(--shadow-sm)] py-8 px-4">
          <span className="text-xs uppercase tracking-widest font-[family-name:var(--font-label)] text-[var(--color-on-surface-variant)] mb-4">COMMAND READINESS</span>
          <VConicGauge
            progress={omlProgress}
            size={180}
            strokeWidth={14}
            label={omlTotal > 0 ? String(Math.round(omlTotal)) : '--'}
            sublabel="OML Score"
          />
          <div className="flex flex-col items-center mt-3 gap-1">
            <span className="text-xl font-bold text-[var(--color-on-surface)] font-[family-name:var(--font-display)]">
              {percentile > 0 ? `Top ${100 - percentile}%` : '--'}
            </span>
            <span className="text-xs font-semibold uppercase tracking-[2px] text-[var(--color-primary)] font-[family-name:var(--font-label)]">
              {engagement.tier}
            </span>
          </div>
        </section>

        {/* Active Mission Card */}
        <section>
          <h2 className="text-lg font-semibold uppercase tracking-wider text-[var(--color-on-surface)] mb-3 font-[family-name:var(--font-label)]">Active Mission</h2>
          <div className="glass-panel rounded-md p-5 shadow-[var(--shadow-sm)]">
            {mission && !missionAccepted ? (
              <>
                <h3 className="text-lg font-bold text-[var(--color-on-surface)] mb-1 font-[family-name:var(--font-display)]">{mission.title}</h3>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)] mb-2 font-[family-name:var(--font-label)]">{mission.location}</p>
                <p className="text-sm md:text-base text-[var(--color-on-surface-variant)] mb-4 leading-relaxed">{mission.description}</p>
                <button
                  className="px-5 py-2.5 rounded-md gradient-primary text-white text-sm font-bold uppercase tracking-wider cursor-pointer hover:opacity-90 transition-opacity shadow-[var(--shadow-sm)] font-[family-name:var(--font-label)]"
                  aria-label="Accept Brief"
                  onClick={() => {
                    engagement.acceptMission(mission);
                    setMissionAccepted(true);
                    window.alert(`Mission Accepted: You accepted "${mission.title}". Track your progress to complete it.`);
                  }}
                >
                  Accept Brief
                </button>
              </>
            ) : missionAccepted ? (
              <p className="text-sm md:text-base text-center py-4 text-[var(--color-primary)] font-semibold">
                Mission accepted! Track your progress in the Intel tab.
              </p>
            ) : (
              <p className="text-sm md:text-base text-center py-4 text-[var(--color-on-surface-variant)]">
                Complete your profile to get daily missions.
              </p>
            )}
          </div>
        </section>

        {/* Achievement Grid */}
        <section>
          <h2 className="text-lg font-semibold uppercase tracking-wider text-[var(--color-on-surface)] mb-3 font-[family-name:var(--font-label)]">Achievements</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center py-4 px-3 rounded-md bg-[var(--color-surface-container-low)] border border-[var(--ghost-border)] shadow-[var(--shadow-sm)]">
              <MdLocalFireDepartment size={28} className="text-[var(--color-primary)]" />
              <span className="text-2xl font-bold text-[var(--color-on-surface)] mt-2 font-[family-name:var(--font-display)]">{engagement.streak}</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)] mt-1 font-[family-name:var(--font-label)]">Streak</span>
            </div>
            <div className="flex flex-col items-center py-4 px-3 rounded-md bg-[var(--color-surface-container-low)] border border-[var(--ghost-border)] shadow-[var(--shadow-sm)]">
              <MdTrendingUp size={28} className="text-[var(--color-primary)]" />
              <span className="text-2xl font-bold text-[var(--color-on-surface)] mt-2 font-[family-name:var(--font-display)]">
                {squad.totalCadets > 0
                  ? `Top ${Math.round((squad.individualRank / squad.totalCadets) * 100)}%`
                  : '--'}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)] mt-1 font-[family-name:var(--font-label)]">Ranking</span>
            </div>
            <div className="flex flex-col items-center py-4 px-3 rounded-md bg-[var(--color-surface-container-low)] border border-[var(--ghost-border)] shadow-[var(--shadow-sm)]">
              <MdMyLocation size={28} className="text-[var(--color-primary)]" />
              <span className="text-2xl font-bold text-[var(--color-on-surface)] mt-2 font-[family-name:var(--font-display)]">
                {topBranch ? topBranch.branch : '--'}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)] mt-1 font-[family-name:var(--font-label)]">
                {topBranch ? `${topBranch.percentage}% Fit` : 'Set up profile'}
              </span>
            </div>
          </div>
        </section>

        {/* Strategic Readiness */}
        <section className="bg-[var(--color-surface-container-low)] border border-[var(--ghost-border)] rounded-md shadow-[var(--shadow-sm)] p-5">
          <h2 className="text-lg font-semibold uppercase tracking-wider text-[var(--color-on-surface)] mb-4 font-[family-name:var(--font-label)]">Strategic Readiness</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-semibold text-[var(--color-on-surface)]">Physical</span>
                <span className="text-xs font-bold text-[var(--color-primary)] font-[family-name:var(--font-label)]">{Math.round(physical * 100)}%</span>
              </div>
              <VProgressBar progress={physical} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-semibold text-[var(--color-on-surface)]">Academic</span>
                <span className="text-xs font-bold text-[var(--color-primary)] font-[family-name:var(--font-label)]">{Math.round(academic * 100)}%</span>
              </div>
              <VProgressBar progress={academic} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-semibold text-[var(--color-on-surface)]">Leadership</span>
                <span className="text-xs font-bold text-[var(--color-primary)] font-[family-name:var(--font-label)]">{Math.round(leadership * 100)}%</span>
              </div>
              <VProgressBar progress={leadership} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

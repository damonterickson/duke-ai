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
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-primary)]">
        <h1 className="text-base font-bold tracking-[2px] text-white">DUKE VANGUARD</h1>
        <button
          onClick={() => router.push('/profile')}
          aria-label="Settings"
          className="text-white cursor-pointer"
        >
          <MdSettings size={24} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-[var(--color-surface)] p-4 pb-16">
        {/* OML Performance Ring */}
        <div className="flex flex-col items-center mb-6">
          <VConicGauge
            progress={omlProgress}
            size={160}
            strokeWidth={12}
            label={omlTotal > 0 ? String(Math.round(omlTotal)) : '--'}
            sublabel="OML Score"
          />
          <div className="flex flex-col items-center mt-2">
            <span className="text-lg font-semibold text-[var(--color-on-surface)]">
              {percentile > 0 ? `Top ${100 - percentile}%` : '--'}
            </span>
            <span className="text-xs font-medium uppercase tracking-[1px] text-[var(--color-outline)]">
              {engagement.tier}
            </span>
          </div>
        </div>

        {/* Active Mission Card */}
        <h2 className="text-lg font-semibold text-[var(--color-on-surface)] mb-3 mt-2">Active Mission</h2>
        <VGlassPanel className="mb-4">
          {mission && !missionAccepted ? (
            <>
              <h3 className="text-lg font-semibold text-[var(--color-on-surface)] mb-1">{mission.title}</h3>
              <p className="text-xs font-medium text-[var(--color-outline)] mb-2">{mission.location}</p>
              <p className="text-sm text-[var(--color-on-surface)] mb-3">{mission.description}</p>
              <button
                className="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-[var(--color-on-primary)] text-sm font-semibold self-start cursor-pointer hover:opacity-85"
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
            <p className="text-sm text-center py-4 text-[var(--color-primary)]">
              Mission accepted! Track your progress in the Intel tab.
            </p>
          ) : (
            <p className="text-sm text-center py-4 text-[var(--color-outline)]">
              Complete your profile to get daily missions.
            </p>
          )}
        </VGlassPanel>

        {/* Achievement Grid */}
        <h2 className="text-lg font-semibold text-[var(--color-on-surface)] mb-3 mt-2">Achievements</h2>
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="flex flex-col items-center py-3 px-2 rounded-xl bg-[var(--color-surface-container)]">
            <MdLocalFireDepartment size={24} className="text-[var(--color-primary)]" />
            <span className="text-lg font-semibold text-[var(--color-on-surface)] mt-1">{engagement.streak}</span>
            <span className="text-xs font-medium text-[var(--color-outline)] mt-1">Streak</span>
          </div>
          <div className="flex flex-col items-center py-3 px-2 rounded-xl bg-[var(--color-surface-container)]">
            <MdTrendingUp size={24} className="text-[var(--color-primary)]" />
            <span className="text-lg font-semibold text-[var(--color-on-surface)] mt-1">
              {squad.totalCadets > 0
                ? `Top ${Math.round((squad.individualRank / squad.totalCadets) * 100)}%`
                : '--'}
            </span>
            <span className="text-xs font-medium text-[var(--color-outline)] mt-1">Ranking</span>
          </div>
          <div className="flex flex-col items-center py-3 px-2 rounded-xl bg-[var(--color-surface-container)]">
            <MdMyLocation size={24} className="text-[var(--color-primary)]" />
            <span className="text-lg font-semibold text-[var(--color-on-surface)] mt-1">
              {topBranch ? topBranch.branch : '--'}
            </span>
            <span className="text-xs font-medium text-[var(--color-outline)] mt-1">
              {topBranch ? `${topBranch.percentage}% Fit` : 'Set up profile'}
            </span>
          </div>
        </div>

        {/* Strategic Readiness */}
        <h2 className="text-lg font-semibold text-[var(--color-on-surface)] mb-3 mt-2">Strategic Readiness</h2>
        <div className="mb-3">
          <span className="text-sm font-semibold text-[var(--color-on-surface)] mb-1 block">Physical</span>
          <VProgressBar progress={physical} />
        </div>
        <div className="mb-3">
          <span className="text-sm font-semibold text-[var(--color-on-surface)] mb-1 block">Academic</span>
          <VProgressBar progress={academic} />
        </div>
        <div className="mb-3">
          <span className="text-sm font-semibold text-[var(--color-on-surface)] mb-1 block">Leadership</span>
          <VProgressBar progress={leadership} />
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { MdSettings, MdLocalFireDepartment, MdTrendingUp, MdMyLocation, MdTrackChanges } from 'react-icons/md';
import { VConicGauge, VProgressBar } from '@/components';
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

  const topBranch = engagement.branchFit[0];

  // Pillar scores (normalized 0-1)
  const physical = latestScore?.acft_total ? Math.min(latestScore.acft_total / 600, 1) : 0;
  const academic = latestScore?.gpa ? Math.min(latestScore.gpa / 4.0, 1) : 0;
  const leadership = latestScore?.leadership_eval ? Math.min(latestScore.leadership_eval / 100, 1) : 0;

  return (
    <div className="flex flex-col min-h-full bg-[#151317]">
      {/* Header — glass bar */}
      <header className="glass-card ghost-border bg-[#151317]/60 backdrop-blur-2xl px-4 py-4 flex items-center justify-between shadow-lg shadow-purple-900/20 sticky top-0 z-40">
        <h1
          className="text-lg font-black uppercase tracking-tighter italic text-[#d9b9ff]"
          style={{ fontFamily: 'Public Sans, sans-serif' }}
        >
          DUKE VANGUARD
        </h1>
        <button
          onClick={() => router.push('/profile')}
          aria-label="Settings"
          className="text-[#968d9d] hover:text-[#d9b9ff] cursor-pointer transition-colors"
        >
          <MdSettings size={24} />
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 pb-20 max-w-lg mx-auto md:max-w-2xl lg:max-w-4xl w-full space-y-8">
        {/* OML Performance Ring */}
        <section className="glass-card ghost-border rounded-sm py-8 px-4 flex flex-col items-center glow-shadow-purple">
          <span
            className="text-xs uppercase tracking-[0.3em] text-[#968d9d] mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            COMMAND READINESS
          </span>
          <VConicGauge
            progress={omlProgress}
            size={180}
            strokeWidth={14}
            label={omlTotal > 0 ? String(Math.round(omlTotal)) : '--'}
            sublabel="OML Score"
          />
          <div className="flex flex-col items-center mt-3 gap-1">
            <span
              className="text-xl font-black text-[#f8e19e]"
              style={{ fontFamily: 'Public Sans, sans-serif' }}
            >
              {percentile > 0 ? `Top ${100 - percentile}%` : '--'}
            </span>
            <span
              className="text-xs uppercase tracking-[0.3em] text-[#d9b9ff]"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              {engagement.tier}
            </span>
          </div>
        </section>

        {/* Active Mission Card */}
        <section className="bg-[#1d1b1f] rounded-sm p-6 space-y-3">
          <h2
            className="text-xs uppercase tracking-[0.3em] text-[#968d9d] mb-3"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            ACTIVE MISSION
          </h2>
          <div className="glass-card ghost-border rounded-sm p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-sm bg-[#450084] flex items-center justify-center shrink-0">
              <MdTrackChanges size={24} className="text-[#b27ff5]" />
            </div>
            <div className="flex-1">
              <h3
                className="text-base font-black uppercase tracking-tight text-[#e7e1e6]"
                style={{ fontFamily: 'Public Sans, sans-serif' }}
              >
                Track Your Scores
              </h3>
              <p className="text-sm text-[#cdc3d4] mt-1 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                Track your scores to unlock daily missions. Update your GPA, ACFT, and leadership evaluations on the Profile tab.
              </p>
            </div>
          </div>
        </section>

        {/* Achievement Grid */}
        <section>
          <h2
            className="text-xs uppercase tracking-[0.3em] text-[#968d9d] mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            ACHIEVEMENTS
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="glass-card ghost-border rounded-sm flex flex-col items-center py-5 px-3 hover:glow-shadow-purple transition-all">
              <MdLocalFireDepartment size={28} className="text-[#d9b9ff]" />
              <span
                className="text-2xl font-black text-[#f8e19e] mt-2"
                style={{ fontFamily: 'Public Sans, sans-serif' }}
              >
                {engagement.streak}
              </span>
              <span
                className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d] mt-1"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Streak
              </span>
            </div>
            <div className="glass-card ghost-border rounded-sm flex flex-col items-center py-5 px-3 hover:glow-shadow-gold transition-all">
              <MdTrendingUp size={28} className="text-[#dbc585]" />
              <span
                className="text-2xl font-black text-[#f8e19e] mt-2"
                style={{ fontFamily: 'Public Sans, sans-serif' }}
              >
                {squad.totalCadets > 0
                  ? `Top ${Math.round((squad.individualRank / squad.totalCadets) * 100)}%`
                  : '--'}
              </span>
              <span
                className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d] mt-1"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Ranking
              </span>
            </div>
            <div className="glass-card ghost-border rounded-sm flex flex-col items-center py-5 px-3 hover:glow-shadow-purple transition-all">
              <MdMyLocation size={28} className="text-[#c3cc8c]" />
              <span
                className="text-2xl font-black text-[#f8e19e] mt-2"
                style={{ fontFamily: 'Public Sans, sans-serif' }}
              >
                {topBranch ? topBranch.branch : '--'}
              </span>
              <span
                className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d] mt-1"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                {topBranch ? `${topBranch.percentage}% Fit` : 'Set up profile'}
              </span>
            </div>
          </div>
        </section>

        {/* Strategic Readiness */}
        <section className="bg-[#1d1b1f] rounded-sm p-6">
          <h2
            className="text-xs uppercase tracking-[0.3em] text-[#968d9d] mb-5"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            STRATEGIC READINESS
          </h2>
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[#e7e1e6]" style={{ fontFamily: 'Inter, sans-serif' }}>Physical</span>
                <span
                  className="text-xs font-bold text-[#d9b9ff]"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  {Math.round(physical * 100)}%
                </span>
              </div>
              <VProgressBar progress={physical} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[#e7e1e6]" style={{ fontFamily: 'Inter, sans-serif' }}>Academic</span>
                <span
                  className="text-xs font-bold text-[#f8e19e]"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  {Math.round(academic * 100)}%
                </span>
              </div>
              <VProgressBar progress={academic} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[#e7e1e6]" style={{ fontFamily: 'Inter, sans-serif' }}>Leadership</span>
                <span
                  className="text-xs font-bold text-[#c3cc8c]"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  {Math.round(leadership * 100)}%
                </span>
              </div>
              <VProgressBar progress={leadership} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

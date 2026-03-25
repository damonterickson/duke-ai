'use client';

import React, { useMemo, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  MdSettings,
  MdEdit,
  MdFitnessCenter,
  MdSchool,
  MdMilitaryTech,
  MdChevronRight,
  MdAutoFixHigh,
  MdLeaderboard,
  MdLocalFireDepartment,
  MdCloudUpload,
  MdAnalytics,
} from 'react-icons/md';
import { VConicGauge, VProgressBar } from '@/components';
import { useProfileStore } from '@/stores/profile';
import { useScoresStore } from '@/stores/scores';
import { useSquadStore } from '@/stores/squad';
import { calculateOML } from '@/engine/oml';
import type { OMLConfig, ACFTTables } from '@/engine/oml';
import omlConfig from '@/data/oml-config.json';
import acftTables from '@/data/acft-tables.json';

// Inline editable field
function EditableField({
  value,
  placeholder,
  onSave,
  className = '',
  type = 'text',
}: {
  value: string;
  placeholder: string;
  onSave: (v: string) => void;
  className?: string;
  type?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const startEditing = () => {
    setDraft(value);
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed) onSave(trimmed);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && commit()}
        placeholder={placeholder}
        type={type}
        className={`bg-[#211f23] text-[#e7e1e6] rounded-sm px-3 py-1.5 min-w-[80px] outline-none focus:ring-1 focus:ring-[#d9b9ff] ${className}`}
        autoFocus
      />
    );
  }

  return (
    <button onClick={startEditing} className={`flex items-center gap-1.5 cursor-pointer group ${className}`}>
      <span className="text-[#e7e1e6] truncate">{value || placeholder}</span>
      <MdEdit size={14} className="text-[#968d9d] group-hover:text-[#d9b9ff] transition-colors" />
    </button>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const profile = useProfileStore();
  const scores = useScoresStore();
  const squad = useSquadStore();

  const ls = scores.scoreHistory[0];
  const gpa = ls?.gpa;
  const acftTotal = ls?.acft_total;

  // Compute OML
  const omlResult = useMemo(() => {
    if (!profile.yearGroup || !profile.gender || !profile.ageBracket) return null;
    try {
      return calculateOML(
        {
          gpa: ls?.gpa ?? 0,
          mslGpa: ls?.msl_gpa ?? 0,
          acftScores: {},
          leadershipEval: ls?.leadership_eval ?? 0,
          cstScore: ls?.cst_score ?? undefined,
          clcScore: ls?.clc_score ?? undefined,
          commandRoles: [],
          extracurricularHours: 0,
          yearGroup: profile.yearGroup,
          gender: profile.gender,
          ageBracket: profile.ageBracket,
        },
        omlConfig as OMLConfig,
        acftTables as unknown as ACFTTables,
      );
    } catch {
      return null;
    }
  }, [profile, ls]);

  const oml = omlResult?.totalScore ?? ls?.total_oml ?? 0;

  const initials = useMemo(() => {
    const name = profile.name?.trim();
    if (!name) return '??';
    const parts = name.split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  }, [profile.name]);

  const leadershipScore = useMemo(() => {
    const le = ls?.leadership_eval;
    const cst = ls?.cst_score;
    if (le != null && cst != null) return le + cst;
    if (le != null) return le;
    if (cst != null) return cst;
    return null;
  }, [ls]);

  const streak = squad.weeklyRankHistory?.length ?? 0;

  const scoreCards = [
    {
      icon: MdFitnessCenter,
      label: 'ACFT',
      value: acftTotal != null ? String(Math.round(acftTotal)) : '--',
      sublabel: 'Total Score',
      accent: '#c3cc8c',
    },
    {
      icon: MdSchool,
      label: 'GPA',
      value: gpa != null ? gpa.toFixed(2) : '--',
      sublabel: 'Cumulative',
      accent: '#f8e19e',
    },
    {
      icon: MdMilitaryTech,
      label: 'Leadership',
      value: leadershipScore != null ? String(leadershipScore) : '--',
      sublabel:
        ls?.leadership_eval != null && ls?.cst_score != null
          ? `Eval ${ls.leadership_eval} + CST ${ls.cst_score}`
          : 'Eval + CST',
      accent: '#d9b9ff',
    },
  ];

  const quickActions = [
    { icon: MdCloudUpload, label: 'Upload & Sync', route: '/upload', desc: 'Import documents' },
    { icon: MdFitnessCenter, label: 'ACFT Log', route: '/acft-log', desc: 'Log fitness tests' },
    { icon: MdAnalytics, label: 'Intel Brief', route: '/intelligence-brief', desc: 'Full AI analysis' },
    { icon: MdSchool, label: 'Canvas', route: '/canvas', desc: 'LMS integration' },
  ];

  return (
    <div className="flex flex-col min-h-full bg-[#151317]">
      <div className="overflow-y-auto pb-20">
        {/* Glass Header with Profile Info */}
        <div className="glass-card bg-[#151317]/60 backdrop-blur-2xl px-4 md:px-6 pt-4 pb-6 shadow-lg shadow-purple-900/20">
          <div className="flex items-center justify-between mb-4">
            <span
              className="text-xs uppercase tracking-[0.3em] text-[#968d9d]"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              COMMAND PROFILE
            </span>
            <button
              onClick={() => router.push('/settings')}
              aria-label="Settings"
              className="text-[#968d9d] hover:text-[#d9b9ff] cursor-pointer transition-colors"
            >
              <MdSettings size={22} />
            </button>
          </div>

          <div className="flex items-start gap-4 max-w-lg mx-auto md:max-w-2xl">
            {/* Avatar */}
            <div className="w-[72px] h-[72px] rounded-sm bg-[#450084] flex items-center justify-center shrink-0 glow-shadow-purple">
              <span
                className="text-xl font-black text-[#d9b9ff]"
                style={{ fontFamily: 'Public Sans, sans-serif' }}
              >
                {initials}
              </span>
            </div>

            {/* Fields */}
            <div className="flex-1 flex flex-col gap-1.5">
              <EditableField
                value={profile.name ?? ''}
                placeholder="Cadet Name"
                onSave={(v) => profile.updateProfile({ name: v })}
                className="text-xl font-black [&_span]:text-[#e7e1e6] [&_svg]:text-[#968d9d]"
              />
              <span
                className="text-xs uppercase tracking-[0.3em] text-[#968d9d]"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                {profile.yearGroup ?? 'MSI'} Cadet
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="text-[10px] text-[#968d9d] min-w-[64px] uppercase tracking-[0.2em]"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  Branch
                </span>
                <EditableField
                  value={profile.targetBranch ?? ''}
                  placeholder="Target Branch"
                  onSave={(v) => profile.updateProfile({ targetBranch: v })}
                  className="text-sm [&_span]:text-[#cdc3d4] [&_svg]:text-[#968d9d]"
                />
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-[10px] text-[#968d9d] min-w-[64px] uppercase tracking-[0.2em]"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  Goal OML
                </span>
                <EditableField
                  value={profile.goalOml != null ? String(profile.goalOml) : ''}
                  placeholder="0-1000"
                  onSave={(v) => {
                    const n = parseInt(v, 10);
                    if (!isNaN(n) && n >= 0 && n <= 1000) {
                      profile.updateProfile({ goalOml: n });
                    }
                  }}
                  type="number"
                  className="text-sm [&_span]:text-[#cdc3d4] [&_svg]:text-[#968d9d]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 md:px-6 max-w-lg mx-auto md:max-w-2xl lg:max-w-4xl w-full space-y-8 mt-6">
          {/* OML Command Center */}
          <section className="glass-card ghost-border rounded-sm p-6 glow-shadow-purple">
            <h2
              className="text-xs uppercase tracking-[0.3em] text-[#968d9d] mb-4"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              OML COMMAND CENTER
            </h2>
            <div className="flex justify-center mb-4">
              <VConicGauge
                progress={Math.min(oml / 1000, 1)}
                size={240}
                strokeWidth={14}
                label={oml > 0 ? String(Math.round(oml)) : '--'}
                sublabel="/ 1000"
              />
            </div>
            <p className="text-sm italic text-center text-[#cdc3d4] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
              {oml > 0
                ? 'Performance trajectory: holding steady'
                : 'Enter scores to compute your OML'}
            </p>
            <div className="flex gap-3 mb-4">
              <div className="flex-1 flex flex-col items-center p-3 rounded-sm bg-[#1d1b1f]">
                <span
                  className="text-xl font-black text-[#f8e19e]"
                  style={{ fontFamily: 'Public Sans, sans-serif' }}
                >
                  {oml > 0 ? `${Math.round((oml / 1000) * 100)}%` : '--'}
                </span>
                <span
                  className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d] mt-1"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  OML Percentile
                </span>
              </div>
              <div className="flex-1 flex flex-col items-center p-3 rounded-sm bg-[#1d1b1f]">
                <span
                  className="text-xl font-black text-[#c3cc8c]"
                  style={{ fontFamily: 'Public Sans, sans-serif' }}
                >
                  {acftTotal != null ? 'GREEN' : '--'}
                </span>
                <span
                  className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d] mt-1"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  Active Readiness
                </span>
              </div>
            </div>
            <div className="flex justify-center">
              <button
                className="flex items-center gap-2 px-5 py-2.5 rounded-sm bg-[#544511] text-[#dbc585] text-sm font-bold cursor-pointer hover:bg-[#544511]/80 transition-all shadow-lg shadow-[#544511]/20"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                onClick={() => router.push('/what-if')}
                aria-label="What-If scenario planner"
              >
                <MdAutoFixHigh size={18} />
                What If?
              </button>
            </div>
          </section>

          {/* Score Cards */}
          <section>
            <h2
              className="text-xs uppercase tracking-[0.3em] text-[#968d9d] mb-4"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              PERFORMANCE OVERVIEW
            </h2>
            <div className="space-y-3">
              {scoreCards.map((card, i) => {
                const Icon = card.icon;
                return (
                  <button
                    key={i}
                    className="w-full flex items-center gap-4 p-4 rounded-sm glass-card ghost-border cursor-pointer hover:bg-[#450084]/10 transition-all text-left group"
                    onClick={() => router.push('/profile')}
                    aria-label={`View ${card.label} details`}
                  >
                    <div className="w-11 h-11 rounded-sm bg-[#450084] flex items-center justify-center shrink-0">
                      <Icon size={22} className="text-[#b27ff5]" />
                    </div>
                    <div className="flex-1">
                      <span
                        className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d] block"
                        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                      >
                        {card.label}
                      </span>
                      <span
                        className="text-2xl font-black block mt-0.5"
                        style={{ fontFamily: 'Public Sans, sans-serif', color: card.accent }}
                      >
                        {card.value}
                      </span>
                      <span className="text-xs text-[#968d9d] block mt-0.5 truncate">
                        {card.sublabel}
                      </span>
                    </div>
                    <MdChevronRight size={24} className="text-[#968d9d] group-hover:text-[#d9b9ff] transition-colors" />
                  </button>
                );
              })}
            </div>
          </section>

          {/* Quick Actions */}
          <section>
            <h2
              className="text-xs uppercase tracking-[0.3em] text-[#968d9d] mb-4"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              QUICK ACTIONS
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <button
                    key={i}
                    className="flex flex-col items-center py-5 px-3 rounded-sm glass-card ghost-border cursor-pointer hover:glow-shadow-purple transition-all gap-2"
                    onClick={() => router.push(action.route)}
                    aria-label={action.label}
                  >
                    <div className="w-10 h-10 rounded-sm bg-[#450084] flex items-center justify-center">
                      <Icon size={22} className="text-[#b27ff5]" />
                    </div>
                    <span
                      className="text-sm font-black text-[#e7e1e6] uppercase tracking-tight"
                      style={{ fontFamily: 'Public Sans, sans-serif' }}
                    >
                      {action.label}
                    </span>
                    <span className="text-xs text-[#968d9d]" style={{ fontFamily: 'Inter, sans-serif' }}>{action.desc}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Vanguard Status */}
          <section className="glass-card ghost-border rounded-sm p-5 glow-shadow-gold">
            <span
              className="text-xs uppercase tracking-[0.3em] text-[#968d9d] mb-4 block"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              VANGUARD STATUS
            </span>
            <div className="flex items-center">
              <div className="flex-1 flex flex-col items-center gap-1.5">
                <MdLeaderboard size={22} className="text-[#d9b9ff]" />
                <span
                  className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d]"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  Battalion Rank
                </span>
                <span
                  className="text-2xl font-black text-[#f8e19e]"
                  style={{ fontFamily: 'Public Sans, sans-serif' }}
                >
                  #{squad.individualRank}
                  <span className="text-sm font-normal text-[#968d9d]">
                    {' '}/ {squad.totalCadets}
                  </span>
                </span>
              </div>
              <div className="w-[1px] h-12 bg-[rgba(75,68,82,0.15)] mx-4" />
              <div className="flex-1 flex flex-col items-center gap-1.5">
                <MdLocalFireDepartment size={22} className="text-[#dbc585]" />
                <span
                  className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d]"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                >
                  Streak
                </span>
                <span
                  className="text-2xl font-black text-[#f8e19e]"
                  style={{ fontFamily: 'Public Sans, sans-serif' }}
                >
                  {streak}
                  <span className="text-sm font-normal text-[#968d9d]"> weeks</span>
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

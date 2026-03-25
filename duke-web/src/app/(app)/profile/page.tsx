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
import { VConicGauge, VGlassPanel, VProgressBar } from '@/components';
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
        className={`bg-[var(--color-surface-container)] text-[var(--color-on-surface)] rounded-lg px-2 py-1 min-w-[80px] outline-none border border-[var(--color-outline-variant)] ${className}`}
        autoFocus
      />
    );
  }

  return (
    <button onClick={startEditing} className={`flex items-center gap-1 cursor-pointer ${className}`}>
      <span className="text-[var(--color-on-surface)] truncate">{value || placeholder}</span>
      <MdEdit size={13} className="text-[var(--color-outline)]" />
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
    },
    {
      icon: MdSchool,
      label: 'GPA',
      value: gpa != null ? gpa.toFixed(2) : '--',
      sublabel: 'Cumulative',
    },
    {
      icon: MdMilitaryTech,
      label: 'Leadership',
      value: leadershipScore != null ? String(leadershipScore) : '--',
      sublabel:
        ls?.leadership_eval != null && ls?.cst_score != null
          ? `Eval ${ls.leadership_eval} + CST ${ls.cst_score}`
          : 'Eval + CST',
    },
  ];

  const quickActions = [
    { icon: MdCloudUpload, label: 'Upload & Sync', route: '/upload', desc: 'Import documents' },
    { icon: MdFitnessCenter, label: 'ACFT Log', route: '/acft-log', desc: 'Log fitness tests' },
    { icon: MdAnalytics, label: 'Intel Brief', route: '/intelligence-brief', desc: 'Full AI analysis' },
    { icon: MdSchool, label: 'Canvas', route: '/canvas', desc: 'LMS integration' },
  ];

  return (
    <div className="flex flex-col min-h-full bg-[var(--color-surface)]">
      <div className="overflow-y-auto pb-16">
        {/* Personal Info Section */}
        <div className="px-4 pt-3 pb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium uppercase tracking-[1.5px] text-[var(--color-outline)]">
              COMMAND PROFILE
            </span>
            <button
              onClick={() => router.push('/settings')}
              aria-label="Settings"
              className="text-[var(--color-on-surface)] cursor-pointer"
            >
              <MdSettings size={22} />
            </button>
          </div>

          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-[72px] h-[72px] rounded-2xl bg-[var(--color-primary-container)] flex items-center justify-center shrink-0">
              <span className="text-xl font-semibold text-[var(--color-on-primary-container)]">
                {initials}
              </span>
            </div>

            {/* Fields */}
            <div className="flex-1 flex flex-col gap-1">
              <EditableField
                value={profile.name ?? ''}
                placeholder="Cadet Name"
                onSave={(v) => profile.updateProfile({ name: v })}
                className="text-xl font-bold"
              />
              <span className="text-sm font-medium uppercase tracking-[1px] text-[var(--color-outline)] mt-0.5">
                {profile.yearGroup ?? 'MSI'} Cadet
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-[var(--color-outline)] min-w-[64px]">Branch</span>
                <EditableField
                  value={profile.targetBranch ?? ''}
                  placeholder="Target Branch"
                  onSave={(v) => profile.updateProfile({ targetBranch: v })}
                  className="text-sm"
                />
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-[var(--color-outline)] min-w-[64px]">Goal OML</span>
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
                  className="text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* OML Command Center */}
        <div className="px-4 mb-4">
          <h2 className="text-lg font-semibold text-[var(--color-on-surface)] mb-3">
            OML Command Center
          </h2>
          <div className="flex justify-center mb-3">
            <VConicGauge
              progress={Math.min(oml / 1000, 1)}
              size={256}
              strokeWidth={14}
              label={oml > 0 ? String(Math.round(oml)) : '--'}
              sublabel="/ 1000"
            />
          </div>
          <p className="text-sm italic text-center text-[var(--color-on-surface)] opacity-70 mb-3">
            {oml > 0
              ? 'Performance trajectory: holding steady'
              : 'Enter scores to compute your OML'}
          </p>
          <div className="flex gap-2 mb-3">
            <div className="flex-1 flex flex-col items-center p-3 rounded-xl bg-[var(--glass-overlay)]">
              <span className="text-lg font-semibold text-[var(--color-on-surface)]">
                {oml > 0 ? `${Math.round((oml / 1000) * 100)}%` : '--'}
              </span>
              <span className="text-xs text-[var(--color-outline)]">OML Percentile</span>
            </div>
            <div className="flex-1 flex flex-col items-center p-3 rounded-xl bg-[var(--glass-overlay)]">
              <span className="text-lg font-semibold text-[var(--color-on-surface)]">
                {acftTotal != null ? 'GREEN' : '--'}
              </span>
              <span className="text-xs text-[var(--color-outline)]">Active Readiness</span>
            </div>
          </div>
          <div className="flex justify-center">
            <button
              className="flex items-center gap-1 px-5 py-2 rounded-lg bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] text-sm font-semibold cursor-pointer hover:opacity-85"
              onClick={() => router.push('/what-if')}
              aria-label="What-If scenario planner"
            >
              <MdAutoFixHigh size={18} />
              What If?
            </button>
          </div>
        </div>

        {/* Score Cards */}
        <div className="px-4 mb-4">
          <h2 className="text-lg font-semibold text-[var(--color-on-surface)] mb-3">
            Performance Overview
          </h2>
          {scoreCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <button
                key={i}
                className="w-full flex items-center gap-3 p-3 rounded-xl mb-2 bg-[var(--color-surface-container-low)] cursor-pointer hover:opacity-90 text-left"
                onClick={() => router.push('/profile')}
                aria-label={`View ${card.label} details`}
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-container)] flex items-center justify-center">
                  <Icon size={20} className="text-[var(--color-on-primary-container)]" />
                </div>
                <div className="flex-1">
                  <span className="text-xs font-medium uppercase tracking-[1px] text-[var(--color-outline)] block">
                    {card.label}
                  </span>
                  <span className="text-xl font-semibold text-[var(--color-on-surface)] block mt-0.5">
                    {card.value}
                  </span>
                  <span className="text-xs text-[var(--color-outline)] block mt-0.5 truncate">
                    {card.sublabel}
                  </span>
                </div>
                <MdChevronRight size={24} className="text-[var(--color-outline)]" />
              </button>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="px-4 mb-4">
          <h2 className="text-lg font-semibold text-[var(--color-on-surface)] mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, i) => {
              const Icon = action.icon;
              return (
                <button
                  key={i}
                  className="flex flex-col items-center py-3 px-2 rounded-xl bg-[var(--color-surface-container-low)] cursor-pointer hover:opacity-90 gap-1"
                  onClick={() => router.push(action.route)}
                  aria-label={action.label}
                >
                  <Icon size={24} className="text-[var(--color-primary)]" />
                  <span className="text-sm font-semibold text-[var(--color-on-surface)]">
                    {action.label}
                  </span>
                  <span className="text-xs text-[var(--color-outline)]">{action.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Vanguard Status */}
        <div className="px-4 mb-4">
          <VGlassPanel className="p-4">
            <span className="text-xs font-medium uppercase tracking-[1.5px] text-[var(--color-outline)] mb-3 block">
              VANGUARD STATUS
            </span>
            <div className="flex items-center">
              <div className="flex-1 flex flex-col items-center gap-1">
                <MdLeaderboard size={20} className="text-[var(--color-primary)]" />
                <span className="text-xs text-[var(--color-outline)]">Battalion Rank</span>
                <span className="text-xl font-bold text-[var(--color-on-surface)]">
                  #{squad.individualRank}
                  <span className="text-xs font-normal text-[var(--color-outline)]">
                    {' '}/ {squad.totalCadets}
                  </span>
                </span>
              </div>
              <div className="w-[1px] h-10 bg-[var(--color-surface-container-high)] mx-3" />
              <div className="flex-1 flex flex-col items-center gap-1">
                <MdLocalFireDepartment size={20} className="text-[var(--color-primary)]" />
                <span className="text-xs text-[var(--color-outline)]">Streak</span>
                <span className="text-xl font-bold text-[var(--color-on-surface)]">
                  {streak}
                  <span className="text-xs font-normal text-[var(--color-outline)]"> weeks</span>
                </span>
              </div>
            </div>
          </VGlassPanel>
        </div>
      </div>
    </div>
  );
}

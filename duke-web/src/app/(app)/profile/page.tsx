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
        className={`bg-[var(--color-surface-container)] text-[var(--color-on-surface)] rounded-md px-3 py-1.5 min-w-[80px] outline-none border border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] ${className}`}
        autoFocus
      />
    );
  }

  return (
    <button onClick={startEditing} className={`flex items-center gap-1.5 cursor-pointer group ${className}`}>
      <span className="text-[var(--color-on-surface)] truncate">{value || placeholder}</span>
      <MdEdit size={14} className="text-[var(--color-outline)] group-hover:text-[var(--color-primary)] transition-colors" />
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
    <div className="flex flex-col min-h-full bg-[var(--color-background)]">
      <div className="overflow-y-auto pb-20">
        {/* Personal Info Section */}
        <div className="gradient-primary px-4 md:px-6 pt-4 pb-6 shadow-[var(--shadow-md)]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-white/70 font-[family-name:var(--font-label)]">
              COMMAND PROFILE
            </span>
            <button
              onClick={() => router.push('/settings')}
              aria-label="Settings"
              className="text-white/70 hover:text-white cursor-pointer transition-colors"
            >
              <MdSettings size={22} />
            </button>
          </div>

          <div className="flex items-start gap-4 max-w-lg mx-auto md:max-w-2xl">
            {/* Avatar */}
            <div className="w-[72px] h-[72px] rounded-md bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
              <span className="text-xl font-bold text-white font-[family-name:var(--font-display)]">
                {initials}
              </span>
            </div>

            {/* Fields */}
            <div className="flex-1 flex flex-col gap-1.5">
              <EditableField
                value={profile.name ?? ''}
                placeholder="Cadet Name"
                onSave={(v) => profile.updateProfile({ name: v })}
                className="text-xl font-bold [&_span]:text-white [&_svg]:text-white/60"
              />
              <span className="text-sm font-semibold uppercase tracking-[2px] text-white/70 font-[family-name:var(--font-label)]">
                {profile.yearGroup ?? 'MSI'} Cadet
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-white/50 min-w-[64px] font-[family-name:var(--font-label)]">Branch</span>
                <EditableField
                  value={profile.targetBranch ?? ''}
                  placeholder="Target Branch"
                  onSave={(v) => profile.updateProfile({ targetBranch: v })}
                  className="text-sm [&_span]:text-white/90 [&_svg]:text-white/50"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/50 min-w-[64px] font-[family-name:var(--font-label)]">Goal OML</span>
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
                  className="text-sm [&_span]:text-white/90 [&_svg]:text-white/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 md:px-6 max-w-lg mx-auto md:max-w-2xl lg:max-w-4xl w-full space-y-6 -mt-2">
          {/* OML Command Center */}
          <section className="bg-[var(--color-surface-container-low)] border border-[var(--ghost-border)] rounded-md shadow-[var(--shadow-sm)] p-5 pt-8">
            <h2 className="text-lg font-semibold uppercase tracking-wider text-[var(--color-on-surface)] mb-4 font-[family-name:var(--font-label)]">
              OML Command Center
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
            <p className="text-sm italic text-center text-[var(--color-on-surface-variant)] mb-4">
              {oml > 0
                ? 'Performance trajectory: holding steady'
                : 'Enter scores to compute your OML'}
            </p>
            <div className="flex gap-3 mb-4">
              <div className="flex-1 flex flex-col items-center p-3 rounded-md bg-[var(--color-surface-container)] border border-[var(--ghost-border)]">
                <span className="text-xl font-bold text-[var(--color-on-surface)] font-[family-name:var(--font-display)]">
                  {oml > 0 ? `${Math.round((oml / 1000) * 100)}%` : '--'}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)] mt-1 font-[family-name:var(--font-label)]">OML Percentile</span>
              </div>
              <div className="flex-1 flex flex-col items-center p-3 rounded-md bg-[var(--color-surface-container)] border border-[var(--ghost-border)]">
                <span className="text-xl font-bold text-[var(--color-on-surface)] font-[family-name:var(--font-display)]">
                  {acftTotal != null ? 'GREEN' : '--'}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-on-surface-variant)] mt-1 font-[family-name:var(--font-label)]">Active Readiness</span>
              </div>
            </div>
            <div className="flex justify-center">
              <button
                className="flex items-center gap-2 px-5 py-2.5 rounded-md gradient-secondary text-white text-sm font-bold cursor-pointer hover:opacity-90 transition-opacity shadow-[var(--shadow-sm)]"
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
            <h2 className="text-lg font-semibold uppercase tracking-wider text-[var(--color-on-surface)] mb-3 font-[family-name:var(--font-label)]">
              Performance Overview
            </h2>
            <div className="space-y-2">
              {scoreCards.map((card, i) => {
                const Icon = card.icon;
                return (
                  <button
                    key={i}
                    className="w-full flex items-center gap-4 p-4 rounded-md bg-[var(--color-surface-container-low)] border border-[var(--ghost-border)] shadow-[var(--shadow-sm)] cursor-pointer hover:bg-[var(--color-surface-container)] transition-colors text-left group"
                    onClick={() => router.push('/profile')}
                    aria-label={`View ${card.label} details`}
                  >
                    <div className="w-11 h-11 rounded-md bg-[var(--color-primary-container)] flex items-center justify-center shrink-0">
                      <Icon size={22} className="text-[var(--color-on-primary-container)]" />
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] block font-[family-name:var(--font-label)]">
                        {card.label}
                      </span>
                      <span className="text-2xl font-bold text-[var(--color-on-surface)] block mt-0.5 font-[family-name:var(--font-display)]">
                        {card.value}
                      </span>
                      <span className="text-xs text-[var(--color-on-surface-variant)] block mt-0.5 truncate">
                        {card.sublabel}
                      </span>
                    </div>
                    <MdChevronRight size={24} className="text-[var(--color-outline)] group-hover:text-[var(--color-primary)] transition-colors" />
                  </button>
                );
              })}
            </div>
          </section>

          {/* Quick Actions */}
          <section>
            <h2 className="text-lg font-semibold uppercase tracking-wider text-[var(--color-on-surface)] mb-3 font-[family-name:var(--font-label)]">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <button
                    key={i}
                    className="flex flex-col items-center py-4 px-3 rounded-md bg-[var(--color-surface-container-low)] border border-[var(--ghost-border)] shadow-[var(--shadow-sm)] cursor-pointer hover:bg-[var(--color-surface-container)] hover:shadow-[var(--shadow-md)] transition-all gap-1.5"
                    onClick={() => router.push(action.route)}
                    aria-label={action.label}
                  >
                    <div className="w-10 h-10 rounded-md bg-[var(--color-primary-container)] flex items-center justify-center">
                      <Icon size={22} className="text-[var(--color-on-primary-container)]" />
                    </div>
                    <span className="text-sm font-bold text-[var(--color-on-surface)]">
                      {action.label}
                    </span>
                    <span className="text-xs text-[var(--color-on-surface-variant)]">{action.desc}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Vanguard Status */}
          <section className="glass-panel rounded-md p-5 shadow-[var(--shadow-sm)]">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-4 block font-[family-name:var(--font-label)]">
              VANGUARD STATUS
            </span>
            <div className="flex items-center">
              <div className="flex-1 flex flex-col items-center gap-1.5">
                <MdLeaderboard size={22} className="text-[var(--color-primary)]" />
                <span className="text-xs uppercase tracking-wider text-[var(--color-on-surface-variant)] font-[family-name:var(--font-label)]">Battalion Rank</span>
                <span className="text-2xl font-bold text-[var(--color-on-surface)] font-[family-name:var(--font-display)]">
                  #{squad.individualRank}
                  <span className="text-sm font-normal text-[var(--color-on-surface-variant)]">
                    {' '}/ {squad.totalCadets}
                  </span>
                </span>
              </div>
              <div className="w-[1px] h-12 bg-[var(--ghost-border)] mx-4" />
              <div className="flex-1 flex flex-col items-center gap-1.5">
                <MdLocalFireDepartment size={22} className="text-[var(--color-primary)]" />
                <span className="text-xs uppercase tracking-wider text-[var(--color-on-surface-variant)] font-[family-name:var(--font-label)]">Streak</span>
                <span className="text-2xl font-bold text-[var(--color-on-surface)] font-[family-name:var(--font-display)]">
                  {streak}
                  <span className="text-sm font-normal text-[var(--color-on-surface-variant)]"> weeks</span>
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

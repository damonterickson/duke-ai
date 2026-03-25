'use client';

import React, { useMemo, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useProfileStore } from '@/stores/profile';
import { useScoresStore } from '@/stores/scores';
import { useSquadStore } from '@/stores/squad';
import { calculateOML } from '@/engine/oml';
import type { OMLConfig, ACFTTables } from '@/engine/oml';
import omlConfig from '@/data/oml-config.json';
import acftTables from '@/data/acft-tables.json';

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
        className={`bg-[#151317] text-[#e7e1e6] rounded-sm px-3 py-1.5 min-w-[80px] outline-none focus:ring-2 focus:ring-[#d9b9ff]/30 ${className}`}
        style={{ border: 'none' }}
        autoFocus
      />
    );
  }

  return (
    <button onClick={startEditing} className={`flex items-center gap-2 cursor-pointer group ${className}`}>
      <span className="text-[#e7e1e6] truncate">{value || placeholder}</span>
      <span className="material-symbols-outlined text-sm text-[#968d9d] group-hover:text-[#d9b9ff] transition-colors">edit</span>
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
    { icon: 'fitness_center', label: 'ACFT', value: acftTotal != null ? String(Math.round(acftTotal)) : '--', sublabel: 'Total Score', accent: '#c3cc8c', bg: '#2c3303' },
    { icon: 'school', label: 'GPA', value: gpa != null ? gpa.toFixed(2) : '--', sublabel: 'Cumulative', accent: '#f8e19e', bg: '#544511' },
    { icon: 'military_tech', label: 'Leadership', value: leadershipScore != null ? String(leadershipScore) : '--', sublabel: ls?.leadership_eval != null && ls?.cst_score != null ? `Eval ${ls.leadership_eval} + CST ${ls.cst_score}` : 'Eval + CST', accent: '#d9b9ff', bg: '#450084' },
  ];

  const quickActions = [
    { icon: 'cloud_upload', label: 'Upload & Sync', route: '/upload', desc: 'Import documents' },
    { icon: 'fitness_center', label: 'ACFT Log', route: '/acft-log', desc: 'Log fitness tests' },
    { icon: 'query_stats', label: 'Intel Brief', route: '/intelligence-brief', desc: 'Full AI analysis' },
    { icon: 'school', label: 'Canvas', route: '/canvas', desc: 'LMS integration' },
  ];

  return (
    <div className="min-h-screen bg-[#151317] text-[#e7e1e6] selection:bg-[#450084] selection:text-[#d9b9ff]">
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <style jsx global>{`
        .glass-panel-profile { background: rgba(55, 52, 56, 0.5); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
      `}</style>

      <div className="pt-6 pb-8 px-6 max-w-7xl mx-auto space-y-12">

        {/* Profile Header */}
        <section className="relative">
          <div className="glass-panel-profile p-10 md:p-12 rounded-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-30 transition-opacity">
              <span className="material-symbols-outlined text-[120px]">person</span>
            </div>
            <div className="relative z-10 flex items-start gap-6">
              {/* Avatar */}
              <div className="w-[80px] h-[80px] rounded-lg bg-[#450084] flex items-center justify-center shrink-0" style={{ boxShadow: '0 0 20px rgba(69,0,132,0.3)' }}>
                <span className="text-2xl font-black text-[#d9b9ff]" style={{ fontFamily: 'Public Sans, sans-serif' }}>
                  {initials}
                </span>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3 mb-1">
                  <span className="px-3 py-1 bg-[#450084] text-[#d9b9ff] text-[10px] tracking-[0.2em] uppercase font-bold rounded-sm" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    Command Profile
                  </span>
                  <button
                    onClick={() => router.push('/settings')}
                    className="text-[#968d9d] hover:text-[#d9b9ff] transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">settings</span>
                  </button>
                </div>
                <EditableField
                  value={profile.name ?? ''}
                  placeholder="Cadet Name"
                  onSave={(v) => profile.updateProfile({ name: v })}
                  className="text-2xl font-black [&_span]:text-[#e7e1e6]"
                />
                <span className="text-xs uppercase tracking-[0.3em] text-[#968d9d] block" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  {profile.yearGroup ?? 'MSI'} Cadet
                </span>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#968d9d] uppercase tracking-[0.2em]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Branch</span>
                    <EditableField
                      value={profile.targetBranch ?? ''}
                      placeholder="Target Branch"
                      onSave={(v) => profile.updateProfile({ targetBranch: v })}
                      className="text-sm [&_span]:text-[#cdc3d4]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#968d9d] uppercase tracking-[0.2em]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Goal OML</span>
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
                      className="text-sm [&_span]:text-[#cdc3d4]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* OML Command Center + Score Cards Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* OML Command Center */}
          <div className="lg:col-span-1">
            <h3 className="text-[12px] text-[#968d9d] uppercase tracking-[0.3em] font-bold mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              OML Command Center
            </h3>
            <div className="glass-panel-profile p-8 rounded-lg flex flex-col items-center">
              <div className="relative w-[220px] h-[220px] mb-4">
                <svg viewBox="0 0 220 220" className="w-full h-full -rotate-90">
                  <circle cx="110" cy="110" r="95" fill="none" stroke="#373438" strokeWidth="14" />
                  <circle
                    cx="110" cy="110" r="95" fill="none"
                    stroke="url(#omlGradProfile)" strokeWidth="14"
                    strokeDasharray={`${Math.min(oml / 1000, 1) * 597} 597`}
                    strokeLinecap="round"
                    style={{ filter: 'drop-shadow(0 0 8px rgba(219,197,133,0.4))' }}
                  />
                  <defs>
                    <linearGradient id="omlGradProfile" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#d9b9ff" />
                      <stop offset="100%" stopColor="#dbc585" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-[#dbc585]" style={{ fontFamily: 'Public Sans, sans-serif', filter: 'drop-shadow(0 0 10px rgba(219,197,133,0.3))' }}>
                    {oml > 0 ? Math.round(oml) : '--'}
                  </span>
                  <span className="text-sm text-[#968d9d]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>/ 1000</span>
                </div>
              </div>
              <p className="text-sm italic text-center text-[#968d9d] mb-4">
                {oml > 0 ? 'Performance trajectory: holding steady' : 'Enter scores to compute your OML'}
              </p>
              <div className="grid grid-cols-2 gap-3 w-full">
                <div className="bg-[#1d1b1f] rounded-sm p-3 flex flex-col items-center">
                  <span className="text-xl font-black text-[#f8e19e]" style={{ fontFamily: 'Public Sans, sans-serif' }}>
                    {oml > 0 ? `${Math.round((oml / 1000) * 100)}%` : '--'}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d] mt-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    OML Percentile
                  </span>
                </div>
                <div className="bg-[#1d1b1f] rounded-sm p-3 flex flex-col items-center">
                  <span className="text-xl font-black text-[#c3cc8c]" style={{ fontFamily: 'Public Sans, sans-serif' }}>
                    {acftTotal != null ? 'GREEN' : '--'}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d] mt-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    Active Readiness
                  </span>
                </div>
              </div>
              <button
                className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-sm bg-[#544511] text-[#dbc585] text-sm font-bold hover:scale-[1.02] transition-all"
                style={{ fontFamily: 'Space Grotesk, sans-serif', boxShadow: '0 0 15px rgba(84,69,17,0.3)' }}
                onClick={() => router.push('/what-if')}
              >
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_fix_high</span>
                What If?
              </button>
            </div>
          </div>

          {/* Right: Score Cards + Quick Actions */}
          <div className="lg:col-span-2 space-y-8">
            {/* Score Cards */}
            <div>
              <h3 className="text-[12px] text-[#968d9d] uppercase tracking-[0.3em] font-bold mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Performance Overview
              </h3>
              <div className="space-y-4">
                {scoreCards.map((card) => (
                  <div
                    key={card.label}
                    className="bg-[#211f23] hover:bg-[#2c292d] transition-all rounded-lg p-6 flex items-center gap-5 border-l-4 cursor-pointer group"
                    style={{ borderLeftColor: card.bg }}
                    onClick={() => router.push('/profile')}
                  >
                    <div className="p-3 rounded-sm" style={{ backgroundColor: card.bg }}>
                      <span className="material-symbols-outlined" style={{ color: card.accent, fontVariationSettings: "'FILL' 1" }}>{card.icon}</span>
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d] block" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{card.label}</span>
                      <span className="text-3xl font-black block mt-0.5" style={{ fontFamily: 'Public Sans, sans-serif', color: card.accent }}>
                        {card.value}
                      </span>
                      <span className="text-xs text-[#968d9d] block mt-0.5 truncate">{card.sublabel}</span>
                    </div>
                    <span className="material-symbols-outlined text-[#968d9d] group-hover:text-[#d9b9ff] transition-colors">chevron_right</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-[12px] text-[#968d9d] uppercase tracking-[0.3em] font-bold mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => router.push(action.route)}
                    className="bg-[#211f23] hover:bg-[#2c292d] rounded-lg p-5 flex flex-col items-center gap-3 transition-all hover:scale-[1.02]"
                    style={{ boxShadow: 'none' }}
                  >
                    <span className="material-symbols-outlined text-2xl text-[#d9b9ff]" style={{ fontVariationSettings: "'FILL' 1" }}>{action.icon}</span>
                    <span className="text-sm font-black text-[#e7e1e6] uppercase tracking-tight" style={{ fontFamily: 'Public Sans, sans-serif' }}>
                      {action.label}
                    </span>
                    <span className="text-xs text-[#968d9d]">{action.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Vanguard Status */}
        <section>
          <h3 className="text-[12px] text-[#968d9d] uppercase tracking-[0.3em] font-bold mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Vanguard Status
          </h3>
          <div className="glass-panel-profile p-8 rounded-lg" style={{ boxShadow: '0 0 30px rgba(219,197,133,0.1)' }}>
            <div className="grid grid-cols-2 gap-8">
              <div className="flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-[#d9b9ff]" style={{ fontVariationSettings: "'FILL' 1" }}>leaderboard</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Battalion Rank
                </span>
                <span className="text-3xl font-black text-[#f8e19e]" style={{ fontFamily: 'Public Sans, sans-serif' }}>
                  #{squad.individualRank}
                  <span className="text-sm font-normal text-[#968d9d]"> / {squad.totalCadets}</span>
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-[#dbc585]" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Streak
                </span>
                <span className="text-3xl font-black text-[#f8e19e]" style={{ fontFamily: 'Public Sans, sans-serif' }}>
                  {streak}
                  <span className="text-sm font-normal text-[#968d9d]"> weeks</span>
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

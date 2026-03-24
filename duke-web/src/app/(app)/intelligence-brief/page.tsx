'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  MdArrowBack,
  MdShare,
  MdVerifiedUser,
  MdSchool,
  MdFitnessCenter,
  MdMilitaryTech,
  MdMyLocation,
  MdFlag,
  MdAutoAwesome,
  MdExpandMore,
  MdExpandLess,
  MdInfoOutline,
} from 'react-icons/md';
import { VGlassPanel, VProgressBar, VSkeletonLoader } from '@/components';
import { useProfileStore } from '@/stores/profile';
import { useScoresStore } from '@/stores/scores';
import { useGoalsStore } from '@/stores/goals';
import { calculateOML } from '@/engine/oml';
import type { CadetProfile, OMLConfig, ACFTTables } from '@/engine/oml';
import omlConfig from '@/data/oml-config.json';
import acftTables from '@/data/acft-tables.json';

interface BriefingSection {
  title: string;
  icon: React.ElementType;
  content: string;
  priority: 'high' | 'medium' | 'low';
}

export default function IntelligenceBriefPage() {
  const router = useRouter();
  const profile = useProfileStore();
  const scores = useScoresStore();
  const goalsStore = useGoalsStore();

  const [loading, setLoading] = useState(true);
  const [briefingText, setBriefingText] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

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

  // Simulate briefing generation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (profile.yearGroup) {
        setBriefingText(
          'Based on your current performance metrics, you are tracking well in academic performance. Your physical fitness scores show room for improvement, particularly in upper body endurance events. Consider increasing push-up training volume by 20% over the next 4 weeks. Your leadership evaluation is strong - continue seeking leadership opportunities to maintain this trajectory.',
        );
      }
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, [profile.yearGroup]);

  // Build sections
  const sections = useMemo((): BriefingSection[] => {
    const result: BriefingSection[] = [];
    const gpa = latestScore?.gpa;
    if (gpa != null) {
      const impact = gpa >= 3.5 ? 'Your GPA is a strong contributor to your OML score.'
        : gpa >= 3.0 ? 'Your GPA is solid. Pushing above 3.5 would significantly boost your OML.'
        : 'Academic improvement should be a priority.';
      result.push({ title: 'Academic Assessment', icon: MdSchool, content: `Current GPA: ${gpa.toFixed(2)}. ${impact}`, priority: gpa < 3.0 ? 'high' : gpa < 3.5 ? 'medium' : 'low' });
    }
    const acft = latestScore?.acft_total;
    if (acft != null) {
      const impact = acft >= 500 ? 'Outstanding physical fitness.' : acft >= 360 ? 'Passing but room for growth.' : 'Physical fitness needs immediate attention.';
      result.push({ title: 'Physical Readiness', icon: MdFitnessCenter, content: `ACFT Total: ${Math.round(acft)}/600. ${impact}`, priority: acft < 360 ? 'high' : acft < 450 ? 'medium' : 'low' });
    }
    const leadership = latestScore?.leadership_eval;
    if (leadership != null) {
      result.push({ title: 'Leadership Evaluation', icon: MdMilitaryTech, content: `Commander Assessment: ${leadership}/100. ${leadership >= 80 ? 'Strong leadership marks.' : 'Focus on visibility in leadership roles.'}`, priority: leadership < 70 ? 'high' : leadership < 80 ? 'medium' : 'low' });
    }
    if (profile.targetBranch) {
      result.push({ title: 'Branch Analysis', icon: MdMyLocation, content: `Target: ${profile.targetBranch}. ${oml >= 700 ? 'Your OML is competitive for most branches.' : 'Focus on raising OML to improve branch probability.'}`, priority: oml < 500 ? 'high' : 'medium' });
    }
    const activeGoals = goalsStore.getActiveGoals();
    if (activeGoals.length > 0) {
      const completed = activeGoals.filter((g: any) => g.status === 'completed').length;
      result.push({ title: 'Goal Progress', icon: MdFlag, content: `${activeGoals.length} active goals. ${completed} completed. Stay focused.`, priority: completed === 0 ? 'medium' : 'low' });
    }
    return result;
  }, [latestScore, profile, oml, goalsStore]);

  const handleShare = async () => {
    const text = `Intelligence Brief - Duke Vanguard\n\nOML Score: ${Math.round(oml)}/1000\n\n${sections.map((s) => `${s.title}: ${s.content}`).join('\n\n')}`;
    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
        window.alert('Brief copied to clipboard.');
      }
    } catch {}
  };

  const priorityColor = (p: string) => {
    switch (p) {
      case 'high': return 'var(--color-error)';
      case 'medium': return 'var(--color-tertiary)';
      default: return '#4caf50';
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-primary)]">
        <button onClick={() => router.back()} aria-label="Go back" className="text-white cursor-pointer">
          <MdArrowBack size={24} />
        </button>
        <h1 className="text-base font-bold tracking-[2px] text-white">INTELLIGENCE BRIEF</h1>
        <button onClick={handleShare} aria-label="Share brief" className="text-white cursor-pointer">
          <MdShare size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-[var(--color-surface)] p-4 pb-16">
        {/* Classification Banner */}
        <div className="flex items-center justify-center gap-2 py-2 rounded-lg bg-[var(--color-primary-container)] mb-4">
          <MdVerifiedUser size={16} className="text-[var(--color-on-primary-container)]" />
          <span className="text-xs font-medium uppercase tracking-[1.5px] text-[var(--color-on-primary-container)]">
            VANGUARD INTELLIGENCE BRIEF — {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}
          </span>
        </div>

        {/* OML Summary */}
        <VGlassPanel className="mb-4">
          <span className="text-xs font-medium uppercase tracking-[1.5px] text-[var(--color-outline)] mb-1 block">
            COMPOSITE OML SCORE
          </span>
          <div className="flex items-baseline mb-2">
            <span className="text-4xl font-bold text-[var(--color-on-surface)]">
              {oml > 0 ? Math.round(oml) : '--'}
            </span>
            <span className="text-lg font-semibold text-[var(--color-outline)]"> / 1000</span>
          </div>
          <VProgressBar progress={Math.min(oml / 1000, 1)} />
          {profile.goalOml != null && (
            <p className="text-sm font-medium text-[var(--color-primary)] mt-2">
              Target: {profile.goalOml} ({oml > 0 ? `${Math.round(profile.goalOml - oml)} points to go` : 'Set scores to track'})
            </p>
          )}
          <div className="flex gap-3 mt-4">
            {[
              { label: 'Academic', value: latestScore?.gpa ? Math.min(latestScore.gpa / 4.0, 1) : 0, display: latestScore?.gpa?.toFixed(2) ?? '--' },
              { label: 'Physical', value: latestScore?.acft_total ? Math.min(latestScore.acft_total / 600, 1) : 0, display: latestScore?.acft_total ? `${Math.round(latestScore.acft_total)}` : '--' },
              { label: 'Leadership', value: latestScore?.leadership_eval ? Math.min(latestScore.leadership_eval / 100, 1) : 0, display: latestScore?.leadership_eval?.toString() ?? '--' },
            ].map((pillar, i) => (
              <div key={i} className="flex-1">
                <span className="text-xs text-[var(--color-outline)] block mb-1">{pillar.label}</span>
                <span className="text-base font-semibold text-[var(--color-on-surface)] block mb-1">{pillar.display}</span>
                <VProgressBar progress={pillar.value} />
              </div>
            ))}
          </div>
        </VGlassPanel>

        {/* AI Analysis */}
        {loading ? (
          <div className="flex flex-col items-center py-8">
            <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[var(--color-outline)] mt-3">Generating intelligence brief...</p>
          </div>
        ) : briefingText ? (
          <VGlassPanel className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <MdAutoAwesome size={20} className="text-[var(--color-primary)]" />
              <span className="text-sm font-semibold uppercase tracking-[1.5px] text-[var(--color-primary)]">
                AI STRATEGIC ANALYSIS
              </span>
            </div>
            <p className="text-sm leading-relaxed text-[var(--color-on-surface)]">{briefingText}</p>
          </VGlassPanel>
        ) : null}

        {/* Detailed Sections */}
        {sections.length > 0 && (
          <h2 className="text-lg font-semibold text-[var(--color-on-surface)] mb-3 mt-2">Detailed Assessment</h2>
        )}
        {sections.map((section) => {
          const isExpanded = expandedSection === section.title;
          const Icon = section.icon;
          return (
            <button
              key={section.title}
              className="w-full text-left p-4 rounded-2xl mb-2 bg-[var(--glass-overlay)] border border-[var(--ghost-border-color)] cursor-pointer"
              onClick={() => setExpandedSection(isExpanded ? null : section.title)}
              aria-label={`${section.title} - ${section.priority} priority`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 flex-1">
                  <Icon size={22} className="text-[var(--color-primary)]" />
                  <span className="text-base font-semibold text-[var(--color-on-surface)]">{section.title}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: priorityColor(section.priority) }} />
                  <span className="text-xs font-medium" style={{ color: priorityColor(section.priority) }}>
                    {section.priority.toUpperCase()}
                  </span>
                  {isExpanded ? (
                    <MdExpandLess size={20} className="text-[var(--color-outline)]" />
                  ) : (
                    <MdExpandMore size={20} className="text-[var(--color-outline)]" />
                  )}
                </div>
              </div>
              {isExpanded && (
                <p className="text-sm leading-relaxed text-[var(--color-on-surface)] mt-3">{section.content}</p>
              )}
            </button>
          );
        })}

        {/* No Data State */}
        {sections.length === 0 && !loading && (
          <VGlassPanel className="flex flex-col items-center gap-2">
            <MdInfoOutline size={32} className="text-[var(--color-outline)]" />
            <h3 className="text-lg font-semibold text-[var(--color-on-surface)]">Insufficient Data</h3>
            <p className="text-sm text-[var(--color-outline)] text-center">
              Complete your profile and enter scores to receive a full intelligence brief.
            </p>
          </VGlassPanel>
        )}

        {/* Priority Actions */}
        {sections.filter((s) => s.priority === 'high').length > 0 && (
          <>
            <h2 className="text-lg font-semibold text-[var(--color-on-surface)] mb-3 mt-2">Priority Actions</h2>
            {sections
              .filter((s) => s.priority === 'high')
              .map((s, i) => (
                <div key={i} className="border-l-[3px] border-l-[var(--color-error)] pl-3 py-2 mb-2">
                  <p className="text-sm text-[var(--color-on-surface)]">
                    {s.title}: {s.content.split('.')[1]?.trim() ?? s.content}
                  </p>
                </div>
              ))}
          </>
        )}
      </div>
    </div>
  );
}

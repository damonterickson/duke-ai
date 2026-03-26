'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useScoresStore } from '@/stores/scores';

export default function LeadershipPage() {
  const router = useRouter();
  const scores = useScoresStore();
  const latest = scores.scoreHistory[0];

  const [eval_, setEval] = useState(latest?.leadership_eval != null ? String(latest.leadership_eval) : '');
  const [cst, setCst] = useState(latest?.cst_score != null ? String(latest.cst_score) : '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const history = scores.scoreHistory.filter((s) => s.leadership_eval != null || s.cst_score != null).slice(0, 10);

  const currentEval = latest?.leadership_eval;
  const currentCst = latest?.cst_score;
  const totalLeadership = (currentEval ?? 0) + (currentCst ?? 0);

  async function handleSave() {
    const evalVal = eval_ ? parseInt(eval_, 10) : null;
    const cstVal = cst ? parseInt(cst, 10) : null;
    if (evalVal === null && cstVal === null) return;

    setSaving(true);
    await scores.addScoreEntry({
      gpa: latest?.gpa ?? null,
      msl_gpa: latest?.msl_gpa ?? null,
      acft_total: latest?.acft_total ?? null,
      leadership_eval: evalVal ?? latest?.leadership_eval ?? null,
      cst_score: cstVal ?? latest?.cst_score ?? null,
      clc_score: latest?.clc_score ?? null,
      total_oml: latest?.total_oml ?? null,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="min-h-screen bg-[#151317] text-[#e7e1e6]">
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      <style jsx global>{`
        .glass-panel-lead { background: rgba(55, 52, 56, 0.5); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
      `}</style>

      <div className="pt-6 pb-8 px-6 max-w-3xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-[#968d9d] hover:text-[#d9b9ff] transition-colors">
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#968d9d] block" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Leadership Pillar</span>
            <h1 className="text-3xl font-black uppercase tracking-tighter" style={{ fontFamily: 'Public Sans, sans-serif' }}>LEADERSHIP LOG</h1>
          </div>
        </div>

        {/* Current Scores */}
        <section className="glass-panel-lead p-10 rounded-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <span className="material-symbols-outlined text-[120px]">military_tech</span>
          </div>
          <div className="relative z-10">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#968d9d] block mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Combined Leadership Score</span>
            <span className="text-6xl font-black text-[#d9b9ff]" style={{ fontFamily: 'Public Sans, sans-serif', filter: 'drop-shadow(0 0 10px rgba(217,185,255,0.3))' }}>
              {totalLeadership > 0 ? totalLeadership : '--'}
            </span>
            <div className="grid grid-cols-2 gap-6 mt-6">
              <div className="bg-[#1d1b1f] rounded-sm p-4">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d] block mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Commander&apos;s Eval</span>
                <span className="text-2xl font-black text-[#d9b9ff]" style={{ fontFamily: 'Public Sans, sans-serif' }}>{currentEval ?? '--'}</span>
                <span className="text-xs text-[#968d9d]"> / 100</span>
              </div>
              <div className="bg-[#1d1b1f] rounded-sm p-4">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d] block mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>CST Score</span>
                <span className="text-2xl font-black text-[#c3cc8c]" style={{ fontFamily: 'Public Sans, sans-serif' }}>{currentCst ?? '--'}</span>
                <span className="text-xs text-[#968d9d]"> / 100</span>
              </div>
            </div>
            <p className="text-sm text-[#968d9d] mt-4">Leadership contributes 40% of your OML. Command roles, CST, and extracurriculars all factor in.</p>
          </div>
        </section>

        {/* Update Form */}
        <section>
          <h3 className="text-[12px] text-[#968d9d] uppercase tracking-[0.3em] font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Update Scores</h3>
          <div className="glass-panel-lead p-8 rounded-lg space-y-5">
            <div>
              <label className="text-[10px] text-[#968d9d] uppercase tracking-[0.3em] block mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Commander&apos;s Assessment (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={eval_}
                onChange={(e) => setEval(e.target.value)}
                placeholder="85"
                className="w-full bg-[#151317] text-[#e7e1e6] rounded-sm px-4 py-3.5 text-lg font-black outline-none focus:ring-2 focus:ring-[#d9b9ff]/30 placeholder:text-[#968d9d]"
                style={{ border: 'none', fontFamily: 'Public Sans, sans-serif' }}
              />
            </div>
            <div>
              <label className="text-[10px] text-[#968d9d] uppercase tracking-[0.3em] block mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Cadet Summer Training Score (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={cst}
                onChange={(e) => setCst(e.target.value)}
                placeholder="90"
                className="w-full bg-[#151317] text-[#e7e1e6] rounded-sm px-4 py-3.5 text-lg outline-none focus:ring-2 focus:ring-[#d9b9ff]/30 placeholder:text-[#968d9d]"
                style={{ border: 'none' }}
              />
              <p className="text-xs text-[#968d9d] mt-2">Leave blank if you haven&apos;t attended CST yet.</p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving || (!eval_ && !cst)}
              className="w-full py-4 rounded-sm bg-[#450084] text-[#b27ff5] font-bold uppercase tracking-wider disabled:opacity-50 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              style={{ fontFamily: 'Space Grotesk, sans-serif', boxShadow: '0 0 20px rgba(69,0,132,0.3)' }}
            >
              {saved ? (
                <><span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> Saved</>
              ) : saving ? (
                <span className="animate-spin w-4 h-4 border-2 border-[#b27ff5]/30 border-t-[#b27ff5] rounded-full" />
              ) : (
                <><span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>save</span> Save Leadership Scores</>
              )}
            </button>
          </div>
        </section>

        {/* Tips */}
        <section>
          <h3 className="text-[12px] text-[#968d9d] uppercase tracking-[0.3em] font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Boost Your Leadership Score</h3>
          <div className="space-y-4">
            {[
              { icon: 'groups', title: 'Seek Command Roles', desc: 'Squad leader, platoon sergeant, and XO positions carry the highest OML weight.' },
              { icon: 'volunteer_activism', title: 'Log Volunteer Hours', desc: 'Community service and extracurricular leadership show well-roundedness.' },
              { icon: 'event', title: 'CST Preparation', desc: 'Cadet Summer Training is the single highest-impact leadership evaluation.' },
            ].map((tip, i) => (
              <div key={i} className="bg-[#211f23] hover:bg-[#2c292d] transition-all rounded-lg p-6 flex gap-5 items-start border-l-4 border-[#450084]">
                <div className="p-3 rounded-sm bg-[#450084]">
                  <span className="material-symbols-outlined text-[#d9b9ff]" style={{ fontVariationSettings: "'FILL' 1" }}>{tip.icon}</span>
                </div>
                <div>
                  <h4 className="text-lg font-black uppercase tracking-tight mb-1" style={{ fontFamily: 'Public Sans, sans-serif' }}>{tip.title}</h4>
                  <p className="text-sm text-[#968d9d]">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* History */}
        {history.length > 0 && (
          <section>
            <h3 className="text-[12px] text-[#968d9d] uppercase tracking-[0.3em] font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Score History</h3>
            <div className="space-y-3">
              {history.map((entry, i) => (
                <div key={i} className="bg-[#211f23] hover:bg-[#2c292d] transition-all rounded-lg p-5 flex items-center justify-between border-l-4 border-[#450084]">
                  <div className="flex items-center gap-6">
                    <div>
                      <span className="text-[10px] text-[#968d9d] uppercase tracking-[0.2em] block" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Eval</span>
                      <span className="text-xl font-black text-[#d9b9ff]" style={{ fontFamily: 'Public Sans, sans-serif' }}>{entry.leadership_eval ?? '--'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#968d9d] uppercase tracking-[0.2em] block" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>CST</span>
                      <span className="text-xl font-black text-[#c3cc8c]" style={{ fontFamily: 'Public Sans, sans-serif' }}>{entry.cst_score ?? '--'}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#968d9d] uppercase tracking-[0.2em]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {entry.recorded_at ? new Date(entry.recorded_at).toLocaleDateString() : `Entry ${i + 1}`}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

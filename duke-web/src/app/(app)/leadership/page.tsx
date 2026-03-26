'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useScoresStore } from '@/stores/scores';
import { loadAuditState, saveAuditState } from '@/services/auditData';

// ─── Training & Extracurricular Section ──────────────────────
function TrainingSection() {
  const router = useRouter();
  const [activityPts, setActivityPts] = useState(0);

  useEffect(() => {
    const auditState = loadAuditState();
    const trainItems = auditState.items.filter((i) => i.category === 'training' && i.status !== 'unclaimed');
    const total = trainItems.reduce((sum, i) => sum + i.value, 0);
    setActivityPts(total);
  }, []);

  const oms = Math.min(activityPts, 100) / 100 * 5;
  const progress = Math.min(activityPts / 100, 1) * 100;

  const handleChange = (val: number) => {
    const clamped = Math.max(0, Math.min(285, val));
    setActivityPts(clamped);
    localStorage.setItem('duke_training_pts', String(clamped));
  };

  return (
    <section>
      <h3 className="text-[12px] text-[#968d9d] uppercase tracking-[0.3em] font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
        Training & Extracurricular (max 5 OMS)
      </h3>
      <div className="glass-panel-lead p-8 rounded-lg space-y-5">
        <div>
          <label className="text-[10px] text-[#968d9d] uppercase tracking-[0.3em] block mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Activity Points (0-100 for full 5 OMS)
          </label>
          <p className="text-xs text-[#968d9d] mb-2">100 activity points = full 5 OMS. Ranger Challenge, community service, clubs, etc.</p>
          <input
            type="number"
            min="0"
            max="285"
            value={activityPts}
            onChange={(e) => handleChange(parseInt(e.target.value, 10) || 0)}
            className="w-full bg-[#151317] text-[#e7e1e6] rounded-sm px-4 py-3 text-lg font-black outline-none focus:ring-2 focus:ring-[#d9b9ff]/30 placeholder:text-[#968d9d]"
            style={{ border: 'none', fontFamily: 'Public Sans, sans-serif' }}
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-[10px] text-[#968d9d] uppercase tracking-[0.2em]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Progress to cap (100 pts)
            </span>
            <span className="text-[10px] font-bold text-[#d9b9ff]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {oms.toFixed(1)} / 5 OMS
            </span>
          </div>
          <div className="h-2 w-full bg-[#373438] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #d9b9ff88, #d9b9ff)', boxShadow: '0 0 8px rgba(217,185,255,0.3)' }}
            />
          </div>
        </div>
        <button
          onClick={() => router.push('/audit')}
          className="w-full py-3 rounded-sm bg-[#450084] text-[#b27ff5] font-bold uppercase tracking-wider text-sm hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          style={{ fontFamily: 'Space Grotesk, sans-serif', boxShadow: '0 0 20px rgba(69,0,132,0.3)' }}
        >
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>fact_check</span>
          Full Audit
        </button>
      </div>
    </section>
  );
}

// ─── Maturity & Responsibility Section ───────────────────────
function MaturitySection() {
  const router = useRouter();
  const [maturityPts, setMaturityPts] = useState(0);

  useEffect(() => {
    const auditState = loadAuditState();
    const matItems = auditState.items.filter((i) => i.category === 'maturity' && i.status !== 'unclaimed');
    const total = matItems.reduce((sum, i) => sum + i.value, 0);
    setMaturityPts(Math.min(total, 5));
  }, []);

  const handleChange = (val: number) => {
    const clamped = Math.max(0, Math.min(5, val));
    setMaturityPts(clamped);
    localStorage.setItem('duke_maturity_pts', String(clamped));
  };

  return (
    <section>
      <h3 className="text-[12px] text-[#968d9d] uppercase tracking-[0.3em] font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
        Maturity & Responsibility (max 5 OMS)
      </h3>
      <div className="glass-panel-lead p-8 rounded-lg space-y-5">
        <div>
          <label className="text-[10px] text-[#968d9d] uppercase tracking-[0.3em] block mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Maturity Score (0-5 OMS)
          </label>
          <p className="text-xs text-[#968d9d] mb-2">Employment, SMP, Green-to-Gold. Documented work experience while enrolled.</p>
          <input
            type="number"
            min="0"
            max="5"
            value={maturityPts}
            onChange={(e) => handleChange(parseInt(e.target.value, 10) || 0)}
            className="w-full bg-[#151317] text-[#e7e1e6] rounded-sm px-4 py-3 text-lg font-black outline-none focus:ring-2 focus:ring-[#c3cc8c]/30 placeholder:text-[#968d9d]"
            style={{ border: 'none', fontFamily: 'Public Sans, sans-serif' }}
          />
        </div>
        <button
          onClick={() => router.push('/audit')}
          className="w-full py-3 rounded-sm bg-[#2c3303] text-[#c3cc8c] font-bold uppercase tracking-wider text-sm hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          style={{ fontFamily: 'Space Grotesk, sans-serif', boxShadow: '0 0 20px rgba(44,51,3,0.3)' }}
        >
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>fact_check</span>
          Full Audit
        </button>
      </div>
    </section>
  );
}

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
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d] block mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>CER (PMS Eval)</span>
                <span className="text-2xl font-black text-[#d9b9ff]" style={{ fontFamily: 'Public Sans, sans-serif' }}>{currentEval ?? '--'}</span>
                <span className="text-xs text-[#968d9d]"> / 25 OMS</span>
              </div>
              <div className="bg-[#1d1b1f] rounded-sm p-4">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d] block mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>CST Score</span>
                <span className="text-2xl font-black text-[#c3cc8c]" style={{ fontFamily: 'Public Sans, sans-serif' }}>{currentCst ?? '--'}</span>
                <span className="text-xs text-[#968d9d]"> / 25 OMS</span>
              </div>
            </div>
            <p className="text-sm text-[#968d9d] mt-4">Leadership is worth up to 62 of your 100 OMS points. CER, Training, Maturity, CST, and RECONDO all factor in.</p>
          </div>
        </section>

        {/* Update Form */}
        <section>
          <h3 className="text-[12px] text-[#968d9d] uppercase tracking-[0.3em] font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Update Scores</h3>
          <div className="glass-panel-lead p-8 rounded-lg space-y-5">
            <div>
              <label className="text-[10px] text-[#968d9d] uppercase tracking-[0.3em] block mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>CER / PMS Evaluation (0-25)</label>
              <input
                type="number"
                min="0"
                max="25"
                value={eval_}
                onChange={(e) => setEval(e.target.value)}
                placeholder="85"
                className="w-full bg-[#151317] text-[#e7e1e6] rounded-sm px-4 py-3.5 text-lg font-black outline-none focus:ring-2 focus:ring-[#d9b9ff]/30 placeholder:text-[#968d9d]"
                style={{ border: 'none', fontFamily: 'Public Sans, sans-serif' }}
              />
            </div>
            <div>
              <label className="text-[10px] text-[#968d9d] uppercase tracking-[0.3em] block mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Cadet Summer Training Score (0-25)</label>
              <input
                type="number"
                min="0"
                max="25"
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
              { icon: 'groups', title: 'Seek Command Roles', desc: 'Squad leader, platoon sergeant, and XO positions boost your CER score (up to 25 OMS points).' },
              { icon: 'volunteer_activism', title: 'Log Volunteer Hours', desc: 'Community service and extracurricular leadership show well-roundedness.' },
              { icon: 'event', title: 'CST Preparation', desc: 'Cadet Summer Training is worth up to 25 OMS points — the single highest-impact event.' },
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

        {/* Training & Extracurricular */}
        <TrainingSection />

        {/* Maturity & Responsibility */}
        <MaturitySection />

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

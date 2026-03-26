'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useScoresStore } from '@/stores/scores';

export default function GPAPage() {
  const router = useRouter();
  const scores = useScoresStore();
  const latest = scores.scoreHistory[0];

  const [gpa, setGpa] = useState(latest?.gpa != null ? String(latest.gpa) : '');
  const [mslGpa, setMslGpa] = useState(latest?.msl_gpa != null ? String(latest.msl_gpa) : '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const history = scores.scoreHistory.filter((s) => s.gpa != null).slice(0, 10);

  async function handleSave() {
    const gpaVal = parseFloat(gpa);
    if (isNaN(gpaVal) || gpaVal < 0 || gpaVal > 4.0) return;
    const mslVal = mslGpa ? parseFloat(mslGpa) : null;

    setSaving(true);
    await scores.addScoreEntry({
      gpa: gpaVal,
      msl_gpa: mslVal,
      acft_total: latest?.acft_total ?? null,
      leadership_eval: latest?.leadership_eval ?? null,
      cst_score: latest?.cst_score ?? null,
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
        .glass-panel-gpa { background: rgba(55, 52, 56, 0.5); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
      `}</style>

      <div className="pt-6 pb-8 px-6 max-w-3xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-[#968d9d] hover:text-[#d9b9ff] transition-colors">
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#968d9d] block" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Academic Pillar</span>
            <h1 className="text-3xl font-black uppercase tracking-tighter" style={{ fontFamily: 'Public Sans, sans-serif' }}>GPA TRACKER</h1>
          </div>
        </div>

        {/* Current Score */}
        <section className="glass-panel-gpa p-10 rounded-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <span className="material-symbols-outlined text-[120px]">school</span>
          </div>
          <div className="relative z-10">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#968d9d] block mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Current GPA</span>
            <div className="flex items-baseline gap-4">
              <span className="text-6xl font-black text-[#f8e19e]" style={{ fontFamily: 'Public Sans, sans-serif', filter: 'drop-shadow(0 0 10px rgba(248,225,158,0.3))' }}>
                {latest?.gpa != null ? latest.gpa.toFixed(2) : '--'}
              </span>
              <span className="text-xl text-[#968d9d]">/ 4.00</span>
            </div>
            {latest?.msl_gpa != null && (
              <div className="mt-3">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>MSL GPA: </span>
                <span className="text-lg font-black text-[#dbc585]" style={{ fontFamily: 'Public Sans, sans-serif' }}>{latest.msl_gpa.toFixed(2)}</span>
              </div>
            )}
            <p className="text-sm text-[#968d9d] mt-4">Academic pillar contributes 40% of your total OML score — the highest weighted component.</p>
          </div>
        </section>

        {/* Update Form */}
        <section>
          <h3 className="text-[12px] text-[#968d9d] uppercase tracking-[0.3em] font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Update GPA</h3>
          <div className="glass-panel-gpa p-8 rounded-lg space-y-5">
            <div>
              <label className="text-[10px] text-[#968d9d] uppercase tracking-[0.3em] block mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Cumulative GPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="4.0"
                value={gpa}
                onChange={(e) => setGpa(e.target.value)}
                placeholder="3.50"
                className="w-full bg-[#151317] text-[#e7e1e6] rounded-sm px-4 py-3.5 text-lg font-black outline-none focus:ring-2 focus:ring-[#f8e19e]/30 placeholder:text-[#968d9d]"
                style={{ border: 'none', fontFamily: 'Public Sans, sans-serif' }}
              />
            </div>
            <div>
              <label className="text-[10px] text-[#968d9d] uppercase tracking-[0.3em] block mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>MSL GPA (optional)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="4.0"
                value={mslGpa}
                onChange={(e) => setMslGpa(e.target.value)}
                placeholder="3.80"
                className="w-full bg-[#151317] text-[#e7e1e6] rounded-sm px-4 py-3.5 text-lg outline-none focus:ring-2 focus:ring-[#f8e19e]/30 placeholder:text-[#968d9d]"
                style={{ border: 'none' }}
              />
              <p className="text-xs text-[#968d9d] mt-2">Military Science GPA. Leave blank to use cumulative.</p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving || !gpa}
              className="w-full py-4 rounded-sm bg-[#544511] text-[#f8e19e] font-bold uppercase tracking-wider disabled:opacity-50 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              style={{ fontFamily: 'Space Grotesk, sans-serif', boxShadow: '0 0 20px rgba(84,69,17,0.3)' }}
            >
              {saved ? (
                <><span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> Saved</>
              ) : saving ? (
                <span className="animate-spin w-4 h-4 border-2 border-[#f8e19e]/30 border-t-[#f8e19e] rounded-full" />
              ) : (
                <><span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>save</span> Save GPA</>
              )}
            </button>
          </div>
        </section>

        {/* History */}
        {history.length > 0 && (
          <section>
            <h3 className="text-[12px] text-[#968d9d] uppercase tracking-[0.3em] font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>GPA History</h3>
            <div className="space-y-3">
              {history.map((entry, i) => (
                <div key={i} className="bg-[#211f23] hover:bg-[#2c292d] transition-all rounded-lg p-5 flex items-center justify-between border-l-4 border-[#544511]">
                  <div>
                    <span className="text-2xl font-black text-[#f8e19e]" style={{ fontFamily: 'Public Sans, sans-serif' }}>{entry.gpa?.toFixed(2)}</span>
                    {entry.msl_gpa != null && (
                      <span className="text-sm text-[#968d9d] ml-3">MSL: {entry.msl_gpa.toFixed(2)}</span>
                    )}
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

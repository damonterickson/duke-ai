'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useScoresStore } from '@/stores/scores';
import { useProfileStore } from '@/stores/profile';

export default function WhatIfPage() {
  const router = useRouter();
  const scores = useScoresStore();
  const profile = useProfileStore();

  const latestScore = scores.scoreHistory[0];
  const currentOml = latestScore?.total_oml ?? 0;
  const currentGpa = latestScore?.gpa ?? 0;
  const currentAcft = latestScore?.acft_total ?? 0;
  const currentLeadership = latestScore?.leadership_eval ?? 0;

  const [whatIfGpa, setWhatIfGpa] = useState(String(currentGpa || '3.50'));
  const [whatIfAcft, setWhatIfAcft] = useState(String(currentAcft || '480'));
  const [whatIfLeadership, setWhatIfLeadership] = useState(String(currentLeadership || '85'));

  const projectedOml = useMemo(() => {
    const gpa = parseFloat(whatIfGpa) || 0;
    const acft = parseFloat(whatIfAcft) || 0;
    const lead = parseFloat(whatIfLeadership) || 0;
    const academic = (Math.min(gpa, 4.0) / 4.0) * 400;
    const physical = (Math.min(acft, 600) / 600) * 200;
    const leadership = (Math.min(lead, 100) / 100) * 400;
    return Math.round(academic + physical + leadership);
  }, [whatIfGpa, whatIfAcft, whatIfLeadership]);

  const delta = projectedOml - Math.round(currentOml);
  const deltaSign = delta >= 0 ? '+' : '';

  return (
    <div className="min-h-screen bg-[#151317] text-[#e7e1e6] selection:bg-[#450084] selection:text-[#d9b9ff]">
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <style jsx global>{`
        .glass-panel-whatif { background: rgba(55, 52, 56, 0.5); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
      `}</style>

      <div className="pt-6 pb-8 px-6 max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-[#968d9d] hover:text-[#d9b9ff] transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-[#dbc585]" style={{ fontFamily: 'Public Sans, sans-serif' }}>
            WHAT-IF SIMULATOR
          </h1>
        </div>

        <p className="text-[#968d9d] text-lg leading-relaxed max-w-2xl">
          Adjust your scores to see how changes would impact your OML.
        </p>

        {/* Projection Display */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 glass-panel-whatif p-10 rounded-lg flex flex-col items-center" style={{ boxShadow: '0 0 30px rgba(219,197,133,0.15)' }}>
            <span className="text-[12px] text-[#968d9d] uppercase tracking-[0.3em] font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Projected OML
            </span>
            <span className="text-7xl font-black text-[#dbc585]" style={{ fontFamily: 'Public Sans, sans-serif', filter: 'drop-shadow(0 0 15px rgba(219,197,133,0.3))' }}>
              {projectedOml}
            </span>
          </div>
          {delta !== 0 && (
            <div className={`rounded-lg p-8 flex flex-col items-center justify-center ${delta > 0 ? 'bg-[#450084]' : 'bg-[#93000a]/30'}`} style={{ boxShadow: delta > 0 ? '0 0 20px rgba(69,0,132,0.3)' : undefined }}>
              <span className="material-symbols-outlined text-3xl mb-2" style={{ color: delta > 0 ? '#d9b9ff' : '#ffb4ab', fontVariationSettings: "'FILL' 1" }}>
                {delta > 0 ? 'trending_up' : 'trending_down'}
              </span>
              <span className={`text-4xl font-black ${delta > 0 ? 'text-[#d9b9ff]' : 'text-[#ffb4ab]'}`} style={{ fontFamily: 'Public Sans, sans-serif' }}>
                {deltaSign}{delta}
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d] mt-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                OML pts
              </span>
            </div>
          )}
        </section>

        {/* Input Cards */}
        <section>
          <h3 className="text-[12px] text-[#968d9d] uppercase tracking-[0.3em] font-bold mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Adjust Variables
          </h3>
          <div className="space-y-4">
            {[
              { label: 'GPA', current: currentGpa.toFixed(2), value: whatIfGpa, setter: setWhatIfGpa, placeholder: '3.50', icon: 'school', color: '#f8e19e', bg: '#544511' },
              { label: 'ACFT Total', current: String(Math.round(currentAcft)), value: whatIfAcft, setter: setWhatIfAcft, placeholder: '480', icon: 'fitness_center', color: '#c3cc8c', bg: '#2c3303' },
              { label: 'Leadership Eval', current: String(Math.round(currentLeadership)), value: whatIfLeadership, setter: setWhatIfLeadership, placeholder: '85', icon: 'military_tech', color: '#d9b9ff', bg: '#450084' },
            ].map((input) => (
              <div key={input.label} className="bg-[#211f23] hover:bg-[#2c292d] transition-all rounded-lg p-6 border-l-4 flex items-center gap-5" style={{ borderLeftColor: input.bg }}>
                <div className="p-3 rounded-sm" style={{ backgroundColor: input.bg }}>
                  <span className="material-symbols-outlined" style={{ color: input.color, fontVariationSettings: "'FILL' 1" }}>{input.icon}</span>
                </div>
                <div className="flex-1">
                  <span className="text-[10px] text-[#968d9d] uppercase tracking-[0.3em] block mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {input.label} (Current: {input.current})
                  </span>
                  <input
                    type="number"
                    value={input.value}
                    onChange={(e) => input.setter(e.target.value)}
                    placeholder={input.placeholder}
                    className="w-full bg-[#151317] text-[#e7e1e6] text-xl font-black px-4 py-3 rounded-sm outline-none focus:ring-2 focus:ring-[#d9b9ff]/30 placeholder:text-[#968d9d]"
                    style={{ border: 'none', fontFamily: 'Public Sans, sans-serif' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Goal comparison */}
        {profile.goalOml != null && (
          <section className={`rounded-lg p-8 ${projectedOml >= profile.goalOml ? '' : ''}`} style={{
            backgroundColor: projectedOml >= profile.goalOml ? '#450084' : '#544511',
            boxShadow: projectedOml >= profile.goalOml ? '0 0 20px rgba(69,0,132,0.3)' : '0 0 20px rgba(219,197,133,0.15)',
          }}>
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined" style={{ color: projectedOml >= profile.goalOml ? '#d9b9ff' : '#dbc585', fontVariationSettings: "'FILL' 1" }}>
                {projectedOml >= profile.goalOml ? 'check_circle' : 'flag'}
              </span>
              <h3 className="text-lg font-black uppercase tracking-tight" style={{ fontFamily: 'Public Sans, sans-serif' }}>
                Target: {Math.round(profile.goalOml)} OML
              </h3>
            </div>
            <p className="text-sm text-[#cdc3d4]">
              {projectedOml >= profile.goalOml
                ? 'This scenario meets your target!'
                : `${Math.round(profile.goalOml - projectedOml)} points short of your target.`}
            </p>
          </section>
        )}
      </div>
    </div>
  );
}

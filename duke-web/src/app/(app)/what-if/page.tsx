'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useScoresStore } from '@/stores/scores';
import { useProfileStore } from '@/stores/profile';
import { calculateOMS, createDefaultOMSProfile } from '@/engine/oms';
import type { OMSProfile, OMSResult } from '@/engine/oms';

type Mode = 'planning' | 'exact';

function SliderField({
  label,
  value,
  min,
  max,
  step,
  onChange,
  color,
  suffix,
  delta,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  color: string;
  suffix?: string;
  delta?: number;
}) {
  return (
    <div className="bg-[#211f23] rounded-lg p-4 space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-[#968d9d] uppercase tracking-wider" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-black" style={{ fontFamily: 'Public Sans, sans-serif', color }}>
            {step < 1 ? value.toFixed(2) : value}{suffix ?? ''}
          </span>
          {delta != null && delta !== 0 && (
            <span className={`text-[10px] font-bold ${delta > 0 ? 'text-[#c3cc8c]' : 'text-[#ffb4ab]'}`} style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {delta > 0 ? '+' : ''}{delta.toFixed(2)}
            </span>
          )}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${color} 0%, ${color} ${((value - min) / (max - min)) * 100}%, #373438 ${((value - min) / (max - min)) * 100}%, #373438 100%)`,
        }}
      />
      <div className="flex justify-between text-[9px] text-[#968d9d]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

export default function WhatIfPage() {
  const router = useRouter();
  const scores = useScoresStore();
  const profile = useProfileStore();

  const latestScore = scores.scoreHistory[0];

  const [mode, setMode] = useState<Mode>('planning');

  // Academic sliders
  const [gpa, setGpa] = useState(latestScore?.gpa ?? 3.0);
  const [adm, setAdm] = useState(0);
  const [language, setLanguage] = useState(0);

  // Leadership sliders
  const [cer, setCer] = useState(latestScore?.leadership_eval ?? 0);
  const [training, setTraining] = useState(0);
  const [maturity, setMaturity] = useState(0);
  const [cst, setCst] = useState(latestScore?.cst_score ?? 0);
  const [recondo, setRecondo] = useState(false);

  // Physical sliders
  const [fallAft, setFallAft] = useState(latestScore?.acft_total ? Math.round(latestScore.acft_total / 2) : 300);
  const [springAft, setSpringAft] = useState(latestScore?.acft_total ? Math.round(latestScore.acft_total / 2) : 300);
  const [athletics, setAthletics] = useState(0);

  // Exact mode AMS values
  const [amsAcademic, setAmsAcademic] = useState(0);
  const [amsLeadership, setAmsLeadership] = useState(0);
  const [amsPhysical, setAmsPhysical] = useState(0);

  // Baseline: current OMS from stored scores
  const baselineResult = useMemo<OMSResult>(() => {
    const baseProfile: OMSProfile = {
      ...createDefaultOMSProfile(),
      gpa: latestScore?.gpa ?? 0,
      mslGpa: latestScore?.msl_gpa ?? undefined,
      fallAft: latestScore?.acft_total ? Math.round(latestScore.acft_total / 2) : 0,
      springAft: latestScore?.acft_total ? Math.round(latestScore.acft_total / 2) : 0,
      cerScore: latestScore?.leadership_eval ?? 0,
      cstScore: latestScore?.cst_score ?? 0,
    };
    return calculateOMS(baseProfile);
  }, [latestScore]);

  // What-if projected result
  const projected = useMemo<OMSResult>(() => {
    if (mode === 'exact') {
      const total = amsAcademic + amsLeadership + amsPhysical;
      const exactProfile: OMSProfile = {
        ...createDefaultOMSProfile(),
        mode: 'exact',
        amsValues: {
          academicPoints: amsAcademic,
          leadershipPoints: amsLeadership,
          physicalPoints: amsPhysical,
          totalOMS: total,
        },
      };
      return calculateOMS(exactProfile);
    }

    const whatIfProfile: OMSProfile = {
      ...createDefaultOMSProfile(),
      gpa,
      adm,
      languageCultural: language,
      cerScore: cer,
      trainingExtracurricular: training,
      maturityResponsibility: maturity,
      cstScore: cst,
      recondo,
      fallAft,
      springAft,
      athletics,
      mode: 'planning',
    };
    return calculateOMS(whatIfProfile);
  }, [mode, gpa, adm, language, cer, training, maturity, cst, recondo, fallAft, springAft, athletics, amsAcademic, amsLeadership, amsPhysical]);

  const delta = projected.totalOMS - baselineResult.totalOMS;
  const deltaSign = delta >= 0 ? '+' : '';

  return (
    <div className="min-h-screen bg-[#151317] text-[#e7e1e6] selection:bg-[#450084] selection:text-[#d9b9ff]">
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <style jsx global>{`
        .glass-panel-whatif { background: rgba(55, 52, 56, 0.5); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #dbc585; box-shadow: 0 0 8px rgba(219,197,133,0.5); cursor: pointer; }
        input[type=range]::-moz-range-thumb { width: 16px; height: 16px; border-radius: 50%; background: #dbc585; box-shadow: 0 0 8px rgba(219,197,133,0.5); cursor: pointer; border: none; }
      `}</style>

      <div className="pt-6 pb-8 px-6 max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="glass-panel-whatif p-10 md:p-12 rounded-lg relative overflow-hidden animate-fadeInUp">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <span className="material-symbols-outlined text-[120px]">auto_fix_high</span>
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="text-[#968d9d] hover:text-[#d9b9ff] transition-colors">
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <h1 className="text-3xl font-black uppercase tracking-tighter text-[#dbc585]" style={{ fontFamily: 'Public Sans, sans-serif' }}>
                OMS SIMULATOR
              </h1>
            </div>
            <p className="text-[#968d9d] text-lg leading-relaxed max-w-2xl">
              Adjust your inputs to see how changes impact your Order of Merit Score.
            </p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 animate-fadeIn delay-200">
          {(['planning', 'exact'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-5 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-all ${
                mode === m ? 'bg-[#450084] text-[#d9b9ff]' : 'bg-[#211f23] text-[#968d9d] hover:bg-[#2c292d]'
              }`}
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              {m === 'planning' ? 'Planning Mode' : 'Exact (AMS Values)'}
            </button>
          ))}
        </div>

        {/* Current + Projected OMS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel-whatif p-8 rounded-lg flex flex-col items-center">
            <span className="text-[12px] text-[#968d9d] uppercase tracking-[0.3em] font-bold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Current OMS</span>
            <span className="text-4xl font-black text-[#968d9d]" style={{ fontFamily: 'Public Sans, sans-serif' }}>
              {baselineResult.totalOMS.toFixed(1)}
            </span>
            <span className="text-xs text-[#968d9d]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>/ 100</span>
          </div>
          <div className="glass-panel-whatif p-8 rounded-lg flex flex-col items-center" style={{ boxShadow: '0 0 30px rgba(219,197,133,0.15)' }}>
            <span className="text-[12px] text-[#968d9d] uppercase tracking-[0.3em] font-bold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Projected OMS</span>
            <span className="text-7xl font-black text-[#dbc585]" style={{ fontFamily: 'Public Sans, sans-serif', filter: 'drop-shadow(0 0 15px rgba(219,197,133,0.3))' }}>
              {projected.totalOMS.toFixed(1)}
            </span>
            <span className="text-xs text-[#968d9d]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>/ 100</span>
          </div>
          {delta !== 0 && (
            <div className={`rounded-lg p-8 flex flex-col items-center justify-center ${delta > 0 ? 'bg-[#450084]' : 'bg-[#93000a]/30'}`} style={{ boxShadow: delta > 0 ? '0 0 20px rgba(69,0,132,0.3)' : undefined }}>
              <span className="material-symbols-outlined text-3xl mb-2" style={{ color: delta > 0 ? '#d9b9ff' : '#ffb4ab', fontVariationSettings: "'FILL' 1" }}>
                {delta > 0 ? 'trending_up' : 'trending_down'}
              </span>
              <span className={`text-4xl font-black ${delta > 0 ? 'text-[#d9b9ff]' : 'text-[#ffb4ab]'}`} style={{ fontFamily: 'Public Sans, sans-serif' }}>
                {deltaSign}{delta.toFixed(2)}
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d] mt-1" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                OMS pts
              </span>
            </div>
          )}
        </section>

        {mode === 'planning' ? (
          /* Planning Mode Sliders */
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn delay-200">
            {/* Academic Pillar */}
            <div>
              <h3 className="text-[12px] text-[#968d9d] uppercase tracking-[0.3em] font-bold mb-4 flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                <span className="material-symbols-outlined text-sm text-[#f8e19e]" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
                Academic (max 29)
                <span className="ml-auto text-[#f8e19e] text-sm font-black" style={{ fontFamily: 'Public Sans, sans-serif' }}>{projected.academic.total.toFixed(1)}</span>
              </h3>
              <div className="space-y-3">
                <SliderField label="GPA" value={gpa} min={0} max={4.0} step={0.01} onChange={setGpa} color="#f8e19e" delta={projected.academic.subComponents.gpa.value - baselineResult.academic.subComponents.gpa.value} />
                <SliderField label="ADM" value={adm} min={0} max={2} step={1} onChange={setAdm} color="#f8e19e" />
                <SliderField label="Language/Cultural" value={language} min={0} max={5} step={1} onChange={setLanguage} color="#f8e19e" />
              </div>
            </div>

            {/* Leadership Pillar */}
            <div>
              <h3 className="text-[12px] text-[#968d9d] uppercase tracking-[0.3em] font-bold mb-4 flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                <span className="material-symbols-outlined text-sm text-[#d9b9ff]" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
                Leadership (max 62)
                <span className="ml-auto text-[#d9b9ff] text-sm font-black" style={{ fontFamily: 'Public Sans, sans-serif' }}>{projected.leadership.total.toFixed(1)}</span>
              </h3>
              <div className="space-y-3">
                <SliderField label="CER (PMS Eval)" value={cer} min={0} max={25} step={1} onChange={setCer} color="#d9b9ff" />
                <SliderField label="Training Activity Pts" value={training} min={0} max={100} step={5} onChange={setTraining} color="#d9b9ff" suffix=" pts" />
                <SliderField label="Maturity" value={maturity} min={0} max={5} step={1} onChange={setMaturity} color="#d9b9ff" />
                <SliderField label="CST Score" value={cst} min={0} max={25} step={1} onChange={setCst} color="#d9b9ff" />
                <div className="bg-[#211f23] rounded-lg p-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#968d9d] uppercase tracking-wider" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>RECONDO (+2)</span>
                  <button
                    onClick={() => setRecondo(!recondo)}
                    className={`px-4 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-all ${
                      recondo ? 'bg-[#450084] text-[#d9b9ff]' : 'bg-[#151317] text-[#968d9d]'
                    }`}
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  >
                    {recondo ? 'Earned' : 'Not Earned'}
                  </button>
                </div>
              </div>
            </div>

            {/* Physical Pillar */}
            <div>
              <h3 className="text-[12px] text-[#968d9d] uppercase tracking-[0.3em] font-bold mb-4 flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                <span className="material-symbols-outlined text-sm text-[#c3cc8c]" style={{ fontVariationSettings: "'FILL' 1" }}>fitness_center</span>
                Physical (max 9)
                <span className="ml-auto text-[#c3cc8c] text-sm font-black" style={{ fontFamily: 'Public Sans, sans-serif' }}>{projected.physical.total.toFixed(1)}</span>
              </h3>
              <div className="space-y-3">
                <SliderField label="Fall AFT" value={fallAft} min={0} max={600} step={10} onChange={setFallAft} color="#c3cc8c" suffix="/600" delta={projected.physical.subComponents.fallAft.value - baselineResult.physical.subComponents.fallAft.value} />
                <SliderField label="Spring AFT" value={springAft} min={0} max={600} step={10} onChange={setSpringAft} color="#c3cc8c" suffix="/600" delta={projected.physical.subComponents.springAft.value - baselineResult.physical.subComponents.springAft.value} />
                <SliderField label="Athletics" value={athletics} min={0} max={3} step={1} onChange={setAthletics} color="#c3cc8c" />
              </div>
            </div>
          </section>
        ) : (
          /* Exact Mode: AMS Values */
          <section>
            <h3 className="text-[12px] text-[#968d9d] uppercase tracking-[0.3em] font-bold mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Enter AMS Values from Official Scorecard
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Academic Points', value: amsAcademic, setter: setAmsAcademic, max: 29, color: '#f8e19e', icon: 'school' },
                { label: 'Leadership Points', value: amsLeadership, setter: setAmsLeadership, max: 62, color: '#d9b9ff', icon: 'military_tech' },
                { label: 'Physical Points', value: amsPhysical, setter: setAmsPhysical, max: 9, color: '#c3cc8c', icon: 'fitness_center' },
              ].map((field) => (
                <div key={field.label} className="glass-panel-whatif p-6 rounded-lg border-l-4" style={{ borderLeftColor: field.color }}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-sm" style={{ color: field.color, fontVariationSettings: "'FILL' 1" }}>{field.icon}</span>
                    <span className="text-[10px] text-[#968d9d] uppercase tracking-[0.3em]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{field.label} (max {field.max})</span>
                  </div>
                  <input
                    type="number"
                    value={field.value || ''}
                    onChange={(e) => field.setter(Math.min(parseFloat(e.target.value) || 0, field.max))}
                    placeholder={`0-${field.max}`}
                    className="w-full bg-[#151317] text-[#e7e1e6] text-xl font-black px-4 py-3 rounded-sm outline-none focus:ring-2 focus:ring-[#d9b9ff]/30 placeholder:text-[#968d9d]"
                    style={{ border: 'none', fontFamily: 'Public Sans, sans-serif' }}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ROI Comparison */}
        {mode === 'planning' && projected.roiComparison.length > 0 && (
          <section>
            <h3 className="text-[12px] text-[#968d9d] uppercase tracking-[0.3em] font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              ROI Comparison (points per hour invested)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {projected.roiComparison.map((roi) => (
                <div key={roi.pillar} className="bg-[#211f23] rounded-lg p-6 border-l-4" style={{ borderLeftColor: roi.color }}>
                  <span className="text-sm font-bold" style={{ color: roi.color }}>{roi.label}</span>
                  <div className="mt-3 h-2 bg-[#373438] rounded-full">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min((roi.pointsPerHour / 0.06) * 100, 100)}%`,
                        backgroundColor: roi.color,
                        boxShadow: `0 0 8px ${roi.color}40`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Next Best Action */}
        {mode === 'planning' && projected.nextBestAction && (
          <section className="bg-[#450084] rounded-lg p-8 flex gap-5 items-start" style={{ boxShadow: '0 0 20px rgba(69,0,132,0.3)' }}>
            <div className="p-3 rounded-sm bg-[#d9b9ff]/10">
              <span className="material-symbols-outlined text-[#dbc585]" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
            </div>
            <div>
              <h4 className="text-lg font-black uppercase tracking-tight mb-1" style={{ fontFamily: 'Public Sans, sans-serif' }}>Next Best Action</h4>
              <p className="text-sm text-[#e7e1e6]/80 leading-relaxed">{projected.nextBestAction}</p>
            </div>
          </section>
        )}

        {/* Goal comparison */}
        {profile.goalOml != null && (
          <section className="rounded-lg p-8" style={{
            backgroundColor: projected.totalOMS >= profile.goalOml ? '#450084' : '#544511',
            boxShadow: projected.totalOMS >= profile.goalOml ? '0 0 20px rgba(69,0,132,0.3)' : '0 0 20px rgba(219,197,133,0.15)',
          }}>
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined" style={{ color: projected.totalOMS >= profile.goalOml ? '#d9b9ff' : '#dbc585', fontVariationSettings: "'FILL' 1" }}>
                {projected.totalOMS >= profile.goalOml ? 'check_circle' : 'flag'}
              </span>
              <h3 className="text-lg font-black uppercase tracking-tight" style={{ fontFamily: 'Public Sans, sans-serif' }}>
                Target: {Math.round(profile.goalOml)} OMS
              </h3>
            </div>
            <p className="text-sm text-[#cdc3d4]">
              {projected.totalOMS >= profile.goalOml
                ? 'This scenario meets your target!'
                : `${(profile.goalOml - projected.totalOMS).toFixed(1)} points short of your target.`}
            </p>
          </section>
        )}

        {/* Disclaimer */}
        <section className="bg-[#1d1b1f] rounded-lg p-6 flex gap-4 items-start">
          <span className="material-symbols-outlined text-[#968d9d] text-sm mt-0.5">info</span>
          <p className="text-xs text-[#968d9d] leading-relaxed">{projected.disclaimer}</p>
        </section>
      </div>
    </div>
  );
}

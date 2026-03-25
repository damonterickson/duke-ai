'use client';

import React from 'react';
import { useScoresStore } from '@/stores/scores';

export default function IntelPage() {
  const scores = useScoresStore();
  const latest = scores.scoreHistory[scores.scoreHistory.length - 1];
  const omlScore = latest?.total_oml ? String(Math.round(latest.total_oml)) : '350';

  return (
    <div className="min-h-screen bg-[#151317] text-[#e7e1e6] selection:bg-[#450084] selection:text-[#d9b9ff]">
      {/* Material Symbols */}
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <style jsx global>{`
        .glass-panel-intel {
          background: rgba(55, 52, 56, 0.5);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }
        .kinetic-gradient {
          background: linear-gradient(135deg, #d9b9ff 0%, #450084 100%);
        }
        .neon-glow {
          box-shadow: 0 0 20px rgba(219, 197, 133, 0.4);
        }
      `}</style>

      <div className="pt-6 pb-8 px-6 max-w-7xl mx-auto space-y-12">

        {/* AI Briefing Section */}
        <section className="relative">
          <div className="glass-panel-intel p-10 md:p-16 rounded-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 transition-opacity">
              <span className="material-symbols-outlined text-[144px]">shield_with_heart</span>
            </div>
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-[#450084] text-[#d9b9ff] text-[10px] tracking-[0.2em] uppercase font-bold rounded-sm" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Status: Operational</span>
                <div className="w-2 h-2 rounded-full bg-[#dbc585] animate-pulse" style={{ boxShadow: '0 0 10px #f8e19e' }}></div>
              </div>
              <h2 className="text-5xl md:text-7xl leading-tight tracking-tighter uppercase font-black" style={{ fontFamily: 'Public Sans, sans-serif' }}>
                Good morning, Duke. <br />
                Your JMU OML is <span className="text-[#dbc585]" style={{ filter: 'drop-shadow(0 0 15px rgba(219,197,133,0.3))' }}>{omlScore}</span>.
              </h2>
              <p className="text-[#968d9d] max-w-2xl text-lg leading-relaxed">
                Command analytics suggest a 4.2% increase in competitive ranking since your last PT evaluation. Current trajectory places you in the top 15% of the Vanguard Squad.
              </p>
            </div>
          </div>
        </section>

        {/* Optimization Paths & Data Viz Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Optimization Paths */}
          <div className="lg:col-span-1 space-y-6">
            <h3 className="text-[12px] text-[#968d9d] uppercase tracking-[0.3em] font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Optimization Paths</h3>
            <div className="space-y-4">
              {/* Path 1 - Active */}
              <div className="group cursor-pointer p-6 bg-[#211f23] hover:bg-[#2c292d] transition-all rounded-lg border-l-4 border-[#450084]">
                <div className="flex justify-between items-start mb-4">
                  <span className="material-symbols-outlined text-[#d9b9ff]" style={{ fontVariationSettings: "'FILL' 1" }}>fitness_center</span>
                  <span className="text-[10px] text-[#dbc585]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>ACTIVE</span>
                </div>
                <h4 className="text-xl uppercase font-black mb-2" style={{ fontFamily: 'Public Sans, sans-serif' }}>AFT Maxing Plan</h4>
                <p className="text-sm text-[#968d9d]">Intensive cardio and resistance metrics to exceed 2-mile run benchmarks.</p>
              </div>

              {/* Path 2 */}
              <div className="group cursor-pointer p-6 bg-[#1d1b1f] hover:bg-[#211f23] transition-all rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <span className="material-symbols-outlined text-[#968d9d] group-hover:text-[#d9b9ff] transition-colors">school</span>
                  <span className="text-[10px] text-[#968d9d] opacity-50" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>AVAILABLE</span>
                </div>
                <h4 className="text-xl uppercase font-black mb-2" style={{ fontFamily: 'Public Sans, sans-serif' }}>GPA Retention Strategy</h4>
                <p className="text-sm text-[#968d9d]">Targeted study hours for core engineering and tactical science requirements.</p>
              </div>

              {/* Path 3 */}
              <div className="group cursor-pointer p-6 bg-[#1d1b1f] hover:bg-[#211f23] transition-all rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <span className="material-symbols-outlined text-[#968d9d] group-hover:text-[#d9b9ff] transition-colors">diversity_3</span>
                  <span className="text-[10px] text-[#968d9d] opacity-50" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>AVAILABLE</span>
                </div>
                <h4 className="text-xl uppercase font-black mb-2" style={{ fontFamily: 'Public Sans, sans-serif' }}>Balanced Leader Path</h4>
                <p className="text-sm text-[#968d9d]">A hybrid model focusing on volunteer leadership and squad cohesion scores.</p>
              </div>
            </div>
          </div>

          {/* OML Trajectory Analytics */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-[12px] text-[#968d9d] uppercase tracking-[0.3em] font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>OML Trajectory Analytics</h3>
            <div className="glass-panel-intel p-8 rounded-lg h-[450px] flex flex-col relative">
              {/* Chart */}
              <div className="flex-1 flex items-end gap-2 px-2 relative">
                {/* Grid guides */}
                <div className="absolute inset-0 flex flex-col justify-between py-12 pointer-events-none opacity-10">
                  <div className="w-full h-px bg-[#968d9d]"></div>
                  <div className="w-full h-px bg-[#968d9d]"></div>
                  <div className="w-full h-px bg-[#968d9d]"></div>
                  <div className="w-full h-px bg-[#968d9d]"></div>
                </div>
                {/* Bars */}
                <div className="flex-1 bg-[#450084]/30 h-[40%] rounded-t-sm relative group overflow-hidden">
                  <div className="absolute inset-x-0 bottom-0 bg-[#d9b9ff] h-full opacity-0 group-hover:opacity-20 transition-opacity"></div>
                </div>
                <div className="flex-1 bg-[#450084]/40 h-[55%] rounded-t-sm relative group overflow-hidden">
                  <div className="absolute inset-x-0 bottom-0 bg-[#d9b9ff] h-full opacity-0 group-hover:opacity-20 transition-opacity"></div>
                </div>
                <div className="flex-1 bg-[#450084]/50 h-[48%] rounded-t-sm relative group overflow-hidden">
                  <div className="absolute inset-x-0 bottom-0 bg-[#d9b9ff] h-full opacity-0 group-hover:opacity-20 transition-opacity"></div>
                </div>
                <div className="flex-1 bg-[#450084]/60 h-[72%] rounded-t-sm relative group overflow-hidden">
                  <div className="absolute inset-x-0 bottom-0 bg-[#d9b9ff] h-full opacity-0 group-hover:opacity-20 transition-opacity"></div>
                </div>
                <div className="flex-1 kinetic-gradient h-[88%] rounded-t-sm relative" style={{ boxShadow: '0 0 30px rgba(217,185,255,0.3)' }}>
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#dbc585] text-[#3c2f00] px-2 py-1 rounded text-[10px] font-black whitespace-nowrap" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>CURRENT: {omlScore}</div>
                </div>
              </div>
              {/* X-axis labels */}
              <div className="mt-6 flex justify-between text-[10px] text-[#968d9d] uppercase font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                <span>WK 01</span>
                <span>WK 02</span>
                <span>WK 03</span>
                <span>WK 04</span>
                <span>WK 05 (NOW)</span>
              </div>
              {/* Legend */}
              <div className="absolute top-8 right-8 flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#d9b9ff] rounded-full"></div>
                  <span className="text-[10px] text-[#e7e1e6]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>National Avg</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#dbc585] rounded-full" style={{ boxShadow: '0 0 10px #dbc585' }}></div>
                  <span className="text-[10px] text-[#e7e1e6]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Your Path</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Insights Block */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 bg-[#373438]/40 backdrop-blur rounded-lg flex gap-6 items-start">
            <div className="p-4 bg-[#2c3303] rounded-sm">
              <span className="material-symbols-outlined text-[#c3cc8c]" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
            </div>
            <div>
              <h5 className="text-lg uppercase font-black mb-2" style={{ fontFamily: 'Public Sans, sans-serif' }}>Cognitive Load Check</h5>
              <p className="text-sm text-[#968d9d]">Mid-term exam cycle approaching. Recommend adjusting Physical Training intensity to &apos;Sustain&apos; mode for 72 hours.</p>
            </div>
          </div>
          <div className="p-8 bg-[#373438]/40 backdrop-blur rounded-lg flex gap-6 items-start">
            <div className="p-4 bg-[#544511] rounded-sm">
              <span className="material-symbols-outlined text-[#dbc585]" style={{ fontVariationSettings: "'FILL' 1" }}>military_tech</span>
            </div>
            <div>
              <h5 className="text-lg uppercase font-black mb-2" style={{ fontFamily: 'Public Sans, sans-serif' }}>Squad Leadership Opportunity</h5>
              <p className="text-sm text-[#968d9d]">Next week&apos;s field exercise has an open Lead Scout slot. This would boost Leadership OML by +12 points.</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useScoresStore } from '@/stores/scores';

const ACFT_EVENTS = [
  { key: 'mdl', label: 'Max Deadlift (MDL)', unit: 'lbs', max: 340 },
  { key: 'spt', label: 'Standing Power Throw (SPT)', unit: 'm', max: 12.5 },
  { key: 'hrp', label: 'Hand Release Push-Up (HRP)', unit: 'reps', max: 70 },
  { key: 'sdc', label: 'Sprint-Drag-Carry (SDC)', unit: 'mm:ss', max: null },
  { key: 'plk', label: 'Plank (PLK)', unit: 'mm:ss', max: null },
  { key: 'tmr', label: 'Two-Mile Run (2MR)', unit: 'mm:ss', max: null },
] as const;

interface ACFTEntry {
  id: string;
  date: string;
  total: number;
  events: Record<string, string>;
  notes: string;
}

export default function ACFTLogPage() {
  const router = useRouter();
  const scores = useScoresStore();

  const [showForm, setShowForm] = useState(false);
  const [eventScores, setEventScores] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');
  const [entries, setEntries] = useState<ACFTEntry[]>(() => {
    return scores.scoreHistory
      .filter((s: any) => s.acft_total != null)
      .map((s: any, i: number) => ({
        id: `history_${i}`,
        date: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        total: Math.round(s.acft_total!),
        events: {},
        notes: '',
      }));
  });

  const handleSave = useCallback(() => {
    const eventValues = Object.values(eventScores).filter((v) => v.trim() !== '');
    if (eventValues.length === 0) {
      window.alert('Enter at least one event score to log an ACFT attempt.');
      return;
    }

    let totalEstimate = 0;
    let eventCount = 0;
    ACFT_EVENTS.forEach((event) => {
      const val = eventScores[event.key];
      if (val && event.max != null) {
        const num = parseFloat(val);
        if (!isNaN(num)) {
          totalEstimate += Math.min((num / event.max) * 100, 100);
          eventCount++;
        }
      } else if (val) {
        totalEstimate += 80;
        eventCount++;
      }
    });
    if (eventCount > 0) {
      totalEstimate = Math.round((totalEstimate / eventCount) * 6);
    }

    const newEntry: ACFTEntry = {
      id: `acft_${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      total: Math.min(totalEstimate, 600),
      events: { ...eventScores },
      notes,
    };

    setEntries((prev) => [newEntry, ...prev]);
    setEventScores({});
    setNotes('');
    setShowForm(false);
    window.alert(`ACFT Logged. Total estimated score: ${newEntry.total}/600`);
  }, [eventScores, notes]);

  const getScoreColor = (total: number): string => {
    if (total >= 500) return '#c3cc8c';
    if (total >= 400) return '#dbc585';
    if (total >= 360) return '#d9b9ff';
    return '#ffb4ab';
  };

  return (
    <div className="min-h-screen bg-[#151317] text-[#e7e1e6] selection:bg-[#450084] selection:text-[#d9b9ff]">
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

      <style jsx global>{`
        .glass-panel-acft { background: rgba(55, 52, 56, 0.5); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
      `}</style>

      <div className="pt-6 pb-8 px-6 max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="text-[#968d9d] hover:text-[#d9b9ff] transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-[#c3cc8c]" style={{ fontFamily: 'Public Sans, sans-serif' }}>
              ACFT LOG
            </h1>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-5 py-2.5 rounded-sm bg-[#450084] text-[#b27ff5] text-sm font-bold uppercase tracking-wider hover:scale-[1.02] transition-all"
              style={{ fontFamily: 'Space Grotesk, sans-serif', boxShadow: '0 0 20px rgba(69,0,132,0.3)' }}
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">add</span>
                Log ACFT
              </span>
            </button>
          )}
        </div>

        {/* Summary Stats */}
        {entries.length > 0 && !showForm && (
          <section>
            <h3 className="text-[12px] text-[#968d9d] uppercase tracking-[0.3em] font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Summary
            </h3>
            <div className="glass-panel-acft rounded-lg p-8">
              <div className="grid grid-cols-3 gap-8">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d] mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Best</span>
                  <span className="text-4xl font-black" style={{ fontFamily: 'Public Sans, sans-serif', color: getScoreColor(Math.max(...entries.map((e) => e.total))) }}>
                    {Math.max(...entries.map((e) => e.total))}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d] mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Latest</span>
                  <span className="text-4xl font-black" style={{ fontFamily: 'Public Sans, sans-serif', color: getScoreColor(entries[0]?.total ?? 0) }}>
                    {entries[0]?.total ?? '--'}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d] mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Attempts</span>
                  <span className="text-4xl font-black text-[#f8e19e]" style={{ fontFamily: 'Public Sans, sans-serif' }}>
                    {entries.length}
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Form */}
        {showForm && (
          <section className="glass-panel-acft rounded-lg p-8">
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-2" style={{ fontFamily: 'Public Sans, sans-serif' }}>
              LOG ACFT ATTEMPT
            </h2>
            <p className="text-sm text-[#968d9d] mb-6">
              Enter your raw scores for each event. Leave blank for events not completed.
            </p>
            <div className="space-y-4">
              {ACFT_EVENTS.map((event) => (
                <div key={event.key} className="bg-[#211f23] rounded-lg p-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#e7e1e6] flex-1 mr-4">{event.label}</span>
                  <input
                    value={eventScores[event.key] ?? ''}
                    onChange={(e) => setEventScores((prev) => ({ ...prev, [event.key]: e.target.value }))}
                    placeholder={event.unit}
                    className="w-[140px] bg-[#151317] rounded-sm py-2.5 px-4 text-sm text-[#e7e1e6] placeholder:text-[#968d9d] outline-none focus:ring-2 focus:ring-[#d9b9ff]/30"
                    style={{ border: 'none' }}
                    aria-label={`${event.label} score`}
                  />
                </div>
              ))}
            </div>
            <div className="mt-5">
              <label className="text-[10px] text-[#968d9d] uppercase tracking-[0.3em] block mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Notes (optional)</label>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Record ACFT, diagnostic, etc."
                className="w-full bg-[#151317] text-[#e7e1e6] px-4 py-3 rounded-sm outline-none focus:ring-2 focus:ring-[#d9b9ff]/30 placeholder:text-[#968d9d]"
                style={{ border: 'none' }}
              />
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => { setShowForm(false); setEventScores({}); setNotes(''); }}
                className="flex-1 py-3 rounded-sm bg-[#211f23] text-[#e7e1e6] text-sm font-semibold hover:bg-[#2c292d] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 rounded-sm bg-[#450084] text-[#b27ff5] text-sm font-bold uppercase tracking-wider hover:scale-[1.02] transition-all"
                style={{ fontFamily: 'Space Grotesk, sans-serif', boxShadow: '0 0 20px rgba(69,0,132,0.3)' }}
              >
                Save ACFT
              </button>
            </div>
          </section>
        )}

        {/* History */}
        {entries.length > 0 && !showForm && (
          <section>
            <h3 className="text-[12px] text-[#968d9d] uppercase tracking-[0.3em] font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              ACFT History
            </h3>
            <div className="space-y-4">
              {entries.map((item) => (
                <div key={item.id} className="bg-[#211f23] hover:bg-[#2c292d] transition-all rounded-lg p-6 border-l-4 border-[#2c3303]">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-sm font-semibold text-[#cdc3d4]">{item.date}</span>
                      {item.notes && (
                        <p className="text-sm text-[#968d9d] mt-0.5 truncate max-w-[250px]">{item.notes}</p>
                      )}
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-black" style={{ fontFamily: 'Public Sans, sans-serif', color: getScoreColor(item.total), filter: `drop-shadow(0 0 8px ${getScoreColor(item.total)}40)` }}>
                        {item.total}
                      </span>
                      <span className="text-sm text-[#968d9d] ml-1">/600</span>
                    </div>
                  </div>
                  {Object.keys(item.events).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {ACFT_EVENTS.map((event) => {
                        const val = item.events[event.key];
                        if (!val) return null;
                        return (
                          <div key={event.key} className="px-3 py-1.5 rounded-sm bg-[#1d1b1f]">
                            <span className="text-[10px] font-bold text-[#968d9d]" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                              {event.key.toUpperCase()}
                            </span>{' '}
                            <span className="text-xs font-semibold text-[#e7e1e6]">
                              {val}{event.unit !== 'mm:ss' ? ` ${event.unit}` : ''}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {entries.length === 0 && !showForm && (
          <section className="glass-panel-acft rounded-lg p-16 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-lg bg-[#211f23] flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-4xl text-[#968d9d]" style={{ fontVariationSettings: "'FILL' 1" }}>fitness_center</span>
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-3" style={{ fontFamily: 'Public Sans, sans-serif' }}>
              NO ACFT RECORDS
            </h2>
            <p className="text-sm text-[#968d9d] mb-8 max-w-md leading-relaxed">
              Log your ACFT attempts to track physical fitness progress and its impact on your OMS score. Physical pillar is worth up to 9 OMS points: (score / 600) x 2 = fall OMS, (score / 600) x 4 = spring OMS.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-10 py-4 rounded-sm bg-[#450084] text-[#b27ff5] text-sm font-bold uppercase tracking-wider hover:scale-[1.02] transition-all"
              style={{ fontFamily: 'Space Grotesk, sans-serif', boxShadow: '0 0 20px rgba(69,0,132,0.3)' }}
            >
              Log First ACFT
            </button>
          </section>
        )}
      </div>
    </div>
  );
}

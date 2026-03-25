'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MdArrowBack, MdAdd, MdFitnessCenter } from 'react-icons/md';
import { VInput } from '@/components';
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
    <div className="flex flex-col min-h-full bg-[#151317]">
      {/* Header — glass bar */}
      <header className="glass-card ghost-border bg-[#151317]/60 backdrop-blur-2xl px-4 py-4 flex items-center justify-between shadow-lg shadow-purple-900/20 sticky top-0 z-40">
        <button onClick={() => router.back()} aria-label="Go back" className="text-[#968d9d] hover:text-[#d9b9ff] cursor-pointer transition-colors">
          <MdArrowBack size={24} />
        </button>
        <h1
          className="text-lg font-black uppercase tracking-tighter text-[#c3cc8c]"
          style={{ fontFamily: 'Public Sans, sans-serif' }}
        >
          ACFT LOG
        </h1>
        {!showForm ? (
          <button onClick={() => setShowForm(true)} aria-label="Add ACFT entry" className="text-[#968d9d] hover:text-[#d9b9ff] cursor-pointer transition-colors">
            <MdAdd size={24} />
          </button>
        ) : (
          <div className="w-6" />
        )}
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 pb-20 max-w-lg mx-auto md:max-w-2xl w-full space-y-6">
        {/* Summary Stats */}
        {entries.length > 0 && !showForm && (
          <div className="grid grid-cols-3 gap-3">
            <div className="glass-card ghost-border rounded-sm flex flex-col items-center py-4">
              <span
                className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d] mb-1.5"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                BEST
              </span>
              <span
                className="text-2xl font-black"
                style={{ fontFamily: 'Public Sans, sans-serif', color: getScoreColor(Math.max(...entries.map((e) => e.total))) }}
              >
                {Math.max(...entries.map((e) => e.total))}
              </span>
            </div>
            <div className="glass-card ghost-border rounded-sm flex flex-col items-center py-4">
              <span
                className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d] mb-1.5"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                LATEST
              </span>
              <span
                className="text-2xl font-black"
                style={{ fontFamily: 'Public Sans, sans-serif', color: getScoreColor(entries[0]?.total ?? 0) }}
              >
                {entries[0]?.total ?? '--'}
              </span>
            </div>
            <div className="glass-card ghost-border rounded-sm flex flex-col items-center py-4">
              <span
                className="text-[10px] uppercase tracking-[0.2em] text-[#968d9d] mb-1.5"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                ATTEMPTS
              </span>
              <span
                className="text-2xl font-black text-[#f8e19e]"
                style={{ fontFamily: 'Public Sans, sans-serif' }}
              >
                {entries.length}
              </span>
            </div>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <section className="glass-card ghost-border rounded-sm p-5">
            <h2
              className="text-lg font-black uppercase tracking-tighter text-[#e7e1e6] mb-1"
              style={{ fontFamily: 'Public Sans, sans-serif' }}
            >
              LOG ACFT ATTEMPT
            </h2>
            <p className="text-sm text-[#cdc3d4] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
              Enter your raw scores for each event. Leave blank for events not completed.
            </p>
            <div className="space-y-3">
              {ACFT_EVENTS.map((event) => (
                <div key={event.key} className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#e7e1e6] flex-1 mr-3" style={{ fontFamily: 'Inter, sans-serif' }}>{event.label}</span>
                  <input
                    value={eventScores[event.key] ?? ''}
                    onChange={(e) => setEventScores((prev) => ({ ...prev, [event.key]: e.target.value }))}
                    placeholder={event.unit}
                    className="w-[120px] bg-[#211f23] rounded-sm py-2 px-3 text-sm text-[#e7e1e6] placeholder:text-[#968d9d] outline-none focus:ring-1 focus:ring-[#d9b9ff]"
                    aria-label={`${event.label} score`}
                  />
                </div>
              ))}
            </div>
            <VInput
              label="Notes (optional)"
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g., Record ACFT, diagnostic, etc."
              className="mt-4"
            />
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => { setShowForm(false); setEventScores({}); setNotes(''); }}
                className="flex-1 py-3 rounded-sm glass-card ghost-border text-[#e7e1e6] text-sm font-semibold cursor-pointer hover:bg-[#450084]/10 transition-colors"
                aria-label="Cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 rounded-sm bg-[#450084] text-[#b27ff5] text-sm font-bold uppercase tracking-wider cursor-pointer hover:bg-[#450084]/80 transition-all"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Save ACFT
              </button>
            </div>
          </section>
        )}

        {/* Section title */}
        {entries.length > 0 && !showForm && (
          <h2
            className="text-xs uppercase tracking-[0.3em] text-[#968d9d]"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            ACFT HISTORY
          </h2>
        )}

        {/* Entries */}
        {entries.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-sm glass-card ghost-border"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-sm font-semibold text-[#cdc3d4]">{item.date}</span>
                {item.notes && (
                  <p className="text-sm text-[#968d9d] mt-0.5 truncate max-w-[200px]">{item.notes}</p>
                )}
              </div>
              <div className="flex items-baseline">
                <span
                  className="text-2xl font-black"
                  style={{ fontFamily: 'Public Sans, sans-serif', color: getScoreColor(item.total) }}
                >
                  {item.total}
                </span>
                <span className="text-sm text-[#968d9d] ml-0.5">/600</span>
              </div>
            </div>
            {Object.keys(item.events).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {ACFT_EVENTS.map((event) => {
                  const val = item.events[event.key];
                  if (!val) return null;
                  return (
                    <div key={event.key} className="px-2 py-1 rounded-sm bg-[#211f23]">
                      <span
                        className="text-[10px] font-bold text-[#968d9d]"
                        style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                      >
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

        {/* Empty State */}
        {entries.length === 0 && !showForm && (
          <div className="flex flex-col items-center pt-12 px-8">
            <div className="w-20 h-20 rounded-sm bg-[#211f23] flex items-center justify-center mb-4">
              <MdFitnessCenter size={40} className="text-[#968d9d]" />
            </div>
            <h2
              className="text-xl font-black uppercase tracking-tighter text-[#e7e1e6] mb-2"
              style={{ fontFamily: 'Public Sans, sans-serif' }}
            >
              NO ACFT RECORDS
            </h2>
            <p className="text-sm text-[#cdc3d4] text-center mb-6 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
              Log your ACFT attempts to track physical fitness progress and its impact on your OML score.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-8 py-3 rounded-sm bg-[#450084] text-[#b27ff5] text-sm font-bold uppercase tracking-wider cursor-pointer hover:bg-[#450084]/80 transition-all shadow-lg shadow-[#450084]/20"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Log First ACFT
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

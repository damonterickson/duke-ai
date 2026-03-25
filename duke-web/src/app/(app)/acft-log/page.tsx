'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MdArrowBack, MdAdd, MdFitnessCenter } from 'react-icons/md';
import { VGlassPanel, VButton, VInput } from '@/components';
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
    if (total >= 500) return '#4caf50';
    if (total >= 400) return 'var(--color-tertiary)';
    if (total >= 360) return 'var(--color-primary)';
    return 'var(--color-error)';
  };

  return (
    <div className="flex flex-col min-h-full bg-[var(--color-background)]">
      {/* Header */}
      <header className="gradient-primary text-white px-4 py-4 flex items-center justify-between shadow-[var(--shadow-md)]">
        <button onClick={() => router.back()} aria-label="Go back" className="text-white/80 hover:text-white cursor-pointer transition-colors">
          <MdArrowBack size={24} />
        </button>
        <h1 className="text-sm font-bold uppercase tracking-[3px] font-[family-name:var(--font-label)]">ACFT LOG</h1>
        {!showForm ? (
          <button onClick={() => setShowForm(true)} aria-label="Add ACFT entry" className="text-white/80 hover:text-white cursor-pointer transition-colors">
            <MdAdd size={24} />
          </button>
        ) : (
          <div className="w-6" />
        )}
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 pb-20 max-w-lg mx-auto md:max-w-2xl w-full space-y-4">
        {/* Summary Stats */}
        {entries.length > 0 && !showForm && (
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center py-4 rounded-md bg-[var(--color-surface-container-low)] border border-[var(--ghost-border)] shadow-[var(--shadow-sm)]">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-1.5 font-[family-name:var(--font-label)]">BEST</span>
              <span className="text-2xl font-bold font-[family-name:var(--font-display)]" style={{ color: getScoreColor(Math.max(...entries.map((e) => e.total))) }}>
                {Math.max(...entries.map((e) => e.total))}
              </span>
            </div>
            <div className="flex flex-col items-center py-4 rounded-md bg-[var(--color-surface-container-low)] border border-[var(--ghost-border)] shadow-[var(--shadow-sm)]">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-1.5 font-[family-name:var(--font-label)]">LATEST</span>
              <span className="text-2xl font-bold font-[family-name:var(--font-display)]" style={{ color: getScoreColor(entries[0]?.total ?? 0) }}>
                {entries[0]?.total ?? '--'}
              </span>
            </div>
            <div className="flex flex-col items-center py-4 rounded-md bg-[var(--color-surface-container-low)] border border-[var(--ghost-border)] shadow-[var(--shadow-sm)]">
              <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-1.5 font-[family-name:var(--font-label)]">ATTEMPTS</span>
              <span className="text-2xl font-bold text-[var(--color-on-surface)] font-[family-name:var(--font-display)]">{entries.length}</span>
            </div>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <section className="glass-panel rounded-md p-5 shadow-[var(--shadow-sm)]">
            <h2 className="text-lg font-bold text-[var(--color-on-surface)] mb-1 font-[family-name:var(--font-display)]">Log ACFT Attempt</h2>
            <p className="text-sm text-[var(--color-on-surface-variant)] mb-4">
              Enter your raw scores for each event. Leave blank for events not completed.
            </p>
            <div className="space-y-3">
              {ACFT_EVENTS.map((event) => (
                <div key={event.key} className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[var(--color-on-surface)] flex-1 mr-3">{event.label}</span>
                  <input
                    value={eventScores[event.key] ?? ''}
                    onChange={(e) => setEventScores((prev) => ({ ...prev, [event.key]: e.target.value }))}
                    placeholder={event.unit}
                    className="w-[120px] bg-[var(--color-surface-container-low)] border border-[var(--ghost-border)] rounded-md py-2 px-3 text-sm text-[var(--color-on-surface)] placeholder:text-[var(--color-outline)] outline-none focus:border-[var(--color-primary)]"
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
                className="flex-1 py-3 rounded-md border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] text-sm font-semibold cursor-pointer hover:bg-[var(--color-surface-container)] transition-colors"
                aria-label="Cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 rounded-md gradient-primary text-white text-sm font-bold uppercase tracking-wider cursor-pointer hover:opacity-90 transition-opacity font-[family-name:var(--font-label)]"
              >
                Save ACFT
              </button>
            </div>
          </section>
        )}

        {/* Section title */}
        {entries.length > 0 && !showForm && (
          <h2 className="text-lg font-semibold uppercase tracking-wider text-[var(--color-on-surface)] font-[family-name:var(--font-label)]">
            ACFT History
          </h2>
        )}

        {/* Entries */}
        {entries.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-md bg-[var(--color-surface-container-low)] border border-[var(--ghost-border)] shadow-[var(--shadow-sm)]"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-sm font-semibold text-[var(--color-on-surface-variant)]">{item.date}</span>
                {item.notes && (
                  <p className="text-sm text-[var(--color-on-surface-variant)] mt-0.5 truncate max-w-[200px]">{item.notes}</p>
                )}
              </div>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold font-[family-name:var(--font-display)]" style={{ color: getScoreColor(item.total) }}>
                  {item.total}
                </span>
                <span className="text-sm text-[var(--color-on-surface-variant)] ml-0.5">/600</span>
              </div>
            </div>
            {Object.keys(item.events).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {ACFT_EVENTS.map((event) => {
                  const val = item.events[event.key];
                  if (!val) return null;
                  return (
                    <div key={event.key} className="px-2 py-1 rounded-sm bg-[var(--color-surface-container)] border border-[var(--ghost-border)]">
                      <span className="text-xs font-bold text-[var(--color-on-surface-variant)] font-[family-name:var(--font-label)]">{event.key.toUpperCase()}</span>{' '}
                      <span className="text-xs font-semibold text-[var(--color-on-surface)]">
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
            <div className="w-20 h-20 rounded-md bg-[var(--color-surface-container)] flex items-center justify-center mb-4">
              <MdFitnessCenter size={40} className="text-[var(--color-outline)]" />
            </div>
            <h2 className="text-xl font-bold text-[var(--color-on-surface)] mb-2 font-[family-name:var(--font-display)]">No ACFT Records</h2>
            <p className="text-sm text-[var(--color-on-surface-variant)] text-center mb-6 leading-relaxed">
              Log your ACFT attempts to track physical fitness progress and its impact on your OML score.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-8 py-3 rounded-md gradient-primary text-white text-sm font-bold uppercase tracking-wider cursor-pointer hover:opacity-90 transition-opacity shadow-[var(--shadow-sm)] font-[family-name:var(--font-label)]"
            >
              Log First ACFT
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

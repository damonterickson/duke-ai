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
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-primary)]">
        <button onClick={() => router.back()} aria-label="Go back" className="text-white cursor-pointer">
          <MdArrowBack size={24} />
        </button>
        <h1 className="text-base font-bold tracking-[2px] text-white">ACFT LOG</h1>
        {!showForm ? (
          <button onClick={() => setShowForm(true)} aria-label="Add ACFT entry" className="text-white cursor-pointer">
            <MdAdd size={24} />
          </button>
        ) : (
          <div className="w-6" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-[var(--color-surface)] p-4 pb-16">
        {/* Summary Stats */}
        {entries.length > 0 && !showForm && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="flex flex-col items-center py-3 rounded-xl bg-[var(--color-surface-container)]">
              <span className="text-xs font-medium uppercase tracking-[1px] text-[var(--color-outline)] mb-1">BEST SCORE</span>
              <span className="text-xl font-semibold" style={{ color: getScoreColor(Math.max(...entries.map((e) => e.total))) }}>
                {Math.max(...entries.map((e) => e.total))}
              </span>
            </div>
            <div className="flex flex-col items-center py-3 rounded-xl bg-[var(--color-surface-container)]">
              <span className="text-xs font-medium uppercase tracking-[1px] text-[var(--color-outline)] mb-1">LATEST</span>
              <span className="text-xl font-semibold" style={{ color: getScoreColor(entries[0]?.total ?? 0) }}>
                {entries[0]?.total ?? '--'}
              </span>
            </div>
            <div className="flex flex-col items-center py-3 rounded-xl bg-[var(--color-surface-container)]">
              <span className="text-xs font-medium uppercase tracking-[1px] text-[var(--color-outline)] mb-1">ATTEMPTS</span>
              <span className="text-xl font-semibold text-[var(--color-on-surface)]">{entries.length}</span>
            </div>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <VGlassPanel className="mb-4">
            <h2 className="text-lg font-semibold text-[var(--color-on-surface)] mb-1">Log ACFT Attempt</h2>
            <p className="text-sm text-[var(--color-outline)] mb-4">
              Enter your raw scores for each event. Leave blank for events not completed.
            </p>
            {ACFT_EVENTS.map((event) => (
              <div key={event.key} className="flex items-center justify-between mb-2">
                <span className="text-sm text-[var(--color-on-surface)] flex-1 mr-2">{event.label}</span>
                <input
                  value={eventScores[event.key] ?? ''}
                  onChange={(e) => setEventScores((prev) => ({ ...prev, [event.key]: e.target.value }))}
                  placeholder={event.unit}
                  className="w-[120px] bg-[var(--color-surface-container-low)] rounded-xl py-2 px-3 text-sm text-[var(--color-on-surface)] placeholder:text-[var(--color-outline)] border border-transparent outline-none"
                  aria-label={`${event.label} score`}
                />
              </div>
            ))}
            <VInput
              label="Notes (optional)"
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g., Record ACFT, diagnostic, etc."
              className="mt-3"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setShowForm(false); setEventScores({}); setNotes(''); }}
                className="flex-1 py-3 rounded-lg border border-[var(--color-outline)] text-[var(--color-on-surface)] text-sm font-semibold cursor-pointer"
                aria-label="Cancel"
              >
                Cancel
              </button>
              <VButton label="Save ACFT" onPress={handleSave} className="flex-1" />
            </div>
          </VGlassPanel>
        )}

        {/* Section title */}
        {entries.length > 0 && !showForm && (
          <h2 className="text-sm font-semibold uppercase tracking-[1.5px] text-[var(--color-on-surface)] mb-3">
            ACFT History
          </h2>
        )}

        {/* Entries */}
        {entries.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl mb-3 bg-[var(--glass-overlay)] border border-[var(--ghost-border-color)]"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-sm font-medium text-[var(--color-outline)]">{item.date}</span>
                {item.notes && (
                  <p className="text-sm text-[var(--color-outline)] mt-0.5 truncate max-w-[200px]">{item.notes}</p>
                )}
              </div>
              <div className="flex items-baseline">
                <span className="text-xl font-semibold" style={{ color: getScoreColor(item.total) }}>
                  {item.total}
                </span>
                <span className="text-sm text-[var(--color-outline)]">/600</span>
              </div>
            </div>
            {Object.keys(item.events).length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {ACFT_EVENTS.map((event) => {
                  const val = item.events[event.key];
                  if (!val) return null;
                  return (
                    <div key={event.key} className="px-2 py-1 rounded bg-[var(--color-surface-container)]">
                      <span className="text-xs text-[var(--color-outline)]">{event.key.toUpperCase()}</span>{' '}
                      <span className="text-xs text-[var(--color-on-surface)]">
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
          <div className="flex flex-col items-center pt-10 px-8">
            <MdFitnessCenter size={56} className="text-[var(--color-outline)]" />
            <h2 className="text-xl font-semibold text-[var(--color-on-surface)] mt-4 mb-2">No ACFT Records</h2>
            <p className="text-sm text-[var(--color-outline)] text-center mb-4">
              Log your ACFT attempts to track physical fitness progress and its impact on your OML score.
            </p>
            <VButton label="Log First ACFT" onPress={() => setShowForm(true)} className="min-w-[200px]" />
          </div>
        )}
      </div>
    </div>
  );
}
